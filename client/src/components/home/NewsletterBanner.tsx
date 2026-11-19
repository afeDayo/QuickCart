// NewsletterBanner.tsx client/src/components/home/NewsletterBanner.tsx
// "JOIN QUICKCART CLUB": the email box at the bottom of the Home page. It uses your newsletter endpoint
// (POST /api/newsletter/subscribe, server STEP 24), which emails a welcome gift: the QUICK10 code.

// STEP 33 (part 11): The newsletter box

import { useState, type FormEvent } from "react";
import { MdCheckCircle, MdOutlineMail } from "react-icons/md";
import { api } from "../../utils/api";

const NewsletterBanner = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    try {
      // The server checks the email and answers with the message to show, e.g.
      // "Thanks for subscribing! Check your inbox for a welcome gift." or "You're already subscribed..."
      const reply = await api<{ message: string }>("/newsletter/subscribe", {
        method: "POST",
        body: { email },
      });
      setMessage(reply.message);
      setStatus("done");
      setEmail("");
    } catch (error) {
      setMessage((error as Error).message); // e.g. "Please enter a valid email address."
      setStatus("error");
    }
  };

  return (
    <section
      aria-labelledby="newsletter-title"
      className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-center text-white shadow-banner"
    >
      <div
        aria-hidden="true"
        className="absolute -bottom-24 -left-24 size-80 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -top-24 -right-24 size-80 rounded-full bg-[#4f7bd9]/40 blur-3xl"
      />

      <div className="relative">
        <p className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold tracking-wide uppercase">
          <MdOutlineMail size={18} aria-hidden="true" className="text-mint" />{" "}
          Join QuickCart Club
        </p>
        <h2
          id="newsletter-title"
          className="text-3xl leading-10 font-bold tracking-tight md:text-4xl"
        >
          Get 10% Off Your Next Order
        </h2>
        <p className="mx-auto mt-2 max-w-140 text-base leading-6 text-white/80">
          Subscribe to QuickCart VIP Drops for flash deals, members-only secret
          drops, and a welcome code in your inbox.
        </p>

        {status === "done" ? (
          <p
            role="status"
            className="mx-auto mt-8 flex w-fit items-center gap-2 rounded-xl bg-white/15 px-5 py-3 font-medium"
          >
            <MdCheckCircle size={22} aria-hidden="true" className="text-mint" />{" "}
            {message}
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="mx-auto mt-8 flex max-w-115 flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={status === "error" ? true : undefined}
              aria-describedby={
                status === "error" ? "newsletter-error" : undefined
              }
              // max-sm:flex-none: on phones the form is a column, and flex-1 would squash the box's height
              className="h-13 flex-1 rounded-xl bg-white px-4 text-ink outline-none placeholder:text-muted focus:ring-4 focus:ring-white/30 max-sm:flex-none"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="h-13 rounded-xl bg-navy px-7 font-semibold text-white transition-colors hover:bg-footer disabled:opacity-60"
            >
              {status === "sending" ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
        )}

        {status === "error" && (
          <p
            id="newsletter-error"
            role="alert"
            className="mt-3 text-sm font-medium text-[#ffdad6]"
          >
            {message}
          </p>
        )}
        <p className="mt-4 text-[13px] text-white/70">
          No spam ever. Unsubscribe with 1 click at any time.
        </p>
      </div>
    </section>
  );
};

export default NewsletterBanner;
