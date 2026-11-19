// AccountRecoveryLayout.tsx client/src/components/auth/AccountRecoveryLayout.tsx
// The two-part layout of the forgot / reset / verify pages: the blue "QuickCart Shield" panel on the left, and the
// white card (children) on the right. (Designs: Forgot Password, Reset Password & Email Verification)

// STEP 37 (part 1): The account recovery layout

import type { ReactNode } from "react";
import {
  MdOutlineDevices,
  MdOutlineEnhancedEncryption,
  MdOutlineShield,
  MdOutlineTimer,
} from "react-icons/md";

// The 3 promises in the panel are TRUE of your server (server STEP 19): links last 15 minutes, only hashes are
// stored, and changing the password logs out every other device (protect checks passwordChangedAt, STEP 18).
const promises = [
  { text: "15-minute validity window", icon: MdOutlineTimer },
  {
    text: "Zero credentials stored in plain text",
    icon: MdOutlineEnhancedEncryption,
  },
  { text: "Revokes sessions on all other devices", icon: MdOutlineDevices },
];

type AccountRecoveryLayoutProps = {
  title: string; // the big words in the blue panel
  text: string;
  children: ReactNode;
};

const AccountRecoveryLayout = ({
  title,
  text,
  children,
}: AccountRecoveryLayoutProps) => {
  return (
    <div className="mx-auto grid max-w-360 items-start gap-8 px-4 py-12 md:px-12 lg:grid-cols-[0.8fr_1fr] max-lg:grid-cols-1">
      <aside className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary-hover to-primary p-8 text-white shadow-banner md:p-10">
        <div
          aria-hidden="true"
          className="absolute -top-20 -right-20 size-72 rounded-full bg-white/10 blur-3xl"
        />
        <div className="relative">
          <div className="mb-10 flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-white/15">
              <MdOutlineShield size={26} aria-hidden="true" />
            </span>
            <p>
              <span className="block text-xs font-bold tracking-wider text-white/80 uppercase">
                Security protocol
              </span>
              <span className="text-xl font-semibold">QuickCart Shield</span>
            </p>
          </div>

          <h2 className="text-4xl leading-12 font-bold tracking-tight">
            {title}
          </h2>
          <p className="mt-4 text-base leading-7 text-white/80">{text}</p>

          <ul className="mt-8 flex flex-col gap-4 rounded-2xl bg-white/10 p-5">
            {promises.map((promise) => (
              <li
                key={promise.text}
                className="flex items-center gap-3 font-medium"
              >
                <promise.icon
                  size={22}
                  aria-hidden="true"
                  className="shrink-0 text-mint"
                />{" "}
                {promise.text}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="rounded-3xl bg-surface p-6 shadow-card md:p-10">
        {children}
      </div>
    </div>
  );
};

export default AccountRecoveryLayout;
