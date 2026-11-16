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
| ✅   | 31     | Logged-in user: AuthContext, Login and Register pages, protected routes |
| ✅   | 32     | The cart (saved in the browser), toasts, product cards, Featured products |
| ✅   | 33     | The rest of the Home page sections |
| ⬜   | **34** | **Shop page (filters, search, sort, pages) and Categories page** ← you are here |
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

---

## STEP 32: The cart, toasts and the first product cards

By the end of this step:

- a **cart** that lives in the browser: add products, change quantities, remove them. It survives a refresh,
  and needs no login (checkout will ask for one)
- the **red number on the Navbar's bag** shows how many items are in the cart, with a little "bump" each time
- the **"Added to Cart!"** box from the design drops down whenever something is added, from any page
- **toasts**: small dark messages in the corner for things like "Only 3 left"
- the reusable **product card** (photo, badge, category, name, stars, price, **Add**), and the Home page's
  **"Featured products"** row using it, so you can test the cart for real

| New file                                   | What it is                                                     |
| ------------------------------------------ | -------------------------------------------------------------- |
| `utils/format.ts`                          | `naira(45000)` → "₦45,000", `plural(3, "item")` → "3 items"     |
| `context/CartContext.ts`, `CartProvider.tsx` | `useCart()`: items, count, subtotal, add / change / remove    |
| `context/ToastContext.ts`, `ToastProvider.tsx` + `components/common/Toaster.tsx` | `useToast()`: show a message |
| `components/common/Price.tsx`, `RatingStars.tsx` | "₦45,000 ~~₦60,000~~" and ★★★★½ (48), used by every card     |
| `components/product/ProductCard.tsx`       | the card from the design's "Featured products"                  |
| `components/home/FeaturedProducts.tsx`     | the Home row: `GET /api/products?tag=featured&limit=4`          |
| `components/product/AddedToCartModal.tsx`  | the "Added to Cart!" box                                       |

### 32.1 Product types in `src/types/api.ts`

Add at the bottom:

```ts
// STEP 32: Products (server: models/Product.ts and CARD_FIELDS in productController.ts)

export type ProductColor = { name: string; hex: string }; // { name: "Midnight Black", hex: "#1f2937" }

// What a product CARD gets from GET /api/products: the fields cards need, not the whole product
export type ProductSummary = {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  price: number; // whole naira: 45000 = ₦45,000
  oldPrice?: number; // the crossed-out price when it's on sale
  images: string[]; // images[0] is the card photo
  ratings: number; // average stars, 0 to 5
  reviewCount: number;
  badge?: string; // "SALE", "TOP SELLER", "FEATURED"...
  tagline?: string;
  priceNote?: string;
  tags: string[];
  sold: number;
  stock: number;
  trackStock: boolean; // false = never sells out
  flashSaleStock?: number;
  colors: ProductColor[];
  category: { _id: string; name: string; slug: string };
};

// GET /api/products -> one page of products
export type ProductsResponse = {
  products: ProductSummary[];
  total: number;
  page: number;
  pages: number;
};
```

`ProductSummary` is what a **card** gets: the server's `CARD_FIELDS` (server STEP 16), not the whole product.
The Product Details page (STEP 35) adds a bigger `Product` type.

### 32.2 `src/utils/format.ts`

New file.

```ts
// format.ts client/src/utils/format.ts
// Small helpers to show values the Nigerian way.

// STEP 32 (part 1): Formatting

// 45000 -> "₦45,000" (prices are whole naira everywhere, like the server)
export const naira = (amount: number) => `₦${Math.round(amount).toLocaleString("en-NG")}`;

// 1 -> "1 item", 3 -> "3 items"
export const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;
```

`toLocaleString("en-NG")` adds the commas the Nigerian way. Every price on the website goes through `naira()`,
so if you ever want "NGN 45,000" instead, it's one line to change.

### 32.3 The cart: `src/context/CartContext.ts` and `src/context/CartProvider.tsx`

New files, the same two-file pattern as the auth context (STEP 31).

```ts
// CartContext.ts client/src/context/CartContext.ts
// The shopping cart for the whole website:
//   const { items, count, subtotal, addItem } = useCart();
// The values come from CartProvider.tsx (wrapped around the app in main.tsx).

// STEP 32 (part 2): The cart context

import { createContext, useContext } from "react";
import type { ProductSummary } from "../types/api";

// One line in the cart. We copy what the cart page needs to show (name, photo, price), so the cart works
// without asking the server for every product. The server checks the REAL price and stock at checkout (STEP 22).
export type CartItem = {
  key: string; // product id + colour: the same product in 2 colours is 2 lines
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  color?: string; // "Midnight Black"
  quantity: number;
  maxQuantity: number; // the most this line can have (stock, and never more than 10, like the server)
};

// What addItem answers, so the button can say "Added" or show why not
export type AddResult = { ok: true; item: CartItem } | { ok: false; message: string };

export type CartContextValue = {
  items: CartItem[];
  count: number; // all the quantities added up: the red number on the Navbar's bag
  subtotal: number;
  addItem: (product: ProductSummary, options?: { color?: string; quantity?: number }) => AddResult;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void; // after an order is placed (STEP 38)
  lastAdded: CartItem | null; // shown in the "Added to Cart!" pop-up
  dismissLastAdded: () => void;
};

export const CartContext = createContext<CartContextValue | null>(null);

export const useCart = () => {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error("useCart must be used inside <CartProvider> (see main.tsx)");
  }
  return value;
};
```

```tsx
// CartProvider.tsx client/src/context/CartProvider.tsx
// Keeps the cart, and saves it in the browser (localStorage) so it survives a refresh or closing the tab.
// No login needed: anyone can fill a cart. Checkout (STEP 38) asks them to log in.

// STEP 32 (part 3): The cart provider

import { useEffect, useState, type ReactNode } from "react";
import type { ProductSummary } from "../types/api";
import { CartContext, type AddResult, type CartItem } from "./CartContext";

const CART_KEY = "quickcart_cart";
const MAX_PER_LINE = 10; // the server refuses more than 10 of one line (orderController.ts, STEP 22)

// Read the saved cart once, when the website opens. Broken or missing data -> an empty cart (never a crash).
const loadCart = (): CartItem[] => {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(loadCart); // loadCart (no brackets): React runs it only once
  const [lastAdded, setLastAdded] = useState<CartItem | null>(null);

  // Every time the cart changes, save it
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  // These are worked out from the items every time, so they can never be out of date
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addItem = (product: ProductSummary, { color, quantity = 1 }: { color?: string; quantity?: number } = {}): AddResult => {
    const key = color ? `${product._id}:${color}` : product._id;
    const maxQuantity = Math.min(MAX_PER_LINE, product.trackStock ? product.stock : MAX_PER_LINE);
    const existing = items.find((item) => item.key === key);
    const alreadyInCart = existing?.quantity ?? 0;

    if (maxQuantity <= 0) {
      return { ok: false, message: `"${product.name}" is sold out.` };
    }
    if (alreadyInCart + quantity > maxQuantity) {
      return {
        ok: false,
        message:
          maxQuantity === MAX_PER_LINE
            ? `You can add up to ${MAX_PER_LINE} of "${product.name}".`
            : `Only ${maxQuantity} of "${product.name}" left${alreadyInCart > 0 ? `, and ${alreadyInCart} already in your cart` : ""}.`,
      };
    }

    const item: CartItem = existing
      ? { ...existing, quantity: alreadyInCart + quantity, maxQuantity }
      : {
          key,
          productId: product._id,
          slug: product.slug,
          name: product.name,
          image: product.images[0] ?? "",
          price: product.price,
          oldPrice: product.oldPrice,
          color,
          quantity,
          maxQuantity,
        };

    // Already there: replace that line. New: add it at the end.
    setItems((current) => (existing ? current.map((line) => (line.key === key ? item : line)) : [...current, item]));
    setLastAdded({ ...item, quantity }); // the pop-up shows how many were JUST added
    return { ok: true, item };
  };

  const updateQuantity = (key: string, quantity: number) => {
    setItems((current) =>
      current.map((item) =>
        item.key === key ? { ...item, quantity: Math.max(1, Math.min(quantity, item.maxQuantity)) } : item,
      ),
    );
  };

  const removeItem = (key: string) => {
    setItems((current) => current.filter((item) => item.key !== key));
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        lastAdded,
        dismissLastAdded: () => setLastAdded(null),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
```

**Things worth understanding:**

- **The cart copies the name, photo and price** when you add something, so the cart page can show it
  instantly without asking the server. Is that safe? Yes: at checkout the server ignores these prices and uses
  its own (server STEP 22). Changing the price in `localStorage` gets you nothing.
- **`key` = product id + colour**: 2 colours of the same headphones are 2 lines in the cart (like the
  checkout design).
- **`maxQuantity`**: the stock, and never more than 10. These are the server's own rules, checked here so
  the shopper finds out now, not at checkout.
- **`useState(loadCart)`** (no brackets) tells React to read `localStorage` only on the first render.
  `useState(loadCart())` would read it again on every render.
- **The `try/catch` in `loadCart`**: if the saved data is broken (someone edited it), the cart starts empty
  instead of crashing the whole website. My test checked this.
- **`count` and `subtotal` aren't state:** they're added up from `items` on every render, so they can never
  disagree with the items.
- **`addItem` returns a result** (`{ ok: true }` or `{ ok: false, message }`), so each button decides what to
  show: the card shows a toast, the product page (STEP 35) can show the message next to its button.

### 32.4 Toasts: `src/context/ToastContext.ts`, `src/context/ToastProvider.tsx`, `src/components/common/Toaster.tsx`

```ts
// ToastContext.ts client/src/context/ToastContext.ts
// Small pop-up messages in the corner ("toasts"), like the design's "Product updated successfully":
//   const { showToast } = useToast();
//   showToast({ type: "error", title: "Only 3 left" });

// STEP 32 (part 4): Toasts

import { createContext, useContext } from "react";

export type Toast = {
  id: number;
  type: "success" | "error" | "info";
  title: string;
  message?: string; // a second, smaller line
};

export type ToastContextValue = {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => void; // the id is made for you
  dismissToast: (id: number) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error("useToast must be used inside <ToastProvider> (see main.tsx)");
  }
  return value;
};
```

```tsx
// ToastProvider.tsx client/src/context/ToastProvider.tsx
// Keeps the list of toasts, removes each one after 5 seconds, and draws them (Toaster) on top of every page.

// STEP 32 (part 5): The toast provider

import { useRef, useState, type ReactNode } from "react";
import Toaster from "../components/common/Toaster";
import { ToastContext, type Toast } from "./ToastContext";

const TOAST_SECONDS = 5;

const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1); // a counter that survives re-renders without causing one

  const dismissToast = (id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const showToast = (toast: Omit<Toast, "id">) => {
    const id = nextId.current++;
    setToasts((current) => [...current.slice(-2), { ...toast, id }]); // at most 3 on screen
    setTimeout(() => dismissToast(id), TOAST_SECONDS * 1000);
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
};

export default ToastProvider;
```

