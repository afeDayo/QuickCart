// NotFoundPage.tsx client/src/pages/NotFoundPage.tsx
// "Page not found": any address that matches no route (App.tsx's path="*"). It shows inside the shop layout, or
// inside the admin layout for /admin/... addresses, with the right links for each.

// STEP 45 (part 3): The 404 page

import { MdArrowBack, MdSearchOff } from "react-icons/md";
import { Link, useLocation, useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const inAdmin = pathname.startsWith("/admin");

  return (
    <section
      className={`mx-auto flex max-w-lg flex-col items-center px-4 text-center ${inAdmin ? "py-12" : "py-20"}`}
    >
      <span className="flex size-20 items-center justify-center rounded-full bg-primary-light text-primary">
        <MdSearchOff size={40} aria-hidden="true" />
      </span>
      <p className="mt-6 text-sm font-bold tracking-wider text-primary uppercase">
        Error 404
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">
        Page not found
      </h1>
      <p className="mt-3 text-ink-soft">
        We couldn't find{" "}
        <code className="rounded bg-field px-1.5 py-0.5 text-sm break-all">
          {pathname}
        </code>
        . The link may be old, or the address may have a typo.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-12 items-center gap-2 rounded-xl px-5 font-semibold text-ink hover:bg-field"
        >
          <MdArrowBack size={20} aria-hidden="true" /> Go back
        </button>
        {inAdmin ? (
          <Link
            to="/admin"
            className="flex h-12 items-center rounded-xl bg-primary-hover px-6 font-semibold text-white hover:bg-primary"
          >
            Back to the dashboard
          </Link>
        ) : (
          <>
            <Link
              to="/shop"
              className="flex h-12 items-center rounded-xl bg-primary-hover px-6 font-semibold text-white hover:bg-primary"
            >
              Browse the shop
            </Link>
            <Link
              to="/"
              className="flex h-12 items-center rounded-xl px-5 font-semibold text-primary hover:bg-primary-light"
            >
              Home
            </Link>
          </>
        )}
      </div>
    </section>
  );
};

export default NotFoundPage;
