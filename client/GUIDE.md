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
| ✅   | 30     | Connect the client to the server: real categories on the Home page |
| ⬜   | **31** | **Logged-in user: AuthContext, Login and Register pages, protected routes** ← you are here |
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

---

## STEP 31: Logged-in user (login, register, protected pages)

By the end of this step:

- the **Login** and **Register** pages work like the designs, talking to `POST /api/auth/login` and
  `/register`, with friendly messages for every mistake
- the website **remembers who's logged in**, even after a refresh (the token is kept in `localStorage`, and
  `GET /api/auth/me` checks it when the site opens)
- the profile button in the Navbar shows your **initials** and a small menu (My Account, My Orders, Admin
  dashboard for admins, Log Out)
- account pages and checkout need a login, and `/admin` needs an **admin** login

| New file                                  | What it is                                                     |
| ----------------------------------------- | -------------------------------------------------------------- |
| `context/AuthContext.ts`                  | `useAuth()`: any component can ask "who's logged in?"           |
| `context/AuthProvider.tsx`                | keeps the user and token, and has `login`, `register`, `logout` |
| `components/auth/ProtectedRoute.tsx`      | sends logged-out visitors to `/login` (and shoppers away from `/admin`) |
| `components/form/TextInput.tsx`, `PasswordInput.tsx`, `Checkbox.tsx`, `PasswordStrength.tsx` | the form pieces every form uses |
| `utils/password.ts`                       | the password rules (the same 3 as the server)                   |
| `components/layout/AccountMenu.tsx`       | the profile button and its menu                                 |
| `pages/auth/LoginPage.tsx`, `RegisterPage.tsx` | the two pages                                              |

**Why a "context":** the Navbar, the checkout, the account pages and the admin all need to know who's logged
in. Passing `user` down through every component (props) would be painful. A **context** is a value the whole
app can read directly: `AuthProvider` sits around the app in `main.tsx`, and any component calls `useAuth()`.

### 31.1 Add the user types to `src/types/api.ts`

Add this at the bottom of the file (under `CategoriesResponse`):

```ts
// STEP 31: Users (server: models/User.ts)

export type Address = {
  _id: string;
  label: string; // "Home", "Office"
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  instructions?: string;
  isDefault: boolean;
};

// The logged-in user. The server never sends the password or the secret tokens (User.toJSON, server STEP 17).
export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: "customer" | "admin";
  isEmailVerified: boolean;
  addresses: Address[];
  savedItems: string[]; // product ids
  createdAt: string; // dates arrive as text in JSON: "2026-11-15T16:09:36.218Z"
};

// POST /api/auth/login and /register -> { token, user }
export type AuthResponse = { token: string; user: User };
```

### 31.2 `src/context/AuthContext.ts`

New file (make the `context` folder). It's `.ts`, not `.tsx`: there's no HTML in it.

```ts
// AuthContext.ts client/src/context/AuthContext.ts
// "Who is logged in?" for the whole website. Any component can ask:
//   const { user, login, logout } = useAuth();
// The values come from AuthProvider.tsx, which wraps the whole app in main.tsx.

// STEP 31 (part 1): The auth context

import { createContext, useContext } from "react";
import type { User } from "../types/api";

// What the register form sends (server: authController.ts -> register)
export type RegisterData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
};

export type AuthContextValue = {
  user: User | null; // null = nobody is logged in
  checking: boolean; // true while we ask the server "is my saved token still good?" when the site opens
  login: (email: string, password: string, rememberMe: boolean) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => void;
  setUser: (user: User) => void; // after the profile changes (STEP 39), show the new name everywhere
};

// null until AuthProvider gives it a value
export const AuthContext = createContext<AuthContextValue | null>(null);

// The hook every component uses. It complains loudly if AuthProvider is missing (a mistake in main.tsx),
// instead of failing later with "cannot read properties of null".
export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside <AuthProvider> (see main.tsx)");
  }
  return value;
};
```

### 31.3 `src/context/AuthProvider.tsx`

New file.

