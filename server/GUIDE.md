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
| ✅   | 18     | Auth: register, login, me, logout + `protect` / `adminOnly`                         |
| ✅   | 19     | Forgot password, reset password, verify email                                       |
| ✅   | 19B    | Real emails with Brevo (`sendEmail`)                                                |
| ✅   | 20     | My Account: profile, change password, addresses, saved items                        |
| ✅   | 21     | Promo codes (`QUICK25`, `QUICK10`) |
| ✅   | 22     | Orders: checkout, my orders, order details, cancel within 1 hour |
| ⬜   | **23** | **Reviews (only buyers of delivered orders)** ← you are here |
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

---

## STEP 19: Forgot password, reset password and verify email

This step adds two flows from the designs:

- **Forgot / Reset password:**
  1. The user types their email and the server "emails" a link like
     `http://localhost:5173/reset-password/1ba4dc03...`.
  2. The link opens the "Create a new password" screen.
  3. The link works **once**, for **15 minutes**. After that the screen shows **"Link Expired or Invalid"**.
  4. A reset logs out every other device. Your STEP 18 `protect` already does that because `passwordChangedAt`
     changes.
- **Verify email:** a logged-in user asks for a **6-digit code**, types it in, and gets `isEmailVerified: true`.
  That's the "Verified Customer" badge.

**About the emails:** sending real email needs an email service account, SMTP settings and a way to stop it
landing in spam. That's too much for the deadline, so `sendEmail` **prints the email in the server terminal**.
In demo mode (`npm run dev`), the reply also includes the link or code (`devResetUrl` / `devCode`), so you can
demo the whole flow from the website without opening an inbox. When `npm start` runs with demo mode off, those
fields are not sent.

**The safety rules (the same ones real sites use):**

- The link and code are **random** (`crypto`), so nobody can guess them.
- Only a **hash** of the token is saved, like passwords. Someone reading the database can't use it.
- "Forgot password" gives the **same reply** whether the email has an account or not, so strangers can't
  check who has an account.
- Your new password must be **different** from the old one (the design says so).

### 19.1 `src/utils/password.ts`: one place for the password rules

Registration, reset password (now) and change password (STEP 20) all need the same rules. Move them out of
`authController.ts` into a new file:

```ts
// password.ts server/src/utils/password.ts
// The password rules from the registration and reset screens, in one place.

// STEP 19 (part 1): Password rules

import { AppError } from "./AppError";

// 8+ characters, an uppercase letter and a number.
// (?=.*[A-Z]) = "somewhere there is an A-Z", (?=.*\d) = "somewhere there is a 0-9", .{8,} = 8 or more characters
const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

// Throws a 400 with a friendly message if the new password breaks a rule; otherwise gives it back.
// (Returning it as a string tells TypeScript "this is definitely a string now".)
export const checkNewPassword = (password: unknown, confirmPassword: unknown): string => {
  if (typeof password !== "string" || !PASSWORD_RULE.test(password)) {
    throw new AppError(
      400,
      "Password must be at least 8 characters with one uppercase letter (A-Z) and one number (0-9).",
    );
  }

  if (password !== confirmPassword) {
    throw new AppError(400, "Passwords do not match.");
  }

  return password;
};
```

**Now tidy `src/controllers/authController.ts`:**

1. Delete the `PASSWORD_RULE` line 18 and the 2 comment lines above it.
2. In `register`, delete the two `if` blocks (the `PASSWORD_RULE.test` one and the `password !== confirmPassword`
   one from line 38-49) and their comments. In their place, write:

   ```ts
   // 8+ characters, uppercase, number, and both passwords match (utils/password.ts)
   checkNewPassword(password, confirmPassword);
   ```

3. Add the import at the top:

   ```ts
   import { checkNewPassword } from "../utils/password";
   ```

Registration works exactly as before. The 18.6 error table should still give the same messages.

### 19.2 `src/utils/secrets.ts`: random tokens and codes

New file.

```ts
// secrets.ts server/src/utils/secrets.ts
// Random one-time secrets: the password reset token (in the link) and the 6-digit email code.
// We send the REAL secret to the user and save only its HASH, like a password.

// STEP 19 (part 2): One-time secrets

import crypto from "crypto"; // built into Node, nothing to install

// "1ba4dc03..." -> its sha256 hash (64 characters).
// Why not bcrypt like passwords? bcrypt is slow on purpose and gives a different hash every time, so we couldn't
// FIND a user by it. sha256 always gives the same hash, and the token is long and random, so it's safe.
export const hashSecret = (secret: string) => {
  return crypto.createHash("sha256").update(secret).digest("hex");
};

// The reset link token: 32 random bytes = 64 hex characters, impossible to guess
export const makeResetToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  return { token, hashed: hashSecret(token) }; // token -> the email, hashed -> the database
};

// The email code: 6 digits, e.g. "048213" (padStart keeps a leading 0, so it's always 6 digits)
export const makeCode = () => {
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  return { code, hashed: hashSecret(code) };
};
```

### 19.3 `src/utils/sendEmail.ts`: the pretend email

New file.

```ts
// sendEmail.ts server/src/utils/sendEmail.ts
// "Sends" an email by printing it in the server terminal.
// Every email goes through this one function, so a real email service could be plugged in here later
// without changing anything else.

// STEP 19 (part 3): Emails (printed, not sent)

export const sendEmail = async (to: string, subject: string, text: string) => {
  console.log(
    [
      "",
      "================ EMAIL (not really sent) ================",
      `To:      ${to}`,
      `Subject: ${subject}`,
      "",
      text,
      "=========================================================",
      "",
    ].join("\n"),
  );
};
```

It's `async` even though it doesn't wait for anything yet. A real email service would have to wait, and this way
the code that calls it (`await sendEmail(...)`) won't need to change.

> **Update:** STEP 19B replaces the inside of this function with real emails sent through **Brevo**.

### 19.4 Add the 5 new functions to `src/controllers/authController.ts`

**Update the comment at the top** so it lists the new routes too:

```ts
// STEP 19 (part 4): Forgot / reset password and verify email
// POST /api/auth/forgot-password       -> "email" a reset link
// GET  /api/auth/reset-password/:token -> is this link still good? (to show "Link Expired" straight away)
// POST /api/auth/reset-password/:token -> set the new password
// POST /api/auth/send-verification     -> "email" a 6-digit code    (protect)
// POST /api/auth/verify-email          -> check the code            (protect)
```

**Add these imports** with the others:

```ts
import { env } from "../config/env";
import { hashSecret, makeCode, makeResetToken } from "../utils/secrets";
import { sendEmail } from "../utils/sendEmail";
```

**Then add this at the bottom of the file:**

```ts
// Reset links and email codes stop working after 15 minutes (the design: "15-minute validity window")
const FIFTEEN_MINUTES = 15 * 60 * 1000; // in milliseconds

// POST /api/auth/forgot-password   { "email": "ada.obi@example.com" }
export const forgotPassword = async (req: Request, res: Response) => {
  const email = String(req.body?.email ?? "").toLowerCase().trim();

  if (!email) {
    throw new AppError(400, "Please enter your email address.");
  }

  // The SAME reply whether the account exists or not (don't tell strangers who has an account)
  const reply: { message: string; devResetUrl?: string } = {
    message: "If an account exists for that email, we've sent a link to reset your password.",
  };

  const user = await User.findOne({ email });

  if (user) {
    // 1. A new random token. Asking again replaces the old one, so only the newest link works.
    const { token, hashed } = makeResetToken();
    user.passwordResetToken = hashed; // only the hash is saved
    user.passwordResetExpires = new Date(Date.now() + FIFTEEN_MINUTES);
    await user.save(); // the password isn't modified, so the pre("save") hook doesn't re-hash anything

    // 2. "Email" the link to the reset screen on the website
    const resetUrl = `${env.clientUrl}/reset-password/${token}`;
    await sendEmail(
      user.email,
      "Reset your QuickCart password",
      `Hi ${user.firstName},\n\nClick this link to choose a new password (it works once, for 15 minutes):\n${resetUrl}\n\nIf you didn't ask for this, ignore this email.`,
    );

    // 3. Demo mode only: also put the link in the reply, so a demo needs no inbox
    if (env.demoMode) {
      reply.devResetUrl = resetUrl;
    }
  }

  res.json(reply);
};

// Finds the user a reset link belongs to, or refuses with the "Link Expired or Invalid" message.
// Used by both reset routes below.
const findUserByResetToken = async (token: string) => {
  const user = await User.findOne({
    passwordResetToken: hashSecret(token), // hash what's in the link and look for the same hash
    passwordResetExpires: { $gt: new Date() }, // $gt = "greater than": the expiry time is still in the future
  }).select("+password"); // needed to check "different from your old password"

  if (!user) {
    throw new AppError(
      400,
      "This password reset link has expired or has already been used. Please request a new link.",
    );
  }

  return user;
};

// GET /api/auth/reset-password/:token
// The reset screen calls this when it opens, to show "Link Expired or Invalid" BEFORE the user types anything
export const checkResetToken = async (req: Request<{ token: string }>, res: Response) => {
  await findUserByResetToken(req.params.token);
  res.json({ valid: true });
};

// POST /api/auth/reset-password/:token   { "password": "...", "confirmPassword": "..." }
export const resetPassword = async (req: Request<{ token: string }>, res: Response) => {
  const user = await findUserByResetToken(req.params.token);
  const password = checkNewPassword(req.body?.password, req.body?.confirmPassword);

  // "Your new password must be different from previous passwords" (the design)
  if (await user.comparePassword(password)) {
    throw new AppError(400, "Your new password must be different from your old password.");
  }

  user.password = password; // the pre("save") hook hashes it AND sets passwordChangedAt
  user.passwordResetToken = undefined; // undefined = remove the field: the link can't be used twice
  user.passwordResetExpires = undefined;
  await user.save();

  // passwordChangedAt changed, so protect (STEP 18) now refuses every OLDER token: all other devices are logged out.
  // This device gets a fresh token, so the user is logged in straight away.
  res.json({ message: "Your password has been reset.", token: signToken(String(user._id)), user });
};

// POST /api/auth/send-verification   (protect: must be logged in)
export const sendVerification = async (req: Request, res: Response) => {
  const user = req.user!; // "!" = "protect ran first, so this is definitely set"

  if (user.isEmailVerified) {
    throw new AppError(400, "Your email is already verified.");
  }

  const { code, hashed } = makeCode();
  user.emailVerifyToken = hashed;
  user.emailVerifyExpires = new Date(Date.now() + FIFTEEN_MINUTES);
  await user.save();

  await sendEmail(
    user.email,
    "Your QuickCart verification code",
    `Hi ${user.firstName},\n\nYour verification code is ${code}. It expires in 15 minutes.`,
  );

  const reply: { message: string; devCode?: string } = {
    message: `We've sent a 6-digit code to ${user.email}.`,
  };

  if (env.demoMode) {
    reply.devCode = code;
  }

  res.json(reply);
};

// POST /api/auth/verify-email   { "code": "048213" }   (protect)
export const verifyEmail = async (req: Request, res: Response) => {
  const code = String(req.body?.code ?? "").trim();

  // req.user was loaded WITHOUT the secret fields (select: false), so load them now
  const user = await User.findById(req.user!._id).select("+emailVerifyToken +emailVerifyExpires");

  if (!user) {
    throw new AppError(401, "This account no longer exists. Please log in again.");
  }

  if (user.isEmailVerified) {
    throw new AppError(400, "Your email is already verified.");
  }

  // No code saved, code too old, or the hash doesn't match -> one message for all three
  const expired = !user.emailVerifyExpires || user.emailVerifyExpires.getTime() < Date.now();

  if (!code || expired || user.emailVerifyToken !== hashSecret(code)) {
    throw new AppError(400, "That code is wrong or has expired. Please request a new one.");
  }

  user.isEmailVerified = true;
  user.emailVerifyToken = undefined;
  user.emailVerifyExpires = undefined;
  await user.save();

  res.json({ message: "Your email is verified.", user });
};
```

**Two things that are new here:**

- `Request<{ token: string }>` tells TypeScript that `req.params.token` exists, because the route is
  `/reset-password/:token`.
- `req.body?.email`: the `?.` means "if there's no body, give `undefined` instead of crashing". It does the same
  job as `req.body ?? {}` in STEP 18.

### 19.5 Add the routes to `src/routes/authRoutes.ts`

Add the 5 new names to the import from `../controllers/authController`:

```ts
checkResetToken, forgotPassword, resetPassword, sendVerification, verifyEmail,
```

And add these routes under the others:

```ts
router.post("/forgot-password", forgotPassword);
router.get("/reset-password/:token", checkResetToken);
router.post("/reset-password/:token", resetPassword);
router.post("/send-verification", protect, sendVerification);
router.post("/verify-email", protect, verifyEmail);
```

### 19.6 Test it

```bash
npm run typecheck
npm run seed
npm run dev
```

**A. Forgot + reset password**

1. Log in as Ada (`POST /api/auth/login`) and keep that token. Call it the **old token**.
2. `POST http://localhost:5000/api/auth/forgot-password` with `{ "email": "ada.obi@example.com" }`.
   You should get **200**, the message and a `devResetUrl`, and the **server terminal** shows the email. Copy the
   long token at the end of the URL.
