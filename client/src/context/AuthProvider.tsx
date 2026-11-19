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
  const [checking, setChecking] = useState(
    () => localStorage.getItem(TOKEN_KEY) !== null,
  );

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

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean,
  ) => {
    // Errors (e.g. 401 "Incorrect email or password.") are thrown on to the login page, which shows them
    const reply = await api<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password, rememberMe },
    });
    startSession(reply);
    return reply; // the page needs reply.verification too (a code was emailed to an unverified shopper)
  };

  const register = async (data: RegisterData) => {
    const reply = await api<AuthResponse>("/auth/register", {
      method: "POST",
      body: data,
    });
    startSession(reply);
    return reply; // reply.verification: the code the server just emailed
  };

  // "Continue with Google": the server checks Google's token, then logs in (or creates) the account
  const googleLogin = async (credential: string) => {
    const reply = await api<AuthResponse>("/auth/google", {
      method: "POST",
      body: { credential },
    });
    startSession(reply);
    return reply;
  };

  const logout = () => {
    // The server has nothing to delete (server STEP 18): throwing the token away IS logging out.
    // We still tell it, without waiting, in case it ever needs to know.
    api("/auth/logout", { method: "POST" }).catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        checking,
        login,
        register,
        googleLogin,
        logout,
        setUser,
        startSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