```tsx
// AuthProvider.tsx client/src/context/AuthProvider.tsx
// Remembers who is logged in, and gives login / register / logout to the whole app (through AuthContext).
// The token is kept in localStorage, so a refresh (or closing the tab) doesn't log you out.

// STEP 31 (part 2): The auth provider

import { useEffect, useState, type ReactNode } from "react";
import type { AuthResponse, User } from "../types/api";
import { api, ApiError, TOKEN_KEY } from "../utils/api";
import { AuthContext, type RegisterData } from "./AuthContext";

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Only check with the server if there IS a saved token. No token = nobody's logged in, nothing to wait for.
  const [checking, setChecking] = useState(() => localStorage.getItem(TOKEN_KEY) !== null);

  // When the website opens: is the saved token still good? Ask GET /api/auth/me (server STEP 18).
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      return;
    }

    api<{ user: User }>("/auth/me")
      .then(({ user }) => {
        setUser(user);
      })
      .catch((error) => {
        // 401 = expired, the password was changed, or the account was deleted (e.g. after a demo reset).
        // Forget the token. (Other errors, like the server being off, keep it: it may still be good.)
        if (error instanceof ApiError && error.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
        }
      })
      .finally(() => {
        setChecking(false);
      });
  }, []);

  // Save the token and the user. Used by login and register (the server logs you in straight after registering).
  const startSession = ({ token, user }: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
    return user;
  };

  const login = async (email: string, password: string, rememberMe: boolean) => {
    // Errors (e.g. 401 "Incorrect email or password.") are thrown on to the login page, which shows them
    return startSession(await api<AuthResponse>("/auth/login", { method: "POST", body: { email, password, rememberMe } }));
  };

  const register = async (data: RegisterData) => {
    return startSession(await api<AuthResponse>("/auth/register", { method: "POST", body: data }));
  };

  const logout = () => {
    // The server has nothing to delete (server STEP 18): throwing the token away IS logging out.
    // We still tell it, without waiting, in case it ever needs to know.
    api("/auth/logout", { method: "POST" }).catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, checking, login, register, logout, setUser }}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
```

**Things worth understanding:**

- **Why two files?** React's live reload (Fast Refresh) works best when a `.tsx` file only exports
  components. The context and the hook live in `AuthContext.ts`, the component in `AuthProvider.tsx`.
- **`checking`** starts `true` only if there's a saved token. Without it, a logged-in user who refreshes
  `/account` would be sent to `/login` for a split second, before `/auth/me` answers.
- **A 401 from `/auth/me` deletes the token.** That happens after a demo reset (STEP 28), a password change, or
  when the token expires. Any other error (server off) keeps it: it might still be good.
- **`login` and `register` don't catch errors.** They let them go up to the page, which shows the server's
  message. That's the `ApiError` from STEP 30 doing its job.

Wrap the app in `src/main.tsx`:

```tsx
import AuthProvider from "./context/AuthProvider";
```

```tsx
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
```

### 31.4 `src/components/auth/ProtectedRoute.tsx`

Replace the placeholder.

```tsx
// ProtectedRoute.tsx client/src/components/auth/ProtectedRoute.tsx
// Wraps the routes that need a login in App.tsx:
//   <Route element={<ProtectedRoute />}>            checkout, account...  -> must be logged in
//   <Route element={<ProtectedRoute adminOnly />}>  /admin...             -> must be an admin
// It's the website's version of the server's protect and adminOnly (server STEP 18).

// STEP 31 (part 3): Protected routes

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ adminOnly = false }: { adminOnly?: boolean }) => {
  const { user, checking } = useAuth();
  const location = useLocation();

  // Still asking the server about the saved token: wait, or we'd send a logged-in user to /login by mistake
  if (checking) {
    return (
      <div role="status" className="flex min-h-[50vh] items-center justify-center">
        <span className="size-8 animate-spin rounded-full border-3 border-primary-light border-t-primary" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Not logged in: go to the right login page, and remember where they wanted to go ("from").
  // After logging in, the login page sends them back there. "replace": Back doesn't loop to this page.
  if (!user) {
    return <Navigate to={adminOnly ? "/admin/login" : "/login"} replace state={{ from: location }} />;
  }

  // A shopper trying an admin page: back to the shop. (The server refuses them too, with 403.)
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />; // allowed: show the page inside
};

export default ProtectedRoute;
```

In `src/App.tsx`, import it:

```tsx
import ProtectedRoute from "./components/auth/ProtectedRoute";
```

Your `App.tsx` already has two empty `<Route>` groups waiting for this, with comments saying so. Give them
an `element`:

```tsx
            {/* Pages that need a login: ... */}
            <Route element={<ProtectedRoute />}>
```

```tsx
          {/* Admin pages: ... Only admins gets in. */}
          <Route element={<ProtectedRoute adminOnly />}>
```

- **A route with only an `element` and no `path`** is a "layout route": it wraps its children. Its
  `<Outlet />` is where the child page appears, so `ProtectedRoute` decides: show the page, or redirect.
