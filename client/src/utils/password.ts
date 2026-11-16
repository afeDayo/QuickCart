// password.ts client/src/utils/password.ts
// The password rules, shared by the register page (STEP 31) and the reset password page (STEP 37).
// (In its own file, not in PasswordStrength.tsx: React's live reload works best when a .tsx file only exports components.)

// STEP 31 (part 4): Password rules

// The first 3 are REQUIRED by the server (server/src/utils/password.ts). The symbol only makes it stronger.
export const PASSWORD_RULES = [
  {
    label: "At least 8 characters",
    test: (password: string) => password.length >= 8,
  },
  {
    label: "At least one uppercase (A-Z)",
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    label: "At least one number (0-9)",
    test: (password: string) => /\d/.test(password),
  },
  {
    label: "At least one symbol (@$!%*?)",
    test: (password: string) => /[^A-Za-z0-9]/.test(password),
  },
];

// true when the password passes the server's 3 required rules
export const isPasswordValid = (password: string) =>
  PASSWORD_RULES.slice(0, 3).every((rule) => rule.test(password));
