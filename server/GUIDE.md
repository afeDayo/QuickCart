# QuickCart Server: Step-by-Step Guide

This guide shows you how to finish the server **yourself**. Each step tells you which file to open,
what to type, why each part is there, and how to test it before you move on.
When a step is done and tested, reply **NEXT** and the next step will be added at the bottom of this file.

> Rule for every step: **type the code yourself, don't paste it.** Then run `npm run typecheck`
> (from inside `server/`) and the test at the end of the step. Commit after every step:
> `git add . && git commit -m "STEP X: ..." && git push`

---

## Where you are now

| Done | Step | What |
|------|------|------|
| ✅ | 1–6 | env, database, Express app, 404 handler, routes + `/api/health`, start server |
| ✅ | 7–8 | Category and Product models |
| ✅ | 9 | `slugify` |
| ✅ | 10 | Demo data: `categories.ts`, `products.ts` (40 products) |
| ✅ | 11 | Upload photos to Cloudinary (renames skipped: STEP 12.0 handles it) |
| ✅ | 12 | `demoData.ts` (optional: `photosFor` still lacks the `bare` part, see STEP 15 note) |
| ✅ | 13 | `seed.ts`: `npm run seed` works |
| ✅ | 14 | Error handler (`AppError` + `errorHandler.ts`) |
| ⬜ | **15** | **Categories API: `GET /api/categories`** ← you are here |
| ⬜ | 16 | Products API: list, filters, sort, pagination, one product |
| ⬜ | 17 | User model (password hashing, roles, addresses, saved items) |
| ⬜ | 18 | Auth: register, login, me, logout + `protect` / `adminOnly` middleware |
| ⬜ | 19 | Forgot password, reset password, verify email |
| ⬜ | 20 | My Account: profile, change password, addresses, saved items |
| ⬜ | 21 | Promo codes (`QUICK25`, `QUICK10`) |
| ⬜ | 22 | Orders: checkout, my orders, order details, cancel within 1 hour |
| ⬜ | 23 | Reviews (only buyers of delivered orders) |
| ⬜ | 24 | Newsletter sign-up |
| ⬜ | 25 | Admin: photo upload, products CRUD, categories CRUD |
| ⬜ | 26 | Admin: orders management, customers list |
| ⬜ | 27 | Admin: dashboard stats (sales, chart, top sellers, low stock) |
| ⬜ | 28 | Demo panel: reset demo data, move orders along |
| ⬜ | 29 | Final check: build, test every endpoint, clean-up |

### Time plan (deadline: tomorrow 5pm)
- **Today:** steps 11–18. The shop can then show real products and people can log in.
- **Tomorrow morning:** steps 19–24 (customer side complete).
- **Tomorrow afternoon:** steps 25–29 (admin + final check).
- If you run short of time, cut these first: 19 (email verify only), 24, 28. Everything else is needed by a screen in `ui/`.

### What the screens in `ui/` need from the server (the scope)
- **Home / Shop / Product Details:** categories with item counts, products filtered by category,
  search, sort, tags (`featured`, `flash-deal`, `deal`, `new-arrival`, `recommended`), best sellers
  (by `sold`), flash sale (`flashSaleStock`), bundle and related products, reviews.
- **Cart / Checkout:** promo code check, free delivery over ₦50,000, Standard (free) or Express
  (₦2,500) delivery, Card or Pay on Delivery (payment is *simulated*: no real Paystack).
- **Order Confirmation / Order Details / Order History:** order number like `#QC-1042`, status
  tracker (Placed → Processing → Dispatched → Delivered), courier + waybill, payment record, price
  breakdown, cancel within 1 hour.
- **My Account:** profile, stats, addresses, saved items, change password.
- **Login / Register / Forgot / Reset / Verify:** JWT auth.
- **Admin:** dashboard KPIs + revenue chart + top sellers + low stock; products table + add/edit form
  with photo upload; orders table with status tabs, filters and pagination; customers; categories.

Your `client/` is still mostly placeholders, so the server is designed from these screens.

---

## STEP 11: Fix the photo names and upload them to Cloudinary

### Why your command failed
1. You ran `npm run upload-images` from `QuickCarrt/`. npm looks for `package.json` in the folder
   you're in, and only `server/` has the one with this script. **Always run server commands from inside `server/`.**
   This also matters for `.env`: `dotenv` reads `.env` from the folder you run the command in.
2. `src/data/uploadImages.ts` is empty, so there was nothing to run. You'll write it below.

### How photos will work (read this first)
- Every product has a **slug** made by `slugify(product.name)`, e.g.
  `"Wireless Noise-Cancelling Headphones"` → `wireless-noise-cancelling-headphones`.
- A product's photos are named **`<slug>-1`, `<slug>-2`, `<slug>-3`, `<slug>-4`**. Photo `-1` is the
  main photo on product cards (`images[0]`).
- The upload script sends each file to Cloudinary as `quickcart/products/<file name without extension>`.
  `config/cloudinary.ts` already builds the address from that name with `photoUrl()`.
- In STEP 12, the seed matches photos to products **by slug**. A file name that doesn't match its
  slug exactly will leave that product **without photos**.

### 11.1 Rename these files in `Desktop/quickcart-product-photos`
> **Skipped.** STEP 12.0 handles these names in code instead, so you don't need to rename anything.
> The table stays here for reference.

I checked all 154 files against the 40 product names. These files don't match their product's slug yet:

