import { Link } from "react-router-dom";
import footerLogo from "../../assets/images/Container.png";
import { MdOutlineChat, MdOutlineShare, MdPublic } from "react-icons/md";

// The three link colums. A link with a "badge" shows a small green pill next to it.
const footerColums: {
  title: string;
  links: { label: string; to: string; badge?: string }[];
}[] = [
  {
    title: "Shop & Categories",
    links: [
      { label: "Electronics & Gadgets", to: "/shop?category=electronics" },
      { label: "Fashion & Apparel", to: "/shop?category=fashion" },
      { label: "Home & Living", to: "/shop?category=living" },
      { label: "Beauty & Personal Care", to: "/shop?category=beauty" },
      { label: "Daily Flash Deals", to: "/#flash-sale" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Track Your Order", to: "/account/orders" },
      { label: "Shipping & Delivery", to: "/help/shipping" },
      { label: "Easy 7-Day Returns", to: "/help/returns" },
      { label: "FAQs & Help Desk", to: "/help/faqs" },
      { label: "Buyer Protection Policy", to: "/help/buyer-protection" },
    ],
  },
  {
    title: "Company & Legal",
    links: [
      { label: "About QuickCart", to: "/about" },
      { label: "Career", to: "/careers" },
      { label: "Terms of Service", to: "/terms" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Merchant Partners", to: "/merchants" },
    ],
  },
];

// The look of the round social buttons under the brand text
const socialClasses =
  "flex size-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20";

const paymentMethods = [
  "Mastercard",
  "Visa",
  "Verve",
  "Paystack",
  "Flutterwave",
  "Bank Transfer",
];

// The current year for the copyright line
const currentYear = new Date().getFullYear();

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-footer text-white print:hidden">
      <div className="mx-auto max-w-360 px-4 pt-10 pb-6 md:px-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[513px_repeat(3,minmax(0,1fr))] lg:gap-x-10.25 lg:gap-y-0">
          <section aria-label="About QuickCart">
            <Link to="/" className="mb-4" aria-label="QuickCart home">
              <img src={footerLogo} alt="" />
            </Link>

            <p className="mb-4 max-w-96.5 text-base leading-6.5 text-white/70">
              Everything essentials, delivered in 30 minutes across Lagos,
              Abuja, and port Harcourt. Authenticity guaranteed, effortless
              ordering.
            </p>

            <div className="flex items-center gap-3">
              <ul className="flex gap-3">
                <li>
                  <button
                    type="button"
                    aria-label="Share QuickCart"
                    className={socialClasses}
                  >
                    <MdOutlineShare
                      size={16}
                      aria-hidden="true"
                      className="-translate-y-px"
                    />
                  </button>
                </li>
                <li>
                  <a
                    href="mailto:help@quickcart.ng"
                    aria-label="Email our help desk"
                    className={socialClasses}
                  >
                    <MdOutlineChat
                      size={16}
                      aria-hidden="true"
                      className="-translate-y-px"
                    />
                  </a>
                </li>
                <li>
                  <Link
                    to="/about"
                    aria-label="About QuickCart"
                    className={socialClasses}
                  >
                    <MdPublic
                      size={16}
                      aria-hidden="true"
                      className="-translate-y-px"
                    />
                  </Link>
                </li>
              </ul>
              <p role="status" className="text-xs text-white/70 empty:hidden">
                ...
              </p>
            </div>
          </section>

          {footerColums.map((column) => {
            return (
              <nav key={column.title} aria-label={column.title}>
                <h2 className="mb-3.5 text-xs leading-4 font-bold tracking-wide uppercase">
                  {column.title}
                </h2>
                <ul className="flex flex-col gap-2.5">
                  {column.links.map((link) => {
                    return (
                      <li key={link.label} className="flex items-center gap-1">
                        <Link
                          to={link.to}
                          className="text-[13px] leading-4.5 text-white/70 transition-colors hover:text-white"
                        >
                          {link.label}
                        </Link>

                        {link.badge && (
                          <span className="rounded-full bg-success px-2 text-[10px] leading-4 font-medium text-white">
                            {link.badge}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            );
          })}
        </div>

        {/* Bottom bar: payment methods, country and copyright */}
        <div className="mt-10 flex flex-col gap-4 border-t border-white/5 pt-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <p className="mr-1 text-xs leading-4 font-semibold text-white/80">
              Secure Payments:
            </p>

            <ul className="flex flex-wrap gap-2">
              {paymentMethods.map((method) => {
                return (
                  <li
                    key={method}
                    className="rounded-md bg-white/10 px-2.5 pt-0.75 pb-1.25 font-mono text-[11px] leading-4 text-white"
                  >
                    {method}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <p className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs leading-4 font-semibold">
              <span
                className="size-2 rounded-full bg-[#34d399]"
                aria-hidden="true"
              ></span>
              Nigeria (NGN ₦)
            </p>

            <p className="text-xs leading-4 text-white/70">
              © {currentYear} QuickCart. Powered by Techstudio Academy. All
              rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
