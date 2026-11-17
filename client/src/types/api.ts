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

// STEP 32: Products (server: models/Product.ts and CARD_FIELDS in productController.ts)

export type ProductColor = { name: string; hex: string }; // { name: "Midnight Black", hex: "#1f2937" }

// What a product CARD gets from GET /api/products: the fields cards need, not the whole product
export type ProductSummary = {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  price: number; // whole naira: 45000 = ₦45,000
  oldPrice?: number; // the crossed-out price when it's on sale
  images: string[]; // images[0] is the card photo
  ratings: number; // average stars, 0 to 5
  reviewCount: number;
  badge?: string; // "SALE", "TOP SELLER", "FEATURED"...
  tagline?: string;
  priceNote?: string;
  tags: string[];
  sold: number;
  stock: number;
  trackStock: boolean; // false = never sells out
  flashSaleStock?: number;
  colors: ProductColor[];
  category: { _id: string; name: string; slug: string };
};

// GET /api/products -> one page of products
export type ProductsResponse = {
  products: ProductSummary[];
  total: number;
  page: number;
  pages: number;
};

// STEP 35: One product, and its reviews (server: productController.ts getProduct, reviewController.ts)

export type ProductSpec = { group: string; label: string; value: string }; // a row of "Full Specifications"
export type ProductHighlight = { icon: string; title: string; text: string }; // the 3 feature cards

// GET /api/products/:idOrSlug -> { product }: everything for the Product Details page
export type Product = ProductSummary & {
  description: string;
  features: string[]; // the ✓ bullet points
  specs: ProductSpec[];
  highlights: ProductHighlight[];
  sku: string;
  gallery: string[]; // big photos (empty = use images)
  lowStockThreshold: number;
  ratingCounts: number[]; // how many 5, 4, 3, 2 and 1 star reviews, in that order
  category: { _id: string; name: string; slug: string; icon: string };
  bundleProducts: ProductSummary[]; // "Frequently Bought Together"
  relatedProducts: ProductSummary[]; // "Related Products"
};

export type ProductResponse = { product: Product };

export type Review = {
  _id: string;
  name: string; // "Ada O." (first name + initial, server STEP 23)
  rating: number; // 1 to 5
  title?: string;
  comment: string;
  createdAt: string;
};

// GET /api/reviews/product/:idOrSlug
export type ReviewsResponse = {
  summary: { ratings: number; reviewCount: number; ratingCounts: number[] };
  reviews: Review[];
  total: number;
  page: number;
  pages: number;
};

// GET /api/reviews/can-review/:productId
export type CanReviewResponse = {
  canReview: boolean;
  reason: string | null;
  review: Review | null;
};
