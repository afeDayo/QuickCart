// accountController.ts server/src/controllers/accountController.ts
// The logged-in user's own account: profile, password, delivery addresses and saved items.

// STEP 20: My Account
// (every route has protect, so req.user is always the logged-in user)
// PATCH  /api/account/profile               -> change name, email, phone
// PATCH  /api/account/password              -> change password (current password required)
// GET    /api/account/addresses             -> my addresses
// POST   /api/account/addresses             -> add one
// PATCH  /api/account/addresses/:addressId  -> edit one (or make it the default)
// DELETE /api/account/addresses/:addressId  -> delete one
// GET    /api/account/saved                 -> my saved products (as product cards)
// POST   /api/account/saved/:productId      -> save a product
// DELETE /api/account/saved/:productId      -> unsave a product

import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { IAddress, User } from "../models/User";
import { liveProducts, Product } from "../models/Product";
import { AppError } from "../utils/AppError";
import { checkNewPassword } from "../utils/password";
import { signToken } from "../utils/token";
import { CARD_FIELDS } from "./productController";

// The logged-in user. "!" = "protect ran first, so it's definitely set".
const me = (req: Request) => req.user!;

// ===== Profile =====

// PATCH /api/account/profile   { "firstName"?, "lastName"?, "email"?, "phone"? }
// PATCH (not PUT) = "change only what I send". A field that isn't sent stays as it is.
export const updateProfile = async (req: Request, res: Response) => {
  const user = me(req);
  const { firstName, lastName, email, phone } = req.body ?? {};

  // Copy only these 4 fields. Anything else in the body (like "role": "admin") is ignored.
  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (phone !== undefined) user.phone = phone;

  // A NEW email hasn't been checked yet, so "Verified" goes off. ("ADA.OBI@..." is the same email, not a new one.)
  if (
    email !== undefined &&
    String(email).toLowerCase().trim() !== user.email
  ) {
    user.email = email;
    user.isEmailVerified = false;
  }

  // save() runs the model's rules: empty name -> 400, bad email -> 400, email already used -> 409
  await user.save();
  res.json({ message: "Your profile has been updated.", user });
};

// ===== Password =====

// PATCH /api/account/password   { "currentPassword", "newPassword", "confirmPassword" }
export const changePassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword, confirmPassword } = req.body ?? {};

  if (!currentPassword) {
    throw new AppError(400, "Please enter your current password.");
  }

  // req.user has no password (select: false), so load it with the password this time
  const user = await User.findById(me(req)._id).select("+password");
  if (!user) {
    throw new AppError(
      401,
      "This account no longer exists. Please log in again.",
    );
  }

  // Someone who finds a laptop that's still logged in can't change the password without knowing it
  if (!(await user.comparePassword(String(currentPassword)))) {
    throw new AppError(400, "Your current password is incorrect.");
  }

  const password = checkNewPassword(newPassword, confirmPassword); // the same rules as registration

  if (password === currentPassword) {
    throw new AppError(
      400,
      "Your new password must be different from your old password.",
    );
  }

  user.password = password; // pre("save") hashes it and sets passwordChangedAt ("Last updated ...")
  await user.save();

  // passwordChangedAt changed, so every older token stops working (other devices are logged out).
  // This device gets a new token so it stays logged in. The website must save this new token!
  res.json({
    message: "Your password has been changed.",
    token: signToken(String(user._id)),
    user,
  });
};

// ===== Addresses =====

// Copy only the address fields from the body (never _id or anything else)
const pickAddress = (body: Record<string, unknown>) => {
  const fields = [
    "label",
    "fullName",
    "phone",
    "street",
    "city",
    "state",
    "country",
    "instructions",
    "isDefault",
  ] as const;

  const picked: Partial<Record<(typeof fields)[number], unknown>> = {};
  for (const field of fields) {
    if (body[field] !== undefined) picked[field] = body[field];
  }

  return picked as Partial<IAddress>;
};

// Find one of MY addresses by the :addressId in the URL, or 404.
// Because we only search req.user's own addresses, nobody can edit someone else's.
const findAddress = (req: Request<{ addressId: string }>) => {
  const address = me(req).addresses.find(
    (a) => String(a._id) === req.params.addressId,
  );

  if (!address) {
    throw new AppError(404, "Address not found");
  }

  return address;
};

