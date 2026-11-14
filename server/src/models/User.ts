// User model server/src/models/User.ts
// A person with an account: a shopper ("customer") or a shop manager ("admin").
// Passwords are never stored as typed: they're scrambled ("hashed") with bcrypt before saving.

// STEP 17: The User model

import bcrypt from "bcryptjs";
import { Model, model, Schema, Types } from "mongoose";

// One saved delivery address (My Account -> Delivery Addresses, and the checkout form)
export interface IAddress {
  _id?: Types.ObjectId; // each address gets its own id, so one can be edited or deleted
  label: string; // e.g. "Home", "Office"
  fullName: string; // who receives the package
  phone: string;
  street: string; // e.g. "12 Admiralty Way"
  city: string; // city / neighbourhood, e.g. "Lekki Phase 1"
  state: string; // e.g. "Lagos State"
  country: string;
  instructions?: string; // e.g. "Gate code 4022. Please call upon arrival."
  isDefault: boolean; // the address picked automatically at checkout
}

export interface IUser {
  firstName: string;
  lastName: string;
  email: string; // unique: one account per email
  phone?: string;
  password: string; // the bcrypt hash, never the real password
  role: "customer" | "admin";
  isEmailVerified: boolean;
  addresses: IAddress[];
  savedItems: Types.ObjectId[]; // products the user saved (wishlist)
  emailVerifyToken?: string; // STEP 19
  emailVerifyExpires?: Date;
  passwordResetToken?: string; // STEP 19
  passwordResetExpires?: Date;
  passwordChangedAt?: Date; // "Password last updated ..."; also used to cancel old logins (STEP 18)
}

// Functions every user document has: user.comparePassword("typed password")
interface IUserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

// The model's type: users with the fields of IUser AND the methods of IUserMethods
type UserModel = Model<IUser, {}, IUserMethods>;

// An address is a "sub-document": it lives inside the user, not in its own collection
const addressSchema = new Schema<IAddress>({
  label: { type: String, default: "Home", trim: true },
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
  },
  street: {
    type: String,
    required: [true, "Street address is required"],
    trim: true,
  },
  city: { type: String, required: [true, "City is required"], trim: true },
  state: { type: String, required: [true, "State is required"], trim: true },
  country: { type: String, default: "Nigeria", trim: true },
  instructions: { type: String, trim: true },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    // [rule, message]: the message is what errorHandler (STEP 14) sends back when the rule fails
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // MongoDB refuses a second account with the same email (error 11000 -> 409)
      lowercase: true, // "Ada.Obi@Example.com" is saved as "ada.obi@example.com"
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },

    phone: { type: String, trim: true },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // left out of every query unless asked for with .select("+password")
    },

    role: { type: String, enum: ["customer", "admin"], default: "customer" },

    isEmailVerified: { type: Boolean, default: false },

    addresses: [addressSchema],

    savedItems: [{ type: Schema.Types.ObjectId, ref: "Product" }],

    // Secret tokens for STEP 19, hidden like the password
    emailVerifyToken: { type: String, select: false },
    emailVerifyExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    passwordChangedAt: { type: Date },
  },
  {
    timestamps: true, // createdAt = "Member since"

    // toJSON runs whenever a user is sent with res.json(user): remove the secret fields, just in case
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.password;
        delete ret.emailVerifyToken;
        delete ret.emailVerifyExpires;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Before every save: if the password was set or changed, replace it with its bcrypt hash.
// "function" (not an arrow) is required here: Mongoose sets "this" to the user being saved.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return; // e.g. only the name changed: don't hash the hash again!
  }

  this.password = await bcrypt.hash(this.password, 10); // 10 = how hard to scramble (the usual choice)

  // A changed password (not a brand-new account) is remembered for "Password last updated"
  if (!this.isNew) {
    this.passwordChangedAt = new Date();
  }
});

// user.comparePassword("typed password") -> true / false
// bcrypt hashes the typed password the same way and compares. (Needs .select("+password") when loading the user.)
userSchema.method("comparePassword", async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
});

export const User = model<IUser, UserModel>("User", userSchema);
