import { MdOutlineLocalShipping } from "react-icons/md";
import { Link } from "react-router-dom";
import heroImg from "../../assets/images/Curated lifestyle essentials.png";

// The three quick facts under the buttons
const stats = [
  { value: "30-min", label: "Express dispatch" },
  { value: "100%", label: "Genuine items" },
  { value: "4.9/5", label: "Customer rating" },
];

const HeroSection = () => {
  return (
    <section
      aria-labelledby="hero-title"
      className="grid grid-cols-1 items-center gap-6 lg:min-h-108.75 lg:grid-cols-2"
    >
      <div>
        <p className="mb-4 flex h-6 w-fit items-center gap-1 rounded-full bg-mint pr-3 pl-2.75 text-[13px] leading-4 font-semibold text-forest">
          <MdOutlineLocalShipping size={17} aria-hidden="true" />
          Free shipping over ₦50,000
        </p>

        <h1
          id="hero-title"
          className="mb-4 text-5xl leading-[1.12] font-extrabold tracking-tight text-ink"
        >
          Everyday essentials, <br /> delivered fast.
        </h1>

        <p className="mb-6 max-w-141 text-base leading-6.5 text-ink-soft">
          Quality electronics, fashion &amp; home goods at prices you'll love —
          with a checkout that takes seconds.
        </p>

        <div className="flex flex-wrap gap-4">
          <Link
            to="/shop"
            className="inline-flex h-12 items-center rounded-xl bg-primary-hover px-7 text-[15px] font-semibold text-white shadow-[0_4px_12px_rgba(77,74,232,0.25)] transition-colors hover:bg-primary"
          >
            Shop now
          </Link>
          <Link
            to="/categories"
            className="inline-flex h-12 items-center rounded-xl bg-surface px-6 text-[15px] font-semibold text-ink shadow-card transition-colors hover:bg-field"
          >
            Browse categories
          </Link>
        </div>

        <ul className="mt-10 flex items-center gap-6 pt-4">
          {stats.map((stat, index) => {
            return (
              <li key={stat.label} className="flex items-center gap-6">
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-info-light"
                  />
                )}

                <span aria-hidden="true" className="flex flex-col">
                  <strong className="text-lg leading-6 font-extrabold text-ink">
                    {stat.value}
                  </strong>
                  <span className="text-[13px] leading-4.5 text-subtle">
                    {stat.label}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Right: main image on a soft background */}
      <div className="relative overflow-hidden rounded-4xl bg-field p-4 lg:-my-7.5 lg:h-123.75">
        <div
          aria-hidden="true"
          className="absolute -top-12 left-113 size-64 rounded-full bg-primary/5 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute top-71.75 -left-12 size-64 rounded-full bg-mint/40 blur-3xl"
        />
        <div className="relative">
          <img
            src={heroImg}
            alt=""
            className="h-auto w-full rounded-3xl object-cover lg:h-115.75"
          />

          <p className="absolute bottom-4 left-4 flex h-8 items-center gap-2 rounded-full bg-surface pr-3.5 pl-3.5 text-[13px] leading-4 font-semibold text-ink shadow-card">
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full bg-success"
            />{" "}
            Over 1,200 essentials in stock
          </p>
        </div>
        qa
      </div>
    </section>
  );
};

export default HeroSection;
