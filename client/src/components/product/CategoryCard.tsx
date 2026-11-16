// CategoryCard.tsx client/src/components/product/CategoryCard.tsx
// A big department card for the Categories page: icon, name, number of products, "Shop now".

// STEP 34 (part 6): The category card

import { MdArrowForward } from "react-icons/md";
import { Link } from "react-router-dom";
import type { Category } from "../../types/api";
import { categoryIcons, DefaultCategoryIcon } from "../../utils/categoryIcons";
import { plural } from "../../utils/format";

const CategoryCard = ({ category }: { category: Category }) => {
  const Icon = categoryIcons[category.icon] ?? DefaultCategoryIcon;

  return (
    <Link
      to={`/shop?category=${category.slug}`}
      className="group flex h-full flex-col rounded-3xl bg-surface p-6 shadow-card transition-shadow hover:shadow-lift"
    >
      <span className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary-light text-primary transition-colors group-hover:bg-primary group-hover:text-white">
        <Icon size={32} aria-hidden="true" />
      </span>
      <h2 className="text-xl leading-7 font-bold text-ink">{category.name}</h2>
      <p className="mt-1 text-sm text-muted">
        {plural(category.productCount, "product")}
      </p>
      <span className="mt-6 flex items-center gap-1 text-sm font-semibold text-primary-hover">
        Shop now{" "}
        <MdArrowForward
          size={16}
          aria-hidden="true"
          className="transition-transform group-hover:translate-x-1"
        />
      </span>
    </Link>
  );
};

export default CategoryCard;
