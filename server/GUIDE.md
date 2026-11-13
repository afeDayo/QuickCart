# QuickCart Server: Step-by-Step Guide

This guide shows you how to finish the server **yourself**. Each step tells you which file to open,
what to type, why each part is there, and how to test it before you move on.
When a step is done and tested, reply **NEXT** and the next step will be added at the bottom of this file.

> Rule for every step: **type the code yourself, don't paste it.** Then run `npm run typecheck`
> (from inside `server/`) and the test at the end of the step. Commit after every step:
> `git add . && git commit -m "STEP X: ..." && git push`

---

## Where you are now

| Done | Step   | What                                                                                |
| ---- | ------ | ----------------------------------------------------------------------------------- |
| ✅   | 1–6    | env, database, Express app, 404 handler, routes + `/api/health`, start server       |
| ✅   | 7–8    | Category and Product models                                                         |
| ✅   | 9      | `slugify`                                                                           |
| ✅   | 10     | Demo data: `categories.ts`, `products.ts` (40 products)                             |
| ✅   | 11     | Upload photos to Cloudinary (renames skipped: STEP 12.0 handles it)                 |
| ✅   | 12     | `demoData.ts` (optional: `photosFor` still lacks the `bare` part, see STEP 15 note) |
| ✅   | 13     | `seed.ts`: `npm run seed` works                                                     |
| ✅   | 14     | Error handler (`AppError` + `errorHandler.ts`)                                      |
| ✅   | 15     | Categories API: `GET /api/categories`                                               |
| ✅   | 16     | Products API: list, filters, sort, pagination, one product                          |
| ✅   | 17     | User model (password hashing, roles, addresses, saved items)                        |
| ⬜   | **18** | **Auth: register, login, me, logout + `protect` / `adminOnly`** ← you are here       |
| ⬜   | 19     | Forgot password, reset password, verify email                                       |
| ⬜   | 20     | My Account: profile, change password, addresses, saved items                        |
| ⬜   | 21     | Promo codes (`QUICK25`, `QUICK10`)                                                  |
| ⬜   | 22     | Orders: checkout, my orders, order details, cancel within 1 hour                    |
| ⬜   | 23     | Reviews (only buyers of delivered orders)                                           |
| ⬜   | 24     | Newsletter sign-up                                                                  |
| ⬜   | 25     | Admin: photo upload, products CRUD, categories CRUD                                 |
| ⬜   | 26     | Admin: orders management, customers list                                            |
| ⬜   | 27     | Admin: dashboard stats (sales, chart, top sellers, low stock)                       |
| ⬜   | 28     | Demo panel: reset demo data, move orders along                                      |
| ⬜   | 29     | Final check: build, test every endpoint, clean-up                                   |

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
  (₦2,500) delivery, Card or Pay on Delivery (payment is _simulated_: no real Paystack).
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

