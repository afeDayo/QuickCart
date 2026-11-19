// AuthContext.ts client/src/context/AuthContext.ts
// "Who is logged in?" for the whole website. Any component can ask:
//   const { user, login, logout } = useAuth();
// The values come from AuthProvider.tsx, which wraps the whole app in main.tsx.

// STEP 31 (part 1): The auth context

import { createContext, useContext } from "react";

import type { AuthResponse, User } from "../types/api";

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
  login: (
    email: string,
    password: string,
    rememberMe: boolean,
  ) => Promise<AuthResponse>; // the whole reply: the user, and "verification" if a code was just emailed
  register: (data: RegisterData) => Promise<AuthResponse>;
  googleLogin: (credential: string) => Promise<AuthResponse>; // "Continue with Google" (components/auth/SocialSignIn.tsx)
  logout: () => void;
  setUser: (user: User) => void; // after the profile changes (STEP 39), show the new name everywhere
  startSession: (auth: AuthResponse) => User; // log in with a token the server just gave (reset password, STEP 37)
};

// null until AuthProvider gives it a value
export const AuthContext = createContext<AuthContextValue | null>(null);

// The hook every component uses. It complains loudly if AuthProvider is missing (a mistake in main.tsx),
// instead of failing later with "cannot read properties of null".
export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error(
      "useAuth must be used inside <AuthProvider> (see main.tsx)",
    );
  }
  return value;
};