// Exactly one default: the chosen address becomes default, every other one stops being default
const makeOnlyDefault = (addresses: IAddress[], chosen: IAddress) => {
  for (const address of addresses) {
    address.isDefault = address === chosen;
  }
};

// GET /api/account/addresses
export const getAddresses = async (req: Request, res: Response) => {
  res.json({ addresses: me(req).addresses });
};

// POST /api/account/addresses   { "label", "fullName", "phone", "street", "city", "state", ... }
export const addAddress = async (req: Request, res: Response) => {
  const user = me(req);

  user.addresses.push(pickAddress(req.body ?? {}) as IAddress);
  const added = user.addresses[user.addresses.length - 1]; // the one we just pushed (now with its own _id)

  // It becomes the default if the user asked for that, or if it's their FIRST address
  if (added.isDefault || user.addresses.length === 1) {
    makeOnlyDefault(user.addresses, added);
  }

  await user.save(); // missing street / city / ... -> the messages from 20.1 (400)
  res.status(201).json({ addresses: user.addresses });
};

// PATCH /api/account/addresses/:addressId   { any address fields, e.g. "isDefault": true }
export const updateAddress = async (
  req: Request<{ addressId: string }>,
  res: Response,
) => {
  const user = me(req);
  const address = findAddress(req);
  const wasDefault = address.isDefault;

  Object.assign(address, pickAddress(req.body ?? {})); // copy the sent fields onto the address

  if (address.isDefault) {
    makeOnlyDefault(user.addresses, address); // "Set as default": the old default loses its badge
  } else if (wasDefault) {
    address.isDefault = true; // you can't "un-default" the default: pick ANOTHER one as default instead
  }

  await user.save();
  res.json({ addresses: user.addresses });
};

// DELETE /api/account/addresses/:addressId
export const deleteAddress = async (
  req: Request<{ addressId: string }>,
  res: Response,
) => {
  const user = me(req);
  const address = findAddress(req);

  user.addresses = user.addresses.filter((a) => a !== address); // keep every address except this one

  // Deleted the default? The first remaining address becomes the default, so there's always one.
  if (address.isDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  res.json({ addresses: user.addresses });
};

// ===== Saved items =====

// GET /api/account/saved -> the saved products as cards (the same fields as the shop)
export const getSavedItems = async (req: Request, res: Response) => {
  const products = await Product.find({
    $and: [{ _id: { $in: me(req).savedItems } }, liveProducts()], // $in = "the _id is one of these"
  })
    .select(CARD_FIELDS)
    .populate("category", "name slug")
    .lean();

  res.json({ products });
};

// POST /api/account/saved/:productId
export const saveItem = async (
  req: Request<{ productId: string }>,
  res: Response,
) => {
  const { productId } = req.params;

  // isValidObjectId: "abc" isn't a MongoDB id at all. exists: is there a product shoppers can see with this id?
  if (
    !isValidObjectId(productId) ||
    !(await Product.exists({ $and: [{ _id: productId }, liveProducts()] }))
  ) {
    throw new AppError(404, "Product not found");
  }

  // $addToSet = add it only if it isn't already in the list (saving twice doesn't make a duplicate).
  // returnDocument: "after" = give back the user AFTER the change (Mongoose's old name for this was "new: true")
  const user = await User.findByIdAndUpdate(
    me(req)._id,
    { $addToSet: { savedItems: productId } },
    { returnDocument: "after" },
  );

  res.json({ savedItems: user!.savedItems });
};

// DELETE /api/account/saved/:productId
export const unsaveItem = async (
  req: Request<{ productId: string }>,
  res: Response,
) => {
  if (!isValidObjectId(req.params.productId)) {
    throw new AppError(404, "Product not found");
  }

  // $pull = remove it from the list (no error if it wasn't there)
  const user = await User.findByIdAndUpdate(
    me(req)._id,
    { $pull: { savedItems: req.params.productId } },
    { returnDocument: "after" },
  );

  res.json({ savedItems: user!.savedItems });
};