| Current file name (all `.jpeg`)           | Rename to                                                            | Why                                   |
| ----------------------------------------- | -------------------------------------------------------------------- | ------------------------------------- |
| `alloy-adjustable-stand.jpeg`             | `alloy-adjustable-stand-1.jpeg`                                      | number missing                        |
| `compact-mechanical-keypad.jpeg`          | `compact-mechanical-keypad-1.jpeg`                                   | number missing                        |
| `bluethoot-portable-speaker-1..4`         | `bluetooth-portable-speaker-1..4`                                    | typo                                  |
| `cast-iron-skillet-10inch-1..4`           | `cast-iron-skillet-10-inch-1..4`                                     | product name is "10-inch"             |
| `daily-planner-n-hardcover-Journal-1..4`  | `daily-planner-hardcover-journal-1..4`                               | `&` becomes nothing; capital J        |
| `design-system-handbook-1..4`             | `design-systems-handbook-1..4`                                       | product is "Design Systems Handbook"  |
| `fast-dual-usb-c-gan-charger-35w-1 ..4 `  | `fast-dual-usb-c-gan-charger-35w-1..4`                               | **space before `.jpeg`**: delete it   |
| `insulated-1l-hydro-flask-1 ..4 `         | `insulated-1l-hydro-flask-1..4`                                      | **space before `.jpeg`**: delete it   |
| `gold-plated-3.5mm-aux-cable-1..4`        | `gold-plated-3-5mm-aux-cable-1..4`                                   | slugify turns `.` into `-`            |
| `magnetic-headphone-stand-n-usb-hub-1..4` | `magnetic-headphone-stand-usb-hub-1..4`                              | `&` becomes nothing                   |
| `minimalistic-led-desk-lamp-1..4`         | `minimalist-led-desk-lamp-1..4`                                      | product is "Minimalist LED Desk Lamp" |
| `hi-res-dac-audio-adapter-3.1.jpeg`       | `hi-res-dac-audio-adapter-5.jpeg` (or delete it if it's a duplicate) | the extra `.1`                        |

**Two products have no photos at all:** `Smart Gooseneck Kettle` (`smart-gooseneck-kettle`) and
`True Wireless ANC Earbuds` (`true-wireless-anc-earbuds`). Add photos named `smart-gooseneck-kettle-1.jpeg`
and `true-wireless-anc-earbuds-1.jpeg` (more if you have them). Otherwise those two show no picture.

Tip: in File Explorer, turn on _View → Show → File name extensions_ so you can see the hidden spaces before `.jpeg`.

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
    console.error(
      'Say where the photos are: npm run upload-images -- "C:/path/to/photos"',
    );
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

| Product (line in `products.ts`)           | Add this line under `name:`                                                                             |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Design Systems Handbook (688)             | `photo: "design-system-handbook",`                                                                      |
| Minimalist LED Desk Lamp (792)            | `photo: "minimalistic-led-desk-lamp",`                                                                  |
| Bluetooth Portable Speaker (1528)         | `photo: "bluethoot-portable-speaker",`                                                                  |
| Cast Iron Skillet 10-inch (1740)          | `photo: "cast-iron-skillet-10inch",`                                                                    |
| Daily Planner & Hardcover Journal (2474)  | `photo: "daily-planner-n-hardcover-journal",`                                                           |
| Smart Gooseneck Kettle (2687)             | `photo: "electric-gooseneck-kettle",` _(no photos of its own; borrows the Electric Gooseneck Kettle's)_ |
| Gold-Plated 3.5mm AUX Cable (3639)        | `photo: "gold-plated-3.5mm-aux-cable",`                                                                 |
| True Wireless ANC Earbuds (3954)          | `photo: "aeropro-wireless-buds",` _(no photos of its own; borrows the AeroPro Wireless Buds')_          |
| Magnetic Headphone Stand & USB Hub (4061) | `photo: "magnetic-headphone-stand-n-usb-hub",`                                                          |

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
export const makeRatingCounts = (
  rating: number,
  reviewCount: number,
): number[] => {
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
  const photoNumber = (id: string) =>
    id === bare ? 0 : Number(id.slice(prefix.length));

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
      throw new Error(
        `"${item.name}" has an unknown category: "${item.category}"`,
      );
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
  const savedProducts = await Product.insertMany(
    demoProducts(categoryIds, photoIds),
  );

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
        throw new Error(
          `"${owner}" links to a product that doesn't exist: "${name}"`,
        );
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

    console.log(
      `Seeded ${result.categories} categories and ${result.products} products.`,
    );
    if (result.withoutPhotos.length > 0) {
      console.log(
        "These products have no photos:",
        result.withoutPhotos.join(", "),
      );
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

| Message                                                  | Cause                                                                                 |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `Seed failed: E11000 duplicate key error ... sku`        | Two products in `products.ts` have the same `sku` (or `slug`). Change one.            |
| `Seed failed: "X" has an unknown category: "y"`          | `category` of product X in `products.ts` isn't one of the 8 slugs in `categories.ts`. |
| `Seed failed: "X" links to a product that doesn't exist` | A name in `bundle` or `related` of product X is misspelt.                             |
| `Seed failed: querySrv ENOTFOUND` / timeout              | No internet, or your IP isn't allowed in Atlas → **Network Access**.                  |
| `Module './demoData' has no exported member ...`         | 12.2 isn't written yet, or a function is missing `export`.                            |
| The command never finishes                               | You left out `await mongoose.disconnect()`.                                           |

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

- `extends Error` means an `AppError` _is_ an `Error` with something extra: `statusCode`.
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
    return res
      .status(409)
      .json({ message: `That ${field} is already in use.` });
  }

  // 5. The website sent broken JSON (express.json() couldn't read the body)
  if (err.type === "entity.parse.failed") {
    return res
      .status(400)
      .json({ message: "The request body is not valid JSON." });
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

| Method + URL                | Gives back                                       | Used by                                                      |
| --------------------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| `GET /api/categories`       | all 8 categories, each with `productCount`       | Home grid, Categories page, Shop filter, admin product form  |
| `GET /api/categories/:slug` | one category, e.g. `/api/categories/home-living` | Shop page title when filtered (`/shop?category=home-living`) |

### The pattern you'll use for every feature from now on

```
routes/index.ts ──► routes/categoryRoutes.ts ──► controllers/categoryController.ts ──► models (MongoDB)
  "/categories"        "GET /" → getCategories        does the work, replies JSON
```

- **Routes file:** only _which URL runs which function_. It's short and easy to scan.
- **Controller file:** _what happens_: ask the database and reply. A problem means a `throw new AppError(...)`, and
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
  const category = await Category.findOne({
    slug: req.params.slug.toLowerCase(),
  })
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
import {
  getCategories,
  getCategoryBySlug,
} from "../controllers/categoryController";

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

---

## STEP 16: The products API

### What this step is for

This is the endpoint the shop runs on. Almost every customer screen in `ui/` lists products in some way:

| Screen / section                                       | Request the website will make                                                                |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Shop page, all products, 24 per page                   | `GET /api/products?page=1`                                                                   |
| Shop page category pills / `?category=` links          | `GET /api/products?category=electronics`                                                     |
| Search bar ("Search products, brands and categories…") | `GET /api/products?search=headphones`                                                        |
| Shop "Sort: Featured" dropdown                         | `&sort=featured` / `price-asc` / `price-desc` / `newest` / `rating` / `best-selling`         |
| Home "Limited Rush Deals" (flash sale)                 | `GET /api/products?tag=flash-deal`                                                           |
| Home "Featured products"                               | `GET /api/products?tag=featured`                                                             |
| Home "Today's Deals"                                   | `GET /api/products?tag=deal`                                                                 |
| Home "New Arrivals"                                    | `GET /api/products?tag=new-arrival`                                                          |
| Home "Recommended for You"                             | `GET /api/products?tag=recommended`                                                          |
| Home "Best Sellers in Nigeria"                         | `GET /api/products?sort=best-selling&limit=4`                                                |
| Price filter                                           | `&minPrice=10000&maxPrice=20000`                                                             |
| Product Details page                                   | `GET /api/products/wireless-noise-cancelling-headphones` (slug) **or** `/api/products/<_id>` |

So you build **two** endpoints. The first one takes optional filters that can be **combined**, e.g.
`/api/products?category=electronics&sort=price-asc&page=2`.

Reply shapes:

- **List:** `{ products: [...], total: 39, page: 1, pages: 2 }`. The Shop page needs `total` and `pages` for
  "Showing 1–24 of 39" and the page numbers.
- **One:** `{ product: { ...everything, category: {name, slug, icon}, bundleProducts: [...], relatedProducts: [...] } }`

**Security rule:** `costPrice` (what the shop paid) is for admins only and must **never** appear in these public replies.

### 16.1 Create `src/utils/escapeRegex.ts`

Search uses a _regular expression_ to find the typed text anywhere in a name. Some characters mean something special in a regex.
If someone searches `3.5mm`, the `.` would match **any** character. If they search `(` the server would crash with an invalid regex.
This helper puts a `\` in front of every special character so the search text is matched **literally**.

```ts
// escapeRegex.ts server/src/utils/escapeRegex.ts
// Makes user text safe to put inside a regular expression: "3.5mm (black)" -> "3\.5mm \(black\)"
// Without it, "." would match any character and "(" would crash the search.

// STEP 16: The products API (helper)

export const escapeRegex = (text: string) => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& = "the character that matched"
};
```

Type this regex **very carefully**: `/[.*+?^${}()|[\]\\]/g`. It's a list of special characters between `[` and `]`.

### 16.2 Create `src/controllers/productController.ts`

```ts
// productController.ts server/src/controllers/productController.ts
// The public products API: the Shop page list (with filters, search, sorting and pages)
// and the Product Details page. Only products shoppers may see (liveProducts) are ever returned.

// STEP 16: The products API
// GET /api/products             -> a page of products, e.g. ?category=electronics&sort=price-asc&page=2
// GET /api/products/:idOrSlug   -> one product with its category, bundle and related products

import { Request, Response } from "express";
import { SortOrder, Types } from "mongoose";
import { Category } from "../models/Category";
import { liveProducts, Product } from "../models/Product";
import { AppError } from "../utils/AppError";
import { escapeRegex } from "../utils/escapeRegex";

// The fields a product card needs. Leaving out the rest (description, specs...) keeps the list fast and small.
// costPrice is NOT here on purpose: it's admin-only.
const CARD_FIELDS =
  "name slug brand price oldPrice images ratings reviewCount badge tagline priceNote tags sold stock trackStock flashSaleStock colors category";

// ?sort=... -> how MongoDB should order the results (1 = smallest first, -1 = biggest first)
// _id is added as a tie-breaker so products with the same price always come in the same order.
const SORTS: Record<string, Record<string, SortOrder>> = {
  featured: { _id: 1 }, // the order in products.ts (the design's "Featured" order)
  newest: { createdAt: -1, _id: -1 },
  "price-asc": { price: 1, _id: 1 },
  "price-desc": { price: -1, _id: 1 },
  rating: { ratings: -1, reviewCount: -1 },
  "best-selling": { sold: -1, _id: 1 },
};

// --- Small helpers to read the query string safely --------------------------------
// Everything in req.query arrives as text (or an array, or nothing), never as a number.

// "  Headphones " -> "Headphones"; anything that isn't a single string -> ""
const text = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

// "15000" -> 15000; "" or "abc" -> undefined (meaning "no filter")
const toNumber = (value: unknown) => {
  const number = Number(text(value));
  return text(value) !== "" && Number.isFinite(number) ? number : undefined;
};

// For page and limit: a whole number above 0, otherwise the fallback ("abc", "-3", "0" -> fallback)
const wholeNumber = (value: unknown, fallback: number) => {
  const number = Math.floor(Number(text(value)));
  return number > 0 ? number : fallback;
};

// GET /api/products
export const getProducts = async (req: Request, res: Response) => {
  // Every filter is added to this list; a product must match ALL of them ($and).
  // It always starts with liveProducts(), so drafts and future products are never shown.
  const conditions: Record<string, unknown>[] = [liveProducts()];

  // ?category=electronics: the website sends the slug, the products store the category id
  const categorySlug = text(req.query.category).toLowerCase();
  if (categorySlug) {
    const category = await Category.findOne({ slug: categorySlug });

    // An unknown category simply has no products (the Shop page shows "no products found")
    if (!category) {
      res.json({ products: [], total: 0, page: 1, pages: 0 });
      return;
    }
    conditions.push({ category: category._id });
  }

  // ?tag=flash-deal: the Home page sections
  const tag = text(req.query.tag).toLowerCase();
  if (tag) {
    conditions.push({ tags: tag }); // matches when the tags array CONTAINS this tag
  }

  // ?search=aura: the text anywhere in the name, brand or tags, ignoring capitals ("i")
  const search = text(req.query.search);
  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    conditions.push({
      $or: [{ name: pattern }, { brand: pattern }, { tags: pattern }],
    });
  }

  // ?minPrice=10000&maxPrice=20000 (either one alone works too)
  const minPrice = toNumber(req.query.minPrice);
  const maxPrice = toNumber(req.query.maxPrice);
  if (minPrice !== undefined) {
    conditions.push({ price: { $gte: minPrice } }); // $gte = greater than or equal
  }
  if (maxPrice !== undefined) {
    conditions.push({ price: { $lte: maxPrice } }); // $lte = less than or equal
  }

  // ?sort=price-asc (unknown or missing -> featured)
  const sort = SORTS[text(req.query.sort)] ?? SORTS.featured;

  // ?page=2&limit=24: 24 per page like the design, never more than 60 at once
  const limit = Math.min(wholeNumber(req.query.limit, 24), 60);
  const page = wholeNumber(req.query.page, 1);

  const filter = { $and: conditions };

  // The page of products AND the total count, at the same time
  const [products, total] = await Promise.all([
    Product.find(filter)
      .select(CARD_FIELDS)
      .populate("category", "name slug") // swap the category id for { _id, name, slug }
      .sort(sort)
      .skip((page - 1) * limit) // page 2 with limit 24 skips the first 24
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.json({ products, total, page, pages: Math.ceil(total / limit) });
};

// A MongoDB id is exactly 24 characters of 0-9 and a-f
const OBJECT_ID = /^[a-f0-9]{24}$/i;

// GET /api/products/:idOrSlug
export const getProduct = async (
  req: Request<{ idOrSlug: string }>,
  res: Response,
) => {
  const { idOrSlug } = req.params;

  // Links can use either the id or the readable slug
  const which = OBJECT_ID.test(idOrSlug)
    ? { _id: idOrSlug }
    : { slug: idOrSlug.toLowerCase() };

  const product = await Product.findOne({ $and: [which, liveProducts()] })
    .select("-costPrice -__v") // everything EXCEPT these
    .populate<{
      category: {
        _id: Types.ObjectId;
        name: string;
        slug: string;
        icon: string;
      };
    }>("category", "name slug icon")
    // Fill in the linked products with card fields, skipping any that are no longer live
    .populate({
      path: "bundleProducts",
      match: liveProducts(),
      select: CARD_FIELDS,
    })
    .populate({
      path: "relatedProducts",
      match: liveProducts(),
      select: CARD_FIELDS,
    })
    .lean();

  // Not found, or a draft/scheduled product: both look the same to shoppers
  if (!product) {
    throw new AppError(404, "Product not found");
  }

  // The model says: empty relatedProducts = show the best sellers from the same category
  let relatedProducts: unknown[] = product.relatedProducts;
  if (relatedProducts.length === 0) {
    relatedProducts = await Product.find({
      $and: [
        liveProducts(),
        { category: product.category._id },
        { _id: { $ne: product._id } }, // $ne = not equal: don't recommend the product to itself
      ],
    })
      .select(CARD_FIELDS)
      .sort({ sold: -1 })
      .limit(4)
      .lean();
  }

  res.json({ product: { ...product, relatedProducts } });
};

// Next: STEP 16 (part 2) -> server/src/routes/productRoutes.ts
```

**Things to understand, not just type:**

- **Why `$and` with a list?** `liveProducts()` already uses `$or` (published **or** scheduled-and-due), and search uses
  `$or` too. A filter object can only have **one** `$or` key, so a second one would silently overwrite the first and
  drafts would leak into the shop. Putting each condition in the `$and` list keeps them all.
- **`req.query` is always text.** `?page=2` gives `"2"`, not `2`, and a user can type anything (`?page=abc`, `?page=-5`).
  That's why the small helpers exist: bad input falls back to a sensible default instead of crashing.
- **`skip` + `limit` = pagination.** Page `p` skips `(p - 1) × limit` products and takes `limit`.
  `pages = Math.ceil(total / limit)`, so 39 products at 24 per page is 2 pages.
- **`populate`** replaces an id with the document it points to. `.populate("category", "name slug")` turns
  `category: ObjectId("665f…")` into `category: { _id, name: "Electronics", slug: "electronics" }`.
  The version with `{ path, match, select }` also **filters**: linked products that were turned into drafts are dropped.
- **`populate<{ category: {...} }>`** tells TypeScript that after populating, `category` is an object, not an id.
  That's what makes `product.category._id` typecheck.
- **`select("-costPrice -__v")`:** a `-` means "leave this out". `CARD_FIELDS` is the opposite, a list of fields to
  **include**. (You can't mix including and leaving out in one select.)
- **The `res.json(...); return;` in the category check:** we've already replied, so we stop the function there.
  Replying twice crashes with "Cannot set headers after they are sent".

### 16.3 Create `src/routes/productRoutes.ts`

```ts
// productRoutes.ts server/src/routes/productRoutes.ts
// Which URL runs which function for products. routes/index.ts puts these under /api/products.

// STEP 16 (part 2): The products API routes

import { Router } from "express";
import { getProduct, getProducts } from "../controllers/productController";

const router = Router();

router.get("/", getProducts); // GET /api/products?category=...&search=...&sort=...&page=...
router.get("/:idOrSlug", getProduct); // GET /api/products/smart-watch-ultra

export default router;

// Next: STEP 17 (The User model) -> server/src/models/User.ts
```

### 16.4 Connect it in `src/routes/index.ts`

Same as STEP 15:

```ts
import productRoutes from "./productRoutes";
```

```ts
router.use("/products", productRoutes); // /api/products...
```

### 16.5 Test it

Run `npm run seed` first so you have a clean copy of all 40 products, then `npm run typecheck` and `npm run dev`.
Open these in the browser (or use `curl`):

| URL                                                         | Expected                                                                                                                                                                                                       |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/products`                                             | `total: 40`, `pages: 2`, 24 products, starting with **Wireless Noise-Cancelling Headphones**, Canvas Low-Top Sneakers, Ceramic Mug Set                                                                         |
| `/api/products?page=2`                                      | the remaining 16 products                                                                                                                                                                                      |
| `/api/products?category=electronics&sort=price-asc&limit=3` | `total: 15`, cheapest first: **Gold-Plated 3.5mm AUX Cable ₦2,200**, Protective Hard Shell Case ₦6,500, Fast Dual USB-C GaN Charger 35W ₦8,000                                                                 |
| `/api/products?search=3.5mm`                                | exactly 1: the AUX cable (proof that `escapeRegex` works)                                                                                                                                                      |
| `/api/products?search=aura`                                 | 10 products (name, brand "Aura Sound Labs", or tags), case doesn't matter                                                                                                                                      |
| `/api/products?tag=flash-deal`                              | 4: AeroPro Wireless Buds, Smart Gooseneck Kettle, Botanical Radiance Elixir, Alloy Adjustable Stand (the Home "Limited Rush Deals" row)                                                                        |
| `/api/products?sort=best-selling&limit=4`                   | starts with Wireless Noise-Cancelling Headphones (1,420 sold)                                                                                                                                                  |
| `/api/products?minPrice=10000&maxPrice=20000`               | only products from ₦10,000 to ₦20,000                                                                                                                                                                          |
| `/api/products?category=nope`                               | `{"products":[],"total":0,"page":1,"pages":0}`                                                                                                                                                                 |
| `/api/products?page=abc&limit=-5`                           | still works, using page 1 and 24 per page                                                                                                                                                                      |
| `/api/products/wireless-noise-cancelling-headphones`        | full product; `category` is `{name:"Electronics",...}`; 3 `bundleProducts` (Protective Hard Shell Case, Gold-Plated 3.5mm AUX Cable, Fast Dual USB-C GaN Charger 35W); 4 `relatedProducts`; **no `costPrice`** |
| `/api/products/<paste that product's _id>`                  | the same product                                                                                                                                                                                               |
| `/api/products/nope`                                        | `404 {"message":"Product not found"}`                                                                                                                                                                          |

**Check that drafts stay hidden.** In Atlas, change one product's `status` to `"draft"`. `/api/products` should now
say `total: 39`, and that product's page should give a 404. Then run `npm run seed` to put everything back.

I ran this exact code against a freshly seeded copy of your data, including the draft test and the "no related products"
fallback, and got the results above.

### 16.6 Commit

```bash
git add .
git commit -m "STEP 16: products API with filters, search, sorting and pagination"
git push
```

🎉 After this step, the **whole customer catalogue** (Home, Shop, Categories, Product Details) has real data.

➡️ **Next: STEP 17 (User model: password hashing with bcrypt, customer/admin roles, addresses, saved items)**.
Reply **NEXT** when 16.5 checks out.

---

## STEP 17: The User model

### What this step is for

Everything from here on needs **people**: logging in (STEP 18), My Account (STEP 20), placing orders (STEP 22),
reviews (STEP 23) and the admin pages. This step creates the **User model** and seeds two demo accounts.
There are no routes yet; the login endpoints come in STEP 18.

What the screens in `ui/` say a user needs:

| Screen                                                | Fields                                                                                       |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Register / My Account "Edit Profile"                  | `firstName`, `lastName`, `email`, `phone`                                                    |
| Login                                                 | `email` + `password`                                                                         |
| My Account "Verified Customer" badge                  | `isEmailVerified`                                                                            |
| My Account "Member since March 2024"                  | `createdAt` (from `timestamps`)                                                              |
| Admin pages vs shop                                   | `role`: `"customer"` or `"admin"`                                                            |
| Delivery Addresses (Home / Office, "Default Address") | `addresses[]`: label, fullName, phone, street, city, state, country, instructions, isDefault |
| Saved Items (the heart icon)                          | `savedItems[]`: product ids                                                                  |
| Forgot / Reset password, Verify email (STEP 19)       | token + expiry fields                                                                        |
| "Password last updated 42 days ago"                   | `passwordChangedAt`                                                                          |

### The 3 password rules (the most important part of this step)

1. **Never store the real password.** We store a **hash**, a scrambled version made by `bcrypt`. You can't turn
   a hash back into the password. To check a login, bcrypt hashes the typed password the same way and compares the two.
   If the database ever leaks, nobody can read the passwords.
2. **Never send the password, or its hash, to the browser.** `select: false` keeps it out of queries, and `toJSON`
   removes it from replies just in case.
3. **Hash automatically.** A `pre("save")` hook hashes the password every time it's set or changed, so no route can
   forget to do it.

### 17.1 Create `src/models/User.ts`

```ts
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
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
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

// Next: STEP 17 (part 2: demo users) -> server/src/data/users.ts
```

**Things to understand, not just type:**

- **`isModified("password")`:** the hook runs on **every** save, including when someone only changes their phone.
  Without this check, the hash would be hashed again and the user could never log in.
- **`function ()` instead of `() =>`:** arrow functions have no `this` of their own. Mongoose passes the document as
  `this`, so hooks and methods must use `function`.
- **`select: false`:** `User.findOne({ email })` comes back **without** `password`. Login (STEP 18) is the only place that
  asks for it: `User.findOne({ email }).select("+password")`.
- **Sub-documents (`addresses: [addressSchema]`)** are stored inside the user. Each still gets its own `_id`, so
  `PATCH /api/account/addresses/:id` (STEP 20) can find one.
- **`Model<IUser, {}, IUserMethods>`** is how TypeScript learns that users have a `comparePassword` method.

### 17.2 Create `src/data/users.ts`: two demo accounts

One admin to manage the shop, and **Ada Obi**, the customer who appears in every design (her checkout, her order
#QC-1042, her account page), with the same two addresses as the designs.

```ts
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

// Next: STEP 17 (part 3) -> add the users to server/src/data/demoData.ts and seed.ts
```

### 17.3 Add `demoUsers` to `src/data/demoData.ts`

1. Add the import with the others at the top:
   ```ts
   import { users } from "./users";
   ```
2. Add this function, e.g. under `demoCategories`:
   ```ts
   // --- Users ---------------------------------------------------------------------------
   // users.ts is already shaped like the User model. Passwords are hashed by the model when seed.ts saves them.
   export const demoUsers = () => {
     return users;
   };
   ```

### 17.4 Seed the users in `src/data/seed.ts`

Four small changes:

1. **Imports** (top of the file):

   ```ts
   import { User } from "../models/User";
   ```

   and add `demoUsers` to the demoData import:

   ```ts
   import { demoCategories, demoProducts, demoUsers } from "./demoData";
   ```

   (While you're there: line 11, `import { categories } from "./categories";`, isn't used, so you can delete it.)

2. **Step 1 (line 20)**: empty the users too:

   ```ts
   await Promise.all([
     Category.deleteMany({}),
     Product.deleteMany({}),
     User.deleteMany({}),
   ]);
   ```

3. **New part after step 5** (after the `bulkWrite`, before the summary):

   ```ts
   // 6. Save the demo users. User.create (NOT insertMany): only create/save runs the model's
   // pre("save") hook, which hashes the passwords. insertMany would store them as plain text!
   const savedUsers = await User.create(demoUsers());
   ```

   Change the summary comment to `// 7. A summary ...` and add `users` to the returned object:

   ```ts
   users: savedUsers.length,
   ```

4. **In `runSeed`**, update the message:
   ```ts
   console.log(
     `Seeded ${result.categories} categories, ${result.products} products and ${result.users} users`,
   );
   ```

**Why `User.create` and not `insertMany` here:** `insertMany` is fast because it **skips the model's hooks**. For
categories and products that doesn't matter. For users it means the `pre("save")` that hashes passwords would
**never run**, and `Password@123` would sit in the database as plain text. `create` saves each user one by one, so
the hook runs every time.

### 17.5 Test it

```bash
npm run typecheck
npm run seed
```

Expected: `Seeded 8 categories, 40 products and 2 users`

In **Atlas → quickcart → users**:

- 2 documents: `admin@quickcart.ng` (role `admin`) and `ada.obi@example.com` (role `customer`).
- `password` looks like `$2b$10$Kq9...`, a hash and **not** `Password@123`. If you can read the password, you used
  `insertMany`. Go back to 17.4 step 3.
- Ada has 2 `addresses`, each with its own `_id`, and `country: "Nigeria"`.
- Both have `createdAt` / `updatedAt`.

`comparePassword` gets its real test in STEP 18 when you log in. I tested this model on a throwaway database:

- hashing works
- `select: false` hides the password
- `comparePassword` is true for the right password and false for a wrong one
- changing only the name does **not** re-hash the password
- changing the password sets `passwordChangedAt`
- a second account with `ADA.OBI@example.com` is refused (11000 → your errorHandler sends 409)
- a bad email and a 3-letter password give the friendly messages from the schema

### 17.6 Commit

```bash
git add .
git commit -m "STEP 17: User model and demo users"
git push
```

➡️ **Next: STEP 18 (Auth: register, login, logout, "who am I", JWT tokens, and the `protect` / `adminOnly`
middleware that guards private and admin routes)**. Reply **NEXT** when 17.5 checks out.

---

## STEP 18: Auth (register, login, "who am I", logout) and the route guards

After this step, people can create an account and log in. You'll also have two "guards" you can put in front of any
route: `protect` (must be logged in) and `adminOnly` (must be an admin). Every later step uses them.

**How login works here (JWT):**

1. The user logs in with email + password. The server checks the password and replies with a **token**: a long
   string like `eyJhbGciOi...` that says "this is user 6650..., valid until ...". The token is **signed** with your
   `JWT_SECRET`.
2. The website saves the token and sends it with every private request in a header:
   `Authorization: Bearer eyJhbGciOi...`
3. `protect` reads that header and checks the signature (nobody can fake one without your secret). Then it loads
   the user and lets the request through.

The server doesn't store logins anywhere, so **logout** just means the website deletes its token.

What the screens need (from `ui/`):

- **Registration:**
  - first name, last name, email (with an **"Available"** tick) and phone
  - a password with rules: 8+ characters, an uppercase letter and a number (the symbol is optional because
    "Medium" is accepted)
  - confirm password, and an "I agree to the Terms" box
- **Login:** email, password, **"Remember me for 30 days"**. Without it, the token lasts `JWT_EXPIRES_IN` (15 days).
- "Continue with Google" is **out of scope**. Leave the button in the client but don't build it.

### 18.0 First, fix a typo in `errorHandler.ts` (from STEP 14)

Open `src/middleware/errorHandler.ts`. Part 2 (the ValidationError part) says:

```ts
return res.status(400).json({ messages: messages.join(". ") });
```

The key must be `message` (singular), like every other reply. The website reads `message`, so with this typo a
registration with no first name would show no error at all. My test caught it:
`{"messages":"First name is required"}`. Change it to:

```ts
return res.status(400).json({ message: messages.join(". ") });
```

### 18.1 `src/utils/token.ts`: make and check tokens

New file. It has two small functions, so the rest of the code never touches `jsonwebtoken` directly.

```ts
// token.ts server/src/utils/token.ts
// Makes login tokens (JWTs) and checks them.

// STEP 18 (part 1): Tokens

import jwt from "jsonwebtoken";
import { env } from "../config/env";

// What is inside one of our tokens once it's checked
export interface TokenPayload {
  id: string; // the user's _id
  iat: number; // "issued at": when it was made, in SECONDS since 1970
  exp: number; // when it stops working, in seconds
}

// signToken("6650...") -> "eyJhbGciOi..."
// rememberMe ("Remember me for 30 days" on the login screen) -> 30 days, otherwise JWT_EXPIRES_IN (15d)
export const signToken = (userId: string, rememberMe = false) => {
  // The "as" is needed because TypeScript only accepts strings like "15d" here, and env gives a plain string
  const expiresIn = (rememberMe ? "30d" : env.jwtExpiresIn) as jwt.SignOptions["expiresIn"];

  return jwt.sign({ id: userId }, env.jwtSecret, { expiresIn });
};

// verifyToken("eyJhbGciOi...") -> { id, iat, exp }
// If the token was changed, faked or has expired, jwt.verify THROWS (JsonWebTokenError / TokenExpiredError).
// We don't catch it: errorHandler part 6 (STEP 14) already turns those into a 401.
export const verifyToken = (token: string) => {
  return jwt.verify(token, env.jwtSecret) as TokenPayload;
};
```

**Check your `.env`:** `JWT_SECRET` should be a long random string, not a word. You can make one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 18.2 `src/middleware/auth.ts`: the `protect` and `adminOnly` guards

New file.

```ts
// auth.ts server/src/middleware/auth.ts
// Guards for routes:
//   router.get("/me", protect, getMe)                     -> must be logged in
//   router.post("/", protect, adminOnly, createProduct)   -> must be an admin

// STEP 18 (part 2): Route guards

import { NextFunction, Request, Response } from "express";
import { HydratedDocument } from "mongoose";
import { IUser, User } from "../models/User";
import { AppError } from "../utils/AppError";
import { verifyToken } from "../utils/token";

// Teach TypeScript that a request can carry the logged-in user: req.user
// (Express's Request type doesn't have "user", so we add it to Express's own type.)
declare global {
  namespace Express {
    interface Request {
      user?: HydratedDocument<IUser>; // a full user document, so later steps can change and .save() it
    }
  }
}

// protect: let the request through only if it carries a valid token for a user who still exists
export const protect = async (req: Request, _res: Response, next: NextFunction) => {
  // 1. The header looks like "Bearer eyJhbGciOi..."
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError(401, "Please log in to continue.");
  }

  const token = header.split(" ")[1]; // the part after "Bearer "

  // 2. Check the token. A fake or expired one throws here -> errorHandler -> 401
  const payload = verifyToken(token);

  // 3. The user might have been deleted since the token was made
  const user = await User.findById(payload.id);
  if (!user) {
    throw new AppError(401, "This account no longer exists. Please log in again.");
  }

  // 4. If the password was changed AFTER this token was made, the token is no longer accepted.
  //    (Someone who stole an old token is locked out as soon as the real owner changes the password.)
  //    Math.floor: iat is in whole seconds, so we compare whole seconds too. Without it, a token made in
  //    the same second as the change (e.g. right after "change password" in STEP 20) would be refused.
  if (user.passwordChangedAt) {
    const changedAt = Math.floor(user.passwordChangedAt.getTime() / 1000);
    if (changedAt > payload.iat) {
      throw new AppError(401, "Your password was changed. Please log in again.");
    }
  }

  // 5. Remember who it is for the next function, and continue
  req.user = user;
  next();
};

// adminOnly: always put it AFTER protect (it needs req.user)
export const adminOnly = (req: Request, _res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") {
    throw new AppError(403, "Only admins can do this."); // 403 = "I know who you are, but no"
  }

  next();
};
```

**Why `throw` works in middleware here:** Express 5 catches errors thrown in async functions and sends them to
`errorHandler`. Express 4 couldn't do this, which is why older tutorials wrap everything in `try/catch` or
`asyncHandler`. You don't need that.

**401 vs 403:** 401 means "I don't know who you are, log in". 403 means "you're logged in, but not allowed".

### 18.3 `src/controllers/authController.ts`

New file.

```ts
// authController.ts server/src/controllers/authController.ts
// Create an account, log in, "who am I", log out, and "is this email free?"

// STEP 18 (part 3): The auth controller
// POST /api/auth/register           -> create an account, reply with a token
// POST /api/auth/login              -> check email + password, reply with a token
// GET  /api/auth/me                 -> the logged-in user          (protect)
// POST /api/auth/logout             -> "logged out"                (protect)
// GET  /api/auth/check-email?email= -> { available: true/false }  (the "Available" tick)

import { Request, Response } from "express";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import { signToken } from "../utils/token";

// The rules from the registration screen: 8+ characters, an uppercase letter and a number.
// (?=.*[A-Z]) = "somewhere there is an A-Z", (?=.*\d) = "somewhere there is a 0-9", .{8,} = 8 or more characters
const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

// POST /api/auth/register
export const register = async (req: Request, res: Response) => {
  // "?? {}": in Express 5, req.body is undefined when nothing was sent, and destructuring undefined crashes
  const { firstName, lastName, email, phone, password, confirmPassword, agreeToTerms } =
    req.body ?? {};

  if (!agreeToTerms) {
    throw new AppError(400, "Please agree to the Terms of Service and Privacy Policy.");
  }

  // The model only checks "8 characters"; the uppercase + number rules are checked here.
  // (They can't go in the model: the model sees the HASH when it validates on later saves.)
  if (typeof password !== "string" || !PASSWORD_RULE.test(password)) {
    throw new AppError(
      400,
      "Password must be at least 8 characters with one uppercase letter (A-Z) and one number (0-9).",
    );
  }

  if (password !== confirmPassword) {
    throw new AppError(400, "Passwords do not match.");
  }

  // Pick the fields one by one. NEVER do User.create(req.body): someone could send "role": "admin"!
  // Missing names or a bad email -> the model's messages (400). Email already used -> 409.
  const user = await User.create({ firstName, lastName, email, phone, password });

  // 201 = "created". Log them straight in by sending a token too.
  // The user's toJSON (STEP 17) removes the password from the reply.
  res.status(201).json({ token: signToken(String(user._id)), user });
};

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body ?? {};

  if (!email || !password) {
    throw new AppError(400, "Please enter your email and password.");
  }

  // The password has select: false, so we must ask for it to compare it
  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select("+password");

  // The SAME message for "no such email" and "wrong password": don't tell strangers which emails have accounts
  if (!user || !(await user.comparePassword(String(password)))) {
    throw new AppError(401, "Incorrect email or password.");
  }

  res.json({ token: signToken(String(user._id), Boolean(rememberMe)), user });
};

// GET /api/auth/me (after protect, so req.user is already loaded)
// The website calls this when it opens, to know who is logged in (the avatar, "Hi Ada", admin menu).
export const getMe = async (req: Request, res: Response) => {
  res.json({ user: req.user });
};

// POST /api/auth/logout
// Nothing to delete on the server: the website deletes its token. This just confirms it.
export const logout = async (_req: Request, res: Response) => {
  res.json({ message: "You have been logged out." });
};

// GET /api/auth/check-email?email=ada.obi@example.com -> { available: false }
export const checkEmail = async (req: Request, res: Response) => {
  const email = String(req.query.email ?? "").toLowerCase().trim();

  if (!email) {
    throw new AppError(400, "Please give an email to check.");
  }

  const taken = await User.exists({ email }); // exists = cheap "is there one?" (only the _id comes back)
  res.json({ available: !taken });
};
```

### 18.4 `src/routes/authRoutes.ts`

New file.

```ts
// authRoutes.ts server/src/routes/authRoutes.ts
// Which URL runs which auth function. routes/index.ts puts these under /api/auth.

// STEP 18 (part 4): The auth routes

import { Router } from "express";
import { checkEmail, getMe, login, logout, register } from "../controllers/authController";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/check-email", checkEmail);
router.get("/me", protect, getMe); // protect runs first; getMe only runs if it calls next()
router.post("/logout", protect, logout);

export default router;
```

### 18.5 Mount it in `src/routes/index.ts`

Add the import with the others:

```ts
import authRoutes from "./authRoutes";
```

And add this line with the other `router.use` lines:

```ts
router.use("/auth", authRoutes); // /api/auth...
```

No route uses `adminOnly` yet. It gets its first job in STEP 25.

### 18.6 Test it

```bash
npm run typecheck
npm run seed      # fresh demo users
npm run dev
```

Use Postman, Thunder Client (VS Code extension), or `curl`. For POST requests, set the body to **raw JSON**.

**1. Log in as Ada:** `POST http://localhost:5000/api/auth/login`

```json
{ "email": "ada.obi@example.com", "password": "Password@123" }
```

Expected: **200**, `{ "token": "eyJ...", "user": { "firstName": "Ada", ... } }`, with **no** `password` in `user`.
Copy the token.

**2. Who am I:** send `GET http://localhost:5000/api/auth/me` with the header
`Authorization: Bearer <paste the token>`. In Postman, that's the Authorization tab → Bearer Token.
Expected: **200**, `{ "user": { ...Ada... } }`.

**3. The error cases.** Each one should give exactly this status and message:

| Request                                               | Status | Reply                                                         |
| ----------------------------------------------------- | ------ | ------------------------------------------------------------- |
| login with a wrong password                           | 401    | Incorrect email or password.                                  |
| login with an email that has no account               | 401    | Incorrect email or password.                                  |
| login with `{}`                                       | 400    | Please enter your email and password.                         |
| `/me` with no header                                  | 401    | Please log in to continue.                                    |
| `/me` with `Bearer abc.def.ghi`                       | 401    | Your session has expired. Please log in again.                |
| register with `"agreeToTerms": false`                 | 400    | Please agree to the Terms of Service and Privacy Policy.      |
| register with password `password`                     | 400    | Password must be at least 8 characters with one uppercase ... |
| register with a different `confirmPassword`           | 400    | Passwords do not match.                                       |
| register with `"firstName": ""`                       | 400    | First name is required _(only after the 18.0 fix)_            |
| register with `ada.obi@example.com`                   | 409    | That email is already in use.                                 |
| `GET /api/auth/check-email?email=Ada.Obi@example.com` | 200    | `{ "available": false }`                                      |
| `GET /api/auth/check-email?email=new@example.com`     | 200    | `{ "available": true }`                                       |

**4. Register a new account:** `POST http://localhost:5000/api/auth/register`

```json
{
  "firstName": "Tola",
  "lastName": "Ade",
  "email": "tola@example.com",
  "phone": "08031234567",
  "password": "QuickLagos#2025",
  "confirmPassword": "QuickLagos#2025",
  "agreeToTerms": true
}
```

Expected: **201** with a token and the user, with `role: "customer"`. Then register again with another email and add
`"role": "admin"` to the body. The new user must **still** be a `customer`. In Atlas, Tola's password is a
`$2b$10$...` hash.

**5. Remember me:** log in with `"rememberMe": true` and paste the token into [jwt.io](https://jwt.io). Compare
`exp - iat`: it should be **2592000** seconds (30 days). Without it, you get **1296000** (15 days).

A JWT isn't secret, only signed: anyone can **read** it, but nobody can **change** it. That's why we only put the
id inside.

I ran this exact code against a throwaway database, and all of the above passed. I also checked that:

- the admin can pass `protect, adminOnly`, and Ada gets **403**
- a token for a deleted user gets **401**
- an expired token gets **401**
- after a password change, the old token gets **401** "Your password was changed"

### 18.7 Commit

```bash
git add .
git commit -m "STEP 18: auth (register, login, me, logout) and protect/adminOnly"
git push
```

➡️ **Next: STEP 19 (Forgot password, reset password and verify email).** Reply **NEXT** when 18.6 checks out.
