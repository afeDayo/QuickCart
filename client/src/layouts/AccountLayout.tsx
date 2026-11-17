// AccountLayout.tsx client/src/layouts/AccountLayout.tsx
// The frame of the My Account pages (App.tsx puts Overview, Order History, Addresses, Saved Items and Settings inside it):
// "Home › My Account", the menu on the left, and the page on the right (<Outlet />).

// STEP 39 (part 3): The account layout

import { Outlet } from "react-router-dom";
import Breadcrumb from "../components/common/Breadcrumb";
import AccountSidebar from "../components/layout/AccountSidebar";

const AccountLayout = () => {
  return (
    <div className="mx-auto max-w-360 px-4 pt-6 pb-20 md:px-12">
      <Breadcrumb
        items={[{ label: "Home", to: "/" }, { label: "My Account" }]}
      />
      <div className="grid items-start gap-8 lg:grid-cols-[300px_1fr]">
        <AccountSidebar />
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;