`Toaster.tsx` replaces the placeholder:

```tsx
// Toaster.tsx client/src/components/common/Toaster.tsx
// Draws the toasts in the bottom-right corner (bottom of the screen on phones), like the design's dark
// "Product updated successfully" box. ToastProvider puts it on every page.

// STEP 32 (part 5): The toasts on screen

import { MdCheckCircle, MdClose, MdErrorOutline, MdInfoOutline } from "react-icons/md";
import { useToast } from "../../context/ToastContext";

const ICONS = {
  success: { icon: MdCheckCircle, color: "text-mint" },
  error: { icon: MdErrorOutline, color: "text-[#ffb4ab]" },
  info: { icon: MdInfoOutline, color: "text-primary-light" },
};

const Toaster = () => {
  const { toasts, dismissToast } = useToast();

  return (
    // aria-live="polite": screen readers read each new toast without interrupting
    <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-100 flex flex-col items-end gap-3 sm:left-auto">
      {toasts.map((toast) => {
        const { icon: Icon, color } = ICONS[toast.type];
        return (
          <div
            key={toast.id}
            role={toast.type === "error" ? "alert" : "status"}
            className="pointer-events-auto flex w-full max-w-sm animate-slide-up items-start gap-3 rounded-2xl bg-navy px-4 py-3.5 text-white shadow-banner"
          >
            <Icon size={22} aria-hidden="true" className={`mt-px shrink-0 ${color}`} />
            <div className="flex-1">
              <p className="text-[15px] leading-5 font-semibold">{toast.title}</p>
              {toast.message && <p className="mt-0.5 text-sm leading-5 text-white/75">{toast.message}</p>}
            </div>
            <button type="button" onClick={() => dismissToast(toast.id)} aria-label="Close message" className="text-white/70 hover:text-white">
              <MdClose size={20} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toaster;
```

- **`useRef` for the id counter:** a ref keeps a value between renders like state does, but changing it doesn't
  re-render. Perfect for "the next number".
- **`setTimeout(() => dismissToast(id), 5000)`** removes each toast after 5 seconds. Each toast has its own
  timer, and its own id, so the right one disappears.
- **`role="alert"`** for errors (screen readers interrupt), **`role="status"`** for the rest.

### 32.5 Wrap the app in `src/main.tsx`

```tsx
import CartProvider from "./context/CartProvider";
import ToastProvider from "./context/ToastProvider";
```

```tsx
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  </StrictMode>,
```

The order matters a little: `ToastProvider` is outside the others, so anything inside (even the auth or cart
code, later) can show a toast.

### 32.6 `src/components/common/Price.tsx` and `src/components/common/RatingStars.tsx`

Replace both placeholders.

```tsx
// Price.tsx client/src/components/common/Price.tsx
// "₦45,000 ₦60,000" (the second one crossed out when the product is on sale). Used on every product card.

// STEP 32 (part 6): Price

import { naira } from "../../utils/format";

type PriceProps = {
  price: number;
  oldPrice?: number;
  size?: "sm" | "md" | "lg";
};

const SIZES = { sm: "text-[15px]", md: "text-lg", lg: "text-3xl" };

const Price = ({ price, oldPrice, size = "md" }: PriceProps) => {
  const onSale = oldPrice !== undefined && oldPrice > price;

  return (
    <p className="flex flex-wrap items-baseline gap-x-2">
      <span className={`${SIZES[size]} leading-tight font-bold text-ink`}>{naira(price)}</span>
      {onSale && (
        <>
          <span className="sr-only">, was</span>
          <del className="text-[13px] text-muted">{naira(oldPrice)}</del>
        </>
      )}
    </p>
  );
};

export default Price;
```

```tsx
// RatingStars.tsx client/src/components/common/RatingStars.tsx
// ★★★★☆ (48): the average rating as 5 stars, with halves, and the number of reviews.

// STEP 32 (part 6): Rating stars

import { MdStar, MdStarBorder, MdStarHalf } from "react-icons/md";

type RatingStarsProps = {
  rating: number; // 0 to 5, e.g. 4.8
  count?: number; // how many reviews, shown in brackets
  size?: number;
};

const RatingStars = ({ rating, count, size = 16 }: RatingStarsProps) => {
  // 4.8 -> 5 full stars, 4.3 -> 4 full and a half: round to the nearest half first
  const rounded = Math.round(rating * 2) / 2;

  return (
    <div className="flex items-center gap-1.5">
      {/* The screen reader hears one sentence instead of "star star star star star" */}
      <span className="flex text-warning" role="img" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
        {[1, 2, 3, 4, 5].map((star) =>
          rounded >= star ? (
            <MdStar key={star} size={size} aria-hidden="true" />
          ) : rounded >= star - 0.5 ? (
            <MdStarHalf key={star} size={size} aria-hidden="true" />
          ) : (
            <MdStarBorder key={star} size={size} aria-hidden="true" />
          ),
        )}
      </span>
      {count !== undefined && <span className="text-[13px] text-muted">({count})</span>}
    </div>
  );
};

export default RatingStars;
```

- **`<del>`** is the HTML tag for "this text was removed": the browser crosses it out, and the hidden ", was"
  makes a screen reader say "₦45,000, was ₦60,000".
- **Half stars:** `Math.round(4.3 * 2) / 2` = 4.5. The ratings come from real reviews (server STEP 23), so they
  can be anything like 4.73.

### 32.7 `src/components/product/ProductCard.tsx`

Replace the placeholder.

```tsx
// ProductCard.tsx client/src/components/product/ProductCard.tsx
// The standard product card (Home "Featured products", and the Shop page in STEP 34):
// photo with a badge, category, name, stars, price, and an "Add" button.
//   <ProductCard product={product} />

// STEP 32 (part 7): The product card

import { MdOutlineImageNotSupported } from "react-icons/md";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import type { ProductSummary } from "../../types/api";
import Price from "../common/Price";
import RatingStars from "../common/RatingStars";

// The badge colours from the design: SALE red, TOP SELLER green, anything else amber ("#4 BEST SELLER")
const badgeColor = (badge: string) =>
  badge === "SALE" ? "bg-danger text-white" : badge === "TOP SELLER" ? "bg-success text-white" : "bg-warning text-white";

const ProductCard = ({ product }: { product: ProductSummary }) => {
  const { addItem } = useCart();
  const { showToast } = useToast();

  const soldOut = product.trackStock && product.stock === 0;
  const link = `/product/${product.slug}`;

  const handleAdd = () => {
    // Quick add from a card takes the first colour. (The product page lets you choose, STEP 35.)
    const result = addItem(product, { color: product.colors[0]?.name });
    if (!result.ok) {
      showToast({ type: "error", title: "Couldn't add to cart", message: result.message });
    }
    // When it works, the "Added to Cart!" pop-up opens by itself (it watches lastAdded in the cart)
  };

  return (
    <article className="group flex w-full flex-col rounded-3xl bg-surface p-3 shadow-card transition-shadow hover:shadow-lift">
      <Link to={link} className="relative mb-4 block overflow-hidden rounded-2xl bg-field">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy" // the browser only downloads it when it's about to scroll into view
            className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="flex aspect-square items-center justify-center text-muted">
            <MdOutlineImageNotSupported size={40} aria-label="No photo yet" />
          </span>
        )}

        {product.badge && (
          <span className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px] leading-3.5 font-bold uppercase ${badgeColor(product.badge)}`}>
            {product.badge}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-1 pb-1">
        <p className="text-[11px] leading-4 font-semibold tracking-wider text-muted uppercase">{product.category.name}</p>

        <h3 className="mt-1 text-base leading-5.5 font-semibold text-ink">
          {/* The link covers the name only, so the Add button isn't inside a link */}
          <Link to={link} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>

        <div className="mt-1.5">
          <RatingStars rating={product.ratings} count={product.reviewCount} size={15} />
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <Price price={product.price} oldPrice={product.oldPrice} />
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut}
            aria-label={soldOut ? `${product.name} is sold out` : `Add ${product.name} to cart`}
            className="h-9 shrink-0 rounded-full bg-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:bg-line-soft disabled:text-muted"
          >
            {soldOut ? "Sold out" : "Add"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
```

- **The photo and the name are links** to the product page; the **Add** button is not inside a link (a button
  inside a link is invalid HTML and confusing for keyboards).
- **Quick add takes the first colour.** On the product page you'll choose.
- **Sold out** (stock 0 and `trackStock`): the button is disabled and says so.
- **`loading="lazy"`**: photos further down the page only download when you scroll near them.
- **`w-full`** on the card: without it, each card is only as wide as its text, and the 4 columns end up
  different sizes. I caught that in the screenshots.

### 32.8 `src/components/home/FeaturedProducts.tsx`

Replace the placeholder.

```tsx
// FeaturedProducts.tsx client/src/components/home/FeaturedProducts.tsx
// The Home page's "EDITOR'S CHOICE / Featured products" row: the 4 products tagged "featured" in the database.

// STEP 32 (part 8): The first product row

import { MdArrowForward } from "react-icons/md";
import { Link } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import type { ProductsResponse } from "../../types/api";
import SectionHeader from "../common/SectionHeader";
import ProductCard from "../product/ProductCard";

const FeaturedProducts = () => {
  // ?tag=featured: only products with the "featured" tag (server STEP 16)
  const { data, error, loading } = useApi<ProductsResponse>("/products?tag=featured&limit=4");

  // Nothing to show (an error, or no featured products): hide the whole section instead of an empty box.
  // The category row above already shows the "Try again" message if the server is off.
  if (error || (!loading && data?.products.length === 0)) {
    return null;
  }

  return (
    <section aria-labelledby="featured-title">
      <SectionHeader eyebrow="Editor's choice" title="Featured products" titleId="featured-title">
        <Link to="/shop?tag=featured" className="flex items-center gap-1 text-sm font-semibold text-primary-hover hover:underline">
          View all <MdArrowForward size={16} aria-hidden="true" />
        </Link>
      </SectionHeader>

      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }, (_, index) => (
              <li key={index} aria-hidden="true" className="h-105 animate-pulse rounded-3xl bg-surface shadow-card" />
            ))
          : data?.products.map((product) => (
              <li key={product._id} className="flex">
                <ProductCard product={product} />
              </li>
            ))}
      </ul>
    </section>
  );
};

