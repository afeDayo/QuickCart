// users.ts server/src/data/users.ts
// The demo accounts. Log in with these after npm run seed.
//   Admin:    admin@quickcart.ng   /  Admin@12345
//   Customer: ada.obi@example.com  /  Password@123
// These passwords are for the demo only: they're hashed when saved, but anyone reading this file knows them.

// STEP 17 (part 2): Demo users

import type { IUser } from "../models/User";

// The fields a demo user needs (Pick = "only these fields of IUser")
export type DemoUser = Pick<
  IUser,
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "password"
  | "role"
  | "isEmailVerified"
  | "addresses"
>;

export const users: DemoUser[] = [
  {
    firstName: "QuickCart",
    lastName: "Admin",
    email: "admin@quickcart.ng",
    phone: "+2348000000001",
    password: "Admin@12345",
    role: "admin",
    isEmailVerified: true,
    addresses: [],
  },
  {
    firstName: "Ada",
    lastName: "Obi",
    email: "ada.obi@example.com",
    phone: "+2348031234567",
    password: "Password@123",
    role: "customer",
    isEmailVerified: true,
    addresses: [
      {
        label: "Home",
        fullName: "Ada Obi",
        phone: "+2348031234567",
        street: "12 Admiralty Way",
        city: "Lekki Phase 1",
        state: "Lagos State",
        country: "Nigeria",
        instructions: "Gate code 4022. Please call upon arrival at reception.",
        isDefault: true,
      },
      {
        label: "Office",
        fullName: "Ada Obi",
        phone: "+2348031234567",
        street: "1415 Adetokunbo Ademola Street",
        city: "Victoria Island",
        state: "Lagos State",
        country: "Nigeria",
        isDefault: false,
      },
    ],
  },
];