| Current file name (all `.jpeg`) | Rename to | Why |
|---|---|---|
| `alloy-adjustable-stand.jpeg` | `alloy-adjustable-stand-1.jpeg` | number missing |
| `compact-mechanical-keypad.jpeg` | `compact-mechanical-keypad-1.jpeg` | number missing |
| `bluethoot-portable-speaker-1..4` | `bluetooth-portable-speaker-1..4` | typo |
| `cast-iron-skillet-10inch-1..4` | `cast-iron-skillet-10-inch-1..4` | product name is "10-inch" |
| `daily-planner-n-hardcover-Journal-1..4` | `daily-planner-hardcover-journal-1..4` | `&` becomes nothing; capital J |
| `design-system-handbook-1..4` | `design-systems-handbook-1..4` | product is "Design Systems Handbook" |
| `fast-dual-usb-c-gan-charger-35w-1 ..4 ` | `fast-dual-usb-c-gan-charger-35w-1..4` | **space before `.jpeg`**: delete it |
| `insulated-1l-hydro-flask-1 ..4 ` | `insulated-1l-hydro-flask-1..4` | **space before `.jpeg`**: delete it |
| `gold-plated-3.5mm-aux-cable-1..4` | `gold-plated-3-5mm-aux-cable-1..4` | slugify turns `.` into `-` |
| `magnetic-headphone-stand-n-usb-hub-1..4` | `magnetic-headphone-stand-usb-hub-1..4` | `&` becomes nothing |
| `minimalistic-led-desk-lamp-1..4` | `minimalist-led-desk-lamp-1..4` | product is "Minimalist LED Desk Lamp" |
| `hi-res-dac-audio-adapter-3.1.jpeg` | `hi-res-dac-audio-adapter-5.jpeg` (or delete it if it's a duplicate) | the extra `.1` |

**Two products have no photos at all:** `Smart Gooseneck Kettle` (`smart-gooseneck-kettle`) and
`True Wireless ANC Earbuds` (`true-wireless-anc-earbuds`). Add photos named `smart-gooseneck-kettle-1.jpeg`
and `true-wireless-anc-earbuds-1.jpeg` (more if you have them). Otherwise those two show no picture.

Tip: in File Explorer, turn on *View → Show → File name extensions* so you can see the hidden spaces before `.jpeg`.

### 11.2 Write `server/src/data/uploadImages.ts`
Open the empty file and type this:

```ts
// uploadImages.ts
// Sends every product photo in a folder on your computer to Cloudinary, into "quickcart/products".
// A file called "smart-watch-ultra-1.jpeg" becomes the photo "quickcart/products/smart-watch-ultra-1".

// STEP 11: Put the demo product photos on Cloudinary
// Run it from the server folder:
//   npm run upload-images -- "C:/Users/Afe Temidayo/Desktop/quickcart-product-photos"
// Everything after "--" is handed to this script; process.argv[2] is the folder.

import fs from "fs";
import path from "path";
import {
  CLOUDINARY_MISSING,
  isCloudinaryReady,
  PHOTO_FOLDER,
  photoUrl,
  uploadPhoto,
} from "../config/cloudinary";

// Only these file types are photos; anything else in the folder (e.g. desktop.ini) is skipped
const PHOTO_TYPES = [".jpg", ".jpeg", ".png", ".webp"];

const uploadImages = async () => {
  const folder = process.argv[2];

  // 1. Check we have everything before we start
  if (!folder) {
    console.error('Say where the photos are: npm run upload-images -- "C:/path/to/photos"');
    process.exit(1);
  }
  if (!isCloudinaryReady) {
    console.error(CLOUDINARY_MISSING);
    process.exit(1);
  }
  if (!fs.existsSync(folder)) {
    console.error(`Folder not found: ${folder}`);
    process.exit(1);
  }

  // 2. List the photo files in the folder
  const files = fs
    .readdirSync(folder)
    .filter((file) => PHOTO_TYPES.includes(path.extname(file).toLowerCase()));

  console.log(`Uploading ${files.length} photos to Cloudinary...`);

  // 3. Upload them one at a time (simple, and kind to a slow connection)
  let uploaded = 0;
  let failed = 0;

  for (const file of files) {
    // "smart-watch-ultra-1 .JPEG" -> "smart-watch-ultra-1" (trim removes stray spaces)
    const name = path.parse(file).name.trim().toLowerCase();
    const bytes = fs.readFileSync(path.join(folder, file));

    try {
      const publicId = await uploadPhoto(bytes, `${PHOTO_FOLDER}/${name}`);
      uploaded++;
      console.log(`${uploaded}/${files.length}  ${photoUrl(publicId)}`);
    } catch (error) {
      failed++;
      console.error(`Failed: ${file} -> ${(error as Error).message}`);
    }
  }

  console.log(`Done: ${uploaded} uploaded, ${failed} failed.`);
};

uploadImages();
```

**What each part does:**
- `process.argv` is the list of words on the command line. `[0]` is node, `[1]` is the script, and `[2]` is the first thing you typed after `--`.
- `path.parse(file).name` gives the file name without its extension. `.trim()` fixes names like `"...-1 "`, so a missed space won't break things.
- `uploadPhoto` (already in `config/cloudinary.ts`) streams the bytes to Cloudinary. It uses `overwrite: true`, so **you can run the script again safely** after fixing names.
- `for ... of` with `await` uploads one photo at a time. `try/catch` around each photo means one bad file doesn't stop the rest.

### 11.3 Run it
```bash
cd server
npm run typecheck
npm run upload-images -- "C:/Users/Afe Temidayo/Desktop/quickcart-product-photos"
```

### 11.4 Check it worked
- The last line should say `Done: 154 uploaded, 0 failed.` (more if you added photos).
- Ctrl+click one of the printed addresses. The photo should open in the browser.
- In the Cloudinary website go to **Media Library → Folders → quickcart → products**. You should see the photos there.
- If you see `Invalid Signature` or `Unknown API key`, the `CLOUDINARY_*` values in `server/.env` are wrong
  (they must not have spaces or quotes).

### 11.5 Commit
```bash
git add .
git commit -m "STEP 11: upload product photos to Cloudinary"
git push
```

➡️ **Next: STEP 12 (`demoData.ts`)**. Reply **NEXT** when 11.4 works.

---

## STEP 12: `demoData.ts` turns the data files into database records

### 12.0 Tell 9 products which photo name to use (instead of renaming files)
> ✅ **Already done for you** in `src/data/products.ts` (see `CHANGES.md`). Read this part to understand
> it, then go straight to 12.1.

You don't need to rename any files or upload again. Each product looks for photos named after its
**slug**. For the 9 products whose photos have a different name, you'll **tell the product the
photo name** with a new optional field called `photo`.

**a) Add the field to the `SeedProduct` type** in `src/data/products.ts`. Put it right under the
`gallery?` line (line 35):

