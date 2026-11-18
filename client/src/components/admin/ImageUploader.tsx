// ImageUploader.tsx client/src/components/admin/ImageUploader.tsx
// "Product Gallery Assets" (design: Edit Product): up to 5 photos, the first is the MAIN HERO COVER (the photo
// shoppers see on cards), "Add Image" uploads to Cloudinary through POST /api/admin/uploads (server STEP 25).

// STEP 42 (part 6): Photo uploads

import { useRef, useState, type ChangeEvent } from "react";
import {
  MdAddPhotoAlternate,
  MdDeleteOutline,
  MdOutlineVerified,
  MdStar,
} from "react-icons/md";
import { api } from "../../utils/api";

const MAX_PHOTOS = 5; // the server's limits (server/src/middleware/upload.ts)
const MAX_MB = 5;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

type ImageUploaderProps = {
  images: string[];
  onChange: (images: string[]) => void; // after a remove or "make cover"
  onUploaded: (urls: string[]) => void; // new photos to add at the end
};

const ImageUploader = ({
  images,
  onChange,
  onUploaded,
}: ImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0); // how many photos are on their way
  const [error, setError] = useState("");
  const free = MAX_PHOTOS - images.length - uploading;

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = ""; // so picking the same file again still fires onChange

    // Check in the browser first: no point sending a 20 MB file just to hear "too big"
    const files = picked.slice(0, free);
    const bad = files.find(
      (file) => !TYPES.includes(file.type) || file.size > MAX_MB * 1024 * 1024,
    );
    if (bad) {
      setError(
        `"${bad.name}" must be a JPG, PNG, WebP or AVIF photo of ${MAX_MB} MB or less.`,
      );
      return;
    }
    if (files.length === 0) return;
    setError(
      picked.length > files.length
        ? `Only ${MAX_PHOTOS} photos are allowed, so ${picked.length - files.length} were left out.`
        : "",
    );

    // A file can't go in JSON: FormData sends it as multipart/form-data, the way a plain HTML form would.
    const form = new FormData();
    files.forEach((file) => form.append("photos", file)); // "photos": the field name multer reads

    setUploading(files.length);
    try {
      const { urls } = await api<{ urls: string[] }>("/admin/uploads", {
        method: "POST",
        body: form,
      });
      onUploaded(urls);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(0);
    }
  };

  const remove = (url: string) =>
    onChange(images.filter((image) => image !== url));
  const makeCover = (url: string) =>
    onChange([url, ...images.filter((image) => image !== url)]);

  return (
    <div className="flex flex-col gap-5">
      <p className="flex items-start gap-3 rounded-2xl bg-panel p-4 text-sm text-ink-soft">
        <MdOutlineVerified
          size={20}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-primary"
        />
        Recommended: square photos (1200×1200px) in PNG or WebP on a plain
        background. Maximum {MAX_MB} MB each. The first photo is the cover
        shoppers see on every product card.
      </p>

      <ul
        aria-label="Product photos"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3"
      >
        {images.map((url, index) => (
          <li
            key={url}
            className={`group relative overflow-hidden rounded-2xl bg-field ${index === 0 ? "col-span-2 row-span-2 p-3 ring-1 ring-line" : ""}`}
          >
            <img
              src={url}
              alt={index === 0 ? "Cover photo" : `Photo ${index + 1}`}
              className="aspect-square w-full rounded-xl object-cover"
            />
            {index === 0 && (
              <span className="absolute top-5 left-5 rounded-full bg-primary-hover px-3 py-1 text-xs font-bold tracking-wide text-white uppercase">
                Main hero cover
              </span>
            )}
            {/* The buttons: always shown on phones; on hover or keyboard focus on computers */}
            <span className="absolute right-2 bottom-2 flex gap-1.5 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => makeCover(url)}
                  aria-label={`Make photo ${index + 1} the cover`}
                  className="flex size-9 items-center justify-center rounded-lg bg-surface text-ink shadow-card hover:text-primary"
                >
                  <MdStar size={18} />
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(url)}
                aria-label={`Remove ${index === 0 ? "cover photo" : `photo ${index + 1}`}`}
                className="flex size-9 items-center justify-center rounded-lg bg-surface text-ink shadow-card hover:text-danger"
              >
                <MdDeleteOutline size={18} />
              </button>
            </span>
          </li>
        ))}

        {Array.from({ length: uploading }, (_, index) => (
          <li
            key={`uploading-${index}`}
            className="flex aspect-square animate-pulse items-center justify-center rounded-2xl bg-field text-sm text-muted"
          >
            Uploading...
          </li>
        ))}

        {free > 0 && (
          <li>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/25 bg-panel font-semibold text-ink hover:border-primary/60"
            >
              <MdAddPhotoAlternate
                size={26}
                aria-hidden="true"
                className="text-primary"
              />
              Add Image
              <span className="text-xs font-medium text-ink-soft">
                Max {MAX_MB}MB
              </span>
            </button>
          </li>
        )}
      </ul>

      {/* The real file picker is hidden; the "Add Image" button clicks it */}
      <input
        ref={inputRef}
        type="file"
        accept={TYPES.join(",")}
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
};

export default ImageUploader;
