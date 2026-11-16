// api.ts client/src/types/api.ts
// The shapes of what the server sends back, so TypeScript knows "category.name" exists.
// They copy the server's models (server/src/models). Later steps add Product, User, Order...

// STEP 30 (part 1): Types for the server's replies

// GET /api/categories -> { categories: Category[] }   (server: categoryController.ts)
export type Category = {
  _id: string;
  name: string; // "Home & Living"
  slug: string; // "home-living", used in links: /shop?category=home-living
  icon: string; // a Material icon name, e.g. "chair" (utils/categoryIcons.ts turns it into an icon)
  productCount: number; // how many products shoppers can see in it
};

// STEP 31: Users (server: models/User.ts)

export type Address = {
  _id: string;
  label: string; // "Home", "Office"
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  instructions?: string;
  isDefault: boolean;
};

// The logged-in user. The server never sends the password or the secret tokens (User.toJSON, server STEP 17).
export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: "customer" | "admin";
  isEmailVerified: boolean;
  addresses: Address[];
  savedItems: string[]; // product ids
  createdAt: string; // dates arrive as text in JSON: "2026-11-15T16:09:36.218Z"
};

// POST /api/auth/login and /register -> { token, user }
export type AuthResponse = { token: string; user: User };

export type CategoriesResponse = { categories: Category[] };