```ts
  photo?: string; // photo name on Cloudinary when it isn't the slug, e.g. "bluethoot-portable-speaker"
```

**b) Add `photo: "..."` under the `name:` line** of each of these products in `src/data/products.ts`:

| Product (line in `products.ts`) | Add this line under `name:` |
|---|---|
| Design Systems Handbook (688) | `photo: "design-system-handbook",` |
| Minimalist LED Desk Lamp (792) | `photo: "minimalistic-led-desk-lamp",` |
| Bluetooth Portable Speaker (1528) | `photo: "bluethoot-portable-speaker",` |
| Cast Iron Skillet 10-inch (1740) | `photo: "cast-iron-skillet-10inch",` |
| Daily Planner & Hardcover Journal (2474) | `photo: "daily-planner-n-hardcover-journal",` |
| Smart Gooseneck Kettle (2687) | `photo: "electric-gooseneck-kettle",` *(no photos of its own; borrows the Electric Gooseneck Kettle's)* |
| Gold-Plated 3.5mm AUX Cable (3639) | `photo: "gold-plated-3.5mm-aux-cable",` |
| True Wireless ANC Earbuds (3954) | `photo: "aeropro-wireless-buds",` *(no photos of its own; borrows the AeroPro Wireless Buds')* |
| Magnetic Headphone Stand & USB Hub (4061) | `photo: "magnetic-headphone-stand-n-usb-hub",` |

Type them **all in lowercase**. Your upload script lowercased every name (`.toLowerCase()`), so on
Cloudinary the planner is `daily-planner-n-hardcover-journal`, with a small `j`.

`alloy-adjustable-stand.jpeg` and `compact-mechanical-keypad.jpeg` (no `-1`) also work without
renaming: the `photosFor` code below treats a photo with no number as the **first** photo.

I ran this against your Cloudinary account: with these 9 lines, **all 40 products get their photos**.

**How to avoid this next time:** name photo files exactly like the product's slug, e.g.
`slugify("Cast Iron Skillet 10-inch")` → `cast-iron-skillet-10-inch-1.jpeg`. Lowercase only, `&` dropped,
spaces and dots become `-`, and nothing between the number and `.jpeg`.

### What this step is for
`categories.ts` and `products.ts` are written for **humans**: a product's category is a slug
(`"electronics"`), photos aren't listed, and the field is called `rating` where the model says `ratings`.
MongoDB needs records shaped exactly like the **models**: `category` must be a real category `_id`,
`images` must be full photo addresses, and so on.

`demoData.ts` is the **translator** between the two. It doesn't touch the database itself;
`seed.ts` (STEP 13) calls it and saves the results.

```
categories.ts ─┐
products.ts  ──┼─► demoData.ts (shape the records) ─► seed.ts (save to MongoDB)
Cloudinary   ──┘
```

### 12.1 Add a helper to `src/config/cloudinary.ts`: list the uploaded photos
The seed needs to know which photos each product has (most have 4, some 3 or 5). Instead of
guessing, it **asks Cloudinary** for every photo in `quickcart/products`.

Add this at the **bottom** of `src/config/cloudinary.ts`. `cloudinary` is already imported at the top of that file.

```ts
// Lists the names (public ids) of all demo product photos on Cloudinary,
// e.g. ["quickcart/products/smart-watch-ultra-1", ...]. Admin uploads are left out.
// Cloudinary sends at most 500 per page, so we keep asking for the next page until there is none.
// Empty list when Cloudinary isn't set up (the products are then saved without photos).
export const listProductPhotoIds = async (): Promise<string[]> => {
  if (!isCloudinaryReady) {
    return [];
  }

  const ids: string[] = [];
  let nextCursor: string | undefined = undefined;

  do {
    const page = await cloudinary.api.resources({
      type: "upload",
      prefix: `${PHOTO_FOLDER}/`,
      max_results: 500,
      next_cursor: nextCursor,
    });

    for (const photo of page.resources) {
      ids.push(photo.public_id);
    }

    nextCursor = page.next_cursor; // undefined on the last page, which ends the loop
  } while (nextCursor);

  return ids.filter((id) => !id.startsWith(`${UPLOAD_FOLDER}/`));
};
```

**What's new here:**
- `cloudinary.api.resources()` is Cloudinary's "list my files" call. `prefix` means "only names starting with this".
- `do { ... } while (...)` runs the body **at least once**, then repeats while there's another page.
  `next_cursor` is Cloudinary's bookmark for the next page.

### 12.2 Write `src/data/demoData.ts`
Replace the contents of the file (keep your comment style) with:

```ts
// demoData.ts
// Turns the demo data files (categories.ts, products.ts) into records shaped like the models,
// ready for seed.ts to save. Nothing here talks to MongoDB.

// STEP 12: Put the demo data in the database (part 1: shape the records)
// The data files use slugs and simple names; the database needs real ids, full photo addresses
// and every field the model expects. These functions do that translation.

import { Types } from "mongoose";
import { categories } from "./categories";
import { products, SeedProduct } from "./products";
import { slugify } from "../utils/slugify";
import { PHOTO_FOLDER, photoUrl } from "../config/cloudinary";

// --- Star rating breakdown -------------------------------------------------------
// The product page shows bars for 5, 4, 3, 2 and 1 stars. When products.ts doesn't give
// ratingCounts, we make believable ones from the average rating.
// Each row: "if the rating is at least minRating, split the reviews like this (percent)".
const RATING_SHARES = [
  { minRating: 4.7, shares: [80, 14, 4, 1, 1] },
  { minRating: 4.4, shares: [65, 22, 8, 3, 2] },
  { minRating: 4.0, shares: [50, 28, 12, 6, 4] },
  { minRating: 0, shares: [35, 30, 18, 10, 7] },
];

// makeRatingCounts(4.8, 248) -> [199, 35, 10, 2, 2] (adds up to exactly 248)
export const makeRatingCounts = (rating: number, reviewCount: number): number[] => {
  const { shares } = RATING_SHARES.find((row) => rating >= row.minRating)!;

  const counts = shares.map((share) => Math.round((reviewCount * share) / 100));

  // Rounding can leave us 1 or 2 off; give the difference to the 5-star bar
  const total = counts.reduce((sum, count) => sum + count, 0);
  counts[0] += reviewCount - total;

  return counts;
};

// --- Photos ------------------------------------------------------------------------
// From all photo ids on Cloudinary, pick this product's ones ("<name>", "<name>-1", "<name>-2"...),
// put them in number order, and turn them into full addresses.
// photoName is the product's slug, or its "photo" from products.ts when the files are named differently.
export const photosFor = (photoName: string, photoIds: string[]): string[] => {
  const bare = `${PHOTO_FOLDER}/${photoName}`; // a photo with no number, e.g. "alloy-adjustable-stand"
  const prefix = `${bare}-`; // numbered photos start with this, e.g. "alloy-adjustable-stand-"

  // The photo with no number counts as 0, so it comes first
  const photoNumber = (id: string) => (id === bare ? 0 : Number(id.slice(prefix.length)));

  return photoIds
    .filter(
      (id) =>
        id === bare ||
        (id.startsWith(prefix) && /^\d+$/.test(id.slice(prefix.length))),
    )
    .sort((a, b) => photoNumber(a) - photoNumber(b))
    .map(photoUrl);
};

// --- Categories --------------------------------------------------------------------
// categories.ts is already shaped like the Category model, so we hand it over as it is.
export const demoCategories = () => {
  return categories;
};

// --- Products ----------------------------------------------------------------------
// One product from products.ts -> one record shaped like the Product model.
// bundle and related are left out here: they point to other products, which don't have
// ids until they're saved. seed.ts links them afterwards (STEP 13).
const buildProduct = (
  item: SeedProduct,
  categoryId: Types.ObjectId,
  photoIds: string[],
) => {
  const slug = slugify(item.name);

  return {
    name: item.name,
    slug,
    description: item.description,
    tagline: item.tagline,
    priceNote: item.priceNote,
    features: item.features ?? [],
    specs: item.specs ?? [],
    category: categoryId,
    brand: item.brand,
    sku: item.sku,
    price: item.price,
    oldPrice: item.oldPrice,
    costPrice: Math.round(item.price * 0.6), // pretend the shop paid 60% (admin margin display)
    trackStock: true,
    stock: item.stock,
    lowStockThreshold: 10,
    images: photosFor(item.photo ?? slug, photoIds), // "photo" from 12.0, otherwise the slug
    gallery: [], // empty = the product page uses images
    colors: item.colors ?? [],
    tags: item.tags ?? [],
    badge: item.badge,
    highlights: item.highlights ?? [],
    ratings: item.rating, // products.ts says "rating", the model says "ratings"
    reviewCount: item.reviewCount,
    ratingCounts:
      item.ratingCounts ?? makeRatingCounts(item.rating, item.reviewCount),
    sold: item.sold ?? item.reviewCount * 4,
    flashSaleStock: item.flashSaleStock,
    status: "published" as const,
  };
};

// All 40 products. categoryIds maps a category slug to its saved _id,
// e.g. "electronics" -> ObjectId("665f...").
export const demoProducts = (
  categoryIds: Map<string, Types.ObjectId>,
  photoIds: string[],
) => {
  return products.map((item) => {
    const categoryId = categoryIds.get(item.category);

    // A typo in products.ts (e.g. "electronic") should stop the seed loudly, not save bad data
    if (!categoryId) {
      throw new Error(`"${item.name}" has an unknown category: "${item.category}"`);
    }

    return buildProduct(item, categoryId, photoIds);
  });
};

// Next: STEP 13 (The seed command) -> server/src/data/seed.ts
```

**Things to understand, not just type:**
- **`??` (nullish coalescing):** `item.features ?? []` means "use `item.features`, or `[]` if it's missing".
  The model expects arrays, never `undefined`.
- **`!` after `.find(...)`:** `.find` could return `undefined`. The last row has `minRating: 0`, so a match
  is guaranteed, and the `!` tells TypeScript "trust me, it's there".
- **`as const` on `"published"`:** without it TypeScript treats it as any `string`, but the model only allows
  `"published" | "draft" | "scheduled"`.
- **`Map`:** like an object for looking things up, with `.get(key)` and `.set(key, value)`. It's a clean way to say
  "slug → id".
- **The regex `/^\d+$/`** checks that what comes after `<slug>-` is **only digits**. So for the product
  `smart-watch-ultra`, the photo `smart-watch-ultra-2` counts, but a photo like `smart-watch-ultra-strap-1`
  (a different product) doesn't.

### 12.3 Fix the step comments in two files
Your files still use the old step numbers. To keep them matching this guide:
- `src/data/categories.ts`, last line → `// Next: STEP 12 (Put the demo data in the database) -> server/src/data/demoData.ts`
- `src/data/uploadImages.ts` → add `// Next: STEP 12 (Put the demo data in the database) -> server/src/data/demoData.ts` at the bottom.

### 12.4 Test it
```bash
cd server
npm run typecheck
```
It should finish with **no output**. There's nothing to run yet, because `seed.ts` (next step) is what uses these
functions. You'll see the real result in STEP 13: 40 products in MongoDB, each with its photos.

Common typecheck errors:
- `Module has no exported member 'listProductPhotoIds'`: you didn't `export` it in 12.1.
- `Type 'string' is not assignable to type '"published" | "draft" | "scheduled"'`: you forgot `as const`.
- `Module './products' has no exported member 'SeedProduct'`: check the spelling and the capital letters.

### 12.5 Commit
```bash
git add .
git commit -m "STEP 12: demo data builders and Cloudinary photo list"
git push
```

➡️ **Next: STEP 13 (`seed.ts`: `npm run seed`)**. Reply **NEXT** when typecheck passes.

---

## STEP 13: `seed.ts`, the `npm run seed` command that fills MongoDB

### ⚠️ Before you start: finish 12.2
Your `listProductPhotoIds()` from 12.1 is in `cloudinary.ts` ✅, but **`src/data/demoData.ts` is still
empty**. `seed.ts` imports `demoCategories` and `demoProducts` from it, so type 12.2 first.
Typecheck passes right now only because an empty file has nothing to check.

### What this step is for
"Seeding" means filling an empty database with starting data, so the shop has products to show from
day one. `npm run seed` (already in your `package.json`) runs `src/data/seed.ts`, which:

1. connects to MongoDB
2. **empties** the categories and products collections, so you can run it as often as you like and always get a clean copy
3. saves the 8 categories, then reads back their `_id`s
4. asks Cloudinary for the photo list
5. saves the 40 products, using `demoData.ts` to shape them
6. links **"Frequently Bought Together"** and **"Related Products"**. `products.ts` lists these by
   **name**, but the database needs **ids**, and a product only gets an id once it's saved. That's why
   this happens last.
7. prints a summary and disconnects

The work is in a function called `seedDatabase()` that is **exported**. In STEP 28 the demo panel's
"Reset demo data" button reuses it, so the same code doesn't get written twice. Later steps (users, promo
codes, orders) will add more lines to this same function.

### 13.1 Create `src/data/seed.ts`

```ts
// seed.ts
// Fills the database with the demo data: npm run seed
// Running it again wipes the demo collections and starts fresh, so it's always safe to re-run.

// STEP 13: The seed command
// seedDatabase() does the work and is exported, so the demo panel (STEP 28) can reuse it.
// The bottom of the file runs it only when you type npm run seed.

import mongoose, { Types } from "mongoose";
import { connectDB } from "../config/database";
import { listProductPhotoIds } from "../config/cloudinary";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { demoCategories, demoProducts } from "./demoData";
import { products } from "./products";

export const seedDatabase = async () => {
  // 1. Empty the collections (both at the same time with Promise.all)
  await Promise.all([Category.deleteMany({}), Product.deleteMany({})]);

  // 2. Save the categories, then remember each one's id by slug: "electronics" -> ObjectId(...)
  const savedCategories = await Category.insertMany(demoCategories());
  const categoryIds = new Map<string, Types.ObjectId>(
    savedCategories.map((category) => [category.slug, category._id]),
  );

  // 3. Which photos are on Cloudinary?
  const photoIds = await listProductPhotoIds();

  // 4. Save the products
  const savedProducts = await Product.insertMany(demoProducts(categoryIds, photoIds));

  // 5. Link bundles and related products. products.ts uses names; we swap each name for its id.
  const productIds = new Map<string, Types.ObjectId>(
    savedProducts.map((product) => [product.name, product._id]),
  );

  // ["Gold-Plated 3.5mm AUX Cable", ...] -> [ObjectId(...), ...]
  // A misspelt name stops the seed with a clear message instead of silently dropping the link.
  const idsFor = (names: string[] | undefined, owner: string) => {
    return (names ?? []).map((name) => {
      const id = productIds.get(name);
      if (!id) {
        throw new Error(`"${owner}" links to a product that doesn't exist: "${name}"`);
      }
      return id;
    });
  };

  // bulkWrite sends all 40 updates to MongoDB in ONE trip instead of 40 separate saves
  await Product.bulkWrite(
    products.map((item) => ({
      updateOne: {
        filter: { _id: productIds.get(item.name) },
        update: {
          $set: {
            bundleProducts: idsFor(item.bundle, item.name),
            relatedProducts: idsFor(item.related, item.name),
          },
        },
      },
    })),
  );

  // 6. A summary for whoever ran the seed
  return {
    categories: savedCategories.length,
    products: savedProducts.length,
    withoutPhotos: savedProducts
      .filter((product) => product.images.length === 0)
      .map((product) => product.name),
  };
};

