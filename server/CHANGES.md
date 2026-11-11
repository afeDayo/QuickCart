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
