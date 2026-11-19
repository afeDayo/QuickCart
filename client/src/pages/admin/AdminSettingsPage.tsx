// AdminSettingsPage.tsx client/src/pages/admin/AdminSettingsPage.tsx
// Admin → Settings: your admin profile and password (the same forms as the shopper's Account Settings, STEP 39,
// because an admin is a user too), the shop's rules, and the demo tools.

// STEP 45 (part 2): The admin Settings page

import ChangePasswordForm from "../../components/account/ChangePasswordForm";
import EditProfileForm from "../../components/account/EditProfileForm";
import TeamPanel from "../../components/admin/TeamPanel";
import DemoPanel from "../../components/demo/DemoPanel";

// The rules the server uses (server/src/utils/orderRules.ts and data/promoCodes.ts). Shown here so the admin knows
// them; changing them means changing the server code, which is honest about what this project can do.
const RULES = [
  { label: "Standard delivery", value: "Free · 2–3 business days" },
  { label: "Express delivery", value: "₦2,500 · same day · Lagos only" },
  { label: "Pay on delivery", value: "Lagos only" },
  { label: "Cancelling", value: "Free, within 1 hour, while still processing" },
  {
    label: "Promo codes",
    value:
      "QUICK25 (₦2,000 off ₦25,000+) · QUICK10 (10% off ₦10,000+, up to ₦5,000)",
  },
];

const AdminSettingsPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Settings
        </h1>
        <p className="mt-2 max-w-130 text-ink-soft">
          Your admin account, the team, the shop's rules, and the demo tools.
        </p>
      </div>

      <div className="rounded-3xl bg-surface p-2 shadow-card">
        <EditProfileForm />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_420px] max-xl:grid-cols-1">
        <ChangePasswordForm />

        <section
          aria-labelledby="rules-title"
          className="rounded-3xl bg-surface p-6 shadow-card"
        >
          <h2 id="rules-title" className="text-xl font-semibold text-ink">
            Shop rules
          </h2>
          <dl className="mt-4 flex flex-col divide-y divide-line text-sm">
            {RULES.map((rule) => (
              <div
                key={rule.label}
                className="flex flex-col gap-0.5 py-2.5 first:pt-0 last:pb-0"
              >
                <dt className="font-semibold text-ink">{rule.label}</dt>
                <dd className="text-ink-soft">{rule.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-muted">
            Set in the server code (utils/orderRules.ts, data/promoCodes.ts).
          </p>
        </section>
      </div>

      {/* Team: who the admins are, and adding or removing admins */}
      <TeamPanel />

      <DemoPanel />
    </div>
  );
};

export default AdminSettingsPage;
