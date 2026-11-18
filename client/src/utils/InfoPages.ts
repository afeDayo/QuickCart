// infoPages.ts client/src/utils/infoPages.ts
// The text of the help and company pages the Footer links to (Shipping, Returns, FAQs, About, Terms, Privacy...).
// One list, one page component (pages/InfoPages.tsx), one route each (App.tsx). Every fact here matches what the
// shop really does (server/src/utils/orderRules.ts, data/promoCodes.ts): no made-up promises.

// STEP 45 (part 4): The help pages' text

export type InfoSection = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
};

export type InfoPageData = {
  path: string; // the address, e.g. "/help/shipping"
  group: "Help" | "Company"; // the small label above the title
  title: string;
  intro: string;
  sections: InfoSection[];
};

export const infoPages: InfoPageData[] = [
  {
    path: "/help/shipping",
    group: "Help",
    title: "Shipping & Delivery",
    intro: "How and when your order reaches you.",
    sections: [
      {
        heading: "Delivery options",
        list: [
          "Standard Delivery: free, everywhere in Nigeria, in 2–3 business days (Saturdays and Sundays don't count).",
          "Express Same-Day Dispatch: ₦2,500, Lagos addresses only. Your order leaves our warehouse the same day.",
        ],
      },
      {
        heading: "Tracking your order",
        paragraphs: [
          "Every order has a tracker under My Account → Orders. When your order leaves the warehouse we email you the courier's name and the waybill number.",
          "Our courier partners are QuickCart Express, GIG Logistics and DHL Express.",
        ],
      },
      {
        heading: "Pay on delivery",
        paragraphs: [
          "Available for Lagos addresses. You pay the rider when the order arrives.",
        ],
      },
    ],
  },
  {
    path: "/help/returns",
    group: "Help",
    title: "Cancellations & Returns",
    intro: "Changed your mind? Here's what you can do.",
    sections: [
      {
        heading: "Cancel within 1 hour",
        paragraphs: [
          "You can cancel an order yourself, free of charge, within 1 hour of placing it, as long as it hasn't been shipped yet. Open the order under My Account → Orders and click Cancel Order.",
          "If you paid by card, the payment is marked as refunded. If you chose pay on delivery, you're not charged.",
        ],
      },
      {
        heading: "After the first hour",
        paragraphs: [
          "Email help@quickcart.ng with your order number. Our team can still cancel an order that hasn't been delivered.",
          "QuickCart is a student capstone project, so there's no returns pick-up service for delivered orders.",
        ],
      },
    ],
  },
  {
    path: "/help/faqs",
    group: "Help",
    title: "FAQs & Help Desk",
    intro: "Quick answers to the questions shoppers ask most.",
    sections: [
      {
        heading: "Do I need an account to shop?",
        paragraphs: [
          "You can browse and fill your cart without one. You need an account to check out, so we can show you your orders.",
        ],
      },
      {
        heading: "How do promo codes work?",
        paragraphs: [
          "Type the code in your cart. QUICK25 takes ₦2,000 off orders of ₦25,000 or more. QUICK10 takes 10% off orders of ₦10,000 or more (up to ₦5,000).",
        ],
      },
      {
        heading: "Is my card really charged?",
        paragraphs: [
          "No. QuickCart is a demo shop: card payments are simulated and no money moves. We only keep the card type and its last 4 digits.",
        ],
      },
      {
        heading: "Who can review a product?",
        paragraphs: [
          "Shoppers who bought it and received it (a delivered order), so every review comes from a real purchase.",
        ],
      },
      {
        heading: "I forgot my password",
        paragraphs: [
          "Click Forgot password on the login page. We'll email you a link that works once, for 15 minutes.",
        ],
      },
      {
        heading: "Still stuck?",
        paragraphs: ["Email help@quickcart.ng."],
      },
    ],
  },
  {
    path: "/help/buyer-protection",
    group: "Help",
    title: "Buyer Protection",
    intro: "What we do to keep your shopping safe.",
    sections: [
      {
        heading: "Your account",
        list: [
          "Passwords are stored scrambled (hashed), never as plain text. Not even our team can read them.",
          "Changing your password logs out every other device.",
          "Password reset links work once and expire after 15 minutes.",
        ],
      },
      {
        heading: "Your orders",
        list: [
          "Prices are always checked by our server at checkout, so the price you see is the price you pay.",
          "Free cancellation within 1 hour of ordering, while the order is still being packed.",
          "Reviews come only from shoppers who received the product.",
        ],
      },
    ],
  },
  {
    path: "/about",
    group: "Company",
    title: "About QuickCart",
    intro:
      "A fast, friendly online shop for Nigeria, built as a full-stack capstone project.",
    sections: [
      {
        heading: "What QuickCart is",
        paragraphs: [
          "QuickCart sells electronics, fashion, home goods, beauty products and more, with prices in naira, delivery across Nigeria, and same-day dispatch in Lagos.",
          "It was designed and built from scratch: a React website and a Node.js + Express API with a MongoDB database, product photos on Cloudinary and emails through Brevo.",
        ],
      },
      {
        heading: "A demo shop",
        paragraphs: [
          "The products, orders and customers you see are demo data, and card payments are simulated. Feel free to try everything.",
        ],
      },
    ],
  },
  {
    path: "/careers",
    group: "Company",
    title: "Careers",
    intro: "QuickCart is a student project, so we're not hiring.",
    sections: [
      {
        heading: "Want to talk?",
        paragraphs: [
          "If you'd like to know more about how QuickCart was built, email help@quickcart.ng.",
        ],
      },
    ],
  },
  {
    path: "/merchants",
    group: "Company",
    title: "Merchant Partners",
    intro: "Every product in QuickCart is managed by our own team.",
    sections: [
      {
        heading: "Selling on QuickCart",
        paragraphs: [
          "QuickCart doesn't take outside sellers yet. Our admins add the products, set the prices and ship the orders from the admin dashboard.",
        ],
      },
    ],
  },
  {
    path: "/terms",
    group: "Company",
    title: "Terms of Service",
    intro: "The simple rules for using QuickCart.",
    sections: [
      {
        heading: "Using the shop",
        list: [
          "QuickCart is a demonstration shop built for a capstone project. Orders are not real purchases and nothing is actually shipped.",
          "Keep your password to yourself. You're responsible for what's done with your account.",
          "Don't try to break, overload or misuse the site.",
          "Reviews must be honest and about the product. We may remove reviews that aren't.",
        ],
      },
    ],
  },
  {
    path: "/privacy",
    group: "Company",
    title: "Privacy Policy",
    intro: "What we keep about you, and why.",
    sections: [
      {
        heading: "What we store",
        list: [
          "Your name, email and phone number, so you can log in and we can contact you about your orders.",
          "Your saved addresses and your orders, so we can deliver them and show your order history.",
          "For card payments, only the card type and its last 4 digits.",
          "Your newsletter subscription, if you subscribe. Every newsletter email has an unsubscribe link.",
        ],
      },
      {
        heading: "In your browser",
        paragraphs: [
          "Your login, your cart, and the products you viewed recently are kept in your own browser (local storage), not on our server.",
        ],
      },
      {
        heading: "Services we use",
        paragraphs: [
          "MongoDB Atlas stores the data, Cloudinary stores the product photos and Brevo sends our emails. We never sell your data.",
        ],
      },
    ],
  },
];
