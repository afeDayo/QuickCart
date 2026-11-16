# QuickCart Client: Step-by-Step Guide

The server is finished (`server/GUIDE.md`, STEPs 1–29). This guide continues the **same numbering** and
builds the website (`client/`) until the whole store works with the real server, page by page, like the
designs in `ui/`.

> Same rules as the server guide:
>
> - **Type the code yourself, don't paste it.**
> - After each step: `npm run build` (inside `client/`) must pass, then do the step's checks in the browser.
> - Commit after every step. **Run git from the `client` folder** (`git add .` there only adds client files).
> - When a step works, reply **NEXT** and the next step is added at the bottom of this file.

## What you already have (I read every file)

You've done the foundation well, so we keep all of it:

| File                                   | What it does                                                               |
| -------------------------------------- | -------------------------------------------------------------------------- |
| `vite.config.ts`, `index.css`          | Vite + React + Tailwind v4, with your design colours (`bg-primary`, `text-ink`, `bg-field`...), shadows and animations in `@theme` |
| `index.html`                           | the Plus Jakarta Sans font                                                 |
| `App.tsx`                              | every page's route, the 3 layouts (store, account, admin) and the 404      |
| `layouts/MainLayout.tsx`               | Navbar + page + Footer                                                     |
| `components/layout/Navbar.tsx`         | logo, Home / Shop / Categories, search box, cart and profile buttons       |
| `components/layout/Footer.tsx`         | the dark footer with its 3 link columns and payment badges                 |
| `components/home/HeroSection.tsx`, `TrustBar.tsx` | the top of the Home page, like the design                      |
| `components/common/SectionHeader.tsx`  | the "EYEBROW + Title" header every Home section uses                        |
| `utils/categoryIcons.ts`               | turns the server's icon names (`"devices"`) into icons                       |

Everything else (about 120 files: pages, cards, forms, admin...) is a 5-line placeholder that shows its own
name. The steps below fill them in, **in the order that makes each one testable**: first the connection to
the server, then logging in and the cart (almost every page needs them), then the pages a shopper visits,
then the admin.

## Progress

| Done | Step   | What                                                                                |
| ---- | ------ | ----------------------------------------------------------------------------------- |
| ⬜   | **30** | **Connect the client to the server: real categories on the Home page** ← you are here |
| ⬜   | 31     | Logged-in user: AuthContext, Login and Register pages, protected routes             |
| ⬜   | 32     | The cart: CartContext (saved in the browser), cart count, toasts                    |
| ⬜   | 33     | Product cards and the Home page sections                                            |
| ⬜   | 34     | Shop page (filters, search, sort, pages) and Categories page                        |
| ⬜   | 35     | Product Details: gallery, colours, add to cart, save, tabs, reviews, bundle, related |
| ⬜   | 36     | Cart page: items, promo code, summary, empty state                                  |
| ⬜   | 37     | Forgot password, reset password, verify email                                       |
| ⬜   | 38     | Checkout and Order Confirmation                                                     |
| ⬜   | 39     | My Account: layout, overview, settings, addresses, saved items                       |
| ⬜   | 40     | Order History, Order Details and tracking, cancel, leave a review                    |
| ⬜   | 41     | Admin: login, layout, dashboard with the sales chart                                 |
| ⬜   | 42     | Admin: products table, add / edit product, photo upload                              |
| ⬜   | 43     | Admin: orders, customers, categories, settings                                       |
| ⬜   | 44     | Demo panel, help pages, 404, final polish (loading, empty and error states, phones)  |
| ⬜   | 45     | Build and put it online (server on Render, client on Vercel)                         |

## How to run both halves

You need **two terminals** open at the same time:

```bash
# Terminal 1: the server (leave it running)
cd ~/Desktop/QuickCarrt/server
npm run dev          # http://localhost:5000/api

# Terminal 2: the website (leave it running)
cd ~/Desktop/QuickCarrt/client
npm run dev          # http://localhost:5173
```

