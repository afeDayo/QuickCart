// google.d.ts client/src/types/google.d.ts
// The small part of Google's sign-in script (https://accounts.google.com/gsi/client) that QuickCart uses,
// so TypeScript knows window.google. The script itself is loaded by components/auth/SocialSignIn.tsx.

interface GoogleCredentialResponse {
  credential: string; // the signed ID token: the server checks it (POST /api/auth/google)
}

interface GoogleButtonOptions {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number; // in pixels, up to 400
  locale?: string;
}

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (options: {
          client_id: string;
          callback: (response: GoogleCredentialResponse) => void;
          auto_select?: boolean;
          cancel_on_tap_outside?: boolean;
          ux_mode?: "popup" | "redirect";
        }) => void;
        renderButton: (parent: HTMLElement, options: GoogleButtonOptions) => void;
      };
    };
  };
}