export default FeaturedProducts;
```

If the products can't load, the section hides itself instead of showing a second error: the categories row
above already shows the "Try again" message.

### 32.9 `src/components/product/AddedToCartModal.tsx` and where it goes

Replace the placeholder.

```tsx
// AddedToCartModal.tsx client/src/components/product/AddedToCartModal.tsx
// The "Added to Cart!" box that drops down under the Navbar's bag (design: Added to cart).
// It opens by itself whenever something is added (cart.lastAdded), from any page. MainLayout shows it.

// STEP 32 (part 9): The "Added to Cart!" pop-up

import { useEffect } from "react";
import { MdArrowForward, MdCheckCircle, MdClose, MdOutlineLocalShipping } from "react-icons/md";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { naira, plural } from "../../utils/format";

const AddedToCartModal = () => {
  const { lastAdded, dismissLastAdded, count, subtotal } = useCart();

  // Close by itself after 6 seconds, or when Escape is pressed. Adding again restarts the timer
  // (lastAdded changes, so the effect runs again and the old timer is cleared).
  useEffect(() => {
    if (!lastAdded) return;
    const timer = setTimeout(dismissLastAdded, 6000);
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismissLastAdded();
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [lastAdded, dismissLastAdded]);

  if (!lastAdded) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="added-title"
      className="fixed top-22 right-4 left-4 z-60 animate-pop-in rounded-3xl bg-surface p-5 shadow-banner sm:left-auto sm:w-120 md:right-12"
    >
      <div className="flex items-start justify-between border-b border-line pb-4">
        <div className="flex items-center gap-2.5">
          <MdCheckCircle size={30} aria-hidden="true" className="text-success" />
          <div>
            <h2 id="added-title" className="text-lg leading-6 font-bold text-ink">
              Added to Cart!
            </h2>
            <p className="text-xs font-semibold text-muted">({plural(lastAdded.quantity, "item")} added)</p>
          </div>
        </div>
        <button type="button" onClick={dismissLastAdded} aria-label="Close" className="text-ink-soft hover:text-ink">
          <MdClose size={22} />
        </button>
      </div>

      <div className="flex items-center gap-4 py-4">
        <img src={lastAdded.image} alt="" className="size-18 shrink-0 rounded-xl bg-field object-cover" />
        <div className="min-w-0 flex-1 text-sm">
          <p className="truncate font-medium text-ink">{lastAdded.name}</p>
          {lastAdded.color && <p className="text-ink-soft">Color: {lastAdded.color}</p>}
          <div className="mt-1 flex items-center justify-between">
            <p className="text-ink-soft">Qty: {lastAdded.quantity}</p>
            <p className="text-lg font-bold text-primary-hover">{naira(lastAdded.price * lastAdded.quantity)}</p>
          </div>
        </div>
      </div>

      <div className="mb-5 rounded-2xl bg-panel p-4">
        <p className="flex items-center justify-between text-sm text-ink-soft">
          Cart Subtotal ({plural(count, "item")}):
          <span className="text-lg font-bold text-ink">{naira(subtotal)}</span>
        </p>
        {/* Standard delivery is always free in our server (DELIVERY_OPTIONS, server STEP 22) */}
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-success">
          <MdOutlineLocalShipping size={16} aria-hidden="true" />
          Eligible for Free Standard Delivery in Nigeria
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Link
          to="/cart"
          onClick={dismissLastAdded}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          View Cart &amp; Checkout <MdArrowForward size={18} aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={dismissLastAdded}
          className="h-11 rounded-xl bg-panel text-sm font-semibold text-ink transition-colors hover:bg-field"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default AddedToCartModal;
```

Show it on every store page, in `src/layouts/MainLayout.tsx`:

```tsx
import AddedToCartModal from "../components/product/AddedToCartModal";
```

```tsx
      <Footer />
      <AddedToCartModal />
```

- **It watches `lastAdded`** in the cart. The card doesn't open it; it just adds to the cart. So the product
  page, the bundle "Add Both to Cart" (STEP 35) and anything else get the same pop-up for free.
- **It closes after 6 seconds, on Escape, on ✕, or "Continue Shopping".** Adding again restarts the 6 seconds.
- "Eligible for Free Standard Delivery" is always true: standard delivery is free in your server
  (`DELIVERY_OPTIONS`, server STEP 22).

### 32.10 The real number on the Navbar's bag

In `src/components/layout/Navbar.tsx`:

1. Import the hook:

   ```tsx
   import { useCart } from "../../context/CartContext";
   ```

2. First line inside `const Navbar = () => {`:

   ```tsx
     const { count } = useCart();
   ```

3. On the cart `<Link>`, replace `aria-label="Cart"` with:

   ```tsx
               aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
   ```

4. Replace the **whole** red `<span ...>1</span>` (its opening tag, the `1` and its closing `</span>`, all three) with
   this. Don't put it inside the old span: the old one would stay as an empty red dot.

   ```tsx
               {/* key={count}: a new number = a new element, so the "bump" animation plays again */}
               {count > 0 && (
                 <span key={count} aria-hidden="true" className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 animate-bumb items-center justify-center rounded-full bg-danger px-1 text-xs leading-none font-bold text-white">
                   {count > 99 ? "99+" : count}
                 </span>
               )}
   ```

- **`key={count}`** is a neat React trick: when the key changes, React throws the old `<span>` away and makes a
  new one, so your `animate-bumb` animation from `index.css` plays again on every add.
- An empty cart shows no badge at all.

### 32.11 Test it

Both terminals running. If you changed products in earlier steps, run `npm run seed` in the server first.

| Do this                                                      | You should see                                              |
| ------------------------------------------------------------ | ----------------------------------------------------------- |
| Open the Home page                                            | "EDITOR'S CHOICE / Featured products": **Wireless Noise-Cancelling Headphones** (SALE), **Canvas Low-Top Sneakers** (TOP SELLER), **Ceramic Mug Set**, **Skincare Hydration Kit** (SALE), with stars, review counts and prices; no number on the bag |
| Click **Add** on the headphones                               | the bag shows **1** (with a bump), and "Added to Cart!" drops down: the photo, "Color: Midnight Black", Qty 1, ₦45,000, "Cart Subtotal (1 item): ₦45,000" |
| **Continue Shopping**                                         | it closes                                                    |
| **Add** the headphones again                                  | "(1 item added)" but "Cart Subtotal (2 items): ₦90,000"      |
| Press **Escape**, or wait 6 seconds                           | it closes                                                    |
| DevTools → Application → Local Storage → `quickcart_cart`      | 1 line with `"quantity": 2`                                  |
| Refresh the page                                              | the bag still says 2                                         |
| Click the product's name or photo                             | you go to `/product/wireless-noise-cancelling-headphones` (STEP 35 builds that page) |
| Keep clicking **Add** on the **Skincare Hydration Kit** (3 in stock after the seed) | after 3, a toast: "Couldn't add to cart. Only 3 of "Skincare Hydration Kit" left, and 3 already in your cart." |
| As admin in Postman, set a featured product's stock to 0 (`PATCH /api/admin/products/:id` `{ "stock": 0 }`), then refresh | its button says **Sold out** and can't be clicked |
| Change `quickcart_cart` to `{broken` in DevTools and refresh   | the page works and the cart is empty                         |

**About photo speed:** the photos come from Cloudinary. On a slow connection they can take a few seconds to
appear (the cards show a light blue box until then). That's the network, not your code.

I tested this on a copy of your project against a throwaway database: **16 checks, all passed** (every row
above). The screenshots showed one bug, cards of different widths, which the `w-full` above fixes. With it,
the row matches the design. `npm run build` and `npm run lint` pass.

### 32.12 Commit

```bash
cd ~/Desktop/QuickCarrt/client
git add .
git commit -m "STEP 32: cart, toasts, product cards, featured products"
git push
```

➡️ **Next: STEP 33 (The rest of the Home page: the flash sale with its countdown, Today's Deals, Best Sellers,
the promo banner, New Arrivals, Recommended for You, Recently Viewed, Testimonials and the newsletter box that
uses your STEP 24 endpoint).** Reply **NEXT** when 32.11 works.

---

## STEP 33: The rest of the Home page

Every placeholder on the Home page becomes the real section from the design, using real products from your
database:

| Section (design)                         | Which products                                    | File                         |
| ---------------------------------------- | ------------------------------------------------- | ---------------------------- |
| **Flash super sale** with the countdown  | tag `flash-deal` (4)                              | `FlashSale.tsx` + `product/FlashDealCard.tsx` |
| **Today's Deals** (scrolls sideways)     | tag `deal` (5)                                    | `TodaysDeal.tsx`             |
| **Best Sellers in Nigeria** (#1–#4)      | `?sort=best-selling` (most `sold`)                | `BestSellers.tsx`            |
| **Mega Tech & Home Upgrade** banner       | the real **QUICK25** code, with Copy Code          | `PromoBanner.tsx`            |
| **New Arrivals**                         | tag `new-arrival` (4)                             | `NewArrivals.tsx`            |
| **Recommended for You**                  | tag `recommended` (4)                             | `RecommendedForYou.tsx`      |
| **Loved by 25,000 shoppers**             | 3 written quotes                                  | `Testimonials.tsx`           |
| **Join QuickCart Club**                  | your newsletter endpoint (server STEP 24)          | `NewsletterBanner.tsx`       |

The tags were put on the products in `server/src/data/products.ts` (server STEP 10) exactly for these rows.

**"Recently Viewed"** (in the design, above the testimonials) needs to know which product pages you opened.
It's built with the Product Details page in STEP 35.

**Honest numbers:** a few texts in the design don't match what the server really does, so they're changed:

- the promo banner says "Save up to ₦25,000", but QUICK25 is **₦2,000 off orders of ₦25,000 or more**
- the newsletter box says "₦2,000 off your first order", but the welcome email sends **QUICK10** (10% off)
- "Match: 98%" on Recommended for You: we don't calculate matches, so it's left out

A marker who tries the code from the banner will see exactly what the banner promised.

### 33.1 Tidy-up: the "..." in the Footer

In `src/components/layout/Footer.tsx`, the `<p role="status" ...>` next to the social buttons contains `...`, which
shows on every page. Delete the 3 dots (keep the empty `<p>`): its `empty:hidden` class hides it while it's empty.

### 33.2 `src/components/product/ProductCard.tsx`: an optional badge and detail line

Best Sellers shows "#1 BEST SELLER" and "(1,420+ sold)", New Arrivals shows "NEW" and a short description, Today's Deals
shows "Save ₦12,000". Instead of 4 copies of the card, the card gets 2 optional props.

1. Under the comment at the top, add:

   ```tsx
   // Other Home rows change the badge and the line under the name (STEP 33):
   //   <ProductCard product={product} badge={{ label: "NEW", className: "bg-primary text-white" }} details={<p>...</p>} />
   ```

2. Add this import at the top:

   ```tsx
   import type { ReactNode } from "react";
   ```

3. Replace `const ProductCard = ({ product }: { product: ProductSummary }) => {` with:

   ```tsx
   type ProductCardProps = {
     product: ProductSummary;
     badge?: { label: string; className: string }; // replaces the product's own badge, e.g. "#1 BEST SELLER" (STEP 33)
     details?: ReactNode; // replaces the stars line under the name (STEP 33)
   };

   const ProductCard = ({ product, badge, details }: ProductCardProps) => {
   ```

4. Under `const link = ...`, add:

   ```tsx
     // The badge to show: the one given by the row, or the product's own (SALE, TOP SELLER...), or none
     const shownBadge = badge ?? (product.badge ? { label: product.badge, className: badgeColor(product.badge) } : null);
   ```

5. Replace the badge `{product.badge && ( <span ...>{product.badge}</span> )}` with:

   ```tsx
           {shownBadge && (
             <span className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px] leading-3.5 font-bold uppercase ${shownBadge.className}`}>
               {shownBadge.label}
             </span>
           )}
   ```

6. Replace the `<div className="mt-1.5"> <RatingStars ... /> </div>` with:

   ```tsx
           <div className="mt-1.5">{details ?? <RatingStars rating={product.ratings} count={product.reviewCount} size={15} />}</div>
   ```

`??` means "use the left side, unless it's missing": no `details` given → the stars, like before. The Featured
row (STEP 32) doesn't pass either prop, so it doesn't change.

### 33.3 `src/components/home/ProductSection.tsx`

New file: everything the product rows share (header, loading, grey boxes, hiding when empty).

```tsx
// ProductSection.tsx client/src/components/home/ProductSection.tsx
// What every product row on the Home page has in common: the header, loading the products from the server,
// the grey boxes while loading, and hiding itself if there's nothing to show. Each row only says WHICH products
// and HOW to draw a card:
//   <ProductSection eyebrow="Just in catalog" title="New Arrivals" titleId="new-title"
//     query="tag=new-arrival&limit=4" renderCard={(product) => <ProductCard product={product} />} />

// STEP 33 (part 1): A shared product row

import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { MdArrowForward } from "react-icons/md";
import { Link } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import type { ProductSummary, ProductsResponse } from "../../types/api";
import SectionHeader from "../common/SectionHeader";

type ProductSectionProps = {
  eyebrow: string;
  eyebrowIcon?: IconType;
  title: string;
  titleId: string;
  query: string; // the part after "?" in GET /api/products?...
  link?: { to: string; label: string }; // "View all ->" on the right
  aside?: ReactNode; // anything else on the right of the header (instead of the link)
  renderCard: (product: ProductSummary, index: number) => ReactNode;
  className?: string; // e.g. a background panel for "Recommended for You"
};

const ProductSection = ({ eyebrow, eyebrowIcon, title, titleId, query, link, aside, renderCard, className = "" }: ProductSectionProps) => {
  const { data, error, loading } = useApi<ProductsResponse>(`/products?${query}`);

  // An error or no products: hide the row (the categories row already shows "Try again" if the server is off)
  if (error || (!loading && !data?.products.length)) {
    return null;
  }

  return (
    <section aria-labelledby={titleId} className={className}>
      <SectionHeader eyebrow={eyebrow} eyebrowIcon={eyebrowIcon} title={title} titleId={titleId}>
        {aside ??
          (link && (
            <Link to={link.to} className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary-hover hover:underline">
              {link.label} <MdArrowForward size={16} aria-hidden="true" />
            </Link>
          ))}
      </SectionHeader>

      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }, (_, index) => (
              <li key={index} aria-hidden="true" className="h-105 animate-pulse rounded-3xl bg-surface shadow-card" />
            ))
          : data?.products.map((product, index) => (
              <li key={product._id} className="flex">
                {renderCard(product, index)}
              </li>
            ))}
      </ul>
    </section>
  );
};

export default ProductSection;
```

- **`renderCard`** is a function passed as a prop: the section loads the products, and asks the row "how do I
  draw this one?". It's called a *render prop*. That's how Best Sellers can number its cards (`index + 1`).
- Best Sellers, New Arrivals and Recommended for You use it, so each of those files is only ~25 lines.

### 33.4 The flash sale: `src/hooks/useCountdown.ts`, `src/components/product/FlashDealCard.tsx`, `src/components/home/FlashSale.tsx`

```ts
// useCountdown.ts client/src/hooks/useCountdown.ts
// Counts down to a moment, updating every second:
//   const { hours, minutes, seconds } = useCountdown(endOfToday);

// STEP 33 (part 2): A countdown hook

import { useEffect, useState } from "react";

export const useCountdown = (target: Date) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    // Every second, remember the new time; React re-draws with the new numbers
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer); // stop the timer when the component disappears
  }, []);

  const left = Math.max(0, target.getTime() - now); // milliseconds left, never below 0
  const totalSeconds = Math.floor(left / 1000);

  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    finished: left === 0,
  };
};
```

```tsx
// FlashDealCard.tsx client/src/components/product/FlashDealCard.tsx
// A flash sale card: "-45% OFF", a red price, the "Claimed: 82%" bar, "Only 6 left" and a big Quick Add button.

// STEP 33 (part 3): The flash sale card

import { MdBolt, MdOutlineAddShoppingCart } from "react-icons/md";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import type { ProductSummary } from "../../types/api";
import { naira } from "../../utils/format";

const FlashDealCard = ({ product }: { product: ProductSummary }) => {
  const { addItem } = useCart();
  const { showToast } = useToast();

  // -45% OFF: how much cheaper than the old price
  const percentOff = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  // "Claimed: 82%": of the units offered in the sale (flashSaleStock, server STEP 8), how many are gone.
  // 33 offered, 6 left -> 27 claimed -> 82%.
  const offered = product.flashSaleStock ?? 0;
  const claimed = offered > 0 ? Math.min(100, Math.round(((offered - product.stock) / offered) * 100)) : 0;
  const soldOut = product.trackStock && product.stock === 0;
  const fewLeft = product.stock <= 6;
  const link = `/product/${product.slug}`;

  const handleAdd = () => {
    const result = addItem(product, { color: product.colors[0]?.name });
    if (!result.ok) showToast({ type: "error", title: "Couldn't add to cart", message: result.message });
  };

  return (
    <article className="flex w-full flex-col rounded-3xl bg-surface p-4 shadow-card">
      <Link to={link} className="relative mb-4 block overflow-hidden rounded-2xl bg-field">
        <img src={product.images[0]} alt={product.name} loading="lazy" className="aspect-square w-full object-cover" />
        {percentOff > 0 && (
          <span className="absolute top-3 left-3 rounded-full bg-danger px-2.5 py-1 text-[11px] font-bold text-white">
            -{percentOff}% OFF
          </span>
        )}
        {product.tags.includes("fast-deal") && (
          <span className="absolute top-3 right-3 flex items-center gap-0.5 rounded-full bg-ink/60 px-2 py-0.5 text-[11px] font-medium text-white">
            <MdBolt size={13} aria-hidden="true" /> Fast Deal
          </span>
        )}
      </Link>

      <p className="text-[11px] font-semibold tracking-wider text-muted uppercase">{product.category.name}</p>
      <h3 className="mt-1 text-lg leading-6 font-semibold text-ink">
        <Link to={link} className="hover:text-primary">
          {product.name}
        </Link>
      </h3>

      <p className="mt-1 flex items-baseline gap-2">
        <span className="text-lg font-bold text-danger">{naira(product.price)}</span>
        {product.oldPrice && <del className="text-[13px] text-muted">{naira(product.oldPrice)}</del>}
      </p>

      {/* The bar: a background track, and a red part as wide as the claimed % */}
      <div
        role="progressbar"
        aria-valuenow={claimed}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Claimed"
        className="mt-3 h-2 overflow-hidden rounded-full bg-info-light"
      >
        <div className="h-full origin-left animate-grow-x rounded-full bg-danger" style={{ width: `${claimed}%` }} />
      </div>
      <p className="mt-1.5 flex justify-between text-xs">
        <span className="text-muted">Claimed: {claimed}%</span>
        <span className="font-semibold text-danger">{soldOut ? "Sold out" : fewLeft ? `Only ${product.stock} left` : `${product.stock} left`}</span>
      </p>

      <button
        type="button"
        onClick={handleAdd}
        disabled={soldOut}
        className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-navy text-base font-medium text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:bg-line-soft disabled:text-muted"
      >
        <MdOutlineAddShoppingCart size={18} aria-hidden="true" />
        {soldOut ? "Sold out" : "Quick Add"}
      </button>
    </article>
  );
};

export default FlashDealCard;
```

```tsx
// FlashSale.tsx client/src/components/home/FlashSale.tsx
// "FLASH SUPER SALE · ENDING SOON / Limited Rush Deals": the blue banner with a countdown to midnight,
// and the products tagged "flash-deal".

// STEP 33 (part 4): The flash sale

import { MdBolt } from "react-icons/md";
import { useApi } from "../../hooks/useApi";
import { useCountdown } from "../../hooks/useCountdown";
import type { ProductsResponse } from "../../types/api";
import FlashDealCard from "../product/FlashDealCard";

// The sale "ends" at midnight tonight (the shopper's time). Worked out once, when the file loads.
const midnight = new Date();
midnight.setHours(24, 0, 0, 0); // 24:00 today = 00:00 tomorrow

// 7 -> "07"
const twoDigits = (value: number) => String(value).padStart(2, "0");

const FlashSale = () => {
  const { data, error, loading } = useApi<ProductsResponse>("/products?tag=flash-deal&limit=4");
  const { hours, minutes, seconds } = useCountdown(midnight);

  if (error || (!loading && !data?.products.length)) return null;

  const units = [
    { value: hours, label: "Hours" },
    { value: minutes, label: "Mins" },
    { value: seconds, label: "Secs" },
  ];

  return (
    // id="flash-sale": the footer's "Daily Flash Deals" link jumps here (/#flash-sale)
    <section id="flash-sale" aria-labelledby="flash-title" className="scroll-mt-28">
      <div className="mb-6 flex flex-col gap-6 overflow-hidden rounded-3xl bg-linear-to-r from-primary to-primary-hover p-8 text-white shadow-banner md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-3 flex w-fit items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold tracking-wide uppercase">
            <MdBolt size={14} aria-hidden="true" className="text-mint" /> Flash super sale · Ending soon
          </p>
          <h2 id="flash-title" className="text-3xl leading-9 font-bold tracking-tight">
            Limited Rush Deals — Save Up to 50%
          </h2>
          <p className="mt-2 max-w-100 text-[15px] leading-6 text-white/80">
            Genuine items in strictly limited stock. Prices reset immediately after the countdown ends.
          </p>
        </div>

        {/* role="timer" + aria-live="off": screen readers don't read it out every second */}
        <div role="timer" aria-live="off" aria-label={`Ends in ${hours} hours ${minutes} minutes`} className="flex items-center gap-2">
          {units.map((unit, index) => (
            <div key={unit.label} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true" className="text-xl font-bold">:</span>}
              <span className="flex w-17 flex-col items-center rounded-xl bg-ink/30 py-2.5">
                {/* key={value}: each new number is a new element, so the "tick" animation plays */}
                <span key={unit.value} className="animate-tick text-xl leading-6 font-bold">
                  {twoDigits(unit.value)}
                </span>
                <span className="text-[10px] tracking-wide text-white/70 uppercase">{unit.label}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }, (_, index) => (
              <li key={index} aria-hidden="true" className="h-120 animate-pulse rounded-3xl bg-surface shadow-card" />
            ))
          : data?.products.map((product) => (
              <li key={product._id} className="flex">
                <FlashDealCard product={product} />
              </li>
            ))}
      </ul>
    </section>
  );
};

export default FlashSale;
```

**Things worth understanding:**

- **"Claimed: 82%"** uses `flashSaleStock` (server STEP 8): how many units the sale offered. AeroPro: 33 offered, 6
  left → 27 claimed → 82%, exactly the design's number. When stock goes down (real orders), the bar grows.
- **`setInterval` + clean-up:** the countdown re-draws every second. The clean-up (`clearInterval`) stops the timer
  when you leave the page; without it, timers would pile up every time you came back to Home.
- **`setHours(24, 0, 0, 0)`** = midnight tonight. JavaScript turns "24:00 today" into "00:00 tomorrow" by itself.
  (It's worked out when the page loads: a shopper who keeps the tab open past midnight sees 00:00:00 until they
  refresh. Fine for a demo.)
- **`key={unit.value}`** on the number: the same trick as the cart badge, so your `animate-tick` animation plays every
  second.
- **`id="flash-sale"`**: the Footer's "Daily Flash Deals" link (`/#flash-sale`) points here. `scroll-mt-28` leaves room
  for the sticky Navbar.

### 33.5 `src/components/home/TodaysDeal.tsx`

```tsx
// TodaysDeal.tsx client/src/components/home/TodaysDeal.tsx
// "24-HOUR EXCLUSIVES / Today's Deals": a row you scroll sideways (with ‹ › buttons), each card saying how much
// you save. The products tagged "deal".

// STEP 33 (part 5): Today's deals

import { useRef } from "react";
import { MdChevronLeft, MdChevronRight, MdOutlineLocalOffer } from "react-icons/md";
import { useApi } from "../../hooks/useApi";
import type { ProductsResponse } from "../../types/api";
import { naira } from "../../utils/format";
import SectionHeader from "../common/SectionHeader";
import ProductCard from "../product/ProductCard";

const arrowClasses =
  "flex size-10 items-center justify-center rounded-full bg-surface text-ink shadow-card transition-colors hover:bg-field disabled:opacity-40";

const TodaysDeal = () => {
  const { data, error, loading } = useApi<ProductsResponse>("/products?tag=deal&limit=8");
  const rowRef = useRef<HTMLUListElement>(null); // the scrolling list, so the arrows can move it

  if (error || (!loading && !data?.products.length)) return null;

  // Move the row by about one card ("smooth" = animated)
  const scrollBy = (direction: 1 | -1) => {
    rowRef.current?.scrollBy({ left: direction * 300, behavior: "smooth" });
  };

  return (
    <section aria-labelledby="deals-title">
      <SectionHeader eyebrow="24-hour exclusives" eyebrowIcon={MdOutlineLocalOffer} title="Today's Deals" titleId="deals-title">
        <div className="flex gap-2">
          <button type="button" onClick={() => scrollBy(-1)} aria-label="Previous deals" className={arrowClasses}>
            <MdChevronLeft size={22} />
          </button>
          <button type="button" onClick={() => scrollBy(1)} aria-label="More deals" className={arrowClasses}>
            <MdChevronRight size={22} />
          </button>
        </div>
      </SectionHeader>

      {/* overflow-x-auto: the row scrolls sideways (swipe on phones). snap: it stops neatly on a card. */}
      <ul ref={rowRef} className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-4 pt-1 pb-4 md:mx-0 md:px-0">
        {loading
          ? Array.from({ length: 4 }, (_, index) => (
              <li key={index} aria-hidden="true" className="h-105 w-70 shrink-0 animate-pulse rounded-3xl bg-surface shadow-card" />
            ))
          : data?.products.map((product) => (
              <li key={product._id} className="flex w-70 shrink-0 snap-start">
                <ProductCard
                  product={product}
                  // "Save ₦12,000": green when it's a small saving, red when it's a big one (like the design)
                  badge={
                    product.oldPrice
                      ? {
                          label: `Save ${naira(product.oldPrice - product.price)}`,
                          className: product.oldPrice - product.price >= 10000 ? "bg-danger text-white" : "bg-success text-white",
                        }
                      : undefined
                  }
                  details={<p className="text-[13px] text-muted">{product.tagline ?? product.brand}</p>}
                />
              </li>
            ))}
      </ul>
    </section>
  );
};

export default TodaysDeal;
```

- **`overflow-x-auto` + `snap-x`**: the row scrolls sideways (swipe on a phone), and stops neatly at a card.
- **`useRef`** gives the arrow buttons the real `<ul>`, so `scrollBy({ left: 300 })` can move it.
- **"Save ₦12,000"** = `oldPrice - price`, worked out on the page.

### 33.6 `src/components/home/BestSellers.tsx`, `NewArrivals.tsx`, `RecommendedForYou.tsx`

```tsx
// BestSellers.tsx client/src/components/home/BestSellers.tsx
// "MOST WANTED / Best Sellers in Nigeria": the 4 products with the most sales (?sort=best-selling, server STEP 16),
// ranked "#1 BEST SELLER" to "#4", with the brand and "(1,420+ sold)".

// STEP 33 (part 6): Best sellers

import { MdStar, MdVerified } from "react-icons/md";
import ProductCard from "../product/ProductCard";
import ProductSection from "./ProductSection";

const BestSellers = () => {
  return (
    <ProductSection
      eyebrow="Most wanted"
      title="Best Sellers in Nigeria"
      titleId="best-title"
      query="sort=best-selling&limit=4"
      link={{ to: "/shop?sort=best-selling", label: "See leaderboard" }}
      renderCard={(product, index) => (
        <ProductCard
          product={product}
          badge={{ label: `#${index + 1} Best seller`, className: "bg-warning text-white" }}
          details={
            <div className="flex flex-col gap-1 text-[13px]">
              <p className="flex items-center gap-1 font-medium text-success">
                <MdVerified size={15} aria-hidden="true" /> {product.brand}
              </p>
              <p className="flex items-center gap-1 text-muted">
                <MdStar size={15} aria-hidden="true" className="text-warning" />
                <span className="font-semibold text-ink">{product.ratings.toFixed(1)}</span>
                ({product.sold.toLocaleString("en-NG")}+ sold)
              </p>
            </div>
          }
        />
      )}
    />
  );
};

export default BestSellers;
```

```tsx
// NewArrivals.tsx client/src/components/home/NewArrivals.tsx
// "JUST IN CATALOG / New Arrivals": the products tagged "new-arrival", each with a blue NEW badge.

// STEP 33 (part 7): New arrivals

import { MdOutlineVerified } from "react-icons/md";
import ProductCard from "../product/ProductCard";
import ProductSection from "./ProductSection";

const NewArrivals = () => {
  return (
    <ProductSection
      eyebrow="Just in catalog"
      eyebrowIcon={MdOutlineVerified}
      title="New Arrivals"
      titleId="new-title"
      query="tag=new-arrival&limit=4"
      link={{ to: "/shop?tag=new-arrival", label: "See all new in" }}
      renderCard={(product) => (
        <ProductCard
          product={product}
          badge={{ label: "New", className: "bg-primary text-white" }}
          details={<p className="text-[13px] text-muted">{product.tagline ?? product.brand}</p>}
        />
      )}
    />
  );
};

export default NewArrivals;
```

```tsx
// RecommendedForYou.tsx client/src/components/home/RecommendedForYou.tsx
// "TAILORED PICKS / Recommended for You": the products tagged "recommended", on a soft blue panel.

// STEP 33 (part 8): Recommended for you

import { MdAutoAwesome } from "react-icons/md";
import ProductCard from "../product/ProductCard";
import ProductSection from "./ProductSection";

const RecommendedForYou = () => {
  return (
    <ProductSection
      eyebrow="Tailored picks"
      eyebrowIcon={MdAutoAwesome}
      title="Recommended for You"
      titleId="recommended-title"
      query="tag=recommended&limit=4"
      aside={<p className="hidden text-[13px] text-muted sm:block">Picked from our customers' favourites</p>}
      className="rounded-3xl border border-line-soft bg-panel p-6"
      renderCard={(product) => <ProductCard product={product} />}
    />
  );
};

export default RecommendedForYou;
```

The "See leaderboard" / "See all new in" links already point to the Shop page with the right filters
(`/shop?sort=best-selling`, `/shop?tag=new-arrival`). STEP 34 makes the Shop page read them.

### 33.7 `src/components/home/PromoBanner.tsx`

```tsx
// PromoBanner.tsx client/src/components/home/PromoBanner.tsx
// "SEASONAL CAMPAIGN / Mega Tech & Home Upgrade": the dark blue banner with the QUICK25 code and a Copy Code button.
// QUICK25 is a real code in the database (server STEP 21): ₦2,000 off orders of ₦25,000 or more.

// STEP 33 (part 9): The promo banner

import { MdArrowForward, MdOutlineCampaign } from "react-icons/md";
import { Link } from "react-router-dom";
import heroImg from "../../assets/images/Curated lifestyle essentials.png";
import { useToast } from "../../context/ToastContext";

const CODE = "QUICK25";

const PromoBanner = () => {
  const { showToast } = useToast();

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(CODE); // the browser's clipboard (needs https or localhost)
      showToast({ type: "success", title: `${CODE} copied`, message: "Paste it in your cart to save ₦2,000." });
    } catch {
      // Some browsers block the clipboard: tell them the code instead
      showToast({ type: "info", title: `Your code is ${CODE}`, message: "Type it in the promo box in your cart." });
    }
  };

  return (
    <section
      aria-labelledby="promo-title"
      className="grid overflow-hidden rounded-3xl bg-linear-to-r from-footer via-primary to-primary text-white shadow-banner lg:grid-cols-[1.4fr_1fr]"
    >
      <div className="p-8 md:p-10">
        <p className="mb-4 flex w-fit items-center gap-1.5 rounded-full bg-mint px-3 py-1 text-xs font-bold tracking-wide text-forest uppercase">
          <MdOutlineCampaign size={16} aria-hidden="true" /> Seasonal campaign
        </p>
        <h2 id="promo-title" className="max-w-110 text-4xl leading-11 font-extrabold tracking-tight md:text-5xl md:leading-14">
          Mega Tech &amp; Home Upgrade
        </h2>
        <p className="mt-3 max-w-120 text-base leading-6.5 text-white/80">
          Transform your workspace and living quarters with verified electronics and modern interior picks. Get ₦2,000
          off any order of ₦25,000 or more.
        </p>

        <div className="mt-6 flex w-fit items-center gap-6 rounded-2xl border border-white/20 bg-white/10 py-3 pr-3 pl-4">
          <div>
            <p className="text-[11px] tracking-wide text-white/70 uppercase">Checkout coupon code</p>
            <p className="font-mono text-xl font-bold tracking-wider text-mint">{CODE}</p>
          </div>
          <button type="button" onClick={copyCode} className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-field">
            Copy Code
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link
            to="/shop"
            className="flex h-12 items-center gap-2 rounded-xl bg-success px-6 font-semibold text-white transition-colors hover:bg-forest"
          >
            Explore Promotion <MdArrowForward size={18} aria-hidden="true" />
          </Link>
          <p className="text-[13px] text-white/70">Valid on orders of ₦25,000 or more</p>
        </div>
      </div>

      <div className="relative hidden p-6 lg:block">
        <img src={heroImg} alt="" className="h-full w-full rounded-2xl object-cover" />
        <p className="absolute right-10 bottom-10 left-10 flex items-center justify-between rounded-xl bg-ink/60 px-4 py-3 text-sm backdrop-blur-sm">
          <span>
            <span className="block text-xs text-white/70">Featured Bundle</span>
            <span className="font-semibold">Desk Sanctuary Setup</span>
          </span>
          <span className="font-semibold text-mint">Save ₦2,000</span>
        </p>
      </div>
    </section>
  );
};

export default PromoBanner;
```

**`navigator.clipboard.writeText`** copies text like Ctrl+C. Browsers only allow it on `https://` sites and on
`localhost`, and some block it anyway, so the `catch` shows the code in a toast instead.

### 33.8 `src/components/home/Testimonials.tsx`

```tsx
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
      <h2 id="testimonials-title" className="mx-auto max-w-150 text-3xl leading-10 font-bold tracking-tight text-ink md:text-4xl md:leading-11">
        Loved by over 25,000 shoppers across Nigeria
      </h2>
      <p className="mx-auto mt-2 max-w-155 text-base leading-6 text-ink-soft">
        See what everyday customers in Lagos, Abuja, and Port Harcourt have to say about QuickCart.
      </p>

      <ul className="mt-8 grid gap-6 text-left md:grid-cols-3">
        {testimonials.map((item) => (
          <li key={item.name}>
            {/* <figure> + <blockquote> + <figcaption>: the HTML way to write "a quote and who said it" */}
            <figure className="flex h-full flex-col rounded-3xl bg-surface p-6 shadow-card">
              <p className="mb-3 flex text-warning" role="img" aria-label="5 out of 5 stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <MdStar key={star} size={18} aria-hidden="true" />
                ))}
              </p>
              <blockquote className="flex-1 text-[15px] leading-6 text-ink">"{item.quote}"</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary">
                  {initials(item.name)}
                </span>
                <span>
                  <span className="block font-semibold text-ink">{item.name}</span>
                  <span className="text-sm text-muted">{item.city} · Verified Buyer</span>
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
```

### 33.9 `src/components/home/NewsletterBanner.tsx`

```tsx
// NewsletterBanner.tsx client/src/components/home/NewsletterBanner.tsx
// "JOIN QUICKCART CLUB": the email box at the bottom of the Home page. It uses your newsletter endpoint
// (POST /api/newsletter/subscribe, server STEP 24), which emails a welcome gift: the QUICK10 code.

// STEP 33 (part 11): The newsletter box

import { useState, type FormEvent } from "react";
import { MdCheckCircle, MdOutlineMail } from "react-icons/md";
import { api } from "../../utils/api";

const NewsletterBanner = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    try {
      // The server checks the email and answers with the message to show, e.g.
      // "Thanks for subscribing! Check your inbox for a welcome gift." or "You're already subscribed..."
      const reply = await api<{ message: string }>("/newsletter/subscribe", { method: "POST", body: { email } });
      setMessage(reply.message);
      setStatus("done");
      setEmail("");
    } catch (error) {
      setMessage((error as Error).message); // e.g. "Please enter a valid email address."
      setStatus("error");
    }
  };

  return (
    <section aria-labelledby="newsletter-title" className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-center text-white shadow-banner">
      <div aria-hidden="true" className="absolute -bottom-24 -left-24 size-80 rounded-full bg-white/10 blur-3xl" />
      <div aria-hidden="true" className="absolute -top-24 -right-24 size-80 rounded-full bg-[#4f7bd9]/40 blur-3xl" />

      <div className="relative">
        <p className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold tracking-wide uppercase">
          <MdOutlineMail size={18} aria-hidden="true" className="text-mint" /> Join QuickCart Club
        </p>
        <h2 id="newsletter-title" className="text-3xl leading-10 font-bold tracking-tight md:text-4xl">
          Get 10% Off Your Next Order
        </h2>
        <p className="mx-auto mt-2 max-w-140 text-base leading-6 text-white/80">
          Subscribe to QuickCart VIP Drops for flash deals, members-only secret drops, and a welcome code in your inbox.
        </p>

        {status === "done" ? (
          <p role="status" className="mx-auto mt-8 flex w-fit items-center gap-2 rounded-xl bg-white/15 px-5 py-3 font-medium">
            <MdCheckCircle size={22} aria-hidden="true" className="text-mint" /> {message}
          </p>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mx-auto mt-8 flex max-w-115 flex-col gap-3 sm:flex-row">
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
              aria-describedby={status === "error" ? "newsletter-error" : undefined}
              className="h-13 flex-1 rounded-xl bg-white px-4 text-ink outline-none placeholder:text-muted focus:ring-4 focus:ring-white/30"
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
          <p id="newsletter-error" role="alert" className="mt-3 text-sm font-medium text-[#ffdad6]">
            {message}
          </p>
        )}
        <p className="mt-4 text-[13px] text-white/70">No spam ever. Unsubscribe with 1 click at any time.</p>
      </div>
    </section>
  );
};

export default NewsletterBanner;
```

The messages come **from the server**: "Please enter a valid email address.", "Thanks for subscribing! Check your
inbox for a welcome gift.", "You're already subscribed to QuickCart VIP Drops." The website doesn't repeat the rules,
so they can never disagree.

### 33.10 Test it

`npm run seed` in the server (so stock and tags are as designed), both terminals running, then open the Home page.

| Look at / do                          | You should see                                                            |
| ------------------------------------- | ------------------------------------------------------------------------- |
| The flash sale                        | the blue banner; the clock counting down to midnight, second by second; 4 cards: **AeroPro Wireless Buds** -45% OFF, ⚡ Fast Deal, ₦16,500 ~~₦30,000~~, **Claimed: 82%**, **Only 6 left**; Smart Gooseneck Kettle 65% / 14 left; Botanical Radiance Elixir 90% / Only 3 left; Alloy Adjustable Stand 74% / 8 left |
| **Quick Add** on a flash card          | the "Added to Cart!" box                                                  |
| Today's Deals                         | 5 cards: "Save ₦12,000" Compact Mechanical Keypad, "Save ₦8,000" Insulated 1L Hydro Flask...; the **›** button slides the row |
| Best Sellers                          | #1 Wireless Noise-Cancelling Headphones (Aura Sound Labs, ★ 4.8, 1,420+ sold), #2 Canvas Low-Top Sneakers (980+ sold)... |
| The promo banner → **Copy Code**       | a toast: "QUICK25 copied" (paste it somewhere to check)                   |
| New Arrivals, Recommended for You      | 4 cards each, New Arrivals with blue NEW badges                           |
| Newsletter: type `abc` → Subscribe     | "Please enter a valid email address." (from the server)                   |
| Your own email → Subscribe            | "Thanks for subscribing! Check your inbox for a welcome gift." and the email with QUICK10 arrives (STEP 24) |
| Footer → **Daily Flash Deals**         | the page jumps to the flash sale                                          |
| Make the window narrow (phone size)   | 1 card per row; Today's Deals swipes sideways                             |

I tested all of this on a copy of your project against a throwaway database: **19 checks, all passed**. The
numbers above (82%, 90%, Save ₦12,000, 1,420+ sold...) are what the page showed, and they match the design. I compared
every section's screenshot with the design. `npm run build` and `npm run lint` pass.

### 33.11 Commit

```bash
cd ~/Desktop/QuickCarrt/client
git add .
git commit -m "STEP 33: home page sections"
git push
```

➡️ **Next: STEP 34 (The Shop page: category, price and search filters, sorting and pages, all kept in the address
bar so links like `/shop?category=electronics` work; the Navbar search box; and the Categories page).** Reply **NEXT**
when 33.10 works.

---

## STEP 34: The Shop page, search and the Categories page

By the end of this step:

- **Shop all products** (design: Shop): category chips, a search box, "All Categories" and "Sort" dropdowns, 24
  products per page, "Showing 1–24 of 40 items" and page buttons
- every choice is kept **in the address bar** (`/shop?category=electronics&sort=price-asc&page=2`), so the links
  you already have work: the Footer's categories, the Home rows' "View all", and Back/Forward undo filters
- the **Navbar search box** works: type and press Enter → `/shop?search=...`
- a **Categories** page with a card per department
- every new page opens **scrolled to the top**

| New / changed file                      | What it is                                                     |
| --------------------------------------- | -------------------------------------------------------------- |
| `components/common/Pagination.tsx`      | "‹ 1 2 3 … 7 ›", reused by Order History and the admin tables later |
| `components/common/EmptyState.tsx`      | the "No products found" box, reused for the empty cart and "no orders yet" |
| `components/layout/ScrollToTop.tsx`     | scrolls to the top on every new page                           |
| `components/layout/SearchBox.tsx`       | the Navbar search                                              |
| `pages/shop/ShopPage.tsx`               | the Shop page                                                  |
| `components/product/CategoryCard.tsx`, `pages/shop/CategoriesPage.tsx` | the Categories page              |

### 34.1 First, fix the cart badge from STEP 32

While testing this step on your code, the bag showed **a red dot with no number** even with an empty cart. In your
`Navbar.tsx` the new badge went *inside* the old `<span>` instead of replacing it:

```tsx
<span className="absolute -top-1 -right-1 ... animate-bumb ...">      {/* ❌ the OLD span: always shows an empty red dot */}
  {/* key={count}: ... */}
  {count > 0 && (
    <span key={count} ...>{count > 99 ? "99+" : count}</span>
  )}
</span>                                                               {/* ❌ its closing tag */}
```

Delete the outer `<span className="absolute -top-1 ...">` line and its closing `</span>` (just before `</Link>`). Keep
what's between them. After the fix, the inside of the cart `<Link>` is only:

```tsx
            <MdOutlineLocalMall size={20} aria-hidden="true" />
            {/* key={count}: a new number = a new element, so the "bump" animation plays again */}
            {count > 0 && (
              <span
                key={count}
                aria-hidden="true"
                className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 animate-bumb items-center justify-center rounded-full bg-danger px-1 text-xs leading-none font-bold text-white"
              >
                {count > 99 ? "99+" : count}
              </span>
            )}
```

Check: with an empty cart (DevTools → Application → Local Storage → delete `quickcart_cart`, refresh) there's **no** red
dot; add something and "1" appears in the corner.

### 34.2 `src/components/common/Pagination.tsx`

Replace the placeholder.

```tsx
// Pagination.tsx client/src/components/common/Pagination.tsx
// "‹ 1 2 3 4 … 7 ›" under a list. Used by the Shop page, and later Order History and the admin tables.
//   <Pagination page={2} pages={7} onChange={(page) => ...} />

// STEP 34 (part 1): Pagination

import { MdChevronLeft, MdChevronRight } from "react-icons/md";

type PaginationProps = {
  page: number;
  pages: number;
  onChange: (page: number) => void;
};

// Which buttons to show: always the first and last page, and the pages around the current one.
// Gaps become "…". pagesToShow(5, 10) -> [1, "…", 4, 5, 6, "…", 10]
const pagesToShow = (page: number, pages: number): (number | "…")[] => {
  const wanted = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages));
  const sorted = [...wanted].sort((a, b) => a - b);

  const result: (number | "…")[] = [];
  sorted.forEach((n, index) => {
    if (index > 0 && n - sorted[index - 1] > 1) result.push("…");
    result.push(n);
  });
  return result;
};

const buttonClasses =
  "flex size-10 items-center justify-center rounded-xl bg-surface text-sm font-medium text-ink shadow-card transition-colors hover:bg-field disabled:cursor-not-allowed disabled:opacity-40";

const Pagination = ({ page, pages, onChange }: PaginationProps) => {
  if (pages <= 1) return null; // one page: nothing to choose

  return (
    <nav aria-label="Pages" className="flex items-center gap-2">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page" className={buttonClasses}>
        <MdChevronLeft size={20} />
      </button>

      {pagesToShow(page, pages).map((item, index) =>
        item === "…" ? (
          <span key={`gap-${index}`} aria-hidden="true" className="px-1 text-muted">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? "page" : undefined} // tells screen readers "current page"
            aria-label={`Page ${item}`}
            className={item === page ? `${buttonClasses} bg-primary! text-white hover:bg-primary-hover!` : buttonClasses}
          >
            {item}
          </button>
        ),
      )}

      <button type="button" onClick={() => onChange(page + 1)} disabled={page >= pages} aria-label="Next page" className={buttonClasses}>
        <MdChevronRight size={20} />
      </button>
    </nav>
  );
};

export default Pagination;
```

- **`pagesToShow`** never shows 50 buttons: only the first page, the last, and the ones next to the current page.
  Gaps become "…".
- **`bg-primary!`**: the `!` at the end is Tailwind v4's "important", so the current page's blue wins over the white
  in `buttonClasses`.

### 34.3 `src/components/common/EmptyState.tsx`

Replace the placeholder.

```tsx
// EmptyState.tsx client/src/components/common/EmptyState.tsx
// The friendly "nothing here" box: an icon, a title, a sentence, and an optional button.
// Used when a search finds nothing (STEP 34), an empty cart (STEP 36), no orders yet (STEP 40)...
//   <EmptyState icon={MdSearchOff} title="No products found" text="Try another word." action={<button>...</button>} />

// STEP 34 (part 2): The empty state

import type { ReactNode } from "react";
import type { IconType } from "react-icons";

type EmptyStateProps = {
  icon: IconType;
  title: string;
  text?: string;
  action?: ReactNode;
};

const EmptyState = ({ icon: Icon, title, text, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center rounded-3xl bg-surface px-6 py-16 text-center shadow-card">
      <span className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
        <Icon size={32} aria-hidden="true" />
      </span>
      <h2 className="text-xl leading-7 font-bold text-ink">{title}</h2>
      {text && <p className="mt-2 max-w-100 text-[15px] leading-6 text-ink-soft">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;
```

### 34.4 `src/components/layout/ScrollToTop.tsx` and `src/components/layout/SearchBox.tsx`

Replace the `ScrollToTop` placeholder:

```tsx
// ScrollToTop.tsx client/src/components/layout/ScrollToTop.tsx
// React Router changes the page without reloading, so the browser keeps the old scroll position: click a product at
// the bottom of the Home page and its page would open scrolled to the bottom. This scrolls to the top on every new page.
// It draws nothing (returns null); MainLayout includes it once.

// STEP 34 (part 3): Scroll to the top on every new page

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation(); // only the path ("/shop"), so changing a filter (?sort=...) doesn't jump

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
```

New file `SearchBox.tsx`:

```tsx
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
    <form role="search" onSubmit={handleSubmit} className="relative hidden lg:block">
      <label htmlFor="header-search" className="sr-only">
        Search products, brands and categories
      </label>
      <MdSearch size={21} aria-hidden="true" className="pointer-events-none absolute top-3 left-3.25 text-muted" />
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
```

In `src/layouts/MainLayout.tsx`, add the import and put `<ScrollToTop />` first:

```tsx
import ScrollToTop from "../components/layout/ScrollToTop";
```

```tsx
    <>
      <ScrollToTop />
      <Navbar />
```

In `src/components/layout/Navbar.tsx`:

1. Remove `MdSearch` from the icons import, and import the new box:

   ```tsx
   import { MdOutlineLocalMall } from "react-icons/md";
   import SearchBox from "./SearchBox";
   ```

2. Replace the whole `<form role="search" ...> ... </form>` with:

   ```tsx
             <SearchBox />
   ```

The input looks exactly the same: `SearchBox` has your classes. It just has a `value`, an `onChange` and an `onSubmit`
now.

### 34.5 `src/pages/shop/ShopPage.tsx`

Replace the placeholder.

```tsx
// ShopPage.tsx client/src/pages/shop/ShopPage.tsx
// "Shop all products": category chips, search, category and sort dropdowns, 24 products per page. (Design: Shop)
// Every choice lives in the ADDRESS BAR (/shop?category=electronics&sort=price-asc&page=2), so:
//   - links from other pages work (the Footer, the Home rows' "View all", the Navbar search)
//   - Back and Forward undo and redo filters
//   - you can share or refresh a filtered page and get the same products

// STEP 34 (part 5): The Shop page

import { useEffect, useRef, useState } from "react";
import { MdClose, MdSearch, MdSearchOff } from "react-icons/md";
import { useSearchParams } from "react-router-dom";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import ProductCard from "../../components/product/ProductCard";
import { useApi } from "../../hooks/useApi";
import type { CategoriesResponse, ProductsResponse } from "../../types/api";

const PER_PAGE = 24; // like the design ("Showing 1-24")

// The server's sort names (server STEP 16) and what the dropdown says
const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "best-selling", label: "Best Selling" },
];

// The Home rows link here with a tag (?tag=new-arrival): show a readable name for it
const TAG_NAMES: Record<string, string> = {
  featured: "Featured",
  "new-arrival": "New Arrivals",
  recommended: "Recommended",
  deal: "Today's Deals",
  "flash-deal": "Flash Deals",
};

const chipClasses = (active: boolean) =>
  `shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
    active ? "bg-primary text-white" : "bg-surface text-ink-soft shadow-card hover:text-primary"
  }`;

const selectClasses =
  "h-12 cursor-pointer rounded-xl bg-surface px-4 text-[15px] font-medium text-ink shadow-card outline-none focus:ring-2 focus:ring-primary/30";

const ShopPage = () => {
  const [params, setParams] = useSearchParams();

  // Read the filters from the address bar (missing = the default)
  const category = params.get("category") ?? "";
  const search = params.get("search") ?? "";
  const tag = params.get("tag") ?? "";
  const sort = params.get("sort") ?? "featured";
  const page = Math.max(1, Number(params.get("page")) || 1);

  // Change some filters. Any change except the page itself goes back to page 1
  // (page 3 of "all products" may not exist for "Books").
  // setParams((current) => ...) gets the address as it is RIGHT NOW, so a late update (the search timer below)
  // never undoes a filter clicked in the meantime.
  const update = (changes: Record<string, string>) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      for (const [key, value] of Object.entries(changes)) {
        if (value && !(key === "sort" && value === "featured")) next.set(key, value);
        else next.delete(key); // empty, or the default: keep the address short
      }
      if (!("page" in changes)) next.delete("page");
      return next;
    });
  };

  // The search box: typing updates the address 0.4s after you stop (debouncing, like the register email check)
  const [searchText, setSearchText] = useState(search);
  const [lastSearch, setLastSearch] = useState(search);
  if (search !== lastSearch) {
    // The search changed from OUTSIDE this box (the Navbar search, Back button): show it in the box.
    // (Setting state while rendering is React's recommended way to follow a value like this.)
    setLastSearch(search);
    setSearchText(search);
  }
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const handleSearchChange = (value: string) => {
    setSearchText(value);
    clearTimeout(searchTimer.current); // typed again before 0.4s: forget the previous timer
    searchTimer.current = setTimeout(() => update({ search: value.trim() }), 400);
  };
  // Leaving the page: cancel a waiting timer, or it would bring you back to /shop
  useEffect(() => () => clearTimeout(searchTimer.current), []);

  // The same filters, as the server's query string
  const query = new URLSearchParams({ limit: String(PER_PAGE), page: String(page) });
  if (category) query.set("category", category);
  if (search) query.set("search", search);
  if (tag) query.set("tag", tag);
  if (sort !== "featured") query.set("sort", sort);

  const { data, error, loading, reload } = useApi<ProductsResponse>(`/products?${query}`);
  const { data: categoryData } = useApi<CategoriesResponse>("/categories");
  const categories = categoryData?.categories ?? [];

  const currentCategory = categories.find((item) => item.slug === category);
  const title = search ? `Results for "${search}"` : currentCategory ? currentCategory.name : tag ? TAG_NAMES[tag] ?? "Shop all products" : "Shop all products";
  const hasFilters = Boolean(category || search || tag);

  const goToPage = (next: number) => {
    update({ page: String(next) });
    window.scrollTo({ top: 0, behavior: "smooth" }); // back to the top of the new page
  };

  const first = data ? (data.page - 1) * PER_PAGE + 1 : 0;
  const last = data ? Math.min(data.page * PER_PAGE, data.total) : 0;

  return (
    <div className="mx-auto max-w-360 px-4 pt-10 pb-20 md:px-12">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <h1 className="text-4xl leading-11 font-extrabold tracking-tight text-ink md:text-5xl md:leading-14">{title}</h1>

        {/* The quick chips: All + the first 6 categories (the dropdown below has all of them) */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
          <button type="button" onClick={() => update({ category: "" })} className={chipClasses(!category)}>
            All
          </button>
          {categories.slice(0, 6).map((item) => (
            <button key={item._id} type="button" onClick={() => update({ category: item.slug })} className={chipClasses(category === item.slug)}>
              {item.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <label htmlFor="shop-search" className="sr-only">
            Search products
          </label>
          <MdSearch size={22} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
          <input
            id="shop-search"
            type="search"
            value={searchText}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search products, brands and tags..."
            className="h-12 w-full rounded-xl bg-surface pr-4 pl-12 text-[15px] text-ink shadow-card outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <label htmlFor="shop-category" className="sr-only">
          Category
        </label>
        <select id="shop-category" value={category} onChange={(event) => update({ category: event.target.value })} className={selectClasses}>
          <option value="">All Categories</option>
          {categories.map((item) => (
            <option key={item._id} value={item.slug}>
              {item.name} ({item.productCount})
            </option>
          ))}
        </select>

        <label htmlFor="shop-sort" className="sr-only">
          Sort by
        </label>
        <select id="shop-sort" value={sort} onChange={(event) => update({ sort: event.target.value })} className={selectClasses}>
          {SORTS.map((option) => (
            <option key={option.value} value={option.value}>
              Sort: {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* The active filters, each with an ✕ to remove it */}
      {hasFilters && (
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
          {[
            category && { key: "category", label: currentCategory?.name ?? category },
            tag && { key: "tag", label: TAG_NAMES[tag] ?? tag },
            search && { key: "search", label: `"${search}"` },
          ]
            .filter((chip): chip is { key: string; label: string } => Boolean(chip))
            .map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => update({ [chip.key]: "" })}
                aria-label={`Remove filter ${chip.label}`}
                className="flex items-center gap-1 rounded-full bg-primary-light py-1 pr-2 pl-3 font-medium text-primary hover:bg-info-light"
              >
                {chip.label} <MdClose size={16} aria-hidden="true" />
              </button>
            ))}
          <button type="button" onClick={() => setParams({})} className="ml-1 font-semibold text-muted hover:text-ink">
            Clear all
          </button>
        </div>
      )}

      {error ? (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-danger-light p-4 text-sm text-danger">
          <p>{error}</p>
          <button type="button" onClick={reload} className="font-semibold underline">
            Try again
          </button>
        </div>
      ) : !data && loading ? (
        <ul aria-hidden="true" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <li key={index} className="h-105 animate-pulse rounded-3xl bg-surface shadow-card" />
          ))}
        </ul>
      ) : data && data.products.length === 0 ? (
        <EmptyState
          icon={MdSearchOff}
          title="No products found"
          text={search ? `Nothing matches "${search}". Check the spelling, or try a shorter word.` : "There's nothing here yet. Try another category."}
          action={
            <button type="button" onClick={() => setParams({})} className="h-11 rounded-xl bg-primary px-6 font-semibold text-white hover:bg-primary-hover">
              Show all products
            </button>
          }
        />
      ) : (
        data && (
          <>
            {/* While new results load, the old ones stay but fade (aria-busy tells screen readers it's updating) */}
            <ul aria-busy={loading} className={`grid grid-cols-1 gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-4 ${loading ? "opacity-50" : ""}`}>
              {data.products.map((product) => (
                <li key={product._id} className="flex">
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
              <p className="text-sm text-ink-soft">
                Showing{" "}
                <strong className="text-ink">
                  {first}–{last}
                </strong>{" "}
                of <strong className="text-ink">{data.total}</strong> {data.total === 1 ? "item" : "items"}
              </p>
              <Pagination page={data.page} pages={data.pages} onChange={goToPage} />
            </div>
          </>
        )
      )}
    </div>
  );
};

export default ShopPage;
```

**Things worth understanding:**

- **`useSearchParams`** reads and writes the part of the address after `?`. The filters are *not* in `useState`: the
  address IS the state. That's what makes `/shop?category=home-living` from your Footer work, and Back undo a filter.
- **`update({ category: "fashion" })`** changes only what you pass and goes back to page 1 (page 3 of "everything"
  may not exist for "Books"). The default sort (`featured`) is left out of the address to keep it short.
- **`setParams((current) => ...)`** builds the new address from the address *as it is now*. The search box updates
  it 0.4 s after you stop typing; if you click a chip in those 0.4 s, the late update keeps your chip. (The linter
  pointed out the problem with my first version, which used an effect.)
- **The search box keeps its own text** (`searchText`) so typing feels instant, and only puts it in the address after
  0.4 s. When the search changes from *outside* (the Navbar search, the Back button), the `if (search !==
  lastSearch)` block copies it into the box. Setting state during render like this is React's recommended way to
  "follow" a value without an effect.
- **The clean-up `useEffect`** cancels a waiting search timer when you leave the page. Without it, typing and then
  quickly clicking a product would bring you back to `/shop`.
- **4 states**: the error with Try again, grey boxes on the very first load, "No products found", and the products.
  When you change a filter, the old products stay **faded** until the new ones arrive (`aria-busy`), instead of
  flashing empty.

### 34.6 The Categories page: `src/components/product/CategoryCard.tsx` and `src/pages/shop/CategoriesPage.tsx`

Replace both placeholders. There's no design for this page, so it uses the Home page's style.

```tsx
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
      <p className="mt-1 text-sm text-muted">{plural(category.productCount, "product")}</p>
      <span className="mt-6 flex items-center gap-1 text-sm font-semibold text-primary-hover">
        Shop now <MdArrowForward size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
};

export default CategoryCard;
```

```tsx
// CategoriesPage.tsx client/src/pages/shop/CategoriesPage.tsx
// /categories: every department as a big card. (There's no design for it, so it reuses the Home page's style.)

// STEP 34 (part 7): The Categories page

import CategoryCard from "../../components/product/CategoryCard";
import { useApi } from "../../hooks/useApi";
import type { CategoriesResponse } from "../../types/api";

const CategoriesPage = () => {
  const { data, error, loading, reload } = useApi<CategoriesResponse>("/categories");

  return (
    <div className="mx-auto max-w-360 px-4 pt-10 pb-20 md:px-12">
      <p className="text-[11px] font-bold tracking-wider text-primary uppercase">Explore departments</p>
      <h1 className="mt-1 text-4xl leading-11 font-extrabold tracking-tight text-ink md:text-5xl md:leading-14">Shop by category</h1>
      <p className="mt-2 mb-8 max-w-140 text-base leading-6.5 text-ink-soft">
        Everything we sell, by department. Pick one to see all its products.
      </p>

      {error ? (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-danger-light p-4 text-sm text-danger">
          <p>{error}</p>
          <button type="button" onClick={reload} className="font-semibold underline">
            Try again
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }, (_, index) => <li key={index} aria-hidden="true" className="h-60 animate-pulse rounded-3xl bg-surface shadow-card" />)
            : data?.categories.map((category) => (
                <li key={category._id}>
                  <CategoryCard category={category} />
                </li>
              ))}
        </ul>
      )}
    </div>
  );
};

export default CategoriesPage;
```

### 34.7 Test it

After `npm run seed`, both terminals running:

| Do this                                                       | You should see                                         |
| ------------------------------------------------------------- | ------------------------------------------------------ |
| Click **Shop** in the Navbar                                   | "Shop all products", 24 cards (headphones first), "Showing **1–24** of **40** items", buttons 1 2 › |
| Click **2**                                                    | the address is `/shop?page=2`, 16 cards, "Showing 25–40 of 40", the page scrolls up |
| Click the **Electronics** chip                                 | `/shop?category=electronics`, title "Electronics", 15 products, back on page 1 |
| Sort: **Price: Low to High**                                   | `...&sort=price-asc`, cheapest first                   |
| Press the browser's **Back** button                            | the sort is undone and the dropdown says Featured again |
| Type `aura` in the page's search box and wait                  | after a moment: `...&search=aura`, title `Results for "aura"`, chips for Electronics and "aura" |
| Click the ✕ on the Electronics chip                            | `/shop?search=aura`: all categories                    |
| Search `zzzzqqq`                                               | "No products found"; **Show all products** clears everything |
| Type `kettle` in the **Navbar** search and press Enter          | `/shop?search=kettle`, the page's box says "kettle", 2 kettles |
| Home → "See all new in" / "See leaderboard"; Footer → "Home & Living" | New Arrivals (4) / best-selling order / Home & Living (3) |
| `/shop?category=toys`                                          | "No products found" (not an error)                     |
| Scroll down the Shop page, click a product                     | its page opens at the **top**                          |
| **Categories** in the Navbar                                   | 8 cards (Electronics 15 products, Fashion 6...); a card opens the Shop page on that category |
| Narrow window (phone)                                          | chips scroll sideways, the dropdowns stack, 1 card per row |

I tested all of this on a copy of your project against a throwaway database: **30 checks, all passed** (one only
needed a second longer on the slow connection; I re-checked it by hand). I compared the screenshots with the design.
`npm run build` and `npm run lint` pass. The test is also what found the cart badge bug in 34.1.

### 34.8 Commit

```bash
cd ~/Desktop/QuickCarrt/client
git add .
git commit -m "STEP 34: shop page, search, categories page"
git push
```

➡️ **Next: STEP 35 (Product Details: the photo gallery, colours, quantity, Add to Cart, the ♡ save button, the specs
and highlights, reviews with the star bars and "Write a review", Frequently Bought Together, Related Products, and
Recently Viewed on the Home page).** Reply **NEXT** when 34.7 works.
