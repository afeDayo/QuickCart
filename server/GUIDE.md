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
| ⬜ | **11** | **Fix photo names and upload them to Cloudinary** ← you are here |
| ⬜ | 12 | `demoData.ts`: turn the data files into database records |
| ⬜ | 13 | `seed.ts`: `npm run seed` fills MongoDB |
| ⬜ | 14 | Error handler (`errorHandler.ts`) |
| ⬜ | 15 | Categories API: `GET /api/categories` |
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