The server already allows the website to call it: `CLIENT_URL=http://localhost:5173` in `server/.env`
(the `cors(...)` line in `server/src/app.ts`, STEP 3).

---

## STEP 30: Connect the client to the server

Right now the Home page's "Shop by category" row is one hard-coded "Electronics 340+ items" card. By the end
of this step it shows the **8 real categories from your database** with their icons and real product counts,
a loading state, and a friendly error with a **Try again** button when the server is off.

More importantly, you build the 3 pieces **every later step uses**:

| File                  | What it is                                                                  |
| --------------------- | --------------------------------------------------------------------------- |
| `src/types/api.ts`    | the shapes of the server's replies, so TypeScript knows `category.name` exists |
| `src/utils/api.ts`    | `api()`: the ONE function that talks to the server (address, JSON, token, errors) |
| `src/hooks/useApi.ts` | `useApi()`: load data when a component appears, with `loading` and `error`   |

It's the same idea as Postman: `api("/categories")` is the website writing the letter you wrote by hand
in `server/postman/README.md`.

### 30.1 Small tidy-ups first

These were noted while building the server (29.7), plus 2 more. All are one-line changes:

| File                                   | Change                                                       | Why |
| -------------------------------------- | ------------------------------------------------------------ | --- |
| `index.html`                           | `<title>client</title>` → `<title>QuickCart | Everyday essentials, delivered fast</title>` | the browser tab says "client" |
| `src/components/home/HeroSection.tsx`  | delete the line that only says `qa` (just above the last two `</div>`s) | a typo: "qa" shows under the hero picture |
| `src/components/layout/Footer.tsx`     | `/shop?category=living` → `/shop?category=home-living`       | the slug is `home-living` (server STEP 10) |
| `src/utils/categoryIcons.ts`           | `Sports: "Fitness_center"` → `Sports: "fitness_center"`      | icon names are lowercase; with the capital F, `getCategoryIconByName("Sports")` (used for order items later) gets the general icon |
| `src/App.tsx`                          | `path="Products/new"` → `path="products/new"`                | the other admin paths are lowercase |

### 30.2 Tell the website where the server is: `client/.env`

New file in `client/` (next to `package.json`):

```
VITE_API_URL=http://localhost:5000/api
```

- Vite only gives the website settings that start with **`VITE_`**. That's on purpose: everything in the
  website can be read by anyone who opens it, so secrets must never go here (they stay in `server/.env`).
- Once it's online, this becomes your real API address (STEP 45), and no code changes.
- **Restart `npm run dev` after creating or changing `.env`.** Vite only reads it when it starts.

Add `.env` to `client/.gitignore`, under `*.local`:

```
.env
```

And make `client/.env.example` (this one **is** committed, so others know what to fill in):

```
VITE_API_URL=http://localhost:5000/api
```

### 30.3 `src/types/api.ts`

New file (make the `types` folder).

```ts
// api.ts client/src/types/api.ts
// The shapes of what the server sends back, so TypeScript knows "category.name" exists.
// They copy the server's models (server/src/models). Later steps add Product, User, Order...

// STEP 30 (part 1): Types for the server's replies

// GET /api/categories -> { categories: Category[] }   (server: categoryController.ts)
export type Category = {
  _id: string;
  name: string; // "Home & Living"
  slug: string; // "home-living", used in links: /shop?category=home-living
  icon: string; // a Material icon name, e.g. "chair" (utils/categoryIcons.ts turns it into an icon)
  productCount: number; // how many products shoppers can see in it
};

export type CategoriesResponse = { categories: Category[] };
```

You'll add more types here in each step (Product in STEP 33, User in STEP 31...). Keeping them in one file
means every page agrees on what a "product" looks like.

### 30.4 `src/utils/api.ts`

New file.

