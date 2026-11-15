// upload.ts server/src/middleware/upload.ts
// Reads the photos the admin picks with "Add Image" (a multipart/form-data request, not JSON).
//   router.post("/uploads", uploadPhotos, uploadProductPhotos)

// STEP 25 (part 1): Read uploaded photos with multer

import multer from "multer";
import { AppError } from "../utils/AppError";

export const MAX_PHOTO_MB = 5; // the design says "Max 5MB"
export const MAX_PHOTOS = 5; // the design has 5 photo slots ("4 / 5 Slots Active")

// The picture types browsers can show. (No SVG: an SVG file can contain code.)
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

const upload = multer({
  // memoryStorage: keep each file's bytes in memory (req.files[i].buffer) instead of saving it on our disk.
  // We send the bytes straight to Cloudinary, so nothing is left behind on the server.
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PHOTO_MB * 1024 * 1024, files: MAX_PHOTOS },
  fileFilter: (_req, file, accept) => {
    if (!PHOTO_TYPES.includes(file.mimetype)) {
      return accept(
        new AppError(400, "Photos must be JPG, PNG, WebP or AVIF images."),
      );
    }
    accept(null, true);
  },
});

// The form field must be called "photos" (several files allowed). The files end up in req.files.
export const uploadPhotos = upload.array("photos", MAX_PHOTOS);
