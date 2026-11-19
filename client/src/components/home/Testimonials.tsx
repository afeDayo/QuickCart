// Testimonials.tsx client/src/components/home/Testimonials.tsx
// "Loved by over 25,000 shoppers across Nigeria": 3 customer quotes. They're written into the page (marketing text),
// unlike product reviews, which come from real customers through the server (STEP 35).

// STEP 33 (part 10): Testimonials

import { MdOutlineVerified, MdStar } from "react-icons/md";

const testimonials = [
  {
    quote:
      "Ordered the noise-cancelling headphones around noon in Ikeja and they reached my doorstep under 35 minutes! Genuine gear and ultra clean packaging.",
    name: "Amina Bello",
    city: "Lagos",
  },
  {
    quote:
      "The fastest checkout experience in Nigeria right now. No unnecessary steps or glitches, and customer support answered my inquiry via WhatsApp in 2 minutes.",
    name: "Chinedu Okafor",
    city: "Abuja",
  },
  {
    quote:
      "Was hesitant about online skincare until I received 100% authentic serums with verified batch numbers. QuickCart has completely won over my weekly shopping.",
    name: "Tolu Adeleke",
    city: "Port Harcourt",
  },
];

// "Amina Bello" -> "AB" (we have no photos of these customers, so their initials go in the circle)
const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("");

const Testimonials = () => {
  return (
    <section aria-labelledby="testimonials-title" className="text-center">
      <p className="mx-auto mb-4 flex w-fit items-center gap-1.5 rounded-full bg-primary-light px-3 py-1 text-sm font-medium text-primary">
        <MdOutlineVerified size={16} aria-hidden="true" /> Verified Reviews
      </p>
      <h2
        id="testimonials-title"
        className="mx-auto max-w-150 text-3xl leading-10 font-bold tracking-tight text-ink md:text-4xl md:leading-11"
      >
        Loved by over 25,000 shoppers across Nigeria
      </h2>
      <p className="mx-auto mt-2 max-w-155 text-base leading-6 text-ink-soft">
        See what everyday customers in Lagos, Abuja, and Port Harcourt have to
        say about QuickCart.
      </p>

      <ul className="mt-8 grid gap-6 text-left md:grid-cols-3 max-md:grid-cols-1">
        {testimonials.map((item) => (
          <li key={item.name}>
            {/* <figure> + <blockquote> + <figcaption>: the HTML way to write "a quote and who said it" */}
            <figure className="flex h-full flex-col rounded-3xl bg-surface p-6 shadow-card">
              <p
                className="mb-3 flex text-warning"
                role="img"
                aria-label="5 out of 5 stars"
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <MdStar key={star} size={18} aria-hidden="true" />
                ))}
              </p>
              <blockquote className="flex-1 text-[15px] leading-6 text-ink">
                "{item.quote}"
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                <span
                  aria-hidden="true"
                  className="flex size-10 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary"
                >
                  {initials(item.name)}
                </span>
                <span>
                  <span className="block font-semibold text-ink">
                    {item.name}
                  </span>
                  <span className="text-sm text-muted">
                    {item.city} · Verified Buyer
                  </span>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Testimonials;
