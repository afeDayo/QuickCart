# Changes made to the server code

Only existing files were corrected. No new features or new code files were added.
After the changes, `npx tsc --noEmit` passes, the server connects to MongoDB, and
`GET /api/health` replies `{"status":"ok",...}`. Unknown URLs reply with a JSON 404.

| File | What was wrong | What was changed |
|------|----------------|------------------|
| `src/app.ts` | The app only used `express.json()`. CORS was not turned on, the routes were never mounted under `/api`, and the `notFound` handler was never used, so every request got Express's default 404. `env` was imported but not used. | Added `cors({ origin: env.clientUrl, credentials: true })`, mounted the router with `app.use("/api", routes)`, and added `app.use(notFound)` after the routes. |
| `src/routes/index.ts` | The route path was `"health"` with no leading `/`, so `/api/health` never matched. The router was also never exported, so `app.ts` could not import it. | Changed the path to `"/health"` and added `export default router;`. Also fixed the typo "rout" in a comment. |
| `src/models/Product.ts` | `gallery` is in the `IProduct` interface, and `products.ts` and the client use it, but it had been deleted from the Mongoose schema. Mongoose would quietly drop gallery photos when saving. | Put `gallery: [{ type: String }]` back in the schema. |
| `src/config/env.ts` | The fallback for `MONGO_URI` had your real MongoDB Atlas username and password written in the source code. | Changed the fallback to a local database, `mongodb://127.0.0.1:27017/quickcart`. Your real URI still comes from `.env`. Also fixed comment typos ("monogoUri", "Remin"). |
| `src/server.ts` | The "Next step" comment pointed to `server/src/model/Category.ts`, which does not exist. | Changed it to `server/src/models/Category.ts`. |
| `src/utils/slugify.ts` | A comment said it removes `"_"`, but the code removes `"-"`. | Fixed the comment. |
| `src/config/cloudinary.ts` | Typos: "brouser" and "didnt". | Fixed both. |

## Not changed, but you need to know

1. **Secrets are committed to git.** `server/.env` (your MongoDB password and Cloudinary secret) and `server/node_modules` are in the repository, and there is no `.gitignore`.
   - Add a `.gitignore` that lists `node_modules`, `.env` and `dist`.
   - Run `git rm --cached -r server/.env server/node_modules`.
   - Change your MongoDB password and your Cloudinary API secret, because the old ones are still in the git history.
2. **`npm run seed` will fail.** It runs `src/data/seed.ts`, and that file does not exist yet (STEP 12). `src/data/demoData.ts` is empty apart from a comment (STEP 11).
3. **`npm run upload-images` does not exist yet.** `package.json` has no `upload-images` script, and there is no upload script file. See the explanation in the chat or below.

## Why `npm run upload-images` failed

```
npm error path C:\Users\Afe Temidayo\Desktop\QuickCarrt\package.json
```

There are two reasons:

1. **You ran it from the wrong folder.** `QuickCarrt/` has no `package.json`. Only `client/` and `server/` have one, so npm found nothing to run. Run it from `server/`:
   ```bash
   cd server
   npm run upload-images -- "C:/Users/Afe Temidayo/Desktop/quickcart-product-photos"
   ```
2. **Even from `server/` it will fail with `Missing script: "upload-images"`.** The script has not been written yet. `src/config/cloudinary.ts` already has the helpers it needs (`uploadPhoto`, `PHOTO_FOLDER`, `isCloudinaryReady`). What is still missing:
   - a script file, for example `src/data/uploadImages.ts`, that reads every image in the folder you pass and calls `uploadPhoto(bytes, `${PHOTO_FOLDER}/${fileNameWithoutExtension}`)` for each one
   - this line in the `"scripts"` section of `server/package.json`:
     `"upload-images": "tsx src/data/uploadImages.ts"`

---

## Update: photo names fixed in code (instead of renaming the photo files)

Some photo files on Cloudinary don't match their product's slug (typos, `&`, dots, `Journal` with a capital J),
and two products have no photos of their own. Instead of renaming files and uploading again, each of those
products now says which photo name to use.

**File changed: `src/data/products.ts` only** (10 lines added, nothing removed)

| Line | What was added |
|------|----------------|
| 36 | New optional field in the `SeedProduct` type: `photo?: string;`, the photo name on Cloudinary when it isn't the slug |
| 690 | Design Systems Handbook → `photo: "design-system-handbook",` |
| 795 | Minimalist LED Desk Lamp → `photo: "minimalistic-led-desk-lamp",` |
| 1532 | Bluetooth Portable Speaker → `photo: "bluethoot-portable-speaker",` |
| 1745 | Cast Iron Skillet 10-inch → `photo: "cast-iron-skillet-10inch",` |
| 2480 | Daily Planner & Hardcover Journal → `photo: "daily-planner-n-hardcover-journal",` |
| 2694 | Smart Gooseneck Kettle → `photo: "electric-gooseneck-kettle",` (borrows that product's photos; it has none) |
| 3647 | Gold-Plated 3.5mm AUX Cable → `photo: "gold-plated-3.5mm-aux-cable",` |
| 3963 | True Wireless ANC Earbuds → `photo: "aeropro-wireless-buds",` (borrows that product's photos; it has none) |
| 4071 | Magnetic Headphone Stand & USB Hub → `photo: "magnetic-headphone-stand-n-usb-hub",` |

`npm run typecheck` passes. The field takes effect once you write `demoData.ts` (GUIDE.md STEP 12.2), where
`photosFor(item.photo ?? slug, photoIds)` uses it.
