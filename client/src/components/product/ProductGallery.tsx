// ProductGallery.tsx client/src/components/product/ProductGallery.tsx
// The big photo and the thumbnails under it. Clicking a thumbnail shows it big. The badge sits on the photo,
// and the ♡ save and share buttons on the right.

// STEP 35 (part 6): The photo gallery

import { useState } from "react";
import { MdOutlineImageNotSupported, MdShare } from "react-icons/md";
import { useToast } from "../../context/ToastContext";
import type { Product } from "../../types/api";
import SaveButton from "./SaveButton";

const ProductGallery = ({ product }: { product: Product }) => {
  const { showToast } = useToast();
  const photos = product.gallery.length > 0 ? product.gallery : product.images; // the model: empty gallery = use images
  const [current, setCurrent] = useState(0);

  // Share: the phone's share sheet when there is one, otherwise copy the link
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        showToast({
          type: "success",
          title: "Link copied",
          message: "Paste it anywhere to share this product.",
        });
      }
    } catch {
      // the shopper closed the share sheet, or the clipboard is blocked: nothing to do
    }
  };

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl bg-field shadow-card">
        {photos[current] ? (
          <img
            src={photos[current]}
            alt={product.name}
            className="aspect-square w-full object-cover"
          />
        ) : (
          <span className="flex aspect-square items-center justify-center text-muted">
            <MdOutlineImageNotSupported size={56} aria-label="No photo yet" />
          </span>
        )}

        {product.badge && (
          <span className="absolute top-4 left-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white uppercase">
            {product.badge}
          </span>
        )}

        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <SaveButton productId={product._id} productName={product.name} />
          <button
            type="button"
            onClick={share}
            aria-label="Share this product"
            className="flex size-10 items-center justify-center rounded-full bg-surface text-ink shadow-card hover:text-primary"
          >
            <MdShare size={20} />
          </button>
        </div>
      </div>

      {photos.length > 1 && (
        <ul className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {photos.map((photo, index) => (
            <li key={photo}>
              <button
                type="button"
                onClick={() => setCurrent(index)}
                aria-label={`Show photo ${index + 1} of ${photos.length}`}
                aria-current={index === current}
                className={`block overflow-hidden rounded-2xl border-2 bg-field transition-colors ${
                  index === current
                    ? "border-primary"
                    : "border-transparent hover:border-primary-light"
                }`}
              >
                <img
                  src={photo}
                  alt=""
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductGallery;
