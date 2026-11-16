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