3. In Atlas, Ada's `passwordResetToken` is a 64-character hash that is **different** from the token in the link,
   and `passwordResetExpires` is 15 minutes from now.
4. Then work through these:

| Request                                                                          | Status | Reply                                                          |
| -------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------- |
| `forgot-password` with `{}`                                                      | 400    | Please enter your email address.                               |
| `forgot-password` with `nobody@example.com`                                      | 200    | the **same** message as for Ada, with no `devResetUrl`         |
| `GET /api/auth/reset-password/<token>`                                           | 200    | `{ "valid": true }`                                            |
| `GET /api/auth/reset-password/abc`                                               | 400    | This password reset link has expired or has already been used. |
| `POST .../reset-password/<token>` with `"password": "weak"`                      | 400    | Password must be at least 8 characters ...                     |
| `POST .../reset-password/<token>` with `Password@123` (Ada's current one)        | 400    | Your new password must be different from your old password.    |
| `POST .../reset-password/<token>` with `QuickSafe2025#` (both fields)            | 200    | Your password has been reset. + a new `token`                  |
| the same request again                                                           | 400    | ... has expired or has already been used ... (single-use)      |
| `GET /api/auth/me` with the **old token**                                        | 401    | Your password was changed. Please log in again.                |
| `GET /api/auth/me` with the token from the reset reply                           | 200    | Ada                                                            |
| login with `Password@123`                                                        | 401    | Incorrect email or password.                                   |
| login with `QuickSafe2025#`                                                      | 200    | a token                                                        |

In Atlas, `passwordResetToken` and `passwordResetExpires` are **gone** from Ada after the reset.

**B. Verify email.** Ada is already verified in the demo data, so register a new user first (STEP 18.6 step 4),
then use **their** token:

| Request                                                    | Status | Reply                                                        |
| ---------------------------------------------------------- | ------ | ------------------------------------------------------------ |
| `POST /api/auth/verify-email` `{ "code": "123456" }`       | 400    | That code is wrong or has expired. Please request a new one. |
| `POST /api/auth/send-verification` (no body)               | 200    | We've sent a 6-digit code to ... + `devCode`                 |
| `verify-email` with a wrong code                           | 400    | That code is wrong or has expired ...                        |
| `verify-email` with the `devCode`                          | 200    | Your email is verified. + the user, `isEmailVerified: true`  |
| `verify-email` again / `send-verification` again           | 400    | Your email is already verified.                              |
| `send-verification` with no token                          | 401    | Please log in to continue.                                   |

When you're done, run `npm run seed` to put Ada's password back to `Password@123`.

I ran this exact code against a throwaway database, and every row above passed. I also checked that an expired
link (`passwordResetExpires` in the past) gets the "expired" message.

**Known limit (fine for a demo):** nothing stops someone from guessing codes over and over. A real shop would
lock the code after about 5 wrong tries.

### 19.7 Commit

```bash
git add .
git commit -m "STEP 19: forgot/reset password and email verification"
git push
```

➡️ **Next: STEP 19B (real emails with Brevo), then STEP 20 (My Account).** Reply **NEXT** when 19.6 checks out.

---

## STEP 19B: Real emails with Brevo (free)

Every email in the project goes through **one** function, `sendEmail` in `src/utils/sendEmail.ts`. In STEP 19 it
only printed the email in the terminal. Now it sends real emails with **Brevo**. The free plan allows **300 emails
a day** and needs no card.

You change **one** file's insides and add 3 settings. `authController.ts` doesn't change at all, because it already
calls `sendEmail(to, subject, text)`. Later steps use the same function (STEP 22: the order confirmation email).

If Brevo isn't set up, or refuses an email, `sendEmail` **prints it in the terminal like before** and logs why.
A broken email setting never crashes "forgot password" or checkout.

### 19B.1 Set up Brevo (about 5 minutes, in the browser)

1. Sign up at **brevo.com** (free plan).
2. **Add a sender:** go to **Settings → Senders, Domains & Dedicated IPs → Senders → Add a sender**. Enter the name
   `QuickCart` and an email address **you can open**. Brevo emails you a confirmation link: click it. Brevo only
   sends from verified senders.
3. **Create an API key:** go to **Settings → SMTP & API → API Keys → Generate a new API key**. Name it `quickcart`
   and copy it right away (it starts with). Brevo shows it only once. 
4. If Brevo asks you to **activate your account** or fill in a company profile before sending, do it. New
   accounts sometimes need this.

### 19B.2 Add the settings to `.env` and `src/config/env.ts`

In `server/.env` (never on GitHub):

```

```

In `src/config/env.ts`, add these 3 lines inside the `env` object, after the Cloudinary ones:

```ts
  // Brevo sends the emails (see utils/sendEmail.ts). Empty = emails are printed in the terminal instead

```

### 19B.3 Replace everything in `src/utils/sendEmail.ts`

Brevo has a simple web API. We send it one POST request with Node's built-in `fetch`, so there's **nothing to
install**.

```ts
// sendEmail.ts server/src/utils/sendEmail.ts
// Sends an email with Brevo (free plan: 300 emails a day).
// Every email in the project goes through this one function.
// No BREVO_API_KEY in .env, or Brevo refuses? Then the email is printed in the server terminal instead,
// so the website keeps working (and you can still copy the link or code from the terminal).

// STEP 19B: Real emails with Brevo

import { env } from "../config/env";

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

// Prints the email in the terminal (the STEP 19 version, kept as the fallback)
const printEmail = (to: string, subject: string, text: string, why: string) => {
  console.log(
    [
      "",
      `================ EMAIL (not sent: ${why}) ================`,
      `To:      ${to}`,
      `Subject: ${subject}`,
      "",
      text,
      "=========================================================",
      "",
    ].join("\n"),
  );
};

// Brevo wants an HTML version too. This turns plain text into simple HTML:
// escape < > & (so text can't break the HTML), make links clickable, keep the line breaks.
const textToHtml = (text: string) => {
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const linked = escaped.replace(/(https?:\/\/\S+)/g, '<a href="$1">$1</a>');
  return `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6">${linked.replace(/\n/g, "<br>")}</div>`;
};

// sendEmail("ada.obi@example.com", "Subject", "Text...")
// It never throws: a failed email must not crash "forgot password" or an order. The problem is logged instead.
export const sendEmail = async (to: string, subject: string, text: string) => {
  if (!env.brevoApiKey || !env.emailFrom) {
    printEmail(to, subject, text, "BREVO_API_KEY or EMAIL_FROM missing in .env");
    return;
  }

  try {
    const response = await fetch(BREVO_URL, {
      method: "POST",
      headers: {
        "api-key": env.brevoApiKey, // your secret Brevo key
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: env.emailFromName, email: env.emailFrom }, // must be a sender you verified in Brevo
        to: [{ email: to }],
        subject,
        textContent: text,
        htmlContent: textToHtml(text),
      }),
    });

    if (!response.ok) {
      // e.g. 401 = wrong API key, 400 = sender not verified. Brevo explains why in the reply.
      console.error(`Brevo refused the email (${response.status}):`, await response.text());
      printEmail(to, subject, text, `Brevo error ${response.status}`);
      return;
    }

    console.log(`Email sent with Brevo to ${to}: "${subject}"`);
  } catch (error) {
    // No internet, Brevo down...
    console.error("Could not reach Brevo:", (error as Error).message);
    printEmail(to, subject, text, "could not reach Brevo");
  }
};
```

**Why `sendEmail` never throws:** take "forgot password" as an example. If Brevo is down and `sendEmail`
threw, the user would get a 500 error, but only for emails that **have** an account. That would tell strangers
which emails are registered, and it would break the page. Logging the problem and moving on is safer.

**About `devResetUrl` / `devCode`:** they stay. In demo mode (`npm run dev`) the reply still includes the link or
code, so a live demo never depends on an email arriving in time. With `npm start` they're not sent, and the
real email is the only way.

### 19B.4 Test it

```bash
npm run typecheck
npm run seed
npm run dev
```

1. **Send yourself a reset email.** `npm run seed` resets the users, so first register an account with **your own
   email** (STEP 18.6 step 4). Then send `POST /api/auth/forgot-password` with `{ "email": "<your email>" }`.
   - The terminal should say: `Email sent with Brevo to <your email>: "Reset your QuickCart password"`
   - Your inbox (**check Spam** the first time) should have the email from QuickCart with a clickable link.
2. **Verification code:** log in as that account and send `POST /api/auth/send-verification`. A 6-digit code
   arrives by email.
3. **Ada's emails:** `ada.obi@example.com` isn't a real inbox. Brevo accepts the email but nobody receives it,
   and it still counts toward the 300 a day. Use your own account for email tests.
4. **The fallback:** put a `#` in front of `BREVO_API_KEY` in `.env` (that "comments it out") and restart
   `npm run dev`. Forgot password still replies 200, and the email is printed in the terminal with
   `(not sent: BREVO_API_KEY or EMAIL_FROM missing in .env)`. Remove the `#` afterwards.

**If the terminal shows `Brevo refused the email (...)`, read Brevo's message after it:**

| Brevo's message                                  | Fix                                                                                    |
| ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `401 ... Key not found`                          | The API key in `.env` is wrong or incomplete. Copy it again, then restart `npm run dev`. |
| `401 ... unrecognised IP address`                | Brevo → Settings → **Security → Authorised IPs**: turn the IP blocking off (or add yours). |
| `400 ... sender ... not valid` / `not verified`  | `EMAIL_FROM` must be exactly the sender you verified in 19B.1 step 2.                  |
| `403 ... account ... not activated`              | Finish activating your Brevo account (19B.1 step 4).                                   |

I tested this exact `sendEmail` with no key, where it printed the email, and against Brevo's real API with a fake
key. Brevo answered `401 {"message":"Key not found"}`, which shows the URL and header are right, and the code
printed the email instead of crashing. I didn't have your key, so the first real email you send is the final test.

**Spam:** emails "from" a free address like Gmail sent through Brevo often land in Spam. Gmail can't confirm Brevo
is allowed to send for gmail.com. That's fine for a demo: open the first one from Spam and mark it "Not spam".

### 19B.5 Commit

Check that `.env` is **not** in the list before you commit (`git status`):

```bash
git add .
git commit -m "STEP 19B: send emails with Brevo"
git push
```

➡️ Then continue with **STEP 20** below.

---

## STEP 20: My Account (profile, change password, addresses, saved items)

This step builds everything on the **My Account** screen that belongs to the user:

- **Edit Profile Information:** first name, last name, email and phone. Changing the email turns
  "Verified" off, because the new address hasn't been checked yet.
- **Password & Security:** change the password. Your current password is required, and other devices are
  logged out.
- **Delivery Addresses:** list, add, edit and delete addresses, with exactly **one default address**. That's the
  "Default Address" badge and the "Default: Lekki Phase 1" text.
- **Saved items (wishlist):** save and unsave a product, and list the saved products as product cards.

The order cards ("Total orders 5", "In progress 1", "Recent Orders") need the Order model, so they come in
**STEP 22**.

Every route here is under `/api/account` and needs `protect`. A user can only ever change **their own** account,
because every function works on `req.user` and never on an id from the URL.

### 20.1 Friendlier address messages in `src/models/User.ts`

Right now, adding an address with no street replies `Path \`street\` is required.`, which isn't friendly. In
`addressSchema`, give the 5 required fields a message, the same way you did for the user fields:

```ts
fullName: { type: String, required: [true, "Full name is required"], trim: true },
phone: { type: String, required: [true, "Phone number is required"], trim: true },
street: { type: String, required: [true, "Street address is required"], trim: true },
city: { type: String, required: [true, "City is required"], trim: true },
state: { type: String, required: [true, "State is required"], trim: true },
```

### 20.2 Export `CARD_FIELDS` from `src/controllers/productController.ts`

The saved items list shows product **cards**, so it needs the same fields as the shop. Don't copy the list: add
`export` in front of it so other files can import it:

```ts
export const CARD_FIELDS =
```

### 20.3 `src/controllers/accountController.ts`

New file.

