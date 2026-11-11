// cloudinary.ts
// Product photo lives on cloudinary, a service that stores pictures and serves them quickly from anywhere in the world This file logs in to cloudinary once and has small helpers for photo addresses

import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";

// Every product photo is kept in the "quickcart/products" folder:

export const PHOTO_FOLDER = "quickcart/products";
export const UPLOAD_FOLDER = `${PHOTO_FOLDER}/uploads`;

// Store products photos on Cloudinary
// Log into cloudinary with the 3 settings from .env, and build photo addresses. f_auto,q_auto in an address asks cloudinary for the best format and size for each browser, so photos loads faster.

export const isCloudinaryReady = Boolean(
  env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret,
);

// What to do when the cloudinary settings are missing
export const CLOUDINARY_MISSING =
  "Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to server/.env.";

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
  secure: true, // https addresses
});

// The start of every product photo address. e.g "https://res.cloudinary.com/my-cloud/image/upload/f_auto,q_auto/"
const PHOTO_URL_START = `https://res.cloudinary.com/${env.cloudinaryCloudName}/image/upload/f_auto,q_auto/`;

// "quickcart/products/smart-watch-ultra" -> "https://res.cloudinary.com/my-cloud/image/upload/f_auto,q_auto/quickcart/products/smart-watch-ultra"
export const photoUrl = (publicId: string) => {
  return PHOTO_URL_START + publicId;
};

//  The photo of a demo product, from its slug: "smart-watch-ultra" -> its cloudinary address
export const productPhotoUrl = (slug: string) => {
  return photoUrl(`${PHOTO_FOLDER}/${slug}`);
};

// is this one of our own product photos? (an address in our cloudinary folder, nothing else)
export const isOurPhoto = (url: string) => {
  if (
    !isCloudinaryReady ||
    !url.startsWith(PHOTO_URL_START + PHOTO_FOLDER + "/")
  ) {
    return false;
  }

  return /^[\w/-]+$/.test(url.slice(PHOTO_URL_START.length));
};

// The cloudinary name (public id) of a photo an admin uploads, or null for any other photo.
// Demo photos are never deleted from admin; npm run upload-images puts them there.
export const uploadedPhotoId = (url: string) => {
  if (
    !isCloudinaryReady ||
    !url.startsWith(PHOTO_URL_START + UPLOAD_FOLDER + "/")
  ) {
    return null;
  }

  return url.slice(PHOTO_URL_START.length);
};

// Sends a photo (the file's bytes) to cloudinary and returns its public id
export const uploadPhoto = (bytes: Buffer, publicId: string) => {
  return new Promise<string>((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { public_id: publicId, overwrite: true, resource_type: "image" },
      (error, result) => {
        return error || !result
          ? reject(error ?? new Error("Cloudinary didn't answer"))
          : resolve(result.public_id);
      },
    );
    upload.end(bytes);
  });
};

// Deletes one photo from cloudinary (a missing photo is not an error)
export const deletePhoto = async (publicId: string) => {
  await cloudinary.uploader
    .destroy(publicId, { invalidate: true })
    .catch(() => {});
};

// Deletes every photo admins uploads (the demo panels "Reset demo data" does this)
export const deleteAllUploadedPhotos = async () => {
  if (!isCloudinaryReady) {
    return;
  }
  await cloudinary.api
    .delete_resources_by_prefix(`${UPLOAD_FOLDER}/`)
    .catch(() => {});
};
