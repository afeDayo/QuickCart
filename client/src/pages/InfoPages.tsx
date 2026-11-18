// InfoPages.tsx client/src/pages/InfoPages.tsx
// One page component for all the help and company pages (the text is in utils/infoPages.ts).
// App.tsx makes one route per page: <Route path={page.path} element={<InfoPage page={page} />} />

// STEP 45 (part 5): The help pages

import { MdMailOutline } from "react-icons/md";
import { Link } from "react-router-dom";
import Breadcrumb from "../components/common/Breadcrumb";
import { infoPages, type InfoPageData } from "../utils/InfoPages";

const InfoPage = ({ page }: { page: InfoPageData }) => {
  const others = infoPages.filter(
    (item) => item.group === page.group && item.path !== page.path,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <Breadcrumb items={[{ label: "Home", to: "/" }, { label: page.title }]} />

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[1fr_280px]">
        <article className="rounded-3xl bg-surface p-6 shadow-card md:p-10">
          <p className="text-sm font-bold tracking-wider text-primary uppercase">
            {page.group}
          </p>
          <h1 className="mt-1 text-4xl font-bold tracking-tight text-ink">
            {page.title}
          </h1>
          <p className="mt-3 text-lg text-ink-soft">{page.intro}</p>

          {page.sections.map((section) => (
            <section key={section.heading} className="mt-8">
              <h2 className="text-xl font-semibold text-ink">
                {section.heading}
              </h2>
              {section.paragraphs?.map((text) => (
                <p key={text} className="mt-2 leading-7 text-ink-soft">
                  {text}
                </p>
              ))}
              {section.list && (
                <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 leading-7 text-ink-soft marker:text-primary">
                  {section.list.map((text) => (
                    <li key={text}>{text}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </article>

        <aside className="flex flex-col gap-4">
          <nav
            aria-label={`More ${page.group.toLowerCase()} pages`}
            className="rounded-3xl bg-surface p-5 shadow-card"
          >
            <h2 className="mb-3 text-xs font-bold tracking-wider text-ink-soft uppercase">
              More {page.group.toLowerCase()}
            </h2>
            <ul className="flex flex-col gap-1">
              {others.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="block rounded-lg px-3 py-2 font-medium text-ink hover:bg-field hover:text-primary"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <a
            href="mailto:help@quickcart.ng"
            className="flex items-center gap-3 rounded-3xl bg-primary-light p-5 font-semibold text-primary-hover hover:underline"
          >
            <MdMailOutline size={22} aria-hidden="true" /> help@quickcart.ng
          </a>
        </aside>
      </div>
    </div>
  );
};

export default InfoPage;