```ts
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
  if (email !== undefined && String(email).toLowerCase().trim() !== user.email) {
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
    throw new AppError(401, "This account no longer exists. Please log in again.");
  }

  // Someone who finds a laptop that's still logged in can't change the password without knowing it
  if (!(await user.comparePassword(String(currentPassword)))) {
    throw new AppError(400, "Your current password is incorrect.");
  }

  const password = checkNewPassword(newPassword, confirmPassword); // the same rules as registration

  if (password === currentPassword) {
    throw new AppError(400, "Your new password must be different from your old password.");
  }

  user.password = password; // pre("save") hashes it and sets passwordChangedAt ("Last updated ...")
  await user.save();

  // passwordChangedAt changed, so every older token stops working (other devices are logged out).
  // This device gets a new token so it stays logged in. The website must save this new token!
  res.json({ message: "Your password has been changed.", token: signToken(String(user._id)), user });
};

// ===== Addresses =====

// Copy only the address fields from the body (never _id or anything else)
const pickAddress = (body: Record<string, unknown>) => {
  const fields = [
    "label", "fullName", "phone", "street", "city", "state", "country", "instructions", "isDefault",
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
  const address = me(req).addresses.find((a) => String(a._id) === req.params.addressId);

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
export const updateAddress = async (req: Request<{ addressId: string }>, res: Response) => {
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
export const deleteAddress = async (req: Request<{ addressId: string }>, res: Response) => {
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
export const saveItem = async (req: Request<{ productId: string }>, res: Response) => {
  const { productId } = req.params;

  // isValidObjectId: "abc" isn't a MongoDB id at all. exists: is there a product shoppers can see with this id?
  if (!isValidObjectId(productId) || !(await Product.exists({ $and: [{ _id: productId }, liveProducts()] }))) {
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
export const unsaveItem = async (req: Request<{ productId: string }>, res: Response) => {
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
```