```ts
// api.ts client/src/utils/api.ts
// The ONE function every page uses to talk to the server:
//   const { categories } = await api<CategoriesResponse>("/categories");
//   await api("/auth/login", { method: "POST", body: { email, password } });
// It adds the server address, sends JSON, adds the login token, and turns the server's
// { "message": "..." } errors into a real JavaScript error you can show on the page.

// STEP 30 (part 2): Talk to the server

// "http://localhost:5000/api" while developing (from client/.env), your real API address once it's online
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

// Where the login token is kept in the browser (STEP 31 saves it here when you log in)
export const TOKEN_KEY = "quickcart_token";

// An error from the server, with its status code, e.g. new ApiError(404, "Product not found")
export class ApiError extends Error {
  status: number; // 0 = the server couldn't be reached at all

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown; // an object (sent as JSON) or FormData (photo uploads, STEP 46)
  signal?: AbortSignal; // lets a page cancel a request it no longer needs (see useApi.ts)
};

export const api = async <T>(path: string, { method = "GET", body, signal }: ApiOptions = {}): Promise<T> => {
  const isForm = body instanceof FormData;
  const headers: Record<string, string> = {};

  // Logged in? Show the token on every request, like the Bearer Token tab in Postman
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // JSON bodies need this header. FormData must NOT have it: the browser writes its own.
  if (body !== undefined && !isForm) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(API_URL + path, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    // fetch only throws when there's no answer at all: the server is off, or there's no internet.
    // (A cancelled request is not a real error: let the page ignore it.)
    if ((error as Error).name === "AbortError") {
      throw error;
    }
    throw new ApiError(0, "Can't reach QuickCart right now. Check your connection and try again.");
  }

  // Every QuickCart reply is JSON. ".catch" covers an empty or broken reply.
  const data = await response.json().catch(() => ({}));

  // 400, 401, 404, 500...: the server's own message, e.g. "Incorrect email or password."
  if (!response.ok) {
    throw new ApiError(response.status, data.message ?? "Something went wrong. Please try again.");
  }

  return data as T;
};
```

**Things worth understanding:**

- **`api<T>(...)`**: the `<T>` lets each caller say what comes back. `api<CategoriesResponse>("/categories")`
  gives you `{ categories: Category[] }`, so `data.categories[0].name` is checked by TypeScript.
- **`fetch` doesn't throw on 400 or 404.** It only throws when there's no answer at all. That's why we check
  `response.ok` ourselves and throw an `ApiError` with the **server's own message** ("Incorrect email or
  password.", "Product not found"...). Your pages just show `error.message`.
- **The token** is read from `localStorage` on every request. Nothing saves it yet: STEP 31 does that when
  you log in. After that, every request is "logged in" automatically, exactly like setting Bearer Token in
  Postman.
- **`class ApiError`** keeps the status too, so a page can react differently to `401` (send to login) and
  `404` (show "not found").

### 30.5 `src/hooks/useApi.ts`

New file (make the `hooks` folder).