- **`state={{ from: location }}`** remembers where the visitor wanted to go. The login page sends them back
  there afterwards (open `/account` logged out → log in → you're on `/account`).
- **This is for comfort, not security.** Anyone can change the website's code in their browser. The real lock
  is on the server (`protect` and `adminOnly`, STEP 18): without a valid admin token, the admin API says 403
  no matter what the website shows.

### 31.5 The form pieces

**`src/utils/password.ts`** (new file):

```ts
// password.ts client/src/utils/password.ts
// The password rules, shared by the register page (STEP 31) and the reset password page (STEP 37).
// (In its own file, not in PasswordStrength.tsx: React's live reload works best when a .tsx file only exports components.)

// STEP 31 (part 4): Password rules

// The first 3 are REQUIRED by the server (server/src/utils/password.ts). The symbol only makes it stronger.
export const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (password: string) => password.length >= 8 },
  { label: "At least one uppercase (A-Z)", test: (password: string) => /[A-Z]/.test(password) },
  { label: "At least one number (0-9)", test: (password: string) => /\d/.test(password) },
  { label: "At least one symbol (@$!%*?)", test: (password: string) => /[^A-Za-z0-9]/.test(password) },
];

// true when the password passes the server's 3 required rules
export const isPasswordValid = (password: string) => PASSWORD_RULES.slice(0, 3).every((rule) => rule.test(password));
```

**`src/components/form/TextInput.tsx`** (replace the placeholder):

```tsx
// TextInput.tsx client/src/components/form/TextInput.tsx
// A labelled input like the designs: soft blue box, optional icon on the left, green tick when valid,
// red message under it when wrong. Every form in the app uses it.
//   <TextInput label="Email Address" type="email" icon={MdOutlineMail} value={email} onChange={...} error={...} />

// STEP 31 (part 4): Form inputs

import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import type { IconType } from "react-icons";
import { MdCheckCircle } from "react-icons/md";

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string; // shown in red under the box
  icon?: IconType; // e.g. the envelope in "Email Address"
  valid?: boolean; // shows the green tick (the register design)
  labelAction?: ReactNode; // something on the right of the label, e.g. "Forgot password?"
  leading?: ReactNode; // a box before the input, e.g. "+234" for phone numbers
  trailing?: ReactNode; // something inside the box on the right, e.g. the eye button of a password
};

const TextInput = ({ label, error, icon: Icon, valid, labelAction, leading, trailing, className = "", ...inputProps }: TextInputProps) => {
  // A unique id links the label and the error message to the input (screen readers read them together)
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm leading-5 font-medium text-ink">
          {label}
        </label>
        {labelAction}
      </div>

      <div className="flex gap-2">
        {leading}

        <div className="relative flex-1">
          {Icon && (
            <Icon size={20} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
          )}

          <input
            id={id}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={`h-12 w-full rounded-xl bg-field text-[15px] text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/30 aria-invalid:bg-danger-light aria-invalid:ring-2 aria-invalid:ring-danger/40 ${
              Icon ? "pl-12" : "pl-4"
            } ${trailing || valid ? "pr-12" : "pr-4"}`}
            {...inputProps}
          />

          <div className="absolute top-1/2 right-4 flex -translate-y-1/2 items-center">
            {trailing ?? (valid && <MdCheckCircle size={20} aria-label="Looks good" className="text-success" />)}
          </div>
        </div>
      </div>

      {error && (
        <p id={errorId} className="mt-1.5 text-[13px] leading-4.5 text-danger">
          {error}
        </p>
      )}
    </div>
  );
};

export default TextInput;
```

**`src/components/form/PasswordInput.tsx`**:

```tsx
// PasswordInput.tsx client/src/components/form/PasswordInput.tsx
// A TextInput with the lock icon and the eye button that shows or hides the password.

// STEP 31 (part 4): Form inputs

import { useState } from "react";
import { MdLockOutline, MdOutlineVisibility, MdOutlineVisibilityOff } from "react-icons/md";
import TextInput, { type TextInputProps } from "./TextInput";

const PasswordInput = (props: Omit<TextInputProps, "type" | "trailing">) => {
  const [visible, setVisible] = useState(false);

  return (
    <TextInput
      icon={MdLockOutline}
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button" // type="button": a button inside a form would SUBMIT the form by default
          onClick={() => setVisible((shown) => !shown)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="text-muted transition-colors hover:text-ink"
        >
          {visible ? <MdOutlineVisibilityOff size={20} /> : <MdOutlineVisibility size={20} />}
        </button>
      }
    />
  );
};

export default PasswordInput;
```

**`src/components/form/Checkbox.tsx`**:

```tsx
// Checkbox.tsx client/src/components/form/Checkbox.tsx
// A checkbox with its text, e.g. "Remember me for 30 days" or "I agree to QuickCart's Terms of Service".
// The text can contain links (children), and clicking the text ticks the box (it's all one <label>).

// STEP 31 (part 4): Form inputs

import type { InputHTMLAttributes, ReactNode } from "react";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  children: ReactNode;
  error?: string;
};

const Checkbox = ({ children, error, className = "", ...inputProps }: CheckboxProps) => {
  return (
    <div className={className}>
      <label className="flex cursor-pointer items-start gap-3 text-sm leading-5 text-ink-soft">
        <input type="checkbox" className="mt-0.5 size-4.5 shrink-0 cursor-pointer accent-primary" {...inputProps} />
        <span>{children}</span>
      </label>
      {error && <p className="mt-1.5 text-[13px] leading-4.5 text-danger">{error}</p>}
    </div>
  );
};

export default Checkbox;
```

**`src/components/form/PasswordStrength.tsx`**:

```tsx
// PasswordStrength.tsx client/src/components/form/PasswordStrength.tsx
// The "PASSWORD STRENGTH" box under "Create password" (register design, and reset password in STEP 37):
// 4 bars, Weak / Medium / Strong, and a tick next to each rule.

// STEP 31 (part 4): Form inputs

import { MdCheckCircle, MdRadioButtonUnchecked } from "react-icons/md";
import { PASSWORD_RULES } from "../../utils/password";

// How many rules pass -> the word and colour. Tailwind needs the full class names written out (no "bg-" + colour).
const LEVELS = [
  { word: "Too weak", color: "bg-danger", text: "text-danger" }, // 0
  { word: "Weak", color: "bg-danger", text: "text-danger" }, // 1
  { word: "Medium", color: "bg-warning", text: "text-warning" }, // 2
  { word: "Medium", color: "bg-warning", text: "text-warning" }, // 3
  { word: "Strong", color: "bg-success", text: "text-success" }, // 4
];

const PasswordStrength = ({ password }: { password: string }) => {
  const passed = PASSWORD_RULES.filter((rule) => rule.test(password)).length;
  const level = LEVELS[passed];

  return (
    <div className="rounded-xl bg-panel p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] leading-4 font-bold tracking-wider text-ink-soft uppercase">Password strength</p>
        {/* aria-live: a screen reader says the new strength while you type */}
        <p aria-live="polite" className={`flex items-center gap-1 text-xs font-semibold ${level.text}`}>
          <span aria-hidden="true" className={`size-1.5 rounded-full ${level.color}`} />
          {level.word}
        </p>
      </div>

      <div aria-hidden="true" className="mb-3 grid grid-cols-4 gap-1.5">
        {PASSWORD_RULES.map((rule, index) => (
          <span key={rule.label} className={`h-1 rounded-full transition-colors ${index < passed ? level.color : "bg-line-soft"}`} />
        ))}
      </div>

      <ul className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <li key={rule.label} className={`flex items-center gap-2 text-[13px] leading-4.5 ${ok ? "text-ink" : "text-muted"}`}>
              {ok ? (
                <MdCheckCircle size={16} aria-hidden="true" className="shrink-0 text-success" />
              ) : (
                <MdRadioButtonUnchecked size={16} aria-hidden="true" className="shrink-0" />
              )}
              {rule.label}
              <span className="sr-only">{ok ? "(done)" : "(not yet)"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PasswordStrength;
```

- **`...inputProps`** passes every normal input prop (`value`, `onChange`, `type`, `autoComplete`,
  `placeholder`...) straight to the `<input>`. So `TextInput` works anywhere an `<input>` would.
- **`useId()`** makes a unique id, so clicking the label focuses the input, and a screen reader reads the
  error message with it (`aria-describedby`).
- **`aria-invalid:`** (Tailwind) styles the box red when the input has an error, with no extra state.
- **`autoComplete="current-password"` / `"new-password"`** lets password managers fill or suggest passwords.

### 31.6 `src/pages/auth/LoginPage.tsx`

Replace the placeholder.

```tsx
// LoginPage.tsx client/src/pages/auth/LoginPage.tsx
// "Welcome back": email, password, "Remember me for 30 days", Log In. (Design: Login & Validation States)

// STEP 31 (part 5): The login page

import { useState, type FormEvent } from "react";
import { MdLogin, MdOutlineHeadsetMic, MdOutlineLocalMall, MdOutlineLocalShipping, MdOutlineMail, MdOutlineVerifiedUser } from "react-icons/md";
import { Link, Navigate, useLocation, useNavigate, type Location } from "react-router-dom";
import Checkbox from "../../components/form/Checkbox";
import PasswordInput from "../../components/form/PasswordInput";
import TextInput from "../../components/form/TextInput";
import { useAuth } from "../../context/AuthContext";

const EMAIL_RULE = /^\S+@\S+\.\S+$/; // the same rule as the server's User model

// The 3 cards under the login box
const perks = [
  { title: "Swift Delivery", text: "Real-time status tracking for every parcel.", icon: MdOutlineLocalShipping },
  { title: "Buyer Guarantee", text: "Hassle-free 30-day return policy.", icon: MdOutlineVerifiedUser },
  { title: "24/7 Concierge", text: "Instant help with cart & order updates.", icon: MdOutlineHeadsetMic },
];

const LoginPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Where to go after logging in: the page ProtectedRoute sent them from, or the Home page
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already logged in (e.g. pressed Back after logging in): no need to see this page
  if (user && !submitting) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // stop the browser from reloading the page (the normal form behaviour)

    // Check what we can BEFORE asking the server: faster for the shopper, less work for the server
    const found: typeof errors = {};
    if (!EMAIL_RULE.test(email.trim())) found.email = "Please enter a valid email address.";
    if (!password) found.password = "Please enter your password.";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setServerError("");
    setSubmitting(true);
    try {
      const loggedIn = await login(email.trim(), password, rememberMe);
      // Admins land on their dashboard, unless they were on their way somewhere
      navigate(from === "/" && loggedIn.role === "admin" ? "/admin" : from, { replace: true });
    } catch (error) {
      setServerError((error as Error).message); // e.g. "Incorrect email or password."
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-360 px-4 py-12 md:px-12 md:py-20">
      <div className="mx-auto max-w-120 rounded-3xl bg-surface p-8 shadow-lift md:p-11">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-5 flex size-15 items-center justify-center rounded-2xl bg-primary-hover text-white">
            <MdOutlineLocalMall size={28} aria-hidden="true" />
          </span>
          <h1 className="text-2xl leading-8 font-bold text-ink">Welcome back</h1>
          <p className="mt-1 text-[15px] leading-5.5 text-ink-soft">Sign in to continue shopping and manage your orders.</p>
        </div>

        {/* The server's message, e.g. "Incorrect email or password." role="alert" = read out by screen readers */}
        {serverError && (
          <p role="alert" className="mb-5 rounded-xl bg-danger-light px-4 py-3 text-sm text-danger">
            {serverError}
          </p>
        )}

        {/* noValidate: we show our own messages instead of the browser's grey bubbles */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <TextInput
            label="Email Address"
            type="email"
            autoComplete="email"
            icon={MdOutlineMail}
            placeholder="ada.obi@example.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors((current) => ({ ...current, email: undefined })); // hide the old message while they fix it
            }}
            error={errors.email}
          />

          <PasswordInput
            label="Password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((current) => ({ ...current, password: undefined }));
            }}
            error={errors.password}
            labelAction={
              <Link to="/forgot-password" className="text-sm font-medium text-primary-hover hover:underline">
                Forgot password?
              </Link>
            }
          />

          <Checkbox checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)}>
            Remember me for 30 days
          </Checkbox>

          <button
            type="submit"
            disabled={submitting}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-hover text-base font-semibold text-white transition-colors hover:bg-primary disabled:opacity-60"
          >
            <MdLogin size={20} aria-hidden="true" />
            {submitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="mt-8 text-center text-[15px] text-ink-soft">
          Don't have an account?{" "}
          <Link to="/register" state={location.state} className="font-semibold text-primary-hover hover:underline">
            Create account
          </Link>
        </p>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs font-semibold tracking-wide text-muted">
          <MdOutlineVerifiedUser size={14} aria-hidden="true" className="text-success" />
          256-bit SSL encrypted &amp; secure connection
        </p>
      </div>

      <ul className="mx-auto mt-12 grid max-w-240 gap-6 md:grid-cols-3">
        {perks.map((perk) => (
          <li key={perk.title} className="flex items-center gap-4 rounded-2xl bg-surface p-5 shadow-card">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-field text-primary">
              <perk.icon size={24} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg leading-6 font-semibold text-ink">{perk.title}</h2>
              <p className="text-sm leading-5 text-ink-soft">{perk.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LoginPage;
```

- **Two kinds of errors:** our own checks (empty email, bad email) show under the field **before** asking the
  server. The server's answer ("Incorrect email or password.") shows in the red box at the top.
- **`noValidate`** turns off the browser's grey bubbles, so every message looks like the design.
- **Changing a field hides its old message.** While testing, I found that without this, a stale "Please enter
  a valid email address." stayed after you fixed it.
- **The design's "Continue with Google" button isn't here.** The server has no Google sign-in, and a button
  that does nothing would be confusing in a demo. (It's a good "future work" point for the presentation.)

### 31.7 `src/pages/auth/RegisterPage.tsx`

Replace the placeholder.

```tsx
// RegisterPage.tsx client/src/pages/auth/RegisterPage.tsx
// "Create your account": names, email (checked while you type), phone, password with strength meter,
// confirm password, terms. (Design: Registration & Password Validation)

// STEP 31 (part 6): The register page

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { MdAlternateEmail, MdArrowForward, MdCheckCircleOutline, MdLockReset, MdOutlineLocalShipping } from "react-icons/md";
import { Link, Navigate, useLocation, useNavigate, type Location } from "react-router-dom";
import Checkbox from "../../components/form/Checkbox";
import PasswordInput from "../../components/form/PasswordInput";
import PasswordStrength from "../../components/form/PasswordStrength";
import TextInput from "../../components/form/TextInput";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";
import { isPasswordValid } from "../../utils/password";

const EMAIL_RULE = /^\S+@\S+\.\S+$/;

// "0803 123 4567" -> "+2348031234567" (the format the server and Brevo understand). The leading 0 goes.
const toInternational = (phone: string) => `+234${phone.replace(/\D/g, "").replace(/^0/, "")}`;
// A Nigerian mobile number: 10 digits after +234 (0803 123 4567 = 11 digits with the 0)
const isPhoneValid = (phone: string) => /^\d{10}$/.test(phone.replace(/\D/g, "").replace(/^0/, ""));

type Errors = Partial<Record<"firstName" | "lastName" | "email" | "phone" | "password" | "confirmPassword" | "agreeToTerms", string>>;

const RegisterPage = () => {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? "/";

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // The answer to "is this email free?", remembered WITH the email it's about
  const [emailCheck, setEmailCheck] = useState<{ email: string; available: boolean } | null>(null);
  const email = form.email.trim().toLowerCase();

  // "Available" next to the email: ask GET /api/auth/check-email, but only when they STOP typing for 0.5s.
  // (Without the wait, typing "ada.obi@example.com" would send 19 requests.)
  useEffect(() => {
    if (!EMAIL_RULE.test(email)) return;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      api<{ available: boolean }>(`/auth/check-email?email=${encodeURIComponent(email)}`, { signal: controller.signal })
        .then(({ available }) => setEmailCheck({ email, available }))
        .catch(() => {}); // if the check fails, the server still refuses a used email when they submit (409)
    }, 500);

    // Typed another letter before 0.5s: cancel the timer (and the request, if it already started)
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [email]);

  // Only trust the answer if it's about the email that's in the box NOW
  const emailAvailable = emailCheck?.email === email ? emailCheck.available : undefined;

  if (user && !submitting) {
    return <Navigate to={from} replace />;
  }

  // One change handler for all the text boxes: the input's "name" says which field to update.
  // Changing a field also hides its old error message (it may be fixed now; submitting checks again).
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const validate = () => {
    const found: Errors = {};
    if (!form.firstName.trim()) found.firstName = "First name is required.";
    if (!form.lastName.trim()) found.lastName = "Last name is required.";
    if (!EMAIL_RULE.test(email)) found.email = "Please enter a valid email address.";
    else if (emailAvailable === false) found.email = "This email already has an account. Log in instead?";
    if (!isPhoneValid(form.phone)) found.phone = "Enter a Nigerian mobile number, e.g. 0803 123 4567.";
    if (!isPasswordValid(form.password)) found.password = "Your password needs at least 8 characters, an uppercase letter and a number.";
    if (form.confirmPassword !== form.password) found.confirmPassword = "Passwords do not match.";
    if (!agreeToTerms) found.agreeToTerms = "Please agree to the Terms of Service and Privacy Policy.";
    return found;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setServerError("");
    setSubmitting(true);
    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email,
        phone: toInternational(form.phone),
        password: form.password,
        confirmPassword: form.confirmPassword,
        agreeToTerms,
      });
      navigate(from, { replace: true }); // STEP 37 sends new accounts to "Verify your email" instead
    } catch (error) {
      setServerError((error as Error).message); // e.g. 409 "That email is already in use."
      setSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden px-4 py-12 md:py-20">
      {/* The soft coloured circles behind the card */}
      <div aria-hidden="true" className="absolute -top-20 -left-20 size-96 rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden="true" className="absolute -right-20 -bottom-20 size-96 rounded-full bg-mint/30 blur-3xl" />

      <div className="relative mx-auto max-w-160 rounded-3xl bg-surface p-6 shadow-lift md:p-10">
        <div className="mb-8 text-center">
          <p className="mx-auto mb-4 flex w-fit items-center gap-1.5 rounded-full bg-primary-light px-3 py-1 text-[11px] font-bold tracking-wide text-ink uppercase">
            <MdOutlineLocalShipping size={15} aria-hidden="true" className="text-primary" />
            Fast 30-min delivery nationwide
          </p>
          <h1 className="text-3xl leading-9 font-bold tracking-tight text-ink">Create your account</h1>
          <p className="mx-auto mt-2 max-w-115 text-[15px] leading-5.5 text-ink-soft">
            Join thousands of shoppers enjoying 30-minute delivery and member-exclusive deals across Nigeria.
          </p>
        </div>

        {serverError && (
          <p role="alert" className="mb-5 rounded-xl bg-danger-light px-4 py-3 text-sm text-danger">
            {serverError}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextInput
              label="First name"
              name="firstName"
              autoComplete="given-name"
              value={form.firstName}
              onChange={handleChange}
              valid={form.firstName.trim().length > 0}
              error={errors.firstName}
            />
            <TextInput
              label="Last name"
              name="lastName"
              autoComplete="family-name"
              value={form.lastName}
              onChange={handleChange}
              valid={form.lastName.trim().length > 0}
              error={errors.lastName}
            />
          </div>

          <TextInput
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            icon={MdAlternateEmail}
            placeholder="ada.obi@example.com"
            value={form.email}
            onChange={handleChange}
            valid={emailAvailable === true}
            error={errors.email ?? (emailAvailable === false ? "This email already has an account. Log in instead?" : undefined)}
            labelAction={
              emailAvailable && (
                <span className="flex items-center gap-1 text-xs font-semibold text-success">
                  <MdCheckCircleOutline size={14} aria-hidden="true" /> Available
                </span>
              )
            }
          />

          <TextInput
            label="Phone number"
            name="phone"
            type="tel"
            autoComplete="tel-national"
            inputMode="tel"
            placeholder="0803 123 4567"
            value={form.phone}
            onChange={handleChange}
            valid={isPhoneValid(form.phone)}
            error={errors.phone}
            leading={
              <span className="flex h-12 items-center gap-2 rounded-xl bg-field px-3 text-sm font-semibold text-ink">
                <span aria-hidden="true" className="flex h-3.5 w-5 overflow-hidden rounded-xs">
                  <span className="flex-1 bg-[#008751]" />
                  <span className="flex-1 bg-white" />
                  <span className="flex-1 bg-[#008751]" />
                </span>
                +234
              </span>
            }
          />

          <div className="flex flex-col gap-3">
            <PasswordInput
              label="Create password"
              name="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
            />
            <PasswordStrength password={form.password} />
          </div>

          <PasswordInput
            label="Confirm password"
            name="confirmPassword"
            autoComplete="new-password"
            icon={MdLockReset}
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />

          <Checkbox
            checked={agreeToTerms}
            onChange={(event) => {
              setAgreeToTerms(event.target.checked);
              setErrors((current) => ({ ...current, agreeToTerms: undefined }));
            }}
            error={errors.agreeToTerms}
          >
            I agree to QuickCart's{" "}
            <Link to="/terms" className="text-primary-hover hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary-hover hover:underline">
              Privacy Policy
            </Link>
            .
          </Checkbox>

          <button
            type="submit"
            disabled={submitting}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-hover text-base font-semibold text-white transition-colors hover:bg-primary disabled:opacity-60"
          >
            {submitting ? "Creating your account..." : "Create Account"}
            <MdArrowForward size={20} aria-hidden="true" />
          </button>
        </form>

        <p className="mt-8 text-center text-[15px] text-ink-soft">
          Already have an account?{" "}
          <Link to="/login" state={location.state} className="font-semibold text-primary-hover hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
```

- **"Available" while you type:** after you **stop typing for 0.5 seconds**, it asks
  `GET /api/auth/check-email` (server STEP 18). This is called *debouncing*: without the wait, typing an email
  would send one request per letter.
- **`emailCheck` remembers which email it's about.** If you change the email, the old answer is ignored
  instead of showing "Available" for the wrong address.
- **The phone box** takes `0803 123 4567` the way Nigerians write it, and sends `+2348031234567` to the
  server.
- **The strength meter** shows 4 rules. The server only **requires** the first 3; the symbol makes it
  "Strong". That's why `isPasswordValid` checks `slice(0, 3)`.
- After registering you're logged in straight away (the server sends a token). STEP 37 will send new accounts
  to "Verify your email" first.

### 31.8 `src/components/layout/AccountMenu.tsx` and the Navbar

New file:

```tsx
// AccountMenu.tsx client/src/components/layout/AccountMenu.tsx
// The round profile button at the right of the Navbar.
// Logged out: it goes to /login. Logged in: it shows your initials and opens a small menu.

// STEP 31 (part 7): The account menu

import { useEffect, useRef, useState } from "react";
import { MdLogout, MdOutlineDashboard, MdOutlinePerson, MdOutlineReceiptLong } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const itemClasses = "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-field";

const AccountMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu when you click anywhere else, or press Escape
  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  if (!user) {
    return (
      <Link
        to="/login"
        aria-label="Log in"
        className="flex size-8 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-hover"
      >
        <MdOutlinePerson size={16} aria-hidden="true" />
      </Link>
    );
  }

  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase(); // "Ada Obi" -> "AO"

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/");
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${user.firstName}`}
        className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white transition-colors hover:bg-primary-hover"
      >
        {initials}
      </button>

      {open && (
        <div role="menu" className="absolute top-11 right-0 z-50 w-60 animate-pop-in rounded-2xl bg-surface p-2 shadow-lift">
          <div className="border-b border-line px-3 pt-2 pb-3">
            <p className="text-sm font-semibold text-ink">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>

          <div className="flex flex-col pt-2">
            {user.role === "admin" && (
              <Link role="menuitem" to="/admin" onClick={() => setOpen(false)} className={itemClasses}>
                <MdOutlineDashboard size={18} aria-hidden="true" /> Admin dashboard
              </Link>
            )}
            <Link role="menuitem" to="/account" onClick={() => setOpen(false)} className={itemClasses}>
              <MdOutlinePerson size={18} aria-hidden="true" /> My Account
            </Link>
            <Link role="menuitem" to="/account/orders" onClick={() => setOpen(false)} className={itemClasses}>
              <MdOutlineReceiptLong size={18} aria-hidden="true" /> My Orders
            </Link>
            <button type="button" role="menuitem" onClick={handleLogout} className={`${itemClasses} text-danger`}>
              <MdLogout size={18} aria-hidden="true" /> Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;
```

In `src/components/layout/Navbar.tsx`:

1. Replace the icons import and add the menu's import:

   ```tsx
   import { MdOutlineLocalMall, MdSearch } from "react-icons/md";
   import AccountMenu from "./AccountMenu";
   ```

2. Replace the whole profile `<Link to="/account" ...> ... </Link>` (the last thing in the
   "Search, cart and profile" div) with:

   ```tsx
             <AccountMenu />
   ```

- **Clicking outside closes the menu:** a `mousedown` listener on the whole page checks if the click was
  inside the menu (`menuRef.current.contains(...)`). The listener is only added while the menu is open, and
  removed by the clean-up.
- **`aria-expanded`, `role="menu"`:** screen readers announce "menu, expanded".

### 31.9 Test it

Both terminals running (`server` and `client`), then `npm run seed` in the server once so the demo accounts
exist.

| Do this                                                              | You should see                                        |
| -------------------------------------------------------------------- | ----------------------------------------------------- |
| Logged out, open `http://localhost:5173/account`                      | you land on `/login`                                  |
| Open `/admin`                                                         | you land on `/admin/login` (a placeholder until STEP 41) |
| On `/login`, click **Log In** with empty boxes                        | "Please enter a valid email address." and "Please enter your password." under the boxes |
| `ada.obi@example.com` + `Wrong@1234`                                  | red box: **Incorrect email or password.**              |
| Click the 👁 eye                                                       | the password shows                                    |
| Open `/account` logged out, then log in as Ada (`Password@123`)       | you're taken back to **`/account`**; the Navbar shows **AO** |
| Refresh the page                                                      | still logged in                                       |
| Open `/admin` as Ada                                                  | sent back to the Home page                             |
| Click **AO**                                                          | menu with Ada Obi, her email, My Account, My Orders, Log Out |
| **Log Out**                                                           | the button is the person icon again; `/account` sends you to `/login` |
| DevTools → Application → Local Storage → `quickcart_token`: change it to `abc`, then refresh `/account` | the bad token is deleted and you're on `/login` |
| Log in as `admin@quickcart.ng` / `Admin@12345` from `/login`          | you land on `/admin`; the menu has **Admin dashboard** |
| `/register`: click **Create Account** with nothing filled              | a message under every field                           |
| Type `ada.obi@example.com` as the email and wait                      | "This email already has an account. Log in instead?"  |
| Type a new email                                                      | ✓ **Available**                                       |
| Password `abc`, then `QuickLagos2025`, then `QuickLagos#2025`          | Too weak → Medium → **Strong**, ticks filling in       |
| Different confirm password                                            | "Passwords do not match."                             |
| Fill everything correctly and **Create Account**                      | Home page, logged in with your initials               |

Then check the new account in Atlas (`users` collection): the phone is saved as `+2348031234567`.

I tested all of this on a copy of your project with a robot-driven browser, against a throwaway copy of the
database: **29 checks, all passed**. One check caught the stale-error bug, which the code above fixes. `npm run
build` and `npm run lint` pass, and I compared the Login and Register pages with the designs, on a computer
and a phone screen.

### 31.10 Commit

```bash

git add .
git commit -m "STEP 31: login, register, protected routes"
git push
```

➡️ **Next: STEP 32 (The cart: a CartContext saved in the browser, the cart count in the Navbar, and pop-up
messages like "Added to cart").** Reply **NEXT** when 31.9 works.
