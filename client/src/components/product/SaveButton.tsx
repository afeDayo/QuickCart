// SaveButton.tsx client/src/components/product/SaveButton.tsx
// The ♡ on a product: save it for later (My Account → Saved Items, STEP 39). Uses your server's saved items
// (POST / DELETE /api/account/saved/:productId, server STEP 20), so it's kept on the account, on every device.
// Logged out: it sends you to log in first, and back here afterwards.

// STEP 35 (part 5): The save (heart) button

import { useState } from "react";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../utils/api";

const SaveButton = ({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) => {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);

  const saved = user?.savedItems.includes(productId) ?? false;

  const toggle = async () => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    setBusy(true);
    try {
      // The server answers with the new list of saved product ids
      const { savedItems } = await api<{ savedItems: string[] }>(
        `/account/saved/${productId}`,
        { method: saved ? "DELETE" : "POST" },
      );
      setUser({ ...user, savedItems }); // update the logged-in user everywhere
      showToast({
        type: "success",
        title: saved ? "Removed from Saved Items" : "Saved for later",
        message: productName,
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "Couldn't update Saved Items",
        message: (error as Error).message,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved} // a toggle button: screen readers say "pressed" when it's saved
      aria-label={
        saved
          ? `Remove ${productName} from Saved Items`
          : `Save ${productName} for later`
      }
      className="flex size-10 items-center justify-center rounded-full bg-surface text-ink shadow-card transition-colors hover:text-danger disabled:opacity-60"
    >
      {saved ? (
        <MdFavorite
          key="saved"
          size={20}
          className="animate-heart text-danger"
        />
      ) : (
        <MdFavoriteBorder size={20} />
      )}
    </button>
  );
};

export default SaveButton;