**Why saved items use `findByIdAndUpdate` but addresses use `save()`:** `$addToSet` and `$pull` change one list
in a single step inside MongoDB, which is quick and simple. The address rules ("only one default", "the first
address becomes the default") need JavaScript logic first, so we change `req.user` and then `save()` it. `save()`
also runs the model's rules, which gives the friendly messages.

### 20.4 `src/routes/accountRoutes.ts`

New file.

```ts
// accountRoutes.ts server/src/routes/accountRoutes.ts
// My Account routes. routes/index.ts puts these under /api/account.

// STEP 20: My Account routes

import { Router } from "express";
import {
  addAddress,
  changePassword,
  deleteAddress,
  getAddresses,
  getSavedItems,
  saveItem,
  unsaveItem,
  updateAddress,
  updateProfile,
} from "../controllers/accountController";
import { protect } from "../middleware/auth";

const router = Router();

// router.use(protect) puts protect in front of EVERY route below it, so we don't repeat it 9 times
router.use(protect);

router.patch("/profile", updateProfile);
router.patch("/password", changePassword);

router.get("/addresses", getAddresses);
router.post("/addresses", addAddress);
router.patch("/addresses/:addressId", updateAddress);
router.delete("/addresses/:addressId", deleteAddress);

router.get("/saved", getSavedItems);
router.post("/saved/:productId", saveItem);
router.delete("/saved/:productId", unsaveItem);

export default router;
```

### 20.5 Mount it in `src/routes/index.ts`

```ts
import accountRoutes from "./accountRoutes";
```

```ts
router.use("/account", accountRoutes); // /api/account...
```

### 20.6 Test it

```bash
npm run typecheck
npm run seed
npm run dev
```

Log in as Ada and use her token (`Authorization: Bearer ...`) for everything below.

**A. Profile and password**

| Request                                                                                     | Status | Reply                                                                   |
| ------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------- |
| `GET /api/account/addresses` with **no** token                                              | 401    | Please log in to continue.                                              |
| `PATCH /api/account/profile` `{ "phone": "+2347012345678", "role": "admin" }`               | 200    | the new phone, and `role` **still** `customer`                          |
| `PATCH .../profile` `{ "firstName": "" }`                                                   | 400    | First name is required                                                  |
| `PATCH .../profile` `{ "email": "admin@quickcart.ng" }`                                     | 409    | That email is already in use.                                           |
| `PATCH .../profile` `{ "email": "ADA.OBI@example.com" }`                                    | 200    | `isEmailVerified` **still true** (it's the same email)                  |
| `PATCH .../profile` `{ "email": "ada.new@example.com" }`                                    | 200    | `isEmailVerified: false`                                                |
| `PATCH /api/account/password` `{ "newPassword": "X" }`                                      | 400    | Please enter your current password.                                     |
| `PATCH .../password` with a wrong `currentPassword`                                         | 400    | Your current password is incorrect.                                     |
| `PATCH .../password` with `newPassword` `weak`                                              | 400    | Password must be at least 8 characters ...                              |
| `PATCH .../password` with the same password as now                                          | 400    | Your new password must be different from your old password.             |
| `PATCH .../password` with the current password and `NewPass#2026` (both fields)             | 200    | Your password has been changed. + a new `token`                         |
| any request with the **old** token                                                          | 401    | Your password was changed. Please log in again.                         |

Switch to the **new** token from the password reply for the rest of the tests.

**B. Addresses.** `*` marks the default.

| Request                                                                   | Status | Addresses after                    |
| ------------------------------------------------------------------------- | ------ | ---------------------------------- |
| `GET /api/account/addresses`                                              | 200    | Home\*, Office                     |
| `POST .../addresses` with `"street": ""`                                  | 400    | "Street address is required"       |
| `POST .../addresses` with the body below                                  | 201    | Home\*, Office, Mum's place        |
| `PATCH .../addresses/<Mum's _id>` `{ "isDefault": true }`                 | 200    | Home, Office, Mum's place\*        |
| `PATCH .../addresses/<Mum's _id>` `{ "isDefault": false, "city": "Ikeja GRA" }` | 200 | Mum's place **stays** default, city changed |
| `DELETE .../addresses/<Mum's _id>`                                        | 200    | Home\*, Office (Home takes over)   |
| the same DELETE again                                                     | 404    | Address not found                  |

```json
{
  "label": "Mum's place",
  "fullName": "Ngozi Obi",
  "phone": "+2348030000000",
  "street": "5 Allen Avenue",
  "city": "Ikeja",
  "state": "Lagos State"
}
```

**C. Saved items.** Copy any product's `_id` from `GET /api/products`.

| Request                                         | Status | Reply                                                     |
| ----------------------------------------------- | ------ | --------------------------------------------------------- |
| `POST /api/account/saved/abc`                   | 404    | Product not found                                         |
| `POST /api/account/saved/665f00000000000000000000` | 404 | Product not found                                         |
| `POST /api/account/saved/<product id>`          | 200    | `{ "savedItems": ["<that id>"] }`                         |
| the same POST again                             | 200    | still **one** id (no duplicate)                           |
| `GET /api/account/saved`                        | 200    | `{ "products": [ ...a card with name, price, images, category name ] }` |
| `DELETE /api/account/saved/<product id>`        | 200    | `{ "savedItems": [] }`                                    |

Run `npm run seed` afterwards to put Ada back (password `Password@123`, original email and phone).

I ran this exact code against a throwaway database, and every row above passed. The server terminal showed no
Mongoose warnings.

### 20.7 Commit

```bash
git add .
git commit -m "STEP 20: My Account (profile, password, addresses, saved items)"
git push
```

➡️ **Next: STEP 21 (Promo codes: `QUICK25` and `QUICK10`, and the "Apply" button in the cart).** Reply **NEXT**
when 20.6 checks out.

---

## STEP 21: Promo codes (`QUICK25`, `QUICK10`)

The cart has a **Discount Voucher** box ("Promo code (try QUICK10)" + **Apply**), and checkout shows
**"QUICK25 Applied · Save ₦2,000"** with a "Discount Promo −₦2,000" line. This step adds:

- a **PromoCode** model, so codes live in the database (not hard-coded) and can be switched off or given an expiry date
- the 2 demo codes, created by `npm run seed`:

  | Code      | What it gives                         | Minimum order | Example                       |
  | --------- | ------------------------------------- | ------------- | ----------------------------- |
  | `QUICK25` | **₦2,000 off**                        | ₦25,000       | ₦117,500 → ₦115,500 (the design) |
  | `QUICK10` | **10% off**, at most ₦5,000           | ₦10,000       | ₦18,500 → ₦16,650             |

- `applyPromo()`: one function that checks a code and works out the discount. The **Apply** button uses it now,
  and checkout (STEP 22) will use the **same** function, so the cart and the order can never disagree.
- `POST /api/promo-codes/check`: the **Apply** button

The discount comes off the **items subtotal** only, never off delivery.

### 21.1 `src/models/PromoCode.ts`

New file.

```ts
// PromoCode model server/src/models/PromoCode.ts
// A discount code typed in the cart, e.g. QUICK25 = ₦2,000 off, QUICK10 = 10% off.

// STEP 21 (part 1): The PromoCode model

import { model, Schema } from "mongoose";

export interface IPromoCode {
  code: string; // always saved in CAPITALS, e.g. "QUICK25"
  description: string; // shown to the shopper, e.g. "₦2,000 off orders of ₦25,000 or more"
  type: "fixed" | "percent"; // fixed = a naira amount off; percent = a % of the subtotal off
  value: number; // 2000 (naira) for fixed, 10 (%) for percent
  maxDiscount?: number; // the most a percent code can take off, e.g. 5000
  minSubtotal: number; // the smallest order it works on, in naira
  isActive: boolean; // false = switched off
  expiresAt?: Date; // after this date the code stops working (no date = never expires)
  usedCount: number; // how many orders used it (counted in STEP 22)
}

const promoCodeSchema = new Schema<IPromoCode>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: "" },
    type: { type: String, enum: ["fixed", "percent"], required: true },
    value: { type: Number, required: true, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    minSubtotal: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
    usedCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const PromoCode = model<IPromoCode>("PromoCode", promoCodeSchema);
```

### 21.2 `src/data/promoCodes.ts`: the demo codes

New file.

```ts
// promoCodes.ts server/src/data/promoCodes.ts
// The demo promo codes. npm run seed saves them.

// STEP 21 (part 2): Demo promo codes

import type { IPromoCode } from "../models/PromoCode";

// Pick = only these fields (usedCount starts at 0 by itself)
export type DemoPromoCode = Pick<
  IPromoCode,
  "code" | "description" | "type" | "value" | "maxDiscount" | "minSubtotal"
>;

export const promoCodes: DemoPromoCode[] = [
  {
    code: "QUICK25",
    description: "₦2,000 off orders of ₦25,000 or more",
    type: "fixed",
    value: 2000,
    minSubtotal: 25000,
  },
  {
    code: "QUICK10",
    description: "10% off orders of ₦10,000 or more (up to ₦5,000)",
    type: "percent",
    value: 10,
    maxDiscount: 5000,
    minSubtotal: 10000,
  },
];
```

### 21.3 Seed the codes in `src/data/seed.ts`

1. Add the imports:

   ```ts
   import { PromoCode } from "../models/PromoCode";
   import { promoCodes } from "./promoCodes";
   ```

2. In step 1, add `PromoCode.deleteMany({}),` inside the `Promise.all([...])`, under `User.deleteMany({}),`.

3. After step 6 (the users), add:

   ```ts
   // 7. Save the promo codes (insertMany is fine here: promo codes have no save hooks)
   const savedPromoCodes = await PromoCode.insertMany(promoCodes);
   ```

   Rename the summary comment to `// 8. A summary ...`, and add this to the returned object:

   ```ts
   promoCodes: savedPromoCodes.length,
   ```

4. In `runSeed`, update the message:

   ```ts
   console.log(
     `Seeded ${result.categories} categories, ${result.products} products, ${result.users} users and ${result.promoCodes} promo codes`,
   );
   ```

### 21.4 `src/utils/promo.ts`: check a code and work out the discount

New file. Checkout (STEP 22) imports `applyPromo` from here too.

```ts
// promo.ts server/src/utils/promo.ts
// Checks a promo code and works out its discount. Used by the cart's Apply button AND by checkout (STEP 22),
// so both always agree.

// STEP 21 (part 3): Promo code rules

import { IPromoCode, PromoCode } from "../models/PromoCode";
import { AppError } from "./AppError";

// 25000 -> "₦25,000" (toLocaleString adds the commas the Nigerian way)
const naira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

// How much this code takes off this subtotal, in whole naira
export const discountFor = (promo: IPromoCode, subtotal: number) => {
  // fixed: the value itself (2000). percent: that % of the subtotal (10% of 18500 = 1850)
  let discount = promo.type === "percent" ? (subtotal * promo.value) / 100 : promo.value;

  if (promo.maxDiscount !== undefined) {
    discount = Math.min(discount, promo.maxDiscount); // QUICK10 never takes off more than ₦5,000
  }

  discount = Math.min(discount, subtotal); // never more than the order itself (no negative totals)

  return Math.round(discount); // naira, no kobo: 1234.5 -> 1235
};

// applyPromo("quick25", 117500) -> { promo, discount: 2000 }
// Throws a 400 with a message the cart can show if the code can't be used.
export const applyPromo = async (code: unknown, subtotal: number) => {
  const cleanCode = String(code ?? "").toUpperCase().trim(); // " quick25 " -> "QUICK25"

  if (!cleanCode) {
    throw new AppError(400, "Please enter a promo code.");
  }

  const promo = await PromoCode.findOne({ code: cleanCode });

  // Doesn't exist, switched off, or expired: the shopper doesn't need to know which
  if (!promo || !promo.isActive || (promo.expiresAt && promo.expiresAt.getTime() < Date.now())) {
    throw new AppError(400, `"${cleanCode}" is not a valid promo code.`);
  }

  // Too small an order? Tell them how much more to add (that sells more!)
  if (subtotal < promo.minSubtotal) {
    throw new AppError(
      400,
      `${promo.code} needs an order of at least ${naira(promo.minSubtotal)}. Add ${naira(promo.minSubtotal - subtotal)} more to use it.`,
    );
  }

  return { promo, discount: discountFor(promo, subtotal) };
};
```

### 21.5 `src/controllers/promoController.ts`

New file.

```ts
// promoController.ts server/src/controllers/promoController.ts
// The cart's "Apply" button.

// STEP 21 (part 4): Check a promo code
// POST /api/promo-codes/check   { "code": "QUICK25", "subtotal": 117500 }

import { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { applyPromo } from "../utils/promo";

export const checkPromoCode = async (req: Request, res: Response) => {
  const { code, subtotal } = req.body ?? {};
  const amount = Number(subtotal); // "20000" (text) -> 20000; nonsense -> NaN

  // Number.isFinite is false for NaN, so this catches missing, text and 0 or less
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new AppError(400, "Your cart is empty.");
  }

  const { promo, discount } = await applyPromo(code, amount);

  res.json({
    code: promo.code,
    description: promo.description,
    discount, // "Save ₦2,000" / "Discount Promo −₦2,000"
    subtotalAfterDiscount: amount - discount,
  });
};
```

**Is it safe that the website sends the subtotal?** For a **preview**, yes. Someone could send a fake subtotal, but
all they get back is a number on their own screen. When an order is **placed** (STEP 22), the server adds up the
real prices from the database and runs `applyPromo` again itself. It never trusts the website's total.

### 21.6 `src/routes/promoRoutes.ts` and mount it

New file:

```ts
// promoRoutes.ts server/src/routes/promoRoutes.ts
// routes/index.ts puts these under /api/promo-codes.

// STEP 21 (part 5): Promo code routes

import { Router } from "express";
import { checkPromoCode } from "../controllers/promoController";

const router = Router();

// No protect: shoppers who aren't logged in can try a code in their cart too
router.post("/check", checkPromoCode);

export default router;
```

In `src/routes/index.ts`:

```ts
import promoRoutes from "./promoRoutes";
```

```ts
router.use("/promo-codes", promoRoutes); // /api/promo-codes...
```

### 21.7 Test it

```bash
npm run typecheck
npm run seed
```

Expected: `Seeded 8 categories, 40 products, 2 users and 2 promo codes`. In Atlas there's a new **promocodes**
collection with QUICK25 and QUICK10, each with `usedCount: 0`.

```bash
npm run dev
```

Send `POST http://localhost:5000/api/promo-codes/check` (no token needed) with these bodies:

| Body                                               | Status | Reply                                                                    |
| -------------------------------------------------- | ------ | ------------------------------------------------------------------------ |
| `{ "code": "QUICK25", "subtotal": 117500 }`        | 200    | `discount: 2000`, `subtotalAfterDiscount: 115500` (the checkout design)  |
| `{ "code": "  quick25 ", "subtotal": 117500 }`     | 200    | the same (capitals and spaces don't matter)                              |
| `{ "code": "QUICK25", "subtotal": 18500 }`         | 400    | QUICK25 needs an order of at least ₦25,000. Add ₦6,500 more to use it.   |
| `{ "code": "QUICK10", "subtotal": 18500 }`         | 200    | `discount: 1850`, `subtotalAfterDiscount: 16650`                         |
| `{ "code": "QUICK10", "subtotal": 117500 }`        | 200    | `discount: 5000` (10% would be 11,750, but the cap is ₦5,000)            |
| `{ "code": "QUICK10", "subtotal": 9000 }`          | 400    | QUICK10 needs an order of at least ₦10,000. Add ₦1,000 more to use it.   |
| `{ "code": "QUICK10", "subtotal": 12345 }`         | 200    | `discount: 1235` (1234.5 rounded)                                        |
| `{ "code": "FREEMONEY", "subtotal": 50000 }`       | 400    | "FREEMONEY" is not a valid promo code.                                   |
| `{ "code": "", "subtotal": 50000 }`                | 400    | Please enter a promo code.                                               |
| `{ "code": "QUICK10" }`                            | 400    | Your cart is empty.                                                      |

**Expired and switched-off codes:** in Atlas, edit QUICK10 and set `isActive` to `false`. The QUICK10 rows now give
"not a valid promo code". Set it back to `true` (or just run `npm run seed`). An `expiresAt` date in the past does
the same.

I ran this exact code against a throwaway database, and every row above passed. I also tested an expired code, a
switched-off code, a subtotal sent as text (`"20000"`, which works) and a request with no body at all (400).

### 21.8 Commit

```bash
git add .
git commit -m "STEP 21: promo codes (QUICK25, QUICK10)"
git push
```

➡️ **Next: STEP 22 (Orders: place an order at checkout with real prices from the database, delivery fee and promo
code, order numbers like #QC-1042, my orders, order details, cancel within 1 hour, and a Brevo confirmation
email).** Reply **NEXT** when 21.7 checks out.

---

## STEP 22: Orders (checkout, my orders, order details, cancel within 1 hour)

This is the biggest step. It powers 4 designs:

| Design                           | What it needs from the server                                                   |
| -------------------------------- | ------------------------------------------------------------------------------- |
| **Checkout**                     | `POST /api/orders`: the **PLACE ORDER NOW** button                              |
| **Order Confirmation & Receipt** | the reply of `POST /api/orders` (order number, items, payment, delivery window) |
| **Full Order History & Filters** | `GET /api/orders` with the tabs, search and sort                                |
| **Order Details & Tracking**     | `GET /api/orders/QC-1042` and **Cancel Order** (`PATCH .../cancel`)             |

Plus `GET /api/orders/summary` for the numbers on **My Account**.

**The rules (from the designs):**

- **Prices come from the database, never from the website.** The website only sends "product X, quantity 2".
  Someone who edits the price in their browser still pays the real price.
- **Delivery:** Standard = **Free** (2–3 business days). Express Same-Day Dispatch = **₦2,500** (today, **Lagos only**).
- **Payment:** Card (**pretend**: "Simulated environment for capstone UI") or **Pay on Delivery** (**Lagos only**).
  We never save a card number or CVV, only the brand and the last 4 digits ("MASTERCARD •••• 4242").
- **Promo code:** checked **again** with the same `applyPromo` from STEP 21. Its `usedCount` goes up by 1.
- **Stock:** goes down when the order is placed, and back up if it's cancelled. Two people can't both buy the last one.
- **Order numbers:** `QC-1042`, `QC-1043`, ... The first order after `npm run seed` is **#QC-1042**, like the designs.
- **Statuses:** `processing` → `shipped` → `delivered` (or `cancelled`). The admin moves orders along in STEP 26.
- **Cancel:** only while `processing` **and** within **1 hour** of placing it. The stock goes back and a card payment
  is marked `refunded`.
- **Emails (Brevo):** "Order #QC-1042 confirmed" and "Order #QC-1042 cancelled", both through `sendEmail` (STEP 19B).

You'll make **5 new files** and change **5 small things** in files you already have.

### 22.1 Three tiny changes so files can share code

Each one adds the word `export` in front of something that already exists, so the order code can reuse it:

1. `src/models/User.ts`: the order keeps a copy of the delivery address with the **same rules** as a saved address.

   ```ts
   export const addressSchema = new Schema<IAddress>({
   ```

   (was `const addressSchema = ...`)

2. `src/controllers/accountController.ts`: the same "copy only the address fields" helper.

   ```ts
   export const pickAddress = (body: Record<string, unknown>) => {
   ```

3. `src/utils/promo.ts`: the confirmation email shows naira amounts.

   ```ts
   export const naira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;
   ```

### 22.2 `src/models/Counter.ts`: order numbers

New file. Why not "count the orders and add 1"? Two orders placed at the same moment would both count 5 and both
become #QC-1047. MongoDB's `$inc` adds 1 in **one step**, so every order gets its own number.

```ts
// Counter model server/src/models/Counter.ts
// Hands out numbers one after another (1, 2, 3...), even when two orders are placed at the same moment.
// Used for order numbers: #QC-1042, #QC-1043...

// STEP 22 (part 1): A counter for order numbers

import { model, Schema } from "mongoose";

interface ICounter {
  _id: string; // the counter's name, e.g. "order"
  seq: number; // the last number handed out
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const Counter = model<ICounter>("Counter", counterSchema);

// nextNumber("order") -> 1, then 2, then 3...
// $inc adds 1 INSIDE MongoDB in one step, so two orders at the same time can never get the same number.
// upsert: true = if the counter doesn't exist yet, create it (the first call gives 1).
export const nextNumber = async (name: string) => {
  const counter = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  );

  return counter!.seq; // "!" = with upsert there is always a counter
};
```

### 22.3 `src/models/Order.ts`

New file.

```ts
// Order model server/src/models/Order.ts
// One placed order: what was bought (at what price), where it goes, how it's paid, and where it is now.

// STEP 22 (part 2): The Order model

import { model, Schema, Types } from "mongoose";
import { addressSchema, IAddress } from "./User";

// processing = placed, being packed  ("In Progress" tab)
// shipped    = with the courier      ("Shipped" tab; the tracker calls it "Dispatched")
// delivered  = handed over           ("Delivered" tab)
// cancelled  = cancelled             ("Cancelled" tab)
export const ORDER_STATUSES = ["processing", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// One line of the order. Name, photo and price are COPIED from the product when the order is placed
// (a "snapshot"): if the price changes next week, this order still shows what the customer paid.
export interface IOrderItem {
  product: Types.ObjectId; // the product (for "Buy Again" and reviews)
  name: string;
  image: string;
  sku: string;
  price: number; // the price of ONE, in naira, when the order was placed
  quantity: number;
  color?: string; // e.g. "Midnight Black"
  lineTotal: number; // price x quantity
}

// One step of the tracker: "Order Placed Oct 24, 10:14 AM"
export interface IStatusUpdate {
  status: OrderStatus;
  note: string; // e.g. "Order placed", "Cancelled by you"
  at: Date;
}

// The "Payment Record" card. We NEVER store a full card number or CVV: only the brand and the last 4 digits.
export interface IPayment {
  method: "card" | "pay_on_delivery";
  status: "paid" | "pending" | "refunded"; // pay on delivery stays "pending" until delivery
  cardBrand?: string; // "Mastercard", "Visa", "Verve"
  cardLast4?: string; // "4242"
  reference?: string; // "PSTK-991204812"
  paidAt?: Date;
}

export interface IOrder {
  orderNumber: string; // "QC-1042" (the website shows it as #QC-1042)
  user: Types.ObjectId; // who placed it
  items: IOrderItem[];
  contact: { firstName: string; lastName: string; email: string; phone: string };
  shippingAddress: IAddress; // a COPY of the address: editing the saved address later doesn't move this order
  deliveryMethod: "standard" | "express";
  payment: IPayment;
  subtotal: number; // all line totals added up
  deliveryFee: number;
  discount: number; // from the promo code (0 = none)
  promoCode?: string; // "QUICK25"
  total: number; // subtotal - discount + deliveryFee
  status: OrderStatus;
  statusHistory: IStatusUpdate[];
  estimatedDelivery: { from: Date; to: Date }; // "Oct 26 - Oct 27"
  courier?: string; // set when it's shipped (STEP 26), e.g. "QuickCart Express Freight"
  waybill?: string; // e.g. "QCK-LOS-994821-NG"
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date; // "Placed on ..." (added by timestamps)
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String, default: "" },
    sku: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    color: { type: String },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }, // the lines don't need their own ids
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, unique: true }, // set just before saving (see orderController)
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    contact: {
      firstName: { type: String, required: [true, "First name is required"], trim: true },
      lastName: { type: String, required: [true, "Last name is required"], trim: true },
      email: { type: String, required: [true, "Email is required"], lowercase: true, trim: true },
      phone: { type: String, required: [true, "Phone number is required"], trim: true },
    },
    // The SAME rules as a saved address (STEP 20.1): "Street address is required", ...
    shippingAddress: { type: addressSchema, required: [true, "Please choose a delivery address."] },
    deliveryMethod: { type: String, enum: ["standard", "express"], required: true },
    payment: {
      method: { type: String, enum: ["card", "pay_on_delivery"], required: true },
      status: { type: String, enum: ["paid", "pending", "refunded"], required: true },
      cardBrand: { type: String },
      cardLast4: { type: String },
      reference: { type: String },
      paidAt: { type: Date },
    },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    promoCode: { type: String },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ORDER_STATUSES, default: "processing" },
    statusHistory: [
      {
        _id: false,
        status: { type: String, enum: ORDER_STATUSES, required: true },
        note: { type: String, default: "" },
        at: { type: Date, default: Date.now },
      },
    ],
    estimatedDelivery: { from: Date, to: Date },
    courier: { type: String },
    waybill: { type: String },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { type: String, trim: true },
  },
  { timestamps: true },
);

// "My orders" always searches by user, newest first: an index makes that fast
orderSchema.index({ user: 1, createdAt: -1 });

export const Order = model<IOrder>("Order", orderSchema);
```

**Why copy the name, photo and price into the order?** Products change. If the headphones go from ₦45,000 to
₦50,000 next month, Ada's order must still say ₦45,000, because that's what she paid. The same goes for the
address: if she edits her Home address later, an order that's already on its way doesn't change.

### 22.4 `src/utils/orderRules.ts`: delivery, dates, cancel window, pretend card

New file.

```ts
// orderRules.ts server/src/utils/orderRules.ts
// The shop's order rules in one place: delivery prices, delivery dates, the 1-hour cancel window,
// Lagos-only options and the pretend card payment.

// STEP 22 (part 3): Order rules

import { randomInt } from "crypto";
import { AppError } from "./AppError";

// The checkout's "Delivery Method" box
export const DELIVERY_OPTIONS = {
  standard: { label: "Standard Delivery", fee: 0, minDays: 2, maxDays: 3 }, // Free, 2-3 business days
  express: { label: "Express Same-Day Dispatch", fee: 2500, minDays: 0, maxDays: 0 }, // ₦2,500, today (Lagos only)
};

export type DeliveryMethod = keyof typeof DELIVERY_OPTIONS; // "standard" | "express"

export const CANCEL_WINDOW_MINUTES = 60; // "Free cancellation available within 1 hour of placement"

// Express delivery and Pay on Delivery are "Lagos Metro Only" in the designs
export const isLagos = (state: unknown) => /lagos/i.test(String(state ?? "")); // "Lagos State", "lagos" -> true

// Monday + 2 business days = Wednesday. Friday + 2 = Tuesday (Saturday and Sunday are skipped).
export const addBusinessDays = (start: Date, days: number) => {
  const date = new Date(start);
  let added = 0;

  while (added < days) {
    date.setDate(date.getDate() + 1); // the next day
    const weekday = date.getDay(); // 0 = Sunday, 6 = Saturday
    if (weekday !== 0 && weekday !== 6) added++;
  }

  return date;
};

// "Estimated Delivery: Oct 26 - Oct 27"
export const estimateDelivery = (method: DeliveryMethod, placedAt: Date) => {
  const option = DELIVERY_OPTIONS[method];
  return {
    from: addBusinessDays(placedAt, option.minDays),
    to: addBusinessDays(placedAt, option.maxDays),
  };
};

// The last moment the order can be cancelled: placed + 60 minutes
export const cancelDeadline = (order: { createdAt: Date }) =>
  new Date(order.createdAt.getTime() + CANCEL_WINDOW_MINUTES * 60 * 1000);

// Shows or hides the "Cancel Order" button: still being packed AND within the hour
export const canCancel = (order: { status: string; createdAt: Date }) =>
  order.status === "processing" && Date.now() < cancelDeadline(order).getTime();

// Oct 24, 2026 (for emails)
export const formatDate = (date: Date) =>
  date.toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });

// "4..." Visa, "51-55..." or "22-27..." Mastercard, "506/507/650..." Verve
const cardBrand = (digits: string) => {
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
  if (/^(506|507|650)/.test(digits)) return "Verve";
  return "Card";
};

// A PRETEND card payment ("Simulated environment for capstone UI" in the checkout design).
// It checks the card looks right, then "pays". No money moves and the card details are never saved.
// Any card number ending in 0000 is declined, so you can demo a failed payment.
export const chargeCard = (card: unknown) => {
  const { number, expiry, cvv } = (card ?? {}) as Record<string, unknown>;

  const digits = String(number ?? "").replace(/\D/g, ""); // "4242 4242 4242 4242" -> "4242424242424242"
  if (digits.length < 12 || digits.length > 19) {
    throw new AppError(400, "Please enter a valid card number.");
  }

  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(String(expiry ?? "").trim()); // "08/28" -> ["08/28", "08", "28"]
  const month = Number(match?.[1]);
  if (!match || month < 1 || month > 12) {
    throw new AppError(400, "Please enter the expiry date as MM/YY, e.g. 08/28.");
  }

  // A card that says 08/28 works until the END of August 2028, i.e. until 1 September 2028.
  // (new Date(year, 8, 1) = 1 September, because JavaScript counts months from 0.)
  const firstDayAfterExpiry = new Date(2000 + Number(match[2]), month, 1);
  if (firstDayAfterExpiry.getTime() <= Date.now()) {
    throw new AppError(400, "This card has expired.");
  }

  if (!/^\d{3,4}$/.test(String(cvv ?? ""))) {
    throw new AppError(400, "Please enter the 3-digit CVV from the back of your card.");
  }

  if (digits.endsWith("0000")) {
    throw new AppError(402, "Your card was declined. Please try another card."); // 402 = Payment Required
  }

  return {
    cardBrand: cardBrand(digits),
    cardLast4: digits.slice(-4), // the ONLY part of the number we keep
    reference: `PSTK-${randomInt(100000000, 1000000000)}`, // "PSTK-991204812"
    paidAt: new Date(),
  };
};
```

**Test cards:** `4242 4242 4242 4242` is Visa and `5399 4242 4242 4242` is Mastercard (any future expiry like
`08/28`, any 3-digit CVV). `4000 0000 0000 0000` is **declined**.

### 22.5 `src/controllers/orderController.ts`

New file. It's long, but `placeOrder` is just numbered steps 1 to 11: read the cart → real prices → stock →
delivery and payment → address → money → check → pay and take stock → number and save → email.

```ts
// orderController.ts server/src/controllers/orderController.ts
// Checkout and the customer's own orders.

// STEP 22 (part 4): Orders
// (every route has protect, so req.user is always the logged-in user)
// POST  /api/orders                      -> place an order (the "PLACE ORDER NOW" button)
// GET   /api/orders                      -> my orders (?status=in-progress|shipped|delivered|cancelled, ?search=, ?sort=oldest)
// GET   /api/orders/summary              -> the numbers and recent orders on My Account
// GET   /api/orders/:orderNumber         -> one order (e.g. /api/orders/QC-1042)
// PATCH /api/orders/:orderNumber/cancel  -> cancel it (only within 1 hour, while still processing)

import { Request, Response } from "express";
import { HydratedDocument, isValidObjectId, Types } from "mongoose";
import { env } from "../config/env";
import { nextNumber } from "../models/Counter";
import { IOrder, IOrderItem, Order, OrderStatus } from "../models/Order";
import { liveProducts, Product } from "../models/Product";
import { PromoCode } from "../models/PromoCode";
import { AppError } from "../utils/AppError";
import { escapeRegex } from "../utils/escapeRegex";
import {
  cancelDeadline,
  canCancel,
  chargeCard,
  DELIVERY_OPTIONS,
  DeliveryMethod,
  estimateDelivery,
  formatDate,
  isLagos,
} from "../utils/orderRules";
import { applyPromo, naira } from "../utils/promo";
import { sendEmail } from "../utils/sendEmail";
import { pickAddress } from "./accountController";

const me = (req: Request) => req.user!;

const MAX_QUANTITY = 10; // per cart line
const FIRST_ORDER_NUMBER = 1042; // the first order is #QC-1042, like the designs

// ===== Helpers =====

// The body's "items" -> [{ productId, quantity, color }], or a 400 the checkout can show
const readCart = (items: unknown) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError(400, "Your cart is empty.");
  }

  return items.map((item) => {
    const { productId, quantity, color } = (item ?? {}) as Record<string, unknown>;
    const qty = Number(quantity);

    if (!isValidObjectId(productId)) {
      throw new AppError(400, "An item in your cart is no longer available. Please refresh your cart.");
    }

    // Number.isInteger: 2 yes; 1.5, "two", NaN no
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY) {
      throw new AppError(400, `Quantity must be a whole number from 1 to ${MAX_QUANTITY}.`);
    }

    return { productId: String(productId), quantity: qty, color: color ? String(color) : undefined };
  });
};

// Take the stock: one update per product. "stock: { $gte: qty }" = only if there's still enough.
// Two people buying the last one at the same moment: MongoDB lets only one update match, the other gets the 409.
const reserveStock = async (wanted: Map<string, number>, products: Map<string, { name: string; trackStock: boolean }>) => {
  const reserved: { product: string; quantity: number }[] = [];

  for (const [id, quantity] of wanted) {
    const product = products.get(id)!;

    const result = product.trackStock
      ? await Product.updateOne({ _id: id, stock: { $gte: quantity } }, { $inc: { stock: -quantity, sold: quantity } })
      : await Product.updateOne({ _id: id }, { $inc: { sold: quantity } }); // made to order: stock isn't counted

    if (result.modifiedCount === 0) {
      await releaseStock(reserved); // give back what we already took for this order
      throw new AppError(409, `Sorry, "${product.name}" just sold out. Please update your cart.`);
    }

    reserved.push({ product: id, quantity });
  }
};

// Put stock back (a cancelled order, or a checkout that failed half-way)
const releaseStock = async (lines: { product: Types.ObjectId | string; quantity: number }[]) => {
  if (lines.length === 0) return; // bulkWrite refuses an empty list

  await Product.bulkWrite(
    lines.flatMap(({ product, quantity }) => [
      { updateOne: { filter: { _id: product }, update: { $inc: { sold: -quantity } } } },
      // only products that count their stock get it back
      { updateOne: { filter: { _id: product, trackStock: true }, update: { $inc: { stock: quantity } } } },
    ]),
  );
};

// The confirmation email (plain text: sendEmail turns it into simple HTML)
const confirmationEmail = (order: IOrder) => {
  const delivery = DELIVERY_OPTIONS[order.deliveryMethod];
  const address = order.shippingAddress;

  const lines = [
    `Hi ${order.contact.firstName},`,
    "",
    `Thank you for your order! We have received order #${order.orderNumber} and started preparing it for delivery.`,
    "",
    ...order.items.map(
      (item) => `- ${item.name}${item.color ? ` (${item.color})` : ""} x ${item.quantity}: ${naira(item.lineTotal)}`,
    ),
    "",
    `Subtotal: ${naira(order.subtotal)}`,
    `Delivery (${delivery.label}): ${order.deliveryFee === 0 ? "FREE" : naira(order.deliveryFee)}`,
  ];

  if (order.discount > 0) {
    lines.push(`Discount (${order.promoCode}): -${naira(order.discount)}`);
  }

  lines.push(
    `Total: ${naira(order.total)}`,
    "",
    order.payment.method === "card"
      ? `Payment: paid with ${order.payment.cardBrand} ending in ${order.payment.cardLast4}`
      : "Payment: pay on delivery (cash or POS)",
    `Delivering to: ${address.fullName}, ${address.street}, ${address.city}, ${address.state}`,
    `Estimated delivery: ${formatDate(order.estimatedDelivery.from)} - ${formatDate(order.estimatedDelivery.to)}`,
    "",
    `Track your order: ${env.clientUrl}/account/orders/${order.orderNumber}`,
    "",
    "Changed your mind? You can cancel free of charge within 1 hour of placing your order.",
    "",
    "The QuickCart team",
  );

  return lines.join("\n");
};

// An order + what the "Cancel Order" button needs ("46 mins remaining")
const withCancelInfo = (order: HydratedDocument<IOrder>) => ({
  order,
  canCancel: canCancel(order),
  cancelDeadline: cancelDeadline(order),
});

// How many of MY orders are in each status: { processing: 1, delivered: 3, ... }
const countByStatus = async (userId: Types.ObjectId) => {
  const groups = await Order.aggregate<{ _id: OrderStatus; count: number }>([
    { $match: { user: userId } },
    { $group: { _id: "$status", count: { $sum: 1 } } }, // one group per status, counting the orders
  ]);

  const counts = { processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
  for (const group of groups) counts[group._id] = group.count;
  return counts;
};

// Find one of MY orders from the URL: "QC-1042", "qc-1042" or "1042" all work. Someone else's order = 404.
const findMyOrder = async (req: Request<{ orderNumber: string }>) => {
  let orderNumber = req.params.orderNumber.trim().toUpperCase();
  if (/^\d+$/.test(orderNumber)) orderNumber = `QC-${orderNumber}`; // "1042" -> "QC-1042"

  const order = await Order.findOne({ orderNumber, user: me(req)._id });
  if (!order) {
    throw new AppError(404, "Order not found");
  }

  return order;
};

// ===== Place an order =====

// POST /api/orders
// {
//   "items": [{ "productId": "...", "quantity": 2, "color": "Midnight Black" }],
//   "contact": { "firstName", "lastName", "email", "phone" },   (optional: the account's details are used)
//   "addressId": "..."  OR  "address": { "fullName", "phone", "street", "city", "state", "instructions"? },
//   "deliveryMethod": "standard" | "express",
//   "paymentMethod": "card" | "pay_on_delivery",
//   "card": { "number": "4242 4242 4242 4242", "expiry": "08/28", "cvv": "987" },   (card only)
//   "promoCode": "QUICK25"   (optional)
// }
export const placeOrder = async (req: Request, res: Response) => {
  const user = me(req);
  const body = req.body ?? {};

  // 1. The cart lines
  const cart = readCart(body.items);

  // 2. Load the products. Prices come from the DATABASE, never from the website.
  const ids = [...new Set(cart.map((line) => line.productId))];
  const found = await Product.find({ $and: [{ _id: { $in: ids } }, liveProducts()] });
  const products = new Map(found.map((product) => [String(product._id), product]));

  if (products.size !== ids.length) {
    throw new AppError(400, "An item in your cart is no longer available. Please refresh your cart.");
  }

  // 3. Build the lines (the price snapshot) and add up how many of each product are wanted
  const wanted = new Map<string, number>(); // the same product in 2 colours = 2 lines, 1 stock check
  const items: IOrderItem[] = cart.map((line) => {
    const product = products.get(line.productId)!;
    wanted.set(line.productId, (wanted.get(line.productId) ?? 0) + line.quantity);

    return {
      product: product._id,
      name: product.name,
      image: product.images[0] ?? "",
      sku: product.sku,
      price: product.price,
      quantity: line.quantity,
      color: line.color,
      lineTotal: product.price * line.quantity,
    };
  });

  // 4. Enough stock? (a friendly message now; reserveStock in step 9 makes it certain)
  for (const [id, quantity] of wanted) {
    const product = products.get(id)!;
    if (product.trackStock && product.stock < quantity) {
      throw new AppError(
        400,
        product.stock === 0
          ? `"${product.name}" is sold out. Please remove it from your cart.`
          : `Only ${product.stock} left of "${product.name}". Please lower the quantity.`,
      );
    }
  }

  // 5. Delivery and payment choices
  const deliveryMethod: DeliveryMethod = body.deliveryMethod ?? "standard"; // not sent = standard
  if (deliveryMethod !== "standard" && deliveryMethod !== "express") {
    throw new AppError(400, "Please choose a delivery method.");
  }

  const paymentMethod = body.paymentMethod;
  if (paymentMethod !== "card" && paymentMethod !== "pay_on_delivery") {
    throw new AppError(400, "Please choose a payment method.");
  }

  // 6. The address: one of my saved ones (addressId), or one typed at checkout (address)
  let shippingAddress;
  if (body.addressId) {
    const saved = user.addresses.find((a) => String(a._id) === String(body.addressId));
    if (!saved) {
      throw new AppError(404, "Address not found");
    }
    shippingAddress = pickAddress(saved as unknown as Record<string, unknown>); // a copy, without its _id
  } else if (body.address && typeof body.address === "object") {
    shippingAddress = pickAddress(body.address);
  } else {
    throw new AppError(400, "Please choose a delivery address.");
  }

  if (deliveryMethod === "express" && !isLagos(shippingAddress.state)) {
    throw new AppError(400, "Express Same-Day Dispatch is only available in Lagos.");
  }
  if (paymentMethod === "pay_on_delivery" && !isLagos(shippingAddress.state)) {
    throw new AppError(400, "Pay on Delivery is only available in Lagos.");
  }

  // 7. The money: subtotal from the database prices, the promo code checked AGAIN here, then delivery
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  let discount = 0;
  let promoCode: string | undefined;
  if (body.promoCode) {
    const result = await applyPromo(body.promoCode, subtotal); // the same function as the Apply button
    discount = result.discount;
    promoCode = result.promo.code;
  }

  const deliveryFee = DELIVERY_OPTIONS[deliveryMethod].fee;
  const total = subtotal - discount + deliveryFee;

  // 8. Build the order and check it BEFORE touching stock or payment (missing street, phone... -> 400)
  const contact = body.contact ?? {};
  const placedAt = new Date();

  const order = new Order({
    user: user._id,
    items,
    contact: {
      firstName: contact.firstName ?? user.firstName,
      lastName: contact.lastName ?? user.lastName,
      email: contact.email ?? user.email,
      phone: contact.phone ?? user.phone,
    },
    shippingAddress,
    deliveryMethod,
    payment: { method: paymentMethod, status: "pending" },
    subtotal,
    deliveryFee,
    discount,
    promoCode,
    total,
    status: "processing",
    statusHistory: [{ status: "processing", note: "Order placed", at: placedAt }],
    estimatedDelivery: estimateDelivery(deliveryMethod, placedAt),
  });

  await order.validate(); // runs the model's rules now (save() would run them too, but that's after step 9)

  // 9. Pay (pretend) and take the stock
  if (paymentMethod === "card") {
    Object.assign(order.payment, { status: "paid", ...chargeCard(body.card) }); // declined -> 402, nothing taken
  }

  await reserveStock(wanted, products); // sold out in the meantime -> 409, nothing taken

  // 10. Give it a number and save. If saving fails, give the stock back before reporting the error.
  try {
    order.orderNumber = `QC-${FIRST_ORDER_NUMBER - 1 + (await nextNumber("order"))}`; // 1st order: 1041 + 1 = QC-1042
    await order.save();
  } catch (error) {
    await releaseStock(items);
    throw error;
  }

  // 11. Count the promo code use, and send the email (sendEmail never throws, so no await needed:
  // the customer gets their reply straight away instead of waiting for Brevo)
  if (promoCode) {
    await PromoCode.updateOne({ code: promoCode }, { $inc: { usedCount: 1 } });
  }
  void sendEmail(order.contact.email, `Order #${order.orderNumber} confirmed`, confirmationEmail(order));

  res.status(201).json({ message: "Your order has been placed!", ...withCancelInfo(order) });
};

// ===== My orders =====

// The filter tabs on Order History -> the status saved in the database
const STATUS_TABS = new Map<string, OrderStatus>([
  ["in-progress", "processing"],
  ["shipped", "shipped"],
  ["delivered", "delivered"],
  ["cancelled", "cancelled"],
]);

// GET /api/orders?status=delivered&search=QC-1042&sort=oldest
export const getMyOrders = async (req: Request, res: Response) => {
  const { status, search, sort } = req.query;
  const filter: Record<string, unknown> = { user: me(req)._id }; // ONLY my orders

  if (typeof status === "string" && STATUS_TABS.has(status)) {
    filter.status = STATUS_TABS.get(status);
  }

  // "Search by order number (e.g. #QC-1042) or product name"
  if (typeof search === "string" && search.trim()) {
    const text = new RegExp(escapeRegex(search.trim().replace(/^#/, "")), "i"); // "#QC-1042" -> /QC-1042/i
    filter.$or = [{ orderNumber: text }, { "items.name": text }];
  }

  const [orders, counts] = await Promise.all([
    Order.find(filter).sort({ createdAt: sort === "oldest" ? 1 : -1 }),
    countByStatus(me(req)._id),
  ]);

  res.json({
    orders,
    // the numbers on the tabs: "All Orders (5)", "In Progress (1)" ...
    counts: {
      all: counts.processing + counts.shipped + counts.delivered + counts.cancelled,
      "in-progress": counts.processing,
      shipped: counts.shipped,
      delivered: counts.delivered,
      cancelled: counts.cancelled,
    },
  });
};

// GET /api/orders/summary -> the My Account overview
export const getOrderSummary = async (req: Request, res: Response) => {
  const [counts, recentOrders] = await Promise.all([
    countByStatus(me(req)._id),
    Order.find({ user: me(req)._id }).sort({ createdAt: -1 }).limit(3),
  ]);

  res.json({
    totalOrders: counts.processing + counts.shipped + counts.delivered + counts.cancelled,
    inProgress: counts.processing + counts.shipped, // not delivered yet
    delivered: counts.delivered,
    recentOrders,
  });
};

// GET /api/orders/:orderNumber
export const getOrder = async (req: Request<{ orderNumber: string }>, res: Response) => {
  res.json(withCancelInfo(await findMyOrder(req)));
};

// ===== Cancel =====

// PATCH /api/orders/:orderNumber/cancel   { "reason"?: "Ordered the wrong colour" }
export const cancelOrder = async (req: Request<{ orderNumber: string }>, res: Response) => {
  const order = await findMyOrder(req);

  if (order.status === "cancelled") {
    throw new AppError(400, "This order is already cancelled.");
  }
  if (order.status !== "processing") {
    throw new AppError(400, "This order has already left our warehouse, so it can't be cancelled. Please contact support.");
  }
  if (!canCancel(order)) {
    throw new AppError(400, "Free cancellation is only available within 1 hour of placing your order. Please contact support.");
  }

  // Change it ONLY if it's still "processing" at this very moment. Pressing Cancel twice quickly would
  // otherwise give the stock back twice: the second click finds nothing to change and gets the 400 below.
  const now = new Date();
  const cancelled = await Order.findOneAndUpdate(
    { _id: order._id, status: "processing" },
    {
      $set: {
        status: "cancelled",
        cancelledAt: now,
        cancelReason: String(req.body?.reason ?? "").trim() || undefined,
        "payment.status": order.payment.status === "paid" ? "refunded" : order.payment.status,
      },
      $push: { statusHistory: { status: "cancelled", note: "Cancelled by you", at: now } },
    },
    { returnDocument: "after" },
  );

  if (!cancelled) {
    throw new AppError(400, "This order is already cancelled.");
  }

  await releaseStock(cancelled.items); // the items go back on the shelf
  if (cancelled.promoCode) {
    await PromoCode.updateOne({ code: cancelled.promoCode }, { $inc: { usedCount: -1 } });
  }

  void sendEmail(
    cancelled.contact.email,
    `Order #${cancelled.orderNumber} cancelled`,
    [
      `Hi ${cancelled.contact.firstName},`,
      "",
      `Your order #${cancelled.orderNumber} has been cancelled.`,
      cancelled.payment.status === "refunded"
        ? `Your payment of ${naira(cancelled.total)} will be refunded to your ${cancelled.payment.cardBrand} card ending in ${cancelled.payment.cardLast4}.`
        : "You have not been charged.",
      "",
      "The QuickCart team",
    ].join("\n"),
  );

  res.json({ message: "Your order has been cancelled.", ...withCancelInfo(cancelled) });
};
```

**Things worth understanding:**

- **The order of steps 8 to 10 matters.** Everything that can be wrong with the **request** (missing street, bad
  card, unknown promo code) is checked **before** stock is taken. Then nothing has to be undone when a shopper
  mistypes their CVV.
- **`stock: { $gte: quantity }` in `reserveStock`:** "take 1, but only if there's at least 1". If two people buy
  the last one at the same moment, only one update matches. The other person gets *"just sold out"* (409), and the
  stock can never go below 0.
- **`findOneAndUpdate({ ..., status: "processing" })` in `cancelOrder`:** the same idea. Pressing Cancel twice very
  fast must not put the stock back twice.
- **`void sendEmail(...)`:** `void` means "start it, but don't wait". Brevo can take a second or two. The shopper
  sees "Your order has been placed!" straight away, and `sendEmail` never throws (STEP 19B), so nothing can crash.
- **Someone else's order gives 404, not 403.** `findMyOrder` searches by order number **and** `user: me`. A 403
  would tell a stranger "this order number exists".
- **The website's URL `/account/orders/:orderId`:** use the order number there, e.g. `/account/orders/QC-1042`,
  and `/order-confirmation/QC-1042`. The `#` is only for display: `#` has a special meaning in URLs.

### 22.6 `src/routes/orderRoutes.ts` and mount it

New file:

```ts
// orderRoutes.ts server/src/routes/orderRoutes.ts
// routes/index.ts puts these under /api/orders.

// STEP 22 (part 5): Order routes

import { Router } from "express";
import { cancelOrder, getMyOrders, getOrder, getOrderSummary, placeOrder } from "../controllers/orderController";
import { protect } from "../middleware/auth";

const router = Router();

router.use(protect); // you must be logged in to place or see orders

router.post("/", placeOrder);
router.get("/", getMyOrders);
router.get("/summary", getOrderSummary); // BEFORE "/:orderNumber", or "summary" would be read as an order number
router.get("/:orderNumber", getOrder);
router.patch("/:orderNumber/cancel", cancelOrder);

export default router;
```

In `src/routes/index.ts`:

```ts
import orderRoutes from "./orderRoutes";
```

```ts
router.use("/orders", orderRoutes); // /api/orders...
```

### 22.7 `npm run seed` also clears the orders

`npm run seed` creates the users again with **new ids**, so old orders would belong to nobody. In
`src/data/seed.ts`:

1. Add the imports:

   ```ts
   import { Order } from "../models/Order";
   import { Counter } from "../models/Counter";
   ```

2. In step 1, add these two inside the `Promise.all([...])`, under `PromoCode.deleteMany({}),`:

   ```ts
       Order.deleteMany({}),
       Counter.deleteMany({}), // so the next order is #QC-1042 again
   ```

(Demo orders for Ada, like the 5 in the Order History design, come with the demo panel in STEP 28.)

### 22.8 Test it

```bash
npm run typecheck
npm run seed
npm run dev
```

**Get what you need first:**

1. Log in as Ada (`POST /api/auth/login`) and copy the `token`. Every request below needs
   `Authorization: Bearer <token>`.
2. `GET /api/auth/me`: copy the `_id` of her **Home** address.
3. `GET /api/products?limit=3`: copy 2 product `_id`s and note their `price` and `stock`.

**Place an order:** `POST http://localhost:5000/api/orders`

```json
{
  "items": [
    { "productId": "<product 1 id>", "quantity": 2, "color": "Midnight Black" },
    { "productId": "<product 2 id>", "quantity": 1 }
  ],
  "addressId": "<Home address id>",
  "deliveryMethod": "standard",
  "paymentMethod": "card",
  "card": { "number": "4242 4242 4242 4242", "expiry": "08/28", "cvv": "987" },
  "promoCode": "QUICK25"
}
```

Expected **201**: `order.orderNumber: "QC-1042"`, `subtotal` = (price 1 × 2) + price 2, `discount: 2000`,
`deliveryFee: 0`, `total` = subtotal − 2000, `payment: { status: "paid", cardBrand: "Visa", cardLast4: "4242",
reference: "PSTK-..." }`, `canCancel: true`. The terminal shows the confirmation email (or says it was sent with
Brevo). In Atlas: product 1's `stock` went down by 2 and `sold` up by 2, and QUICK25's `usedCount` is 1.

Try adding `"price": 1` to an item: it's ignored, and the real price is used.

**Now break it.** Change one thing in the body above each time (nothing is saved and no stock is taken for any of these):

| Change                                                                              | Status | Message                                                       |
| ----------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------- |
| `"items": []`                                                                       | 400    | Your cart is empty.                                           |
| `"quantity": 0` (or 11, or 1.5)                                                     | 400    | Quantity must be a whole number from 1 to 10.                 |
| `"productId": "abc"`                                                                | 400    | An item in your cart is no longer available. ...              |
| in Atlas, set product 2's `stock` to 1, then order 2 of it                        | 400    | Only N left of "...". Please lower the quantity.              |
| card number `4000 0000 0000 0000`                                                   | 402    | Your card was declined. Please try another card.              |
| `"expiry": "01/20"`                                                                 | 400    | This card has expired.                                        |
| `"cvv": "12"`                                                                       | 400    | Please enter the 3-digit CVV from the back of your card.      |
| `"promoCode": "FREEMONEY"`                                                          | 400    | "FREEMONEY" is not a valid promo code.                        |
| `"paymentMethod": "bitcoin"`                                                        | 400    | Please choose a payment method.                               |
| no `addressId` and no `address`                                                     | 400    | Please choose a delivery address.                             |
| instead of `addressId`: `"address": { "fullName": "Ada", "phone": "1", "city": "Ikeja", "state": "Lagos" }` | 400 | Street address is required |
| an Abuja `address` + `"deliveryMethod": "express"`                                  | 400    | Express Same-Day Dispatch is only available in Lagos.         |
| an Abuja `address` + `"paymentMethod": "pay_on_delivery"`                           | 400    | Pay on Delivery is only available in Lagos.                   |
| no token                                                                            | 401    | (from `protect`)                                              |

**A second order:** `"deliveryMethod": "express"`, `"paymentMethod": "pay_on_delivery"`, no `card`, no
`promoCode`. Expected 201: `QC-1043`, `deliveryFee: 2500`, `payment.status: "pending"`.

**My orders:**

| Request                                   | Expected                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| `GET /api/orders`                         | both orders, newest first, and `counts: { all: 2, "in-progress": 2, ... }` |
| `GET /api/orders?sort=oldest`             | QC-1042 first                                                            |
| `GET /api/orders?search=%23QC-1043`       | only QC-1043 (`%23` is how `#` is written in a URL)                     |
| `GET /api/orders?search=<part of a product name>` | the orders with that product                                    |
| `GET /api/orders?status=delivered`        | `orders: []` (nothing delivered yet)                                    |
| `GET /api/orders/summary`                 | `totalOrders: 2, inProgress: 2, delivered: 0, recentOrders: [...]`       |
| `GET /api/orders/QC-1042` (or `qc-1042`, or `1042`) | the order + `canCancel: true` + `cancelDeadline`               |
| `GET /api/orders/QC-1042` with the **admin's** token | 404 (it's not the admin's order)                              |

**Cancel:** `PATCH /api/orders/QC-1042/cancel` with `{ "reason": "Ordered the wrong colour" }`

- 200: `status: "cancelled"`, `payment.status: "refunded"`, `canCancel: false`, 2 entries in `statusHistory`
- In Atlas, product 1's stock is back to what it was, and QUICK25's `usedCount` is back to 0
- The same request again: 400, "This order is already cancelled."
- **After the hour:** in Atlas, change QC-1043's `createdAt` to yesterday, then cancel it. You get 400, "Free
  cancellation is only available within 1 hour ...".
- **Already shipped:** set an order's `status` to `shipped` in Atlas, then cancel it. You get 400, "This order has
  already left our warehouse ...".

I ran all of this against a throwaway database: **72 checks, all passed**. They include two people buying the last
item at the same moment (one gets it, the other gets "just sold out", and the stock ends at 0), pressing Cancel
twice at the same moment (the stock goes back only once), and `npm run seed` starting the numbers at QC-1042 again.

### 22.9 Commit

```bash
git add .
git commit -m "STEP 22: orders (checkout, my orders, order details, cancel)"
git push
```

➡️ **Next: STEP 23 (Reviews: only customers whose order was delivered can review a product, and the product's
star rating updates).** Reply **NEXT** when 22.8 checks out.

---

## STEP 23: Reviews (only customers who received the product)

The product page has a **Customer Reviews (248)** tab with the stars and the 5★–1★ bars, and Order History has a
**Leave Review** button on delivered orders. This step adds:

- a **Review** model: stars (1–5), an optional title, a comment, and the shopper's name as "Ada O."
- **The rule:** you can review a product only if one of **your delivered orders** has it. Ordering isn't enough:
  an order that's still on its way doesn't count. One review per customer per product, which they can edit or delete.
- **The product's stars update** when a review is written, edited or deleted: `ratings`, `reviewCount` and the
  5 bars (`ratingCounts`).

| Request                                   | Login? | What it's for                                                  |
| ----------------------------------------- | ------ | -------------------------------------------------------------- |
| `GET /api/reviews/product/:idOrSlug`      | no     | the Customer Reviews tab (stars summary + a page of reviews)   |
| `GET /api/reviews/mine`                   | yes    | which products I've reviewed (Order History's Leave Review)    |
| `GET /api/reviews/can-review/:productId`  | yes    | show or hide "Write a review" on the product page              |
| `POST /api/reviews`                       | yes    | write a review                                                 |
| `PATCH /api/reviews/:reviewId`            | yes    | edit my review                                                 |
| `DELETE /api/reviews/:reviewId`           | yes    | delete my review (an admin can delete any review)              |

### 23.0 First: fix `RATING_SHARE` in `src/data/demoData.ts` (STEP 12)

Your last two rows say `minRating: 4.7`, and two of the shares are different from the guide:

```ts
  { minRating: 4.7, shares: [50, 20, 12, 6, 4] },   // ❌
  { minRating: 4.7, shares: [35, 30, 10, 10, 7] },  // ❌
```

Change them to:

```ts
  { minRating: 4.0, shares: [50, 28, 12, 6, 4] },
  { minRating: 0, shares: [35, 30, 18, 10, 7] },
```

**Why it matters:** `.find(...)!` promises "there's always a match". With 4.7 / 4.4 / 4.7 / 4.7, a product rated
**4.2** matches no row, and `npm run seed` crashes with *"Cannot destructure property 'shares' ... as it is
undefined"*. It works today only because your one 4.2 product has its own `ratingCounts`. Each row's shares
should also add up to 100 (yours add up to 92). The last row has `minRating: 0`, so **every** rating matches
something. I ran both versions: before the fix, 4.2 and 3.1 crash; after, they give `[50, 28, 12, 6, 4]` and
`[35, 30, 18, 10, 7]`.

### 23.1 Two tiny `export`s in `src/controllers/productController.ts`

The reviews code reads `?page=` and `?limit=` and "id or slug" the same way as the products API:

```ts
export const wholeNumber = (value: unknown, fallback: number) => {
```

```ts
export const OBJECT_ID = /^[a-f0-9]{24}$/i;
```

(Both were `const ...` before.)

### 23.2 `src/models/Review.ts`

New file.

```ts
// Review model server/src/models/Review.ts
// A customer's star rating and comment on a product they bought AND received.

// STEP 23 (part 1): The Review model

import { model, Schema, Types } from "mongoose";

export interface IReview {
  product: Types.ObjectId;
  user: Types.ObjectId;
  order: Types.ObjectId; // the delivered order that proves they bought it ("Verified Purchase")
  name: string; // shown on the review, e.g. "Ada O." (never the email)
  rating: number; // 1 to 5 stars
  title?: string; // e.g. "Best headphones I've owned"
  comment: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    name: { type: String, required: true },
    rating: {
      type: Number,
      required: [true, "Please choose a star rating."],
      cast: "Rating must be a whole number from 1 to 5.", // "abc" -> this message instead of "Cast to Number failed"
      min: [1, "Rating must be a whole number from 1 to 5."],
      max: [5, "Rating must be a whole number from 1 to 5."],
      validate: { validator: Number.isInteger, message: "Rating must be a whole number from 1 to 5." }, // no 4.5
    },
    title: { type: String, trim: true, maxlength: [100, "The title can be at most 100 characters."] },
    comment: {
      type: String,
      required: [true, "Please write a few words about the product."],
      trim: true,
      maxlength: [1000, "Your review can be at most 1,000 characters."],
    },
  },
  { timestamps: true },
);

// One review per customer per product. (MongoDB refuses a second one even if two requests arrive together.)
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// The product page lists a product's reviews, newest first: this index makes that fast
reviewSchema.index({ product: 1, createdAt: -1 });

export const Review = model<IReview>("Review", reviewSchema);
```

### 23.3 `src/controllers/reviewController.ts`

New file.

```ts
// reviewController.ts server/src/controllers/reviewController.ts
// Product reviews. Only customers who bought a product AND received it (a delivered order) can review it.

// STEP 23 (part 2): Reviews
// GET    /api/reviews/product/:idOrSlug     -> a product's reviews (public), ?rating=5&sort=highest&page=2
// GET    /api/reviews/mine                  -> my reviews (the "Leave Review" buttons on Order History)
// GET    /api/reviews/can-review/:productId -> may I review this product? (shows or hides "Write a review")
// POST   /api/reviews                       -> write a review
// PATCH  /api/reviews/:reviewId             -> edit my review
// DELETE /api/reviews/:reviewId             -> delete my review (an admin can delete any review)

import { Request, Response } from "express";
import { isValidObjectId, Types } from "mongoose";
import { Order } from "../models/Order";
import { liveProducts, Product } from "../models/Product";
import { Review } from "../models/Review";
import { AppError } from "../utils/AppError";
import { OBJECT_ID, wholeNumber } from "./productController";

const me = (req: Request) => req.user!;

// What a shopper sees on a review (no user id, no order id)
const PUBLIC_FIELDS = "name rating title comment createdAt";

// ===== Helpers =====

// The product's stars change when a review is written (add), deleted (remove) or its stars are edited (both).
// The demo products already have made-up ratings (e.g. 4.8 from 248 reviews), so we ADJUST those numbers
// instead of recalculating from the reviews in the database (that would wipe out the demo numbers).
const updateProductRating = async (productId: Types.ObjectId, change: { add?: number; remove?: number }) => {
  const product = await Product.findById(productId).select("ratings reviewCount ratingCounts");
  if (!product) return; // the product was deleted: nothing to update

  const counts = [0, 1, 2, 3, 4].map((i) => product.ratingCounts[i] ?? 0); // always 5 bars: [5★, 4★, 3★, 2★, 1★]
  let starsTotal = product.ratings * product.reviewCount; // 4.8 x 248 = all the stars added up
  let reviewCount = product.reviewCount;

  if (change.remove) {
    counts[5 - change.remove] = Math.max(0, counts[5 - change.remove] - 1); // 5★ is counts[0], 1★ is counts[4]
    starsTotal -= change.remove;
    reviewCount -= 1;
  }

  if (change.add) {
    counts[5 - change.add] += 1;
    starsTotal += change.add;
    reviewCount += 1;
  }

  reviewCount = Math.max(0, reviewCount);
  const average = reviewCount > 0 ? starsTotal / reviewCount : 0;

  await Product.updateOne(
    { _id: productId },
    {
      $set: {
        ratingCounts: counts,
        reviewCount,
        ratings: Math.min(5, Math.max(0, Math.round(average * 100) / 100)), // 4.8008 -> 4.8, always 0 to 5
      },
    },
  );
};

// "Ada Obi" -> "Ada O.", "bola tinubu" -> "Bola T." (enough to feel real, without showing the full name)
const displayName = (user: { firstName: string; lastName: string }) => {
  const first = user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1);
  return `${first} ${user.lastName.charAt(0).toUpperCase()}.`;
};

// One of my delivered orders that has this product in it (or null)
const deliveredOrderWith = (userId: Types.ObjectId, productId: string) =>
  Order.findOne({ user: userId, status: "delivered", "items.product": productId }).select("_id orderNumber");

// One of MY reviews from the URL. Someone else's review = 404.
const findMyReview = async (req: Request<{ reviewId: string }>) => {
  const review = isValidObjectId(req.params.reviewId)
    ? await Review.findOne({ _id: req.params.reviewId, user: me(req)._id })
    : null;

  if (!review) {
    throw new AppError(404, "Review not found");
  }

  return review;
};

// ===== Public =====

// How the reviews can be sorted
const SORTS = new Map<string, Record<string, 1 | -1>>([
  ["newest", { createdAt: -1 }],
  ["oldest", { createdAt: 1 }],
  ["highest", { rating: -1, createdAt: -1 }],
  ["lowest", { rating: 1, createdAt: -1 }],
]);

// GET /api/reviews/product/smart-watch-ultra?rating=5&sort=highest&page=1&limit=10
export const getProductReviews = async (req: Request<{ idOrSlug: string }>, res: Response) => {
  const { idOrSlug } = req.params;
  const which = OBJECT_ID.test(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug.toLowerCase() };

  const product = await Product.findOne({ $and: [which, liveProducts()] }).select("ratings reviewCount ratingCounts");
  if (!product) {
    throw new AppError(404, "Product not found");
  }

  const filter: Record<string, unknown> = { product: product._id };

  // ?rating=5: clicking the "5 star" bar shows only 5-star reviews
  const rating = Number(req.query.rating);
  if (Number.isInteger(rating) && rating >= 1 && rating <= 5) {
    filter.rating = rating;
  }

  const sort = SORTS.get(String(req.query.sort)) ?? SORTS.get("newest")!;
  const limit = Math.min(wholeNumber(req.query.limit, 10), 50);
  const page = wholeNumber(req.query.page, 1);

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .select(PUBLIC_FIELDS)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    Review.countDocuments(filter),
  ]);

  res.json({
    // the stars and bars at the top: "4.8 ★ (248)", 5★ ████████ 199 ...
    summary: { ratings: product.ratings, reviewCount: product.reviewCount, ratingCounts: product.ratingCounts },
    reviews,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
};

// ===== Logged in =====

// GET /api/reviews/mine -> all my reviews (with the product's name, slug and photo)
export const getMyReviews = async (req: Request, res: Response) => {
  const reviews = await Review.find({ user: me(req)._id })
    .select(`${PUBLIC_FIELDS} product`)
    .populate("product", "name slug images")
    .sort({ createdAt: -1 });

  res.json({ reviews });
};

// GET /api/reviews/can-review/:productId -> { canReview, reason, review }
export const canReviewProduct = async (req: Request<{ productId: string }>, res: Response) => {
  const { productId } = req.params;
  if (!isValidObjectId(productId)) {
    throw new AppError(404, "Product not found");
  }

  const review = await Review.findOne({ product: productId, user: me(req)._id });
  if (review) {
    return res.json({ canReview: false, reason: "You have already reviewed this product.", review });
  }

  const order = await deliveredOrderWith(me(req)._id, productId);
  res.json({
    canReview: Boolean(order),
    reason: order ? null : "Only customers who have received this product can review it.",
    review: null,
  });
};

// POST /api/reviews   { "productId", "rating": 5, "title"?: "...", "comment": "..." }
export const createReview = async (req: Request, res: Response) => {
  const user = me(req);
  const { productId, rating, title, comment } = req.body ?? {};

  if (!isValidObjectId(productId) || !(await Product.exists({ $and: [{ _id: productId }, liveProducts()] }))) {
    throw new AppError(404, "Product not found");
  }

  if (await Review.exists({ product: productId, user: user._id })) {
    throw new AppError(409, "You have already reviewed this product. You can edit your review instead.");
  }

  // The rule: you must have RECEIVED it. Not just ordered: an order that's still on its way doesn't count.
  const order = await deliveredOrderWith(user._id, productId);
  if (!order) {
    throw new AppError(403, "Only customers who have received this product can review it.");
  }

  let review;
  try {
    review = await Review.create({
      product: productId,
      user: user._id,
      order: order._id,
      name: displayName(user),
      rating,
      title,
      comment,
    }); // no stars, no comment, 6 stars -> the model's messages (400)
  } catch (error) {
    // Two clicks at the same moment: both passed the check above, the unique index stops the second one
    if ((error as { code?: number }).code === 11000) {
      throw new AppError(409, "You have already reviewed this product. You can edit your review instead.");
    }
    throw error;
  }

  await updateProductRating(review.product, { add: review.rating });

  res.status(201).json({ message: "Thank you for your review!", review });
};

// PATCH /api/reviews/:reviewId   { "rating"?, "title"?, "comment"? }
export const updateReview = async (req: Request<{ reviewId: string }>, res: Response) => {
  const review = await findMyReview(req);
  const oldRating = review.rating;
  const { rating, title, comment } = req.body ?? {};

  if (rating !== undefined) review.rating = rating;
  if (title !== undefined) review.title = title;
  if (comment !== undefined) review.comment = comment;

  await review.save(); // the same rules as a new review

  // 4 stars -> 5 stars: take the 4 out of the product's rating and put the 5 in
  if (review.rating !== oldRating) {
    await updateProductRating(review.product, { remove: oldRating, add: review.rating });
  }

  res.json({ message: "Your review has been updated.", review });
};

// DELETE /api/reviews/:reviewId
export const deleteReview = async (req: Request<{ reviewId: string }>, res: Response) => {
  const user = me(req);
  if (!isValidObjectId(req.params.reviewId)) {
    throw new AppError(404, "Review not found");
  }

  // Customers delete their own reviews. An admin can delete any review (e.g. a rude one).
  const filter = user.role === "admin" ? { _id: req.params.reviewId } : { _id: req.params.reviewId, user: user._id };

  // findOneAndDelete finds AND deletes in one step: deleting twice can't take the stars off twice
  const review = await Review.findOneAndDelete(filter);
  if (!review) {
    throw new AppError(404, "Review not found");
  }

  await updateProductRating(review.product, { remove: review.rating });

  res.json({ message: "The review has been deleted." });
};
```

**Things worth understanding:**

- **Why adjust the stars instead of recalculating them?** The demo products already say "4.8 from 248 reviews",
  but those 248 reviews don't exist in the database. If we recalculated from the `reviews` collection, the first real
  review would turn 4.8 (248) into, say, 4.0 (1). So we **add one rating to** (or take one out of) the numbers that
  are already there: (4.8 × 248 + 4) ÷ 249 = 4.7968 → **4.8 (249)**.
- **The `ratingCounts` order is [5★, 4★, 3★, 2★, 1★]** (the same as STEP 12), so a 5-star rating is
  `counts[5 - 5] = counts[0]` and a 1-star rating is `counts[5 - 1] = counts[4]`.
- **403 vs 404 vs 409:** 404 = no such product or review (or it isn't yours). 403 = it exists, but you're not
  allowed (you haven't received it). 409 = you already reviewed it.
- **`findOneAndDelete` and the unique index** stop double clicks from counting twice, like `cancelOrder` in STEP 22.
- **The list says 248 but shows no reviews?** That's right for the demo products: the 248 are made-up numbers from
  the demo data. The website should show "Customer Reviews (248)" from the product and list whatever real reviews come back.

### 23.4 `src/routes/reviewRoutes.ts` and mount it

New file:

```ts
// reviewRoutes.ts server/src/routes/reviewRoutes.ts
// routes/index.ts puts these under /api/reviews.

// STEP 23 (part 3): Review routes

import { Router } from "express";
import {
  canReviewProduct,
  createReview,
  deleteReview,
  getMyReviews,
  getProductReviews,
  updateReview,
} from "../controllers/reviewController";
import { protect } from "../middleware/auth";

const router = Router();

// Anyone can READ reviews
router.get("/product/:idOrSlug", getProductReviews);

// Everything else needs a login (protect on each route, because the route above must stay public)
router.get("/mine", protect, getMyReviews);
router.get("/can-review/:productId", protect, canReviewProduct);
router.post("/", protect, createReview);
router.patch("/:reviewId", protect, updateReview);
router.delete("/:reviewId", protect, deleteReview);

export default router;
```

In `src/routes/index.ts`:

```ts
import reviewRoutes from "./reviewRoutes";
```

```ts
router.use("/reviews", reviewRoutes); // /api/reviews...
```

### 23.5 `npm run seed` also clears the reviews

In `src/data/seed.ts`, add the import:

```ts
import { Review } from "../models/Review";
```

and in step 1, under `Counter.deleteMany({}),`:

```ts
    Review.deleteMany({}),
```

### 23.6 Test it

```bash
npm run typecheck
npm run seed
npm run dev
```

**Get ready (as Ada, with her token):**

1. `GET /api/products/wireless-noise-cancelling-headphones` (or any product): note its `_id`, `ratings` (4.8),
   `reviewCount` (248) and `ratingCounts` (`[203, 30, 10, 3, 2]`).
2. Place an order with that product (STEP 22.8) and note its order number.

| Request (Ada's token unless it says otherwise)                                              | Status | Reply                                                                  |
| ------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------- |
| `GET /api/reviews/product/wireless-noise-cancelling-headphones` (no token)                  | 200    | `summary: { ratings: 4.8, reviewCount: 248, ... }`, `reviews: []`      |
| `GET /api/reviews/can-review/<product id>`                                                  | 200    | `canReview: false`, "Only customers who have received this product..." |
| `POST /api/reviews` `{ "productId": "<id>", "rating": 5, "comment": "Great" }`              | 403    | Only customers who have received this product can review it.           |

**Now "deliver" the order:** in Atlas, open the order and change `status` from `processing` to `delivered`.
(The admin does this properly in STEP 26.)

| Request                                                                                      | Status | Reply                                                     |
| -------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------- |
| `GET /api/reviews/can-review/<product id>`                                                   | 200    | `canReview: true`                                         |
| `POST /api/reviews` with `"rating": 6` (or 0, or 4.5, or "abc")                              | 400    | Rating must be a whole number from 1 to 5.                |
| `POST /api/reviews` with `"comment": ""`                                                     | 400    | Please write a few words about the product.               |
| `POST /api/reviews` `{ "productId": "<id>", "rating": 4, "title": "Solid", "comment": "Great sound, very comfy." }` | 201 | `review.name: "Ada O."`, `rating: 4` |
| the same `POST` again                                                                        | 409    | You have already reviewed this product. ...               |
| `GET /api/products/<slug>`                                                                   | 200    | `reviewCount: 249`, `ratingCounts: [203, 31, 10, 3, 2]`, `ratings: 4.8` |
| `GET /api/reviews/product/<slug>` (no token)                                                 | 200    | `reviews: [Ada's review]`, `total: 1` (no user id or order id in it) |
| `GET /api/reviews/product/<slug>?rating=5`                                                   | 200    | `reviews: []` (Ada gave 4)                               |
| `GET /api/reviews/mine`                                                                      | 200    | Ada's review, with the product's name, slug and photos   |
| `PATCH /api/reviews/<review id>` `{ "rating": 5 }`                                           | 200    | `rating: 5`; the product's `ratingCounts` → `[204, 30, 10, 3, 2]` |
| `PATCH /api/reviews/<review id>` with the **admin's** token                                  | 404    | Review not found (it's not the admin's review)           |
| `DELETE /api/reviews/<review id>`                                                            | 200    | The review has been deleted.                              |
| `GET /api/products/<slug>`                                                                   | 200    | back to 4.8, 248, `[203, 30, 10, 3, 2]`                  |

An admin **can** `DELETE` anyone's review (for rude reviews): write it again, then delete it with the admin's token.

I ran all of this against a throwaway database: **49 checks, all passed**. They include two "submit" clicks at the
same moment (one 201, one 409, the count goes up once), two deletes at the same moment (the stars come off once),
a brand-new product with no ratings (`[]` becomes `[0, 0, 0, 1, 0]` and `ratings: 2`, then back to 0), paging
and sorting, and a name typed in small letters ("bola tinubu" shows as "Bola T.").

### 23.7 Commit

```bash
git add .
git commit -m "STEP 23: reviews (delivered buyers only) + fix RATING_SHARE"
git push
```

➡️ **Next: STEP 24 (Newsletter: the "Subscribe to QuickCart VIP Drops" box in the footer, saved as Brevo
contacts).** Reply **NEXT** when 23.6 checks out.
