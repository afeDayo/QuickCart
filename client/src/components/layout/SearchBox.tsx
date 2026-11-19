// SearchBox.tsx client/src/components/layout/SearchBox.tsx
// The Navbar's "Search products, brands and categories..." box. Pressing Enter opens the Shop page with the search:
// "aura" -> /shop?search=aura (the server searches names, brands and tags, server STEP 16).

// STEP 34 (part 4): The Navbar search

import { useState, type FormEvent } from "react";
import { MdSearch } from "react-icons/md";
import { useNavigate } from "react-router-dom";

// wide: the full-width box under the header on phones and tablets (the normal box only shows on large screens)
const SearchBox = ({ wide = false }: { wide?: boolean }) => {
  const navigate = useNavigate();
  const id = wide ? "header-search-mobile" : "header-search"; // two boxes on one page need different ids
  const [text, setText] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const search = text.trim();
    // encodeURIComponent: "socks & shoes" -> "socks%20%26%20shoes", safe inside an address
    navigate(search ? `/shop?search=${encodeURIComponent(search)}` : "/shop");
    setText("");
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={wide ? "relative w-full" : "relative hidden lg:block"}
    >
      <label htmlFor={id} className="sr-only">
        Search products, brands and categories
      </label>
      <MdSearch
        size={21}
        aria-hidden="true"
        className="pointer-events-none absolute top-3 left-3.25 text-muted"
      />
      <input
        id={id}
        name="search"
        type="search"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={wide ? "Search products and brands..." : "Search products, brands and categories..."}
        // 16px text on phones: a smaller font makes iPhones zoom in when the box is tapped
        className={`h-12 rounded-full bg-field pr-4 pl-11.75 text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/30 ${wide ? "w-full text-base" : "w-83 text-[13px]"}`}
      />
    </form>
  );
};

export default SearchBox;
