// SearchBox.tsx client/src/components/layout/SearchBox.tsx
// The Navbar's "Search products, brands and categories..." box. Pressing Enter opens the Shop page with the search:
// "aura" -> /shop?search=aura (the server searches names, brands and tags, server STEP 16).

// STEP 34 (part 4): The Navbar search

import { useState, type FormEvent } from "react";
import { MdSearch } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const SearchBox = () => {
  const navigate = useNavigate();
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
      className="relative hidden lg:block"
    >
      <label htmlFor="header-search" className="sr-only">
        Search products, brands and categories
      </label>
      <MdSearch
        size={21}
        aria-hidden="true"
        className="pointer-events-none absolute top-3 left-3.25 text-muted"
      />
      <input
        id="header-search"
        name="search"
        type="search"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Search products, brands and categories..."
        className="h-12 w-83 rounded-full bg-field pr-4 pl-11.75 text-[13px] text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/30"
      />
    </form>
  );
};

export default SearchBox;