// Runs when you type "npm run seed": connect, seed, report, disconnect.
const runSeed = async () => {
  try {
    await connectDB();
    const result = await seedDatabase();

    console.log(`Seeded ${result.categories} categories and ${result.products} products.`);
    if (result.withoutPhotos.length > 0) {
      console.log("These products have no photos:", result.withoutPhotos.join(", "));
    }
  } catch (error) {
    console.error("Seed failed:", (error as Error).message);
    process.exitCode = 1; // tells the terminal it failed, without cutting off the disconnect below
  } finally {
    await mongoose.disconnect(); // without this the command would hang and never finish
  }
};

// "require.main === module" is true only when this file is run directly (npm run seed),
// not when another file imports seedDatabase (the demo panel). So importing never re-seeds by accident.
if (require.main === module) {
  runSeed();
}

// Next: STEP 14 (One place to handle errors) -> server/src/middleware/errorHandler.ts
```

**Things to understand, not just type:**
- **`deleteMany({})`:** the empty `{}` filter means "every document". Only use it in the seed!
- **`insertMany`** saves many documents in one go and returns them **with their new `_id`s**. That's how we get
  the ids we need for steps 2 and 5.
- **`Promise.all([...])`** runs both deletes at the same time and waits for both to finish.
- **`$set`** in an update means "change only these fields, leave the rest alone".
- **`try / catch / finally`:** `finally` always runs, whether the seed worked or failed, so the database
  connection is always closed.
- **`process.exitCode = 1` instead of `process.exit(1)`:** `exit` stops immediately, which would skip
  `finally`. `exitCode` reports the failure after cleanup has finished.

### 13.2 Run it
```bash
cd server
npm run typecheck
npm run seed
```

You should see:
```
MongoDB connected: ac-...mongodb.net
Seeded 8 categories and 40 products.
```
No "have no photos" line: I ran this same code against your Cloudinary account, and all 40 products got photos.

### 13.3 Check it in MongoDB Atlas
Atlas → your cluster → **Browse Collections** → database `quickcart`:
- **categories:** 8 documents.
- **products:** 40 documents. Open "Wireless Noise-Cancelling Headphones" and check:
  - `category` is an ObjectId, not the word "electronics"
  - `images` has 5 Cloudinary addresses (paste one in the browser and it should show the photo)
  - `bundleProducts` and `relatedProducts` contain ObjectIds
  - `ratingCounts` is `[203, 30, 10, 3, 2]`
  - `createdAt` and `updatedAt` are present (from `timestamps: true` in the model)
- Run `npm run seed` a second time. There should still be exactly 8 and 40, not 16 and 80.

### Common errors
| Message | Cause |
|---|---|
| `Seed failed: E11000 duplicate key error ... sku` | Two products in `products.ts` have the same `sku` (or `slug`). Change one. |
| `Seed failed: "X" has an unknown category: "y"` | `category` of product X in `products.ts` isn't one of the 8 slugs in `categories.ts`. |
| `Seed failed: "X" links to a product that doesn't exist` | A name in `bundle` or `related` of product X is misspelt. |
| `Seed failed: querySrv ENOTFOUND` / timeout | No internet, or your IP isn't allowed in Atlas → **Network Access**. |
| `Module './demoData' has no exported member ...` | 12.2 isn't written yet, or a function is missing `export`. |
| The command never finishes | You left out `await mongoose.disconnect()`. |

