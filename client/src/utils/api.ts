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

export const api = async <T>(
  path: string,
  { method = "GET", body, signal }: ApiOptions = {},
): Promise<T> => {
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
      body:
        body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    // fetch only throws when there's no answer at all: the server is off, or there's no internet.
    // (A cancelled request is not a real error: let the page ignore it.)
    if ((error as Error).name === "AbortError") {
      throw error;
    }
    throw new ApiError(
      0,
      "Can't reach QuickCart right now. Check your connection and try again.",
    );
  }

  // Every QuickCart reply is JSON. ".catch" covers an empty or broken reply.
  const data = await response.json().catch(() => ({}));

  // 400, 401, 404, 500...: the server's own message, e.g. "Incorrect email or password."
  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.message ?? "Something went wrong. Please try again.",
    );
  }

  return data as T;
};