```ts
// useApi.ts client/src/hooks/useApi.ts
// Load something from the server when a component appears, and keep track of loading and errors:
//   const { data, loading, error, reload } = useApi<CategoriesResponse>("/categories");
// When the path changes (e.g. the Shop page's filters), it loads again by itself.

// STEP 30 (part 3): A hook for loading data

import { useEffect, useState } from "react";
import { api } from "../utils/api";

// The last answer, labelled with WHICH request it answers ("/categories#0")
type Result<T> = { key: string; data?: T; error?: string };

// path = null means "don't load anything yet" (e.g. a product page waiting for its id)
export const useApi = <T>(path: string | null) => {
  const [reloadCount, setReloadCount] = useState(0); // the "Try again" button adds 1, which loads again
  const [result, setResult] = useState<Result<T> | null>(null);

  // A label for the request we want right now. A new path or a reload = a new label = load again.
  const key = path === null ? null : `${path}#${reloadCount}`;

  useEffect(() => {
    if (path === null || key === null) {
      return;
    }

    // If the component disappears, or the path changes before the answer arrives, cancel this request.
    // Otherwise a slow old answer could arrive last and replace the new one.
    const controller = new AbortController();

    api<T>(path, { signal: controller.signal })
      .then((data) => {
        setResult({ key, data });
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") {
          setResult({ key, error: err.message });
        }
      });

    // React calls this "clean-up" function before the next load and when the component disappears
    return () => {
      controller.abort();
    };
  }, [path, key]);

  // Still loading = the answer we have isn't for the request we want yet.
  // (Nothing is stored for "loading": it's worked out from what we have, so it can never be out of date.)
  const loading = key !== null && result?.key !== key;

  return {
    data: result?.data ?? null, // while a NEW request loads, the previous data stays on screen
    error: !loading ? (result?.error ?? null) : null,
    loading,
    reload: () => {
      setReloadCount((count) => count + 1);
    },
  };
};
```

**Things worth understanding:**

- **A hook** is a function starting with `use` that can use React's state. Any component can call
  `useApi("/categories")` and get `{ data, loading, error, reload }`. Without it, every page would repeat the
  same `useState` + `useEffect` + `try/catch`.
- **`AbortController`** cancels a request that's no longer wanted. On the Shop page (STEP 34), clicking
  "Electronics" then quickly "Fashion" starts 2 requests. If the Electronics answer arrives last, you'd see
  electronics under the Fashion filter. Cancelling the old one prevents that.
- **`key` and `loading` worked out, not stored:** each answer is saved with the label of the request it
  answers. If the label isn't the one we want now, we're still loading. That's why there's no
  `setLoading(true)` inside the effect, which React's linter warns about (it causes an extra render).
- **The previous data stays on screen while the next request loads**, so the Shop page doesn't flash empty
  each time you change a filter.
- In development, React's `<StrictMode>` (in `main.tsx`) runs effects **twice** on purpose, to catch bugs.
  In the Network tab you'll see the first `/categories` request "cancelled": that's the clean-up working.

### 30.6 `src/components/home/CategoryGrid.tsx`

Replace the whole file.

```tsx
// CategoryGrid client/src/components/home/CategoryGrid.tsx
// The Home page's "Shop by category" row: the 8 departments from the server, each with its icon and
// number of products. Clicking one opens the Shop page filtered to it.

// STEP 30 (part 4): The first component that uses real data

import { Link } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import type { CategoriesResponse } from "../../types/api";
import { categoryIcons, DefaultCategoryIcon } from "../../utils/categoryIcons";
import SectionHeader from "../common/SectionHeader";

const CategoryGrid = () => {
  const { data, error, loading, reload } = useApi<CategoriesResponse>("/categories");
  const categories = data?.categories ?? [];

  return (
    <section aria-labelledby="category-title">
      <SectionHeader eyebrow="Explore departments" title="Shop by category" titleId="category-title">
        {categories.length > 0 && (
          <p className="text-[13px] leading-4 font-semibold text-subtle">{categories.length} curated departments</p>
        )}
      </SectionHeader>

      {/* 3 possible states: an error, loading (grey boxes), or the categories */}
      {error ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-danger-light p-4 text-sm text-danger"
        >
          <p>{error}</p>
          <button type="button" onClick={reload} className="font-semibold underline">
            Try again
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {loading
            ? // 8 grey boxes the same size as the cards, so the page doesn't jump when they arrive
              Array.from({ length: 8 }, (_, index) => (
                <li key={index} aria-hidden="true" className="h-35 animate-pulse rounded-2xl bg-surface shadow-card" />
              ))
            : categories.map((category) => {
                // "devices" -> the devices icon (a name we don't know -> a general icon)
                const Icon = categoryIcons[category.icon] ?? DefaultCategoryIcon;

                return (
                  <li key={category._id}>
                    <Link
                      to={`/shop?category=${category.slug}`}
                      className="group flex flex-col items-center rounded-2xl bg-surface px-2 pt-4 pb-4 shadow-card transition-shadow hover:shadow-md"
                    >
                      <span className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary-light text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                        <Icon size={26} aria-hidden="true" />
                      </span>
                      <span className="text-center text-[13px] leading-4 font-medium text-ink">{category.name}</span>
                      <span className="mt-0.5 text-[11px] leading-4.25 font-medium text-subtle">
                        {category.productCount} {category.productCount === 1 ? "item" : "items"}
                      </span>
                    </Link>
                  </li>
                );
              })}
        </ul>
      )}
    </section>
  );
};