### 13.4 Commit
```bash
git add .
git commit -m "STEP 12-13: demo data and seed command"
git push
```

➡️ **Next: STEP 14 (error handler)**. After that, STEPS 15–16 make the products you just seeded available
at `/api/categories` and `/api/products`, and the shop starts having real data. Reply **NEXT** when 13.3 checks out.

---

## STEP 14: One place to handle errors

### ⚠️ Still open from STEP 13 (2 minutes, do it first)
`src/data/demoData.ts` **line 97** still says `images: photosFor(slug, photoIds),`, so the 9 products with a
`photo:` name are still saved **without photos**. Change it to:
```ts
    images: photosFor(item.photo ?? slug, photoIds), // "photo" from 12.0, otherwise the slug
```
Also replace your `photosFor` (lines 48–60) with the version in STEP 12.2, the one with `bare` and `photoNumber`.
Then run `npm run seed` again until the "have no photos" line is gone.
Also, `src/data/seed.ts` has **never been committed** (`git status` shows `??`), so include it in this step's commit.

### What this step is for
From STEP 15 on, every route can go wrong in some way:
- someone asks for a product that doesn't exist (404)
- they send an id that isn't a valid MongoDB id (400)
- they register with an email that's already taken (409)
- their login has expired (401)
- the database is down (500)

