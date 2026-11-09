import {
  MdOutlineBolt,
  MdOutlineLocalShipping,
  MdOutlineSupportAgent,
  MdOutlineVerifiedUser,
} from "react-icons/md";

const trustItems = [
  {
    title: "Free Delivery",
    text: "Orders above ₦50,000",
    icon: MdOutlineLocalShipping,
    tile: "bg-primary-light text-primary",
  },
  {
    title: "24/7 Surpport",
    text: "Dedicated helpdeck",
    icon: MdOutlineSupportAgent,
    tile: "bg-mint text-forest",
  },
  {
    title: "Buyer Protection",
    text: "100% money back guarantee",
    icon: MdOutlineVerifiedUser,
    tile: "bg-[#dae2fc] text-[#131b2e]",
  },
  {
    title: "Instant 30-Min",
    text: "Rapid city dispatch",
    icon: MdOutlineBolt,
    tile: "bg-[#e6e6ff] text-primary",
  },
];

const TrustBar = () => {
  return (
    <section aria-labelledby="trust-title">
      <h2 id="trust-title" className="sr-only">
        Why shop with QuickCart
      </h2>

      <ul className="grid grid-cols-1 gap-4 rounded-2xl border border-line bg-surface p-6 shadow-card sm:grid-cols-2 lg:grid-cols-4">
        {trustItems.map((item) => {
          return (
            <li key={item.title} className="flex items-center gap-4">
              <span
                className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${item.tile}`}
              >
                <item.icon size={24} aria-hidden="true" />
              </span>

              <div>
                <h3 className="text-[15px] leading-5 font-semibold text-ink">
                  {item.title}
                </h3>

                <p className="text-[13px] leading-4.5 text-subtle">
                  {item.text}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default TrustBar;
