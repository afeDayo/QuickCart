// PromoBanner.tsx client/src/components/home/PromoBanner.tsx
// "SEASONAL CAMPAIGN / Mega Tech & Home Upgrade": the dark blue banner with the QUICK25 code and a Copy Code button.
// QUICK25 is a real code in the database (server STEP 21): ₦2,000 off orders of ₦25,000 or more.

// STEP 33 (part 9): The promo banner

import { MdArrowForward, MdOutlineCampaign } from "react-icons/md";
import { Link } from "react-router-dom";
import heroImg from "../../assets/images/Curated lifestyle essentials.png";
import { useToast } from "../../context/ToastContext";

const CODE = "QUICK25";

const PromoBanner = () => {
  const { showToast } = useToast();

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(CODE); // the browser's clipboard (needs https or localhost)
      showToast({
        type: "success",
        title: `${CODE} copied`,
        message: "Paste it in your cart to save ₦2,000.",
      });
    } catch {
      // Some browsers block the clipboard: tell them the code instead
      showToast({
        type: "info",
        title: `Your code is ${CODE}`,
        message: "Type it in the promo box in your cart.",
      });
    }
  };

  return (
    <section
      aria-labelledby="promo-title"
      className="grid overflow-hidden rounded-3xl bg-linear-to-r from-footer via-primary to-primary text-white shadow-banner lg:grid-cols-[1.4fr_1fr] max-lg:grid-cols-1"
    >
      <div className="p-8 md:p-10">
        <p className="mb-4 flex w-fit items-center gap-1.5 rounded-full bg-mint px-3 py-1 text-xs font-bold tracking-wide text-forest uppercase">
          <MdOutlineCampaign size={16} aria-hidden="true" /> Seasonal campaign
        </p>
        <h2
          id="promo-title"
          className="max-w-110 text-4xl leading-11 font-extrabold tracking-tight md:text-5xl md:leading-14"
        >
          Mega Tech &amp; Home Upgrade
        </h2>
        <p className="mt-3 max-w-120 text-base leading-6.5 text-white/80">
          Transform your workspace and living quarters with verified electronics
          and modern interior picks. Get ₦2,000 off any order of ₦25,000 or
          more.
        </p>

        <div className="mt-6 flex w-fit items-center gap-6 rounded-2xl border border-white/20 bg-white/10 py-3 pr-3 pl-4">
          <div>
            <p className="text-[11px] tracking-wide text-white/70 uppercase">
              Checkout coupon code
            </p>
            <p className="font-mono text-xl font-bold tracking-wider text-mint">
              {CODE}
            </p>
          </div>
          <button
            type="button"
            onClick={copyCode}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-field"
          >
            Copy Code
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link
            to="/shop"
            className="flex h-12 items-center gap-2 rounded-xl bg-success px-6 font-semibold text-white transition-colors hover:bg-forest"
          >
            Explore Promotion <MdArrowForward size={18} aria-hidden="true" />
          </Link>
          <p className="text-[13px] text-white/70">
            Valid on orders of ₦25,000 or more
          </p>
        </div>
      </div>

      <div className="relative hidden p-6 lg:block">
        <img
          src={heroImg}
          alt=""
          className="h-full w-full rounded-2xl object-cover"
        />
        <p className="absolute right-10 bottom-10 left-10 flex items-center justify-between rounded-xl bg-ink/60 px-4 py-3 text-sm backdrop-blur-sm">
          <span>
            <span className="block text-xs text-white/70">Featured Bundle</span>
            <span className="font-semibold">Desk Sanctuary Setup</span>
          </span>
          <span className="font-semibold text-mint">Save ₦2,000</span>
        </p>
      </div>
    </section>
  );
};

export default PromoBanner;