export default CategoryGrid;
```

- **`categoryIcons[category.icon] ?? DefaultCategoryIcon`:** a capitalised variable (`Icon`) holding a
  component can be used as a tag: `<Icon size={26} />`. A new category with an icon we don't know (e.g.
  "toys", from the admin in STEP 43) still gets a general icon instead of crashing.
- **3 states:** an error, the loading boxes, or the real cards. Every page that loads data has these 3, and
  the design for each "empty" or "error" moment comes from the same pattern.
- **The design says "340+ items"**: those were made-up numbers. We show the real count from the server
  (Electronics: 15).
- **`group` / `group-hover:`** (Tailwind): hovering the card turns its icon tile blue.

### 30.7 Test it

```bash
# Terminal 1
cd ~/Desktop/QuickCarrt/server && npm run dev
# Terminal 2
cd ~/Desktop/QuickCarrt/client && npm run dev
```

Open **http://localhost:5173**:

1. "Shop by category" shows 8 cards: **Electronics 15 items, Fashion 6, Home & Living 3, Beauty 2, Sports 4,
   Books 2, Office 3, Kitchen 5**, each with its icon. "8 curated departments" on the right. (These are the
   counts after `npm run seed`.)
2. Every card has its own icon (devices, hanger, sofa, lotus, dumbbell, book, desk, soup pot).
3. Click **Electronics**: the address becomes `/shop?category=electronics` (the Shop page is still a
   placeholder; STEP 34 builds it).
4. **Open DevTools** (F12) → **Network** tab → reload. Click the `categories` request: Headers shows
   `http://localhost:5000/api/categories`, Response shows the JSON. That's the same request as in Postman.
5. **Stop the server** (Ctrl+C in Terminal 1) and reload: the row shows *"Can't reach QuickCart right now.
   Check your connection and try again."* Start the server again and click **Try again**: the cards come
   back without reloading the page.
6. The tab title says "QuickCart | Everyday essentials, delivered fast", and "qa" is gone under the hero
   picture.
7. `npm run build` passes.

**If the cards don't appear:** check DevTools → Console.

| Console says                                   | Fix                                                        |
| ---------------------------------------------- | ---------------------------------------------------------- |
| `blocked by CORS policy`                       | `CLIENT_URL` in `server/.env` must be exactly `http://localhost:5173`; restart the server |
| `GET http://localhost:5000/categories 404`     | `/api` is missing from `VITE_API_URL`                       |
| `undefined/categories`                         | `.env` isn't in `client/`, or you didn't restart `npm run dev` |

I tested this on a copy of your project: `npm run build` and the linter (`npm run lint`) passed, and in a
real browser the 8 categories appeared with the counts above. With the server stopped, the error and **Try
again** appeared exactly as described.

### 30.8 Commit

```bash
cd ~/Desktop/QuickCarrt/client
git add .
git commit -m "STEP 30: connect the client to the server, real categories"
git push
```

Check that `git status` doesn't list `.env` before you commit (`.env.example` should be listed).

➡️ **Next: STEP 31 (Logged-in user: an AuthContext that remembers who's logged in, the Login and Register
pages from the designs, and routes only logged-in users or admins can open).** Reply **NEXT** when 30.7
works.