Without a plan, every route ends up with its own `try/catch` and its own way of replying. Instead:

1. **Routes just `throw`.** For example, `throw new AppError(404, "Product not found")`.
2. **Express 5 catches it.** Even in `async` functions, a thrown error or rejected promise is passed along
   automatically. (Express 4 couldn't do this, which is why older tutorials wrap everything in `asyncHandler`.
   You don't need that.)
3. **One `errorHandler` turns any error into a tidy JSON reply** like `{ "message": "Product not found" }`,
   with the right status code. The website can then always show `response.message`.

```
route throws ──► Express 5 passes it on ──► errorHandler ──► res.status(404).json({ message })
```

### 14.1 Create `src/utils/AppError.ts`
An `Error` that also carries the HTTP status code we want to reply with.

```ts
// AppError.ts
// An error with an HTTP status code attached, e.g. throw new AppError(404, "Product not found").
// errorHandler.ts replies with that status and message.

// STEP 14: One place to handle errors (part 1: an error that knows its status code)

export class AppError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message); // let the normal Error store the message
    this.statusCode = statusCode;
  }
}
```

**New idea, a class:**
- `extends Error` means an `AppError` *is* an `Error` with something extra: `statusCode`.
- `super(message)` calls `Error`'s own constructor, so `.message` works as usual.
- Later, `error instanceof AppError` asks "is this one of ours?"

Status codes you'll use: **400** bad input · **401** not logged in · **403** logged in but not allowed (e.g. not admin) ·
**404** not found · **409** already exists · **500** our bug.

### 14.2 Create `src/middleware/errorHandler.ts`

```ts
// errorHandler.ts
// The last middleware: turns ANY error thrown in a route into a JSON reply with the right status code,
// so the server never crashes and the website always gets { message: "..." }.

// STEP 4 / STEP 14: Handle unknown URLs and errors
// notFound.ts answers "no route matched"; this file answers "a route matched but something went wrong".

import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError";

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction, // not used, but Express only treats a middleware as an error handler when it has 4 parameters
) => {
  // 1. Our own errors: throw new AppError(404, "Product not found")
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  // 2. A record broke the model's rules (e.g. required field missing, price below 0)
  if (error instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(error.errors).map((field) => field.message);
    return res.status(400).json({ message: messages.join(". ") });
  }

  // 3. A badly formed id, e.g. GET /api/products/123 ("123" is not a MongoDB id)
  if (error instanceof mongoose.Error.CastError) {
    return res
      .status(400)
      .json({ message: `Invalid ${error.path}: ${String(error.value)}` });
  }

  // The remaining errors aren't classes we can check with instanceof, so we look at their fields
  const err = error as {
    code?: number;
    keyValue?: Record<string, unknown>;
    type?: string;
    name?: string;
  };

  // 4. A "unique" field already used, e.g. registering with an email that exists (MongoDB code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? "value";
    return res.status(409).json({ message: `That ${field} is already in use.` });
  }

  // 5. The website sent broken JSON (express.json() couldn't read the body)
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "The request body is not valid JSON." });
  }

  // 6. A bad or expired login token (used from STEP 18)
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res
      .status(401)
      .json({ message: "Your session has expired. Please log in again." });
  }

  // 7. Anything else is a bug on our side: log the details for us, send a polite message to the user
  // (never send the real error to the browser, it can reveal how the server works)
  console.error(error);
  return res
    .status(500)
    .json({ message: "Something went wrong on our side. Please try again." });
};

// Next: STEP 15 (The categories API) -> server/src/routes/categoryRoutes.ts
```

**Things to understand, not just type:**
- **Why 4 parameters:** Express looks at how many parameters a middleware has. With 4, `(error, req, res, next)`,
  it's called **only when something went wrong**. Remove `_next` and it stops working, even though it's never used.
- **The `_` in `_req` / `_next`** is a convention meaning "I know this is unused". (You already used `_req` in `routes/index.ts`.)
- **`error: unknown`:** anything can be thrown in JavaScript, even a string. `unknown` makes TypeScript insist that we
  check what it is (`instanceof`) before using it.
- **Order matters:** specific checks come first, and the "anything else → 500" fallback comes last.

### 14.3 Use it in `src/app.ts`
1. Import it next to `notFound`:
   ```ts
   import { errorHandler } from "./middleware/errorHandler";
   ```
2. Add it as the **very last** `app.use`, after `notFound`:
   ```ts
   app.use(notFound); // must come after the routes: runs only when nothing above matched
   app.use(errorHandler); // must be last: catches errors thrown by any route above
   ```
3. Update the "Next" comment at the bottom of `app.ts` and `notFound.ts` if you like, since errorHandler is now part of STEP 4/14.

### 14.4 Test it
Start the server (`npm run dev`), then in a **second** Git Bash window:

```bash
# 1. Broken JSON -> 400 from errorHandler (express.json fails before any route runs)
curl -i -X POST http://localhost:5000/api/health -H "Content-Type: application/json" -d "{bad"

# 2. Unknown URL -> 404 from notFound (still works)
curl -i http://localhost:5000/api/nothing-here

# 3. Health -> 200
curl -i http://localhost:5000/api/health
```
Expected:
1. `HTTP/1.1 400` with `{"message":"The request body is not valid JSON."}`
2. `HTTP/1.1 404` with `{"message":"Not found: GET /api/nothing-here"}`
3. `HTTP/1.1 200` with `{"status":"ok",...}`

Before this step, test 1 replied with an **HTML** error page. Now it's JSON. I tested this handler with thrown `AppError`s
(sync and async), a bad id, a crash and broken JSON, and all gave the right status and message.

You'll see `AppError`, the 404 and the CastError in action in STEP 15–16, e.g. `GET /api/products/not-an-id` → 400.

### 14.5 Commit
```bash
git add .
git commit -m "STEP 13-14: seed command, AppError and error handler"
git push
```

➡️ **Next: STEP 15 (categories API: `GET /api/categories` with item counts)**. Reply **NEXT** when 14.4 gives those 3 results.

---

## STEP 15: The categories API

> **Small optional fix from STEP 12:** line 97 is fixed ✅. Your `photosFor` still lacks the `bare` /
> `photoNumber` part, so **Alloy Adjustable Stand** and **Compact Mechanical Keypad** use photo `-2` as their
> main picture, because their first photo has no number. If you want the right cover photo, copy `photosFor` from
> STEP 12.2 and run `npm run seed` again. Otherwise carry on.

### What this step is for
The **Home page** "Shop by category" row (`CategoryGrid`), the **Categories page** and the **Shop page** filter
all need the list of departments, each with **how many products it has** ("Electronics · 340+ items").

You'll build two endpoints:

| Method + URL | Gives back | Used by |
|---|---|---|
| `GET /api/categories` | all 8 categories, each with `productCount` | Home grid, Categories page, Shop filter, admin product form |
| `GET /api/categories/:slug` | one category, e.g. `/api/categories/home-living` | Shop page title when filtered (`/shop?category=home-living`) |

### The pattern you'll use for every feature from now on
```
routes/index.ts ──► routes/categoryRoutes.ts ──► controllers/categoryController.ts ──► models (MongoDB)
  "/categories"        "GET /" → getCategories        does the work, replies JSON
```
- **Routes file:** only *which URL runs which function*. It's short and easy to scan.
- **Controller file:** *what happens*: ask the database and reply. A problem means a `throw new AppError(...)`, and
  STEP 14 takes care of the reply.
- **Replies are always an object with a name**, e.g. `{ categories: [...] }` and not a bare `[...]`. That way you can
  add more fields later (like `total` for pagination) without breaking the website.

### 15.1 Create `src/controllers/categoryController.ts`
Create the `controllers` folder first.

```ts
// categoryController.ts
// What happens when someone asks for categories: read them from MongoDB and reply with JSON.

// STEP 15: The categories API server/src/controllers/categoryController.ts
// GET /api/categories        -> every category with its number of products
// GET /api/categories/:slug  -> one category, e.g. /api/categories/home-living

import { Request, Response } from "express";
import { Types } from "mongoose";
import { Category } from "../models/Category";
import { liveProducts, Product } from "../models/Product";
import { AppError } from "../utils/AppError";

// How many products shoppers can see in each category: { "665f...": 15, "6660...": 6, ... }
// One "aggregate" query counts them all at once, instead of one query per category.
const countProductsByCategory = async () => {
  const rows = await Product.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: liveProducts() }, // only published (or scheduled and already live) products
    { $group: { _id: "$category", count: { $sum: 1 } } }, // one row per category, adding 1 per product
  ]);

  // Turn the rows into a Map so we can look a count up by category id
  return new Map(rows.map((row) => [String(row._id), row.count]));
};

// GET /api/categories
export const getCategories = async (_req: Request, res: Response) => {
  // Run both queries at the same time
  const [categories, counts] = await Promise.all([
    Category.find().select("-__v").sort({ _id: 1 }).lean(), // _id order = the order they were seeded
    countProductsByCategory(),
  ]);

  res.json({
    categories: categories.map((category) => ({
      ...category,
      productCount: counts.get(String(category._id)) ?? 0, // a category with no products gets 0
    })),
  });
};

// GET /api/categories/:slug
export const getCategoryBySlug = async (
  req: Request<{ slug: string }>,
  res: Response,
) => {
  const category = await Category.findOne({ slug: req.params.slug.toLowerCase() })
    .select("-__v")
    .lean();

  // No such category: errorHandler (STEP 14) turns this into a 404 JSON reply
  if (!category) {
    throw new AppError(404, `Category not found: ${req.params.slug}`);
  }

  const productCount = await Product.countDocuments({
    ...liveProducts(),
    category: category._id,
  });

  res.json({ category: { ...category, productCount } });
};

// Next: STEP 15 (part 2) -> server/src/routes/categoryRoutes.ts
```

**Things to understand, not just type:**
- **`aggregate([...])`** is MongoDB's "process the data in stages" query. Each stage takes the output of the one before:
  - `$match` keeps only live products (like `find`'s filter)
  - `$group` puts products into piles by `category`, and `$sum: 1` counts each pile
  The result is something like `[{ _id: <electronics id>, count: 15 }, ...]`.
- **`.lean()`** returns plain JavaScript objects instead of full Mongoose documents. That's faster, and it's what lets
  `...category` copy the fields cleanly so we can add `productCount`. Use `.lean()` whenever you only **read and reply**.
- **`.select("-__v")`** leaves out Mongoose's internal version field `__v`, which the website doesn't need.
- **`String(row._id)`:** ObjectIds are objects, and two different ObjectId objects are never `===` even with the same
  value. Turning both into strings makes the Map lookup work.
- **`Request<{ slug: string }>`** tells TypeScript that `req.params.slug` exists and is a string.
- **No `try/catch`?** Correct. If the database fails, Express 5 passes the error to `errorHandler`.

### 15.2 Create `src/routes/categoryRoutes.ts`

```ts
// categoryRoutes.ts server/src/routes/categoryRoutes.ts
// Which URL runs which function for categories. routes/index.ts puts these under /api/categories.

// STEP 15 (part 2): The categories API routes

import { Router } from "express";
import { getCategories, getCategoryBySlug } from "../controllers/categoryController";

const router = Router();

router.get("/", getCategories); // GET /api/categories
router.get("/:slug", getCategoryBySlug); // GET /api/categories/home-living

export default router;

// Next: STEP 16 (The products API) -> server/src/controllers/productController.ts
```

### 15.3 Connect it in `src/routes/index.ts`
1. Import it at the top, under `import { Router } from "express";`:
   ```ts
   import categoryRoutes from "./categoryRoutes";
   ```
2. Under the `/health` route and **above** `export default router;`, add:
   ```ts
   router.use("/categories", categoryRoutes); // /api/categories...
   ```
   `router.use("/categories", ...)` means "send every URL starting with `/categories` to that file". Inside the file,
   `"/"` then means `/api/categories` and `"/:slug"` means `/api/categories/<something>`.

### 15.4 Test it
```bash
npm run typecheck
npm run dev
```
In a second terminal (or just open the URLs in your browser):
```bash
curl http://localhost:5000/api/categories
curl http://localhost:5000/api/categories/home-living
curl -i http://localhost:5000/api/categories/nope
```
Expected:
1. `{"categories":[{"_id":"...","name":"Electronics","slug":"electronics","icon":"devices",...,"productCount":15}, ...]}`.
   All 8 should be there, in this order with these counts:
   **Electronics 15 · Fashion 6 · Home & Living 3 · Beauty 2 · Sports 4 · Books 2 · Office 3 · Kitchen 5** (total 40).
2. `{"category":{"name":"Home & Living",...,"productCount":3}}`
3. `HTTP/1.1 404` with `{"message":"Category not found: nope"}`, which comes from your STEP 14 errorHandler.

I ran exactly this code against a freshly seeded copy of your data and got those results.

Tip: install the **"JSON Viewer"** extension in Chrome so JSON in the browser is easy to read.

### 15.5 Commit
```bash
git add .
git commit -m "STEP 15: categories API"
git push
```

➡️ **Next: STEP 16 (products API: list with category / search / tag / price filters, sorting, pagination, and one
product with its bundle and related products)**. That's the big one for the Home, Shop and Product Details pages.
Reply **NEXT** when 15.4 matches.
