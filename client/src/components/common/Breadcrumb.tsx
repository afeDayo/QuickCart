// Breadcrumb.tsx client/src/components/common/Breadcrumb.tsx
// "Home › Electronics › Wireless Noise-Cancelling Headphones": where you are, with links back up.
//   <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Electronics", to: "/shop?category=electronics" }, { label: name }]} />
// The last item has no link: it's the page you're on.

// STEP 35 (part 3): Breadcrumb

import { MdChevronRight } from "react-icons/md";
import { Link } from "react-router-dom";

type BreadcrumbProps = { items: { label: string; to?: string }[] };

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1 text-[13px] text-muted max-sm:flex-nowrap">
        {items.map((item, index) => (
          <li
            key={item.label}
            className={`flex items-center gap-1 ${index === items.length - 1 ? "max-sm:min-w-0" : "max-sm:shrink-0"}`}
          >
            {index > 0 && <MdChevronRight size={16} aria-hidden="true" />}
            {item.to ? (
              <Link to={item.to} className="hover:text-primary">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-ink max-sm:truncate">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
