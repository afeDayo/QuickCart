# QuickCart API: Postman Test & Demo Guide

This guide teaches you **Postman from zero** and then walks you through **every one of the 58 endpoints**
of the QuickCart server, in an order that tells a story you can demonstrate:

> a shopper browses the shop → signs up → checks out → the admin ships the order → the shopper reviews it →
> the admin looks at the dashboard → the demo is reset.

For every endpoint you get:

- 🧭 **What it does on the website** (which page, which button), so you can explain it
- 📂 **Where its code is** (the controller file and the function name), so you can open it and show it
- 📮 **Exactly what to type in Postman**
- ✅ **What you should see**, and the "mistakes on purpose" that show the rules work

---

## Table of contents

- [Part A: Postman for complete beginners](#part-a-postman-for-complete-beginners)
  - [A1. What is Postman?](#a1-what-is-postman)
  - [A2. Install it](#a2-install-it)
  - [A3. Start the server first](#a3-start-the-server-first)
  - [A4. Your first request](#a4-your-first-request)
  - [A5. The Postman screen, piece by piece](#a5-the-postman-screen-piece-by-piece)
  - [A6. Make a Collection (a folder for your requests)](#a6-make-a-collection-a-folder-for-your-requests)
  - [A7. Make an Environment (saved values like the server address and tokens)](#a7-make-an-environment-saved-values-like-the-server-address-and-tokens)
  - [A8. How to send JSON (a "body")](#a8-how-to-send-json-a-body)
  - [A9. How to log in as someone (tokens)](#a9-how-to-log-in-as-someone-tokens)
  - [A10. Make Postman save the token for you (optional magic)](#a10-make-postman-save-the-token-for-you-optional-magic)
  - [A11. Query params (the `?something=value` part)](#a11-query-params-the-somethingvalue-part)
  - [A12. Uploading a photo (form-data)](#a12-uploading-a-photo-form-data)
  - [A13. Reading the answer: status codes](#a13-reading-the-answer-status-codes)
- [Part B: Where the code lives](#part-b-where-the-code-lives)
- [Part C: Testing every endpoint (the demo, in order)](#part-c-testing-every-endpoint-the-demo-in-order)
  - [0. Health check](#0-health-check)
  - [1. Categories (2)](#1-categories-2-endpoints)
  - [2. Products (2)](#2-products-2-endpoints)
  - [3. Accounts: register, log in, me, log out (5)](#3-accounts-register-log-in-me-log-out-5-endpoints)
  - [4. Email verification and forgot password (5)](#4-email-verification-and-forgot-password-5-endpoints)
  - [5. My Account: profile, password, addresses, saved items (9)](#5-my-account-profile-password-addresses-saved-items-9-endpoints)
  - [6. Promo codes (1)](#6-promo-codes-1-endpoint)
  - [7. Orders: checkout and my orders (5)](#7-orders-checkout-and-my-orders-5-endpoints)
  - [8. Admin: orders and customers (5)](#8-admin-orders-and-customers-5-endpoints)
  - [9. Reviews (6)](#9-reviews-6-endpoints)
  - [10. Newsletter (2)](#10-newsletter-2-endpoints)
  - [11. Admin: photos, products, categories (11)](#11-admin-photos-products-categories-11-endpoints)
  - [12. Admin dashboard (1)](#12-admin-dashboard-1-endpoint)
  - [13. Demo panel (2)](#13-demo-panel-2-endpoints)
- [Part D: A 10-minute demo script](#part-d-a-10-minute-demo-script)
- [Part E: When something goes wrong](#part-e-when-something-goes-wrong)

---

# Part A: Postman for complete beginners

## A1. What is Postman?

Your website (the React client) talks to your server by sending it **requests**, like little letters:

> "Dear server, please GIVE me the list of products." → the server writes back: "Here are 40 products."

**Postman is an app that lets YOU write those letters by hand**, without the website. It's how you prove
the server works on its own, and it's perfect for a demo: you click **Send** and everyone sees the answer.

Every letter (request) has:

| Part        | Think of it as...                    | Example                                  |
| ----------- | ------------------------------------ | ---------------------------------------- |
| **Method**  | what you want to do                  | `GET` = give me, `POST` = create, `PATCH` = change, `DELETE` = remove |
| **URL**     | who you're writing to                | `http://localhost:5000/api/products`     |
| **Headers** | notes on the envelope                | "I'm logged in, here's my token"         |
| **Body**    | what's inside the letter             | `{ "email": "...", "password": "..." }`  |

And every answer (response) has:

| Part            | Think of it as...      | Example                         |
| --------------- | ---------------------- | ------------------------------- |
| **Status code** | a mood face            | `200` 😀 OK, `404` 🤷 not found, `401` 🔒 log in first |
| **Body**        | the reply letter       | `{ "products": [ ... ] }`       |

## A2. Install it

1. Go to **https://www.postman.com/downloads/** and download Postman for Windows.
2. Open the file you downloaded. Postman installs itself and opens.
3. It asks you to sign in. Make a free account (or sign in with Google). Signing in lets Postman remember
   your requests.
4. You land on a **Workspace** (your desk). The default "My Workspace" is fine.

## A3. Start the server first

Postman only writes letters. Someone has to be home to answer them: **your server must be running.**

Open **Git Bash** (or the VS Code terminal) and type:

```bash
cd ~/Desktop/QuickCarrt/server
npm run seed
npm run dev
```

- `npm run seed` fills the database with the demo data: 8 categories, 40 products, the admin, Ada and 4
  more shoppers, 2 promo codes and 41 demo orders. **It wipes everything else**, so run it at the start
  of a test session (not in the middle).
- `npm run dev` starts the server. Wait until you see:

```
MongoDB connected: ...
QuickCart API running on http://localhost:5000
```

**Leave this window open** the whole time. If you close it, the server stops and Postman gets "Could not
send request".

> Check your `server/.env` has `DEMO_MODE=true`. That turns on the demo panel, and makes the server put
> email codes and reset links **in the reply**, so you don't need to open an inbox during a demo.

The demo accounts:

| Who            | Email                    | Password       |
| -------------- | ------------------------ | -------------- |
| Admin          | `admin@quickcart.ng`     | `Admin@12345`  |
| Ada (customer) | `ada.obi@example.com`    | `Password@123` |
| Other shoppers | `tunde.adeleke@example.com`, `chioma.nwosu@example.com`, `emeka.okafor@example.com`, `fatima.danjuma@example.com` | `Password@123` |

## A4. Your first request

Let's say hello to the server.

1. In Postman, click the **+** tab near the top (or **New → HTTP**). A blank request opens.
2. On the left of the long bar, there's a dropdown that says **GET**. Leave it as **GET**.
3. Click in the long bar ("Enter URL or paste text") and type:
   ```
   http://localhost:5000/api/health
   ```
4. Click the blue **Send** button on the right.
5. Look at the bottom half of the screen. You should see:
   - a green **200 OK**
   - this body:
     ```json
     { "status": "ok", "message": "QuickCart API is running" }
     ```

🎉 You just talked to your server. Everything else in this guide is the same idea with different methods,
URLs and bodies.

## A5. The Postman screen, piece by piece

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [GET ▼] [ http://localhost:5000/api/products?limit=2        ] [ Send ]  │  ← method, URL, Send
├──────────────────────────────────────────────────────────────────────────┤
│ Params | Authorization | Headers | Body | Scripts | Settings             │  ← tabs for the REQUEST
│  (what you click depends on the request: see below)                     │
├──────────────────────────────────────────────────────────────────────────┤
│ Body | Cookies | Headers | Test Results          200 OK  143 ms  2.1 KB │  ← the ANSWER
│ {                                                                        │
│   "products": [ ... ]                                                    │
│ }                                                                        │
└──────────────────────────────────────────────────────────────────────────┘
```

| Tab             | When you use it in this guide                                          |
| --------------- | ---------------------------------------------------------------------- |
| **Params**      | to add `?search=...&page=2` without typing it in the URL (A11)          |
| **Authorization** | to say who you're logged in as (A9)                                  |
| **Headers**     | almost never: Postman fills them in for you                              |
| **Body**        | to send data with POST and PATCH (A8), or a photo (A12)                  |
| **Scripts**     | optional: to save tokens automatically (A10)                             |

In the answer area, keep **Pretty** and **JSON** selected so the reply is colourful and indented.

## A6. Make a Collection (a folder for your requests)

So you don't retype everything during the demo, save each request in a **Collection**.

1. On the left sidebar, click **Collections**, then the **+** (or **Create Collection**).
2. Name it **QuickCart API**.
3. Hover over the collection, click the **⋯** (three dots) → **Add folder**. Make one folder per section of
   Part C: `0 Health`, `1 Categories`, `2 Products`, `3 Accounts`, ... up to `13 Demo panel`.
4. When a request works, press **Ctrl + S** (or the **Save** button), give it a clear name like
   `Login as Ada`, and choose the right folder.

During the demo you just click a saved request in the sidebar and press **Send**.

## A7. Make an Environment (saved values like the server address and tokens)

Typing `http://localhost:5000/api` 58 times is boring, and tokens are long. An **Environment** is a little
notebook of values with names. You write `{{baseUrl}}` and Postman swaps in the real value.

1. Left sidebar → **Environments** → **+** (Create Environment).
2. Name it **QuickCart Local**.
3. Add these rows (Variable / Initial value). Leave the ones without a value empty for now; you'll fill
   them in as you go:

| Variable        | Initial value                  | What it is                                 |
| --------------- | ------------------------------ | ------------------------------------------ |
| `baseUrl`       | `http://localhost:5000/api`    | the start of every URL                      |
| `adminToken`    |                                | the admin's login token                     |
| `adaToken`      |                                | Ada's login token                           |
| `newToken`      |                                | the token of the account you register       |
| `productId`     |                                | a product's `_id`                           |
| `categoryId`    |                                | a category's `_id`                          |
| `addressId`     |                                | one of Ada's addresses                      |
| `orderNumber`   |                                | an order number like `QC-1042`              |
| `reviewId`      |                                | a review's `_id`                            |
| `photoUrl`      |                                | the address of a photo you uploaded         |
| `newProductId`  |                                | the product you create as admin             |
| `customerId`    |                                | a customer's `_id`                          |

4. Click **Save**.
5. **Very important:** at the top right of Postman there's a dropdown that says **No environment**. Click
   it and choose **QuickCart Local**. If you forget, `{{baseUrl}}` stays red and nothing works.

Now `{{baseUrl}}/health` means `http://localhost:5000/api/health`. Hover over a `{{...}}` to see its value.

**To fill a variable by hand:** copy the value from a response (double-click it, Ctrl + C), open the
environment (the 👁 eye icon at the top right, or Environments in the sidebar), paste it into **Current
value**, and save. Or select the text in the response, **right-click → Set: QuickCart Local → pick the
variable**. That's the fastest way.

## A8. How to send JSON (a "body")

`POST` and `PATCH` requests carry data. Here's how to put it in the letter:

1. Click the **Body** tab (under the URL).
2. Choose **raw**.
3. On the right of that row, a dropdown says **Text**. Change it to **JSON**.
4. Type the JSON in the big box, for example:
   ```json
   {
     "email": "ada.obi@example.com",
     "password": "Password@123"
   }
   ```

JSON rules, like grammar for computers:

- curly braces `{ }` around everything
- every name in **double quotes**: `"email"`, not `email` or `'email'`
- a **comma between** items, but **no comma after the last one**
- text in quotes (`"Ada"`), numbers without (`20000`), and `true` / `false` / `null` without quotes

If you break a rule, the server answers `400 The request body is not valid JSON`. Postman also underlines
the mistake in red.

## A9. How to log in as someone (tokens)

When you log in, the server gives you a **token**: a long text like `eyJhbGciOiJIUzI1NiIs...`. It's like
a wristband at a party. For every request that needs a login, you show the wristband.

**Get a token:** send `POST {{baseUrl}}/auth/login` (section 3) and copy the `"token"` from the answer
(without the quotes). Save it in the environment as `adaToken` or `adminToken` (A7).

**Show the token on a request:**

1. Click the **Authorization** tab.
2. **Auth Type** → choose **Bearer Token**.
3. In the **Token** box type `{{adaToken}}` (or `{{adminToken}}`).

Postman adds the header `Authorization: Bearer eyJhbGci...` for you. That's what the server's `protect`
guard looks for (`server/src/middleware/auth.ts`).

**Shortcut:** set it once on a whole folder. Click the folder → **Authorization** tab → Bearer Token →
`{{adminToken}}`. Every request inside with Auth Type **Inherit auth from parent** uses it. Great for the
admin folders.

## A10. Make Postman save the token for you (optional magic)

Instead of copying tokens by hand, on the **Login as Ada** request:

1. Click the **Scripts** tab → **Post-response**.
2. Paste:
   ```js
   const body = pm.response.json();
   if (body.token) {
     pm.environment.set("adaToken", body.token);
   }
   ```
3. Save. Now every time you send it, `adaToken` updates by itself.

Do the same on **Login as admin** with `"adminToken"`. You can use the same trick anywhere, for example on
**Place an order**: `pm.environment.set("orderNumber", pm.response.json().order.orderNumber);`

## A11. Query params (the `?something=value` part)

Some GET requests take options after a `?`, joined with `&`:

```
{{baseUrl}}/products?category=electronics&sort=price-asc&page=2
```

You can type that in the URL, or use the **Params** tab: each row is one option (Key = `category`,
Value = `electronics`). Postman writes the URL for you, and you can tick/untick rows to switch options on and
off. That's handy during a demo.

A space in a value is fine: Postman turns `ada obi` into `ada%20obi` for you.

## A12. Uploading a photo (form-data)

Photos aren't JSON. For the photo upload (section 11):

1. **Body** tab → choose **form-data** (not raw).
2. In the first row, type the Key `photos`.
3. Hover over the right end of the Key box: a small dropdown says **Text**. Change it to **File**.
4. In Value, click **Select Files** and pick a JPG or PNG from your computer (under 5MB).
5. For a second photo, add another row with the **same key** `photos`.

Don't add a `Content-Type` header yourself. Postman sets the right one.

## A13. Reading the answer: status codes

| Code    | Means                                   | In QuickCart, for example                     |
| ------- | --------------------------------------- | --------------------------------------------- |
| **200** | OK                                      | here's the list you asked for                 |
| **201** | Created                                 | your account / order / review was made        |
| **400** | You sent something wrong                | "Please enter your email and password."       |
| **401** | Log in first (or your token is bad)     | "Please log in to continue."                  |
| **402** | Payment failed                          | a card ending in `0000` is declined           |
| **403** | You're logged in, but not allowed       | "Only admins can do this."                    |
| **404** | Not found                               | "Product not found"                           |
| **409** | Clash with something that exists        | "That email is already in use."               |
| **500** | A bug on the server                     | should never happen: check the terminal       |

**Every error has a `"message"`** written for humans. Read it out during the demo: it shows the server
explains itself.

---

# Part B: Where the code lives

Every endpoint goes through 3 places. When you demo one, you can open these files:

```
server/src/app.ts                 puts everything under /api
  └─ server/src/routes/index.ts   /api/products → productRoutes, /api/auth → authRoutes, ...
       └─ server/src/routes/<x>Routes.ts      which URL runs which function (+ the login guards)
            └─ server/src/controllers/<x>Controller.ts   the function that does the work
```

| URL starts with       | Route file                    | Controller file(s)                                       |
| --------------------- | ----------------------------- | -------------------------------------------------------- |
| `/api/health`         | `routes/index.ts`             | (written right in `routes/index.ts`)                      |
| `/api/categories`     | `routes/categoryRoutes.ts`    | `controllers/categoryController.ts`                       |
| `/api/products`       | `routes/productRoutes.ts`     | `controllers/productController.ts`                        |
| `/api/auth`           | `routes/authRoutes.ts`        | `controllers/authController.ts`                           |
| `/api/account`        | `routes/accountRoutes.ts`     | `controllers/accountController.ts`                        |
| `/api/promo-codes`    | `routes/promoRoutes.ts`       | `controllers/promoController.ts` (rules in `utils/promo.ts`) |
| `/api/orders`         | `routes/orderRoutes.ts`       | `controllers/orderController.ts` (rules in `utils/orderRules.ts`) |
| `/api/reviews`        | `routes/reviewRoutes.ts`      | `controllers/reviewController.ts`                         |
| `/api/newsletter`     | `routes/newsletterRoutes.ts`  | `controllers/newsletterController.ts`                     |
| `/api/admin/...`      | `routes/adminRoutes.ts`       | `adminProductController.ts`, `adminCategoryController.ts`, `adminOrderController.ts`, `adminCustomerController.ts`, `adminDashboardController.ts`, `demoController.ts` |

Other files worth showing:

- `middleware/auth.ts`: `protect` (must be logged in) and `adminOnly` (must be an admin)
- `middleware/errorHandler.ts`: turns every error into a `{ "message": "..." }` reply with the right code
- `middleware/upload.ts`: reads uploaded photos (multer)
- `models/*.ts`: what each thing in the database looks like (Product, User, Order...)

---

# Part C: Testing every endpoint (the demo, in order)

**How to read each card:**

> **`METHOD /path`** · 🔓 no login / 🔑 logged in / 👑 admin only
> 🧭 what it does on the website · 📂 `file → function`

Then the steps to type in Postman, what you should see, and the mistakes to try on purpose.

Everything uses `{{baseUrl}}` = `http://localhost:5000/api` (A7).

---

## 0. Health check

### 0.1 `GET /api/health` · 🔓

- 🧭 Not a page: a quick "is the server alive?" check. Hosts use it to see if the app is running.
- 📂 `server/src/routes/index.ts` (the small function next to `router.get("/health", ...)`)

**Postman:** GET · `{{baseUrl}}/health` · Send

✅ `200` `{ "status": "ok", "message": "QuickCart API is running" }`

❌ Try `{{baseUrl}}/nothing-here` → `404` `Not found: GET /api/nothing-here` (from `middleware/notFound.ts`).

---

## 1. Categories (2 endpoints)

### 1.1 `GET /api/categories` · 🔓

- 🧭 The **Home page "Shop by Category"** tiles, the **Categories page**, and the category list on the
  **Shop page** filter. Each category comes with how many products it has.
- 📂 `controllers/categoryController.ts → getCategories`

**Postman:** GET · `{{baseUrl}}/categories` · Send

✅ `200` with 8 categories: Electronics, Fashion, Home & Living, Beauty, Sports, Books, Office, Kitchen.
Each has `name`, `slug`, `icon` and `productCount` (Electronics: 15).

📝 Copy the Electronics `_id` into the environment as `categoryId` (you need it in section 11).

### 1.2 `GET /api/categories/:slug` · 🔓

- 🧭 Opening one category, e.g. clicking **Home & Living**: the page title and product count.
- 📂 `controllers/categoryController.ts → getCategoryBySlug`

**Postman:** GET · `{{baseUrl}}/categories/home-living` · Send

✅ `200` `{ "category": { "name": "Home & Living", "slug": "home-living", "productCount": ... } }`

❌ `{{baseUrl}}/categories/toys` → `404` `Category not found: toys`

---

## 2. Products (2 endpoints)

### 2.1 `GET /api/products` · 🔓

- 🧭 The **Shop page** grid with its filters, search box, sort dropdown and pages. Also the **Home page**
  sections (Flash Deals, New Arrivals...) and the **search bar** at the top of every page.
- 📂 `controllers/productController.ts → getProducts`

**Postman:** GET · `{{baseUrl}}/products` · Send

✅ `200` `{ "products": [ 24 products ], "total": 40, "page": 1, "pages": 2 }`

Now play with the **Params** tab (A11). Each one is a different thing on the Shop page:

| Key        | Value                  | What it shows on the website                   |
| ---------- | ---------------------- | ---------------------------------------------- |
| `category` | `electronics`          | the category filter: only electronics          |
| `search`   | `headphones`           | the search bar (looks in name, brand and tags)  |
| `sort`     | `price-asc`            | "Price: Low to High" (`price-desc`, `newest`, `rating`, `best-selling`, `featured`) |
| `minPrice` | `10000`                | the price slider's left end                    |
| `maxPrice` | `50000`                | the price slider's right end                   |
| `tag`      | `flash-deal`           | the Home page's Flash Deals row (`new-arrival`, `featured`, `deal`...) |
| `page`     | `2`                    | page 2 at the bottom of the Shop page          |
| `limit`    | `5`                    | how many per page (max 60)                     |

Try them together: `?category=electronics&sort=price-asc&limit=5`.

✅ An unknown category (`?category=toys`) gives `200` with `products: []`: the Shop page shows "No products
found" instead of an error.

📝 Copy the first product's `_id` into `productId`, and remember its `slug`.

### 2.2 `GET /api/products/:idOrSlug` · 🔓

- 🧭 The **Product Details page**: photos, price, colours, specs, the "Frequently Bought Together" bundle
  and "Related Products".
- 📂 `controllers/productController.ts → getProduct`

**Postman:** GET · `{{baseUrl}}/products/wireless-noise-cancelling-headphones` · Send
(or `{{baseUrl}}/products/{{productId}}`: the id works too)

✅ `200` `{ "product": { "name": ..., "price": ..., "category": { "name": "Electronics", ... }, "bundleProducts": [...], "relatedProducts": [...] } }`

🔒 Point out: there's **no `costPrice`** in the answer. What the shop paid is admin-only.

❌ `{{baseUrl}}/products/does-not-exist` → `404` `Product not found`

---

## 3. Accounts: register, log in, me, log out (5 endpoints)

### 3.1 `GET /api/auth/check-email?email=...` · 🔓

- 🧭 The **Register page**: as you type your email, it says "Email already in use" before you press
  Create Account.
- 📂 `controllers/authController.ts → checkEmail`

**Postman:** GET · `{{baseUrl}}/auth/check-email?email=ada.obi@example.com` · Send

✅ `200` `{ "available": false }` (Ada already has an account). Try `newperson@example.com` → `{ "available": true }`.

❌ No email (`{{baseUrl}}/auth/check-email`) → `400` `Please give an email to check.`

### 3.2 `POST /api/auth/register` · 🔓

- 🧭 The **Register page**'s **Create Account** button.
- 📂 `controllers/authController.ts → register` (password rules in `utils/password.ts → checkNewPassword`)

**Postman:** POST · `{{baseUrl}}/auth/register` · Body → raw → JSON:

```json
{
  "firstName": "Tolu",
  "lastName": "Adeyemi",
  "email": "tolu.demo@example.com",
  "phone": "+2348011112222",
  "password": "Demo@1234",
  "confirmPassword": "Demo@1234",
  "agreeToTerms": true
}
```

✅ `201` `{ "token": "eyJ...", "user": { "firstName": "Tolu", "role": "customer", "isEmailVerified": false, ... } }`

🔒 Point out: there's **no password** in the reply, even though it's saved (as a hash, never the real
text: `models/User.ts`).

📝 Save the token as `newToken`.

❌ Mistakes to try (send each one, read the message):

| Change                                   | Answer                                                     |
| ---------------------------------------- | ---------------------------------------------------------- |
| `"agreeToTerms": false`                  | `400` Please agree to the Terms of Service and Privacy Policy. |
| `"password": "short"` (both)             | `400` Password must be at least 8 characters with one uppercase letter (A-Z) and one number (0-9). |
| `"confirmPassword": "Demo@9999"`         | `400` Passwords do not match.                              |
| send the same body again                 | `409` That email is already in use.                        |
| add `"role": "admin"`                    | `201`, but `role` is still `"customer"` (the server ignores it on purpose) |

### 3.3 `POST /api/auth/login` · 🔓

- 🧭 The **Login page** (and the **Admin Login page**) **Sign In** button. "Remember me" keeps you logged
  in longer.
- 📂 `controllers/authController.ts → login`

**Postman:** POST · `{{baseUrl}}/auth/login` · Body → raw → JSON:

```json
{
  "email": "ada.obi@example.com",
  "password": "Password@123",
  "rememberMe": true
}
```

✅ `200` `{ "token": "eyJ...", "user": { "firstName": "Ada", ... } }` → save the token as **`adaToken`**.

Save this request as **Login as Ada**. Then duplicate it (right-click → Duplicate), change the email to
`admin@quickcart.ng` and the password to `Admin@12345`, send, save the token as **`adminToken`**, and save
the request as **Login as admin**. (Or use the A10 script so it saves itself.)

❌ Wrong password → `401` `Incorrect email or password.` (the same message for a wrong email, so strangers
can't find out who has an account). Empty body → `400` `Please enter your email and password.`

### 3.4 `GET /api/auth/me` · 🔑

- 🧭 When the website opens, it asks "who am I?" to show **"Hi, Ada"** in the header and decide if you can
  open My Account or the admin pages.
- 📂 `controllers/authController.ts → getMe`, guarded by `middleware/auth.ts → protect`

**Postman:** GET · `{{baseUrl}}/auth/me` · Authorization → Bearer Token → `{{adaToken}}` · Send

✅ `200` `{ "user": { "firstName": "Ada", "email": "ada.obi@example.com", "addresses": [...], ... } }`

❌ Set Auth Type to **No Auth** → `401` `Please log in to continue.`
❌ Put `{{adaToken}}x` (a broken token) → `401` `Your session has expired. Please log in again.`

### 3.5 `POST /api/auth/logout` · 🔑

- 🧭 The **Log Out** button (in the account menu and the admin sidebar).
- 📂 `controllers/authController.ts → logout`

**Postman:** POST · `{{baseUrl}}/auth/logout` · Bearer `{{newToken}}` · Send

✅ `200` `You have been logged out.`

💬 Explain: the real logout happens in the browser, which throws the token away. The server just confirms.

---

## 4. Email verification and forgot password (5 endpoints)

Because `DEMO_MODE=true`, the server also puts the code / link **in the answer**, so you don't have to open
an inbox on stage. With a Brevo key, the real email is sent as well.

### 4.1 `POST /api/auth/send-verification` · 🔑

- 🧭 The **Verify Email page**: "We've sent a 6-digit code to your email" and the **Resend code** button.
- 📂 `controllers/authController.ts → sendVerification`

**Postman:** POST · `{{baseUrl}}/auth/send-verification` · Bearer `{{newToken}}` (Tolu, who isn't
verified yet) · no body · Send

✅ `200` `{ "message": "We've sent a 6-digit code to tolu.demo@example.com.", "devCode": "048213" }`

❌ Do it with `{{adaToken}}` → `400` `Your email is already verified.`

### 4.2 `POST /api/auth/verify-email` · 🔑

- 🧭 The **Verify Email page**'s 6 boxes and **Verify** button.
- 📂 `controllers/authController.ts → verifyEmail`

**Postman:** POST · `{{baseUrl}}/auth/verify-email` · Bearer `{{newToken}}` · Body JSON:

```json
{ "code": "048213" }
```

(use the `devCode` from 4.1)

✅ `200` `Your email is verified.` and `"isEmailVerified": true`

❌ A wrong code like `"000000"` → `400` `That code is wrong or has expired. Please request a new one.`
(Try this BEFORE the right one.) Codes expire after 15 minutes.

### 4.3 `POST /api/auth/forgot-password` · 🔓

- 🧭 The **Forgot Password page**'s **Send Reset Link** button.
- 📂 `controllers/authController.ts → forgotPassword`

**Postman:** POST · `{{baseUrl}}/auth/forgot-password` · Body JSON:

```json
{ "email": "tolu.demo@example.com" }
```

✅ `200` `{ "message": "If an account exists for that email, we've sent a link to reset your password.", "devResetUrl": "http://localhost:5173/reset-password/1ba4dc03..." }`

📝 The **token** is the long part at the end of `devResetUrl`, after `/reset-password/`. Copy it.

🔒 Try an email that doesn't exist: the **same message** comes back (and no link). Strangers can't use this
page to find out who has an account.

### 4.4 `GET /api/auth/reset-password/:token` · 🔓

- 🧭 When you open the reset link, the **Reset Password page** checks it first and shows "Link Expired or
  Invalid" if it's no good, before you type a new password.
- 📂 `controllers/authController.ts → checkResetToken`

**Postman:** GET · `{{baseUrl}}/auth/reset-password/PASTE-THE-TOKEN-HERE` · Send

✅ `200` `{ "valid": true }` (the link is good). ❌ `{{baseUrl}}/auth/reset-password/abc` → `400` `This password reset link has
expired or has already been used. Please request a new link.`

### 4.5 `POST /api/auth/reset-password/:token` · 🔓

- 🧭 The **Reset Password page**'s **Reset Password** button.
- 📂 `controllers/authController.ts → resetPassword`

**Postman:** POST · `{{baseUrl}}/auth/reset-password/PASTE-THE-TOKEN-HERE` · Body JSON:

```json
{ "password": "NewDemo@123", "confirmPassword": "NewDemo@123" }
```

✅ `200` `Your password has been reset.` plus a fresh `token` (you're logged in straight away).

❌ Send it **again** with the same token → `400` (the link works only once).
❌ Use Tolu's **old** `{{newToken}}` on `GET /auth/me` → `401` `Your password was changed. Please log in
again.` (Changing your password logs out every other device.)

---

## 5. My Account: profile, password, addresses, saved items (9 endpoints)

All use **`{{adaToken}}`** (set it once on the folder, A9).

### 5.1 `PATCH /api/account/profile` · 🔑

- 🧭 **My Account → Account Settings → Personal details → Save Changes**.
- 📂 `controllers/accountController.ts → updateProfile`

**Postman:** PATCH · `{{baseUrl}}/account/profile` · Body JSON:

```json
{ "phone": "+2348030000000" }
```

✅ `200` `Your profile has been updated.` with the new phone.

🔒 Add `"role": "admin"` → still `"customer"`. Change the email → `isEmailVerified` becomes `false` (a
new email must be verified again). Change it back afterwards.

### 5.2 `PATCH /api/account/password` · 🔑

- 🧭 **Account Settings → Change Password**.
- 📂 `controllers/accountController.ts → changePassword`

**Postman:** PATCH · `{{baseUrl}}/account/password` · Body JSON:

```json
{
  "currentPassword": "Password@123",
  "newPassword": "Password@456",
  "confirmPassword": "Password@456"
}
```

✅ `200` `Your password has been changed.` with a new `token` → **update `adaToken`** with it (the old one
stops working).

❌ Wrong `currentPassword` → `400` `Your current password is incorrect.`

⚠️ **Change it back** (swap the two passwords and send again) so `Password@123` keeps working for the rest
of the demo. Then update `adaToken` again.

### 5.3 `GET /api/account/addresses` · 🔑

- 🧭 **My Account → Delivery Addresses**, and the address choice at **Checkout**.
- 📂 `controllers/accountController.ts → getAddresses`

**Postman:** GET · `{{baseUrl}}/account/addresses` · Send

✅ `200` with Ada's 2 addresses: **Home** (12 Admiralty Way, Lekki Phase 1) and **Office** (Victoria Island).

📝 Copy the Home address `_id` into `addressId`.

### 5.4 `POST /api/account/addresses` · 🔑

- 🧭 **Delivery Addresses → Add New Address** form.
- 📂 `controllers/accountController.ts → addAddress`

**Postman:** POST · `{{baseUrl}}/account/addresses` · Body JSON:

```json
{
  "label": "Mum's house",
  "fullName": "Ada Obi",
  "phone": "+2348031234567",
  "street": "7 Allen Avenue",
  "city": "Ikeja",
  "state": "Lagos State"
}
```

✅ `201` with 3 addresses now. Copy the new one's `_id` (for 5.5 and 5.6).

❌ Leave out `street` → `400` `Street address is required`.

### 5.5 `PATCH /api/account/addresses/:addressId` · 🔑

- 🧭 The **Edit** button on an address card, or **Set as default**.
- 📂 `controllers/accountController.ts → updateAddress`

**Postman:** PATCH · `{{baseUrl}}/account/addresses/THE-NEW-ADDRESS-ID` · Body JSON:

```json
{ "isDefault": true }
```

✅ `200`: this one is now the default, and the old default isn't any more (only one default at a time).

### 5.6 `DELETE /api/account/addresses/:addressId` · 🔑

- 🧭 The **Delete** (🗑) button on an address card.
- 📂 `controllers/accountController.ts → deleteAddress`

**Postman:** DELETE · `{{baseUrl}}/account/addresses/THE-NEW-ADDRESS-ID` · Send

✅ `200` with 2 addresses left. Send again → `404` `Address not found`.

### 5.7 `POST /api/account/saved/:productId` · 🔑

- 🧭 The **♡ heart** button on a product card or the Product Details page ("Save for later").
- 📂 `controllers/accountController.ts → saveItem`

**Postman:** POST · `{{baseUrl}}/account/saved/{{productId}}` · Send

✅ `200` `{ "savedItems": [ "<the product id>" ] }`. Send it twice: still only once in the list.

### 5.8 `GET /api/account/saved` · 🔑

- 🧭 **My Account → Saved Items** page.
- 📂 `controllers/accountController.ts → getSavedItems`

**Postman:** GET · `{{baseUrl}}/account/saved` · Send

✅ `200` `{ "products": [ the full product card ] }`

### 5.9 `DELETE /api/account/saved/:productId` · 🔑

- 🧭 Clicking the filled **♥ heart** again to un-save.
- 📂 `controllers/accountController.ts → unsaveItem`

**Postman:** DELETE · `{{baseUrl}}/account/saved/{{productId}}` · Send

✅ `200` `{ "savedItems": [] }`

---

## 6. Promo codes (1 endpoint)

### 6.1 `POST /api/promo-codes/check` · 🔓

- 🧭 The **Cart page**'s promo code box and **Apply** button: "Save ₦2,000".
- 📂 `controllers/promoController.ts → checkPromoCode` (the rules: `utils/promo.ts → applyPromo`)

**Postman:** POST · `{{baseUrl}}/promo-codes/check` · Body JSON:

```json
{ "code": "quick25", "subtotal": 117500 }
```

✅ `200` `{ "code": "QUICK25", "description": "₦2,000 off orders of ₦25,000 or more", "discount": 2000, "subtotalAfterDiscount": 115500 }`

Try `QUICK10` with `117500` → `discount: 5000` (10% would be 11,750, but it's capped at ₦5,000).

❌ Mistakes:

| Body                                         | Answer                                                         |
| -------------------------------------------- | -------------------------------------------------------------- |
| `{ "code": "QUICK25", "subtotal": 20000 }`   | `400` QUICK25 needs an order of at least ₦25,000. Add ₦5,000 more to use it. |
| `{ "code": "FREEMONEY", "subtotal": 50000 }` | `400` "FREEMONEY" is not a valid promo code.                    |
| `{ "code": "QUICK25", "subtotal": 0 }`       | `400` Your cart is empty.                                       |

💬 This only **checks** the code. At checkout (7.1) the server checks it again itself, so nobody can fake a
discount from the browser.

---

## 7. Orders: checkout and my orders (5 endpoints)

All use **`{{adaToken}}`**.

### 7.1 `POST /api/orders` · 🔑

- 🧭 The **Checkout page**'s **PLACE ORDER NOW** button. Then the **Order Confirmation page** shows the
  answer.
- 📂 `controllers/orderController.ts → placeOrder` (delivery fees, dates and the pretend card payment are
  in `utils/orderRules.ts`)

**Postman:** POST · `{{baseUrl}}/orders` · Body JSON (put your `productId` and `addressId` in):

```json
{
  "items": [{ "productId": "PASTE-PRODUCT-ID", "quantity": 1 }],
  "addressId": "PASTE-ADDRESS-ID",
  "deliveryMethod": "standard",
  "paymentMethod": "card",
  "card": { "number": "4242 4242 4242 4242", "expiry": "08/30", "cvv": "123", "name": "Ada Obi" },
  "promoCode": "QUICK10"
}
```

✅ `201` `{ "message": "Your order has been placed!", "order": { "orderNumber": "QC-1042", "status": "processing", "total": ..., "payment": { "status": "paid", "cardBrand": "Visa", "cardLast4": "4242" } }, "canCancel": true, "cancelDeadline": "..." }`

📝 Save `QC-1042` as `orderNumber`.

🔒 Things to point out:

- The prices come **from the database**, not from what you send. You can't buy a ₦45,000 headphone for ₦1.
- Only the **brand and last 4 digits** of the card are saved. Never the full number or the CVV.
- The product's stock went down by 1 (check `GET /products/<slug>`).
- Ada gets a confirmation email (through Brevo, or printed in the terminal without a key).

❌ Mistakes:

| Change                                            | Answer                                                  |
| ------------------------------------------------- | ------------------------------------------------------- |
| card number ending in `0000`                      | `402` Your card was declined... (nothing is charged, no stock taken) |
| `"expiry": "01/20"`                               | `400` This card has expired.                            |
| `"paymentMethod": "pay_on_delivery"` with no card | `201` (allowed in Lagos; payment stays `pending` until delivery) |
| `"deliveryMethod": "express"`                     | `201` with a ₦2,500 delivery fee (Lagos only)           |
| `"quantity": 11`                                  | `400` Quantity must be a whole number from 1 to 10.      |
| more than the stock left (e.g. a low-stock product, quantity 10) | `400` Only 3 left of "...". Please lower the quantity. |
| `"items": []`                                     | `400` Your cart is empty.                                |

Place **2 orders**: one by card (keep it as `orderNumber`), and one with `"paymentMethod": "pay_on_delivery"`
(note its number too). You'll use both in section 8.

### 7.2 `GET /api/orders` · 🔑

- 🧭 **My Account → Order History**: the tabs (All / In Progress / Shipped / Delivered / Cancelled), the
  search box and the sort.
- 📂 `controllers/orderController.ts → getMyOrders`

**Postman:** GET · `{{baseUrl}}/orders` · Send

✅ `200` Ada's orders, newest first, with `counts` for the tabs. After a fresh seed she has 5 demo orders
(like the Order History design), plus the ones you just placed.

Params to try: `status=delivered`, `status=in-progress`, `search=QC-1042`, `search=headphones`,
`sort=oldest`.

🔒 Log in as another shopper and send it: you only ever see **your own** orders.

### 7.3 `GET /api/orders/summary` · 🔑

- 🧭 The **My Account overview** page: "Total orders", "In progress", "Delivered" and the 3 recent orders.
- 📂 `controllers/orderController.ts → getOrderSummary`

**Postman:** GET · `{{baseUrl}}/orders/summary` · Send

✅ `200` `{ "totalOrders": ..., "inProgress": ..., "delivered": ..., "recentOrders": [3 orders] }`

### 7.4 `GET /api/orders/:orderNumber` · 🔑

- 🧭 **Order Details & Shipment Tracking** page: the items, the address, the payment, and the tracker
  (Placed → Dispatched → Delivered). Also the **Order Confirmation** page.
- 📂 `controllers/orderController.ts → getOrder`

**Postman:** GET · `{{baseUrl}}/orders/{{orderNumber}}` · Send (`qc-1042` and `1042` work too)

✅ `200` the order, its `statusHistory` (the tracker), `canCancel` and `cancelDeadline` ("46 mins
remaining").

❌ With the token of a different shopper → `404` (other people's orders don't exist for you).

### 7.5 `PATCH /api/orders/:orderNumber/cancel` · 🔑

- 🧭 The **Cancel Order** button on Order Details (only shown for 1 hour, while the order is still being
  packed).
- 📂 `controllers/orderController.ts → cancelOrder`

**Postman:** PATCH · `{{baseUrl}}/orders/QC-NUMBER-OF-A-THIRD-ORDER/cancel` · Body JSON (optional):

```json
{ "reason": "Ordered the wrong colour" }
```

> Place a **third** order for this, so you keep the other two for section 8.

✅ `200` `Your order has been cancelled.`, `status: "cancelled"`, a card payment becomes `refunded`, and the
stock goes back up.

❌ Cancel it again → `400` `This order is already cancelled.` A shipped order → `400` `This order has already
left our warehouse...`

---

## 8. Admin: orders and customers (5 endpoints)

Switch to **`{{adminToken}}`** (set it on the admin folders). Every `/api/admin/...` request is guarded by
`router.use(protect, adminOnly)` at the top of `routes/adminRoutes.ts`.

🔒 First, prove the guard: send any admin request with **`{{adaToken}}`** → `403` `Only admins can do this.`

### 8.1 `GET /api/admin/orders` · 👑

- 🧭 **Admin → Orders Management**: the table, the tabs with numbers, the top cards (total orders, sales,
  refunds), the search box, the Payment / Date / Courier filters and the pages.
- 📂 `controllers/adminOrderController.ts → getAdminOrders`

**Postman:** GET · `{{baseUrl}}/admin/orders` · Send

✅ `200` `{ "orders": [10 orders], "total", "pages", "counts": { "all", "processing", "shipped", "delivered", "cancelled" }, "sales", "refunded", "couriers": ["QuickCart Express", "GIG Logistics", "DHL Express"] }`

Params to try:

| Key       | Value                         | On the page                                  |
| --------- | ----------------------------- | -------------------------------------------- |
| `status`  | `processing`                  | the Processing tab                           |
| `search`  | `ada obi` / `#QC-1042` / an email / a waybill | the search box               |
| `payment` | `pending`                     | Payment: Pending (pay-on-delivery orders)     |
| `courier` | `GIG Logistics`               | Courier filter                               |
| `days`    | `30`                          | Date: Last 30 Days                            |
| `page`    | `2`                           | page 2                                        |

### 8.2 `GET /api/admin/orders/:orderNumber` · 👑

- 🧭 Clicking an order in Orders Management: the full order, the customer's account, and which buttons to
  show (`nextStatuses`).
- 📂 `controllers/adminOrderController.ts → getAdminOrder`

**Postman:** GET · `{{baseUrl}}/admin/orders/{{orderNumber}}` · Send

✅ `200` with `order.user` (the customer, no password) and `"nextStatuses": ["shipped", "cancelled"]`.

### 8.3 `PATCH /api/admin/orders/:orderNumber/status` · 👑 ⭐ (great for the demo)

- 🧭 The **Mark as Shipped / Mark as Delivered / Cancel** buttons in Orders Management. This is what makes
  the customer's **tracker move**, and it emails the customer each time.
- 📂 `controllers/adminOrderController.ts → updateOrderStatus`

**Step 1: ship it.** PATCH · `{{baseUrl}}/admin/orders/{{orderNumber}}/status` · Body JSON:

```json
{ "status": "shipped", "courier": "GIG Logistics" }
```

✅ `200` `Order #QC-1042 is now shipped.` with a waybill like `GIG-482913`.

👀 **Now show the customer side:** `GET {{baseUrl}}/orders/{{orderNumber}}` with `{{adaToken}}`: status
`shipped`, the courier, the waybill, and a new line in `statusHistory`.

**Step 2: deliver it.** Same URL, body:

```json
{ "status": "delivered" }
```

✅ `200` `deliveredAt` is set and `nextStatuses` is `[]` (delivered is final).

**Step 3: cancel the pay-on-delivery order** (use its number):

```json
{ "status": "cancelled", "reason": "Out of stock" }
```

✅ `200`, note `Cancelled by QuickCart`, stock goes back, payment stays `pending` (it was never paid).

❌ Mistakes:

| Body                                              | Answer                                                   |
| ------------------------------------------------- | -------------------------------------------------------- |
| `{ "status": "delivered" }` on a processing order | `400` A processing order can't be marked as delivered.   |
| `{ "status": "shipped" }` (no courier)            | `400` Please choose a courier: QuickCart Express, GIG Logistics, DHL Express. |
| `{ "status": "cancelled" }` on a delivered order  | `400` A delivered order can't be marked as cancelled.    |

### 8.4 `GET /api/admin/customers` · 👑

- 🧭 **Admin → Customers**: every customer with their number of orders, total spent and last order.
- 📂 `controllers/adminCustomerController.ts → getCustomers`

**Postman:** GET · `{{baseUrl}}/admin/customers` · Send

✅ `200` 5+ customers (Ada, the 4 demo shoppers, and anyone you registered), each with `orderCount`,
`totalSpent` and `lastOrderAt`. No passwords anywhere. The admin isn't in the list.

Params: `sort=spent` (biggest spenders first), `sort=orders`, `search=chioma`.

📝 Copy Ada's `_id` into `customerId`.

### 8.5 `GET /api/admin/customers/:id` · 👑

- 🧭 Clicking a customer: their details, addresses and orders.
- 📂 `controllers/adminCustomerController.ts → getCustomer`

**Postman:** GET · `{{baseUrl}}/admin/customers/{{customerId}}` · Send

✅ `200` `{ "customer": { ..., "addresses": [...], "orderCount", "totalSpent" }, "orders": [...] }`

❌ The admin's own id → `404` `Customer not found`.

---

## 9. Reviews (6 endpoints)

Back to **`{{adaToken}}`**. The rule: **only people who RECEIVED the product can review it**. In section 8 you
delivered `{{orderNumber}}`, so Ada can now review that product (and her 3 delivered demo orders count too).

### 9.1 `GET /api/reviews/product/:idOrSlug` · 🔓

- 🧭 The **reviews section of the Product Details page**: the average, the 5★ to 1★ bars, the list, and the
  filter / sort.
- 📂 `controllers/reviewController.ts → getProductReviews`

**Postman:** GET · `{{baseUrl}}/reviews/product/wireless-noise-cancelling-headphones` · Send

✅ `200` with `summary` (average, count, the star bars) and `reviews`. Params: `rating=5`,
`sort=highest`, `page=2`.

### 9.2 `GET /api/reviews/can-review/:productId` · 🔑

- 🧭 Decides if the **Write a Review** button shows on the Product Details page.
- 📂 `controllers/reviewController.ts → canReviewProduct`

**Postman:** GET · `{{baseUrl}}/reviews/can-review/{{productId}}` · Send

✅ For the product you just delivered: `{ "canReview": true, "reason": null }`.
For one Ada never received: `{ "canReview": false, "reason": "Only customers who have received this product can review it." }`

### 9.3 `POST /api/reviews` · 🔑

- 🧭 The **Write a Review** form (stars, title, comment) and **Submit**. Also **Leave Review** on a
  delivered order in Order History.
- 📂 `controllers/reviewController.ts → createReview`

**Postman:** POST · `{{baseUrl}}/reviews` · Body JSON:

```json
{
  "productId": "PASTE-THE-DELIVERED-PRODUCT-ID",
  "rating": 5,
  "title": "Love them!",
  "comment": "Great sound and the battery lasts all week."
}
```

✅ `201` `Thank you for your review!` and the review shows the name as **"Ada O."** (first name + last
initial, for privacy). The product's average rating and star bars update.

📝 Copy the review `_id` into `reviewId`.

❌ Mistakes:

| Change                                    | Answer                                                     |
| ----------------------------------------- | ---------------------------------------------------------- |
| send it again                             | `409` You have already reviewed this product. You can edit your review instead. |
| a product Ada never received              | `403` Only customers who have received this product can review it. |
| `"rating": 6` or no `comment`             | `400` with the rule that was broken                         |

### 9.4 `GET /api/reviews/mine` · 🔑

- 🧭 A "My reviews" list (and how Order History knows which products you already reviewed).
- 📂 `controllers/reviewController.ts → getMyReviews`

**Postman:** GET · `{{baseUrl}}/reviews/mine` · Send → `200` Ada's reviews.

### 9.5 `PATCH /api/reviews/:reviewId` · 🔑

- 🧭 **Edit** on your own review.
- 📂 `controllers/reviewController.ts → updateReview`

**Postman:** PATCH · `{{baseUrl}}/reviews/{{reviewId}}` · Body JSON: `{ "rating": 4 }`

✅ `200` `Your review has been updated.` The product's average changes again.

❌ With `{{adminToken}}` → `404` (it's not the admin's review, so the admin can't edit it).

### 9.6 `DELETE /api/reviews/:reviewId` · 🔑

- 🧭 **Delete** on your own review. Admins can delete **any** review (to remove abuse).
- 📂 `controllers/reviewController.ts → deleteReview`

**Postman:** DELETE · `{{baseUrl}}/reviews/{{reviewId}}` · Send

✅ `200` `The review has been deleted.` The product's rating goes back to what it was.

---

## 10. Newsletter (2 endpoints)

### 10.1 `POST /api/newsletter/subscribe` · 🔓

- 🧭 The footer's **"Subscribe to QuickCart VIP Drops"** box and **Subscribe** button.
- 📂 `controllers/newsletterController.ts → subscribe` (Brevo contacts: `utils/brevoContacts.ts`)

**Postman:** POST · `{{baseUrl}}/newsletter/subscribe` · Body JSON:

```json
{ "email": "YOUR-OWN-EMAIL@gmail.com" }
```

✅ `201` `Thanks for subscribing! Check your inbox for a welcome gift.` A welcome email arrives with the
**QUICK10** code and an **unsubscribe link** (check Spam the first time). Without a Brevo key, the email is
printed in the server terminal.

❌ Again → `200` `You're already subscribed to QuickCart VIP Drops.` (no second email).
❌ `{ "email": "not-an-email" }` → `400` `Please enter a valid email address.`

### 10.2 `GET /api/newsletter/unsubscribe/:token` · 🔓

- 🧭 The **Unsubscribe** link at the bottom of the welcome email. It opens a small web page, not JSON.
- 📂 `controllers/newsletterController.ts → unsubscribe`

**Demo it in the browser, not Postman:** click the link in the email (or copy it from the terminal and paste
it in Chrome). You see **"You're unsubscribed"** with a **Back to QuickCart** button.

In Postman: GET the link → `200`, and the body is HTML (click **Preview** in the answer area to see the page).
❌ `{{baseUrl}}/newsletter/unsubscribe/abc` → `404` "Link not valid".

---

## 11. Admin: photos, products, categories (11 endpoints)

**`{{adminToken}}`** for all.

### 11.1 `POST /api/admin/uploads` · 👑

- 🧭 The **Add Image** box on **Admin → Add / Edit Product** ("Max 5MB").
- 📂 `controllers/adminProductController.ts → uploadProductPhotos` (reads the files: `middleware/upload.ts`;
  sends them to Cloudinary: `config/cloudinary.ts → uploadPhoto`)

**Postman:** POST · `{{baseUrl}}/admin/uploads` · **Body → form-data** (A12) · Key `photos` (type **File**)
→ pick a JPG/PNG · Send

✅ `201` `{ "urls": ["https://res.cloudinary.com/.../quickcart/products/uploads/3f9a..."] }`

📝 Copy the url into `photoUrl`. Open it in Chrome: it's your photo, stored on Cloudinary.

❌ A `.txt` or `.pdf` → `400` `Photos must be JPG, PNG, WebP or AVIF images.`
❌ A photo bigger than 5MB → `400` `Each photo must be 5MB or smaller.`

### 11.2 `GET /api/admin/products` · 👑

- 🧭 **Admin → Products Management**: the table, the tabs (All / In Stock / Low Stock / Out of Stock /
  Drafts) with numbers, the search, the category and price filters, and 8 rows per page.
- 📂 `controllers/adminProductController.ts → getAdminProducts`

**Postman:** GET · `{{baseUrl}}/admin/products` · Send

✅ `200` 8 products (with `costPrice`, `status` and stock), `total`, `pages`, and `counts` for the tabs.

Params: `tab=low-stock`, `tab=drafts`, `search=QC-AU-9042` (by SKU), `category=electronics`,
`sort=price-desc`, `minPrice=10000`, `maxPrice=50000`, `page=2`.

### 11.3 `GET /api/admin/products/new-sku?category=<id>` · 👑

- 🧭 The **Regenerate** link next to the SKU field on Add / Edit Product.
- 📂 `controllers/adminProductController.ts → generateSku`

**Postman:** GET · `{{baseUrl}}/admin/products/new-sku?category={{categoryId}}` · Send

✅ `200` `{ "sku": "QC-EL-4821" }` (EL = Electronics, random digits, never one that's already used).

### 11.4 `POST /api/admin/products` · 👑

- 🧭 **Admin → Add Product → Save & Publish Product** (or save as Draft).
- 📂 `controllers/adminProductController.ts → createProduct`

**Postman:** POST · `{{baseUrl}}/admin/products` · Body JSON:

```json
{
  "name": "Demo Speaker Mini",
  "description": "A small speaker made during the demo.",
  "category": "PASTE-CATEGORY-ID",
  "brand": "QuickCart Labs",
  "price": 20000,
  "oldPrice": 25000,
  "costPrice": 12000,
  "stock": 5,
  "status": "draft",
  "tags": ["New Arrival", "Flash Deal"],
  "images": ["PASTE-PHOTO-URL"]
}
```

✅ `201` `'Demo Speaker Mini' has been created.` with `slug: "demo-speaker-mini"`, an SKU made for you,
and tags tidied to `["new-arrival", "flash-deal"]`.

📝 Copy its `_id` into `newProductId`.

👀 Show it's a **draft**: `GET {{baseUrl}}/products/demo-speaker-mini` with **No Auth** → `404` (shoppers
can't see drafts).

❌ Mistakes:

| Change                                          | Answer                                                  |
| ----------------------------------------------- | ------------------------------------------------------- |
| `"oldPrice": 20000` (same as price)             | `400` The regular price must be higher than the sale price. |
| `"images": ["https://example.com/x.png"]`       | `400` Please add photos with the Add Image button.       |
| no `category`                                   | `400` Please choose a category.                          |
| `"sku": "QC-AU-9042"`                           | `409` That sku is already in use.                        |
| add `"ratings": 5, "sold": 99999`               | `201`, but ratings stays 0 and sold stays 0 (ignored on purpose) |

💬 `price` is what the customer pays, `oldPrice` is the crossed-out price. On the design's form: **Sale
Price → `price`**, **Regular Price → `oldPrice`**.

### 11.5 `GET /api/admin/products/:id` · 👑

- 🧭 Opening a product in the **Edit Product** form (drafts included, with `costPrice`).
- 📂 `controllers/adminProductController.ts → getAdminProduct`

**Postman:** GET · `{{baseUrl}}/admin/products/{{newProductId}}` · Send → `200` the whole product.

### 11.6 `PATCH /api/admin/products/:id` · 👑

- 🧭 **Edit Product → Save**. The design's toast: "Product updated successfully. 'Wireless Noise-Cancelling
  Headphones' is live".
- 📂 `controllers/adminProductController.ts → updateProduct`

**Postman:** PATCH · `{{baseUrl}}/admin/products/{{newProductId}}` · Body JSON:

```json
{ "status": "published" }
```

✅ `200` `'Demo Speaker Mini' is live.`

👀 Now `GET {{baseUrl}}/products/demo-speaker-mini` with No Auth → `200`: it's in the shop. And there's no
`costPrice` in the public answer.

More to try: `{ "oldPrice": null }` (ends the sale), `{ "stock": 0 }` (now in the Out of Stock tab),
`{ "images": [] }` (the photo is also **deleted from Cloudinary**, check the Media Library).

### 11.7 `DELETE /api/admin/products/:id` · 👑

- 🧭 The **Delete** button in Products Management.
- 📂 `controllers/adminProductController.ts → deleteProduct`

**Postman:** DELETE · `{{baseUrl}}/admin/products/{{newProductId}}` · Send

✅ `200` `'Demo Speaker Mini' has been deleted.` Its reviews, saved-items entries and bundle links are cleaned
up too. Past orders keep their own copy of the product, so Order History still shows it.

### 11.8 `GET /api/admin/categories` · 👑

- 🧭 **Admin → Categories** page (counts every product, drafts too).
- 📂 `controllers/adminCategoryController.ts → getAdminCategories`

**Postman:** GET · `{{baseUrl}}/admin/categories` · Send → `200` 8 categories with `productCount`.

### 11.9 `POST /api/admin/categories` · 👑

- 🧭 **Categories → Add Category**.
- 📂 `controllers/adminCategoryController.ts → createCategory`

**Postman:** POST · `{{baseUrl}}/admin/categories` · Body JSON:

```json
{ "name": "Toys & Games", "icon": "toys" }
```

✅ `201` `'Toys & Games' has been added.` with `slug: "toys-games"`. It appears in `GET /api/categories` (the
shop) straight away. 📝 Copy its `_id`.

❌ `{ "name": "toys games" }` → `409` (same slug). `{ "name": "Pets", "icon": "<b>pets</b>" }` → `400` (icons
must be Material icon names).

### 11.10 `PATCH /api/admin/categories/:id` · 👑

- 🧭 **Edit** a category's name or icon.
- 📂 `controllers/adminCategoryController.ts → updateCategory`

**Postman:** PATCH · `{{baseUrl}}/admin/categories/THE-TOYS-ID` · Body JSON: `{ "name": "Toys, Games & Hobbies" }`

✅ `200`, and the slug **stays** `toys-games` (links keep working after a rename).
❌ `{ "name": "Fashion" }` → `409` `That name is already in use.`

### 11.11 `DELETE /api/admin/categories/:id` · 👑

- 🧭 **Delete** a category.
- 📂 `controllers/adminCategoryController.ts → deleteCategory`

**Postman:** DELETE · `{{baseUrl}}/admin/categories/THE-TOYS-ID` → `200` deleted.

❌ `DELETE {{baseUrl}}/admin/categories/{{categoryId}}` (Electronics) → `409` `'Electronics' still has 15
products. Move or delete them first.`

---

## 12. Admin dashboard (1 endpoint)

### 12.1 `GET /api/admin/dashboard?range=30d` · 👑 ⭐

- 🧭 **Admin → Dashboard Overview**, the whole page in one request: Total Sales (+%), Total Orders (+%),
  Catalog Products ("4 Low Stock"), Total Customers ("+210 new"), the sales chart with its peak, Avg. Order
  Value, Refund Rate, Recent Orders, Top-Selling Products and Low-Stock Alerts. The **7D / 30D / 90D / Year**
  buttons change `range`.
- 📂 `controllers/adminDashboardController.ts → getDashboard`

**Postman:** GET · `{{baseUrl}}/admin/dashboard` · Send. Then Params `range` = `7d`, `90d`, `year`.

✅ `200` with `cards`, `chart` (one point per day; per month for `year`), `peak`, `avgOrderValue`,
`refundRate`, `recentOrders`, `topProducts` and `lowStock`. Thanks to the 41 demo orders, everything has
numbers.

❌ `range=week` → `400` `Unknown range: week. Use one of: 7d, 30d, 90d, year.`

💬 The orders you placed today appear in today's chart point and in Recent Orders.

---

## 13. Demo panel (2 endpoints)

These exist only when `DEMO_MODE=true` (otherwise they answer `404`). See `routes/adminRoutes.ts`.

### 13.1 `POST /api/admin/demo/advance-orders` · 👑

- 🧭 The demo panel's **"Move orders along"** button: every order moves one step (processing → shipped →
  delivered), so the trackers visibly move during a presentation.
- 📂 `controllers/demoController.ts → advanceOrders`

**Postman:** POST · `{{baseUrl}}/admin/demo/advance-orders` · Send

✅ `200` `5 order(s) shipped and 3 order(s) delivered.` (your numbers will differ). Then show
`GET /api/orders` as Ada: her orders moved.

### 13.2 `POST /api/admin/demo/reset` · 👑 (do this LAST)

- 🧭 The demo panel's **"Reset demo data"** button: everything goes back to the starting demo data, and
  photos you uploaded are deleted from Cloudinary. Newsletter subscribers are kept (they're real people).
- 📂 `controllers/demoController.ts → resetDemo` (uses `data/seed.ts → seedDatabase` and
  `config/cloudinary.ts → deleteAllUploadedPhotos`)

**Postman:** POST · `{{baseUrl}}/admin/demo/reset` · Body JSON:

```json
{ "confirm": "RESET" }
```

✅ `200` `The demo data has been reset. Please log in again.` with the counts (40 products, 41 orders...).

❌ Without the body → `400` `This deletes all changes. Send { "confirm": "RESET" } to go ahead.`

⚠️ After a reset, **every token stops working** (the accounts were made again). Any request with the old
`{{adminToken}}` → `401` `This account no longer exists. Please log in again.` Just send **Login as admin**
and **Login as Ada** again.

---

# Part D: A 10-minute demo script

If you only have a few minutes, do these saved requests in this order. Each line says what to **say**.

| #  | Request                                         | Say                                                         |
| -- | ----------------------------------------------- | ----------------------------------------------------------- |
| 1  | `GET /health`                                   | "The API is running."                                       |
| 2  | `GET /products?category=electronics&sort=price-asc` | "The Shop page: filter, sort, pages."                   |
| 3  | `GET /products/wireless-noise-cancelling-headphones` | "Product Details. No cost price for shoppers."         |
| 4  | `POST /auth/register` (then the same again)     | "Sign up. Password rules, and a used email is refused."      |
| 5  | `POST /auth/login` as Ada                       | "Log in: the token is my wristband."                         |
| 6  | `GET /auth/me` without a token, then with       | "Protected routes need the token."                           |
| 7  | `POST /promo-codes/check` QUICK25 with 20000    | "Promo rules: it tells you how much more to add."            |
| 8  | `POST /orders` (then a card ending 0000)        | "Checkout: prices from the database, fake card declined."    |
| 9  | `GET /admin/orders` with **Ada's** token        | "Customers can't open admin routes: 403."                    |
| 10 | `PATCH /admin/orders/:n/status` shipped → delivered | "The admin ships and delivers..."                        |
| 11 | `GET /orders/:n` as Ada                         | "...and the customer's tracker moves."                       |
| 12 | `POST /reviews`                                 | "Only after delivery can Ada review it."                     |
| 13 | `POST /admin/uploads` + `POST /admin/products`  | "The admin uploads a photo to Cloudinary and adds a product." |
| 14 | `GET /admin/dashboard?range=30d`                | "The dashboard: sales, chart, top sellers, low stock."       |
| 15 | `POST /admin/demo/reset`                        | "And one button puts everything back for the next demo."     |

**Tips for the presentation:**

- Run `npm run seed` just before you start. Ada's newest demo order can then still be cancelled for ~30
  minutes.
- Make the Postman text bigger: **Ctrl + =** (zoom in).
- Keep VS Code open next to Postman. When you send a request, open its controller (Part B) and point at the
  line that sends the message you just saw, e.g. `"Only admins can do this."` in `middleware/auth.ts`.
- Keep the terminal visible: without a Brevo key, the emails are printed there.

---

# Part E: When something goes wrong

| You see                                                     | Why                                         | Fix                                               |
| ----------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------- |
| **Could not send request** / `ECONNREFUSED`                 | the server isn't running                     | `npm run dev` in `server/` and wait for "QuickCart API running" |
| `{{baseUrl}}` is **red** in the URL                         | no environment selected                      | top-right dropdown → **QuickCart Local** (A7)      |
| `401 Please log in to continue.`                            | no token on this request                     | Authorization → Bearer Token → `{{adaToken}}` (A9) |
| `401 Your session has expired...`                           | the token is broken or old                   | log in again and update the variable               |
| `401 This account no longer exists...`                      | you ran the seed / reset after logging in    | log in again                                       |
| `401 Your password was changed...`                          | you changed the password after this token    | log in again (or use the new token from the reply) |
| `403 Only admins can do this.`                              | you used Ada's token on an admin route       | use `{{adminToken}}`                               |
| `400 The request body is not valid JSON`                    | a JSON grammar mistake (A8)                  | look for a missing quote or comma, or an extra comma at the end |
| `400` but your data looks right                             | Body is on **Text**, not **JSON**            | Body → raw → change Text to **JSON**               |
| `404 Not found: POST /api/...`                              | a typo in the URL or the wrong method        | compare with the card in Part C                    |
| `404` on `/admin/demo/...`                                  | `DEMO_MODE` isn't `true`                     | set `DEMO_MODE=true` in `.env`, restart `npm run dev` |
| `400 Free cancellation is only available within 1 hour...`  | the order is older than an hour              | place a new order and cancel that one              |
| `503 Photo uploads are not set up...`                       | the Cloudinary keys are missing from `.env`  | add the 3 `CLOUDINARY_` settings and restart       |
| `500 Something went wrong on our side`                      | a real bug                                   | read the red error in the server terminal           |
| no email arrives                                            | no Brevo key, or it went to Spam             | look in the terminal (emails are printed there), and check Spam |

Good luck with the demo! 🚀
