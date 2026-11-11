// products.ts
// Every product from the designs (Shop, Home and Product Details pages).
// Products that appear on several pages under different names are listed once, using the Shop page name.
// The order of this list is the "Featured" order on the Shop page.
// "category" is a category slug; seed.ts swaps it for the real category id.
// Prices are whole naira (45000 = ₦45,000).
// Tags used by the Home page sections: featured, flash-deal, fast-deal, deal, new-arrival, recommended.

import type {
  IProductColor,
  IProductHighlight,
  IProductSpec,
} from "../models/Product";

export type SeedProduct = {
  name: string;
  category: string;
  brand: string;
  sku: string;
  price: number;
  oldPrice?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  sold?: number; // units sold; seed.ts uses reviewCount x 4 when not set
  flashSaleStock?: number; // units offered in the flash sale
  description: string;
  tagline?: string; // one short line for small cards
  priceNote?: string; // short line under the price on small cards
  badge?: string;
  features?: string[];
  colors?: IProductColor[];
  specs?: IProductSpec[];
  tags?: string[];
  gallery?: string[]; // extra photo file names in /images/products for the product page
  highlights?: IProductHighlight[];
  ratingCounts?: number[]; // 5, 4, 3, 2 and 1 star counts; seed.ts makes them up when not set
  bundle?: string[]; // names of "Frequently Bought Together" products
  related?: string[]; // names of "Related Products"
};

// ═══ STEP 10 (part of this step): Write the demo data
// The 40 demo products.
// Main explanation: STEP 10 in server/src/data/categories.ts (and README.md)
// ═══
export const products: SeedProduct[] = [
  // ---------- Shop page, in the order the design shows them (this is the "Featured" order) ----------
  {
    name: "Wireless Noise-Cancelling Headphones",
    category: "electronics",
    brand: "Aura Sound Labs",
    sku: "QC-AU-9042",
    price: 45000,
    oldPrice: 60000,
    stock: 124,
    rating: 4.8,
    sold: 1420,
    reviewCount: 248,
    badge: "SALE",
    description:
      "Immersive sound with adaptive hybrid active noise cancellation, 30-hour battery life, and plush memory foam over-ear cups. Engineered for pure acoustic clarity and supreme everyday durability.",
    features: [
      "40mm Neodymium Drivers",
      "Bluetooth 5.3 Multipoint",
      "30h Playback w/ ANC",
      "USB-C Fast Fueling",
    ],
    colors: [
      { name: "Midnight Black", hex: "#1f2937" },
      { name: "Silver Frost", hex: "#cbd5e1" },
      { name: "Space Navy", hex: "#1e293b" },
    ],
    specs: [
      {
        group: "Audio & Connectivity",
        label: "Driver Size",
        value: "40mm Neodymium Custom Tuned",
      },
      {
        group: "Audio & Connectivity",
        label: "Frequency Response",
        value: "15 Hz – 40,000 Hz",
      },
      {
        group: "Audio & Connectivity",
        label: "Bluetooth Version",
        value: "v5.3 Multipoint (2 devices simultaneous)",
      },
      {
        group: "Audio & Connectivity",
        label: "Supported Codecs",
        value: "LDAC, AAC, SBC",
      },
      {
        group: "Audio & Connectivity",
        label: "Noise Cancellation",
        value: "Hybrid ANC with Ambient Aware Mode",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Battery Life",
        value: "30 hrs (ANC On) / 45 hrs (ANC Off)",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Charging Port",
        value: "USB Type-C Fast Charge",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Total Weight",
        value: "250 grams (Ultra lightweight)",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Microphones",
        value: "4 Beamforming with ENC voice clarity",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Included in Box",
        value: "Headphones, Hard Case, 3.5mm Aux Cable, USB-C",
      },
    ],
    tags: ["audio", "wireless", "noise-cancelling", "bluetooth", "featured"],

    highlights: [
      {
        icon: "hearing",
        title: "Hybrid Active Noise Cancelling",
        text: "Four dedicated beamforming microphones continuously measure exterior noise levels and cancel frequencies up to -35dB for uninterrupted focus.",
      },
      {
        icon: "bolt",
        title: "Speed Fuel USB-C Charging",
        text: "Get 5 hours of high-resolution playback from a rapid 10-minute USB-C boost. Full battery replenishes completely in just 65 minutes.",
      },
      {
        icon: "graphic_eq",
        title: "Studio-Mastered Hi-Res Audio",
        text: "Hi-Res Audio Certified with low-latency AAC and LDAC codec compatibility delivers crystal-clear mid-tones and visceral, punchy bass.",
      },
    ],
    ratingCounts: [203, 30, 10, 3, 2], // 82%, 12%, 4%, 1%, 1% of 248
    bundle: [
      "Protective Hard Shell Case",
      "Gold-Plated 3.5mm AUX Cable",
      "Fast Dual USB-C GaN Charger 35W",
    ],
    related: [
      "Over-Ear Studio Monitors",
      "True Wireless ANC Earbuds",
      "Magnetic Headphone Stand & USB Hub",
      "Hi-Res DAC Audio Adapter",
    ],
  },
  {
    name: "Canvas Low-Top Sneakers",
    category: "fashion",
    brand: "UrbanStride",
    sku: "QC-FTWR-312",
    price: 18500,
    stock: 58,
    rating: 4.8,
    sold: 980,
    reviewCount: 89,
    badge: "TOP SELLER",
    description:
      "All-day off-white canvas sneakers with a cushioned sole. Sizes 40–45, unisex.",
    features: [
      "12oz Cotton Canvas Upper",
      "Cushioned EVA Footbed",
      "Vulcanized Rubber Sole",
      "Unisex Sizes 40–45",
    ],
    colors: [
      { name: "Off-White", hex: "#f5f0e6" },
      { name: "Charcoal Black", hex: "#2b2b2b" },
      { name: "Olive Green", hex: "#6b7a4b" },
    ],
    specs: [
      {
        group: "Fit & Materials",
        label: "Upper Material",
        value: "12oz heavyweight cotton canvas",
      },
      {
        group: "Fit & Materials",
        label: "Lining",
        value: "Breathable cotton drill",
      },
      {
        group: "Fit & Materials",
        label: "Insole",
        value: "Removable cushioned EVA footbed",
      },
      {
        group: "Fit & Materials",
        label: "Fit",
        value: "True to size (half sizes, go one up)",
      },
      {
        group: "Fit & Materials",
        label: "Available Sizes",
        value: "EU 40 – 45 (unisex)",
      },
      {
        group: "Sole, Care & Box Contents",
        label: "Outsole",
        value: "Vulcanized natural rubber with grip pattern",
      },
      {
        group: "Sole, Care & Box Contents",
        label: "Closure",
        value: "Flat cotton laces, 6 metal eyelets",
      },
      {
        group: "Sole, Care & Box Contents",
        label: "Weight",
        value: "380 grams per shoe (size 42)",
      },
      {
        group: "Sole, Care & Box Contents",
        label: "Care",
        value: "Spot clean with mild soap; air dry",
      },
      {
        group: "Sole, Care & Box Contents",
        label: "Included in Box",
        value: "Pair of sneakers, spare white laces, dust bag",
      },
    ],
    tags: ["footwear", "sneakers", "featured", "recommended"],
    highlights: [
      {
        icon: "checkroom",
        title: "Goes With Everything",
        text: "A clean off-white profile that pairs with jeans, chinos or native wear, so one pair covers the office, church and the weekend.",
      },
      {
        icon: "favorite",
        title: "All-Day Cushioned Comfort",
        text: "A removable EVA footbed absorbs every step, keeping your feet fresh through long days in traffic and on your feet.",
      },
      {
        icon: "verified",
        title: "Built To Last",
        text: "Double-stitched heavyweight canvas and a vulcanized rubber sole hold their shape season after season.",
      },
    ],
    ratingCounts: [75, 10, 3, 1, 0], // 84%, 11%, 3%, 1%, 0% of 89
    bundle: [
      "Minimalist Leather Wallet",
      "Polarized UV Sunglasses",
      "Cotton Twill Backpack",
    ],
    related: [
      "Court Classic Lows",
      "Premium Linen Overshirt",
      "Cotton Twill Backpack",
      "Minimalist Leather Wallet",
    ],
  },
  {
    name: "Ceramic Mug Set",
    category: "kitchen",
    brand: "Aurora Home",
    sku: "QC-HM-108",
    price: 9000,
    stock: 26,
    rating: 4.7,
    reviewCount: 31,
    description:
      "Handcrafted speckled ceramic mugs in warm clay, set of 2 (350ml each).",
    features: [
      "Set of 2 × 350ml Mugs",
      "Hand-Glazed Stoneware",
      "Microwave & Dishwasher Safe",
      "Lead-Free Speckled Finish",
    ],
    colors: [
      { name: "Warm Clay", hex: "#c48a6a" },
      { name: "Oat Speckle", hex: "#e8dccb" },
      { name: "Sage Green", hex: "#9caf88" },
    ],
    specs: [
      {
        group: "Design & Materials",
        label: "Material",
        value: "High-fired stoneware ceramic",
      },
      {
        group: "Design & Materials",
        label: "Finish",
        value: "Hand-dipped speckled glaze (lead-free)",
      },
      {
        group: "Design & Materials",
        label: "Capacity",
        value: "350ml per mug",
      },
      {
        group: "Design & Materials",
        label: "Dimensions",
        value: "9.5cm tall × 8.5cm wide",
      },
      {
        group: "Design & Materials",
        label: "Handle",
        value: "Wide ergonomic loop handle",
      },
      {
        group: "Care & Box Contents",
        label: "Microwave Safe",
        value: "Yes",
      },
      {
        group: "Care & Box Contents",
        label: "Dishwasher Safe",
        value: "Yes (top rack recommended)",
      },
      {
        group: "Care & Box Contents",
        label: "Weight",
        value: "320 grams per mug",
      },
      {
        group: "Care & Box Contents",
        label: "Craft Note",
        value: "Each glaze is unique; small variations are normal",
      },
      {
        group: "Care & Box Contents",
        label: "Included in Box",
        value: "2 mugs in a padded gift box",
      },
    ],
    tags: ["coffee", "ceramics", "featured", "recommended"],
    highlights: [
      {
        icon: "palette",
        title: "Handcrafted Speckled Glaze",
        text: "Each mug is hand-dipped in a warm clay glaze, so no two pieces look exactly the same.",
      },
      {
        icon: "thermostat",
        title: "Keeps Your Brew Warm",
        text: "Thick stoneware walls hold heat longer, giving you time to enjoy your morning coffee or tea.",
      },
      {
        icon: "verified",
        title: "Everyday Tough",
        text: "Microwave and dishwasher safe with a lead-free glaze, made for daily use rather than the display shelf.",
      },
    ],
    ratingCounts: [25, 4, 1, 1, 0], // 81%, 13%, 3%, 3%, 0% of 31
    bundle: [
      "Ceramic Pour-Over Dripper",
      "Electric Gooseneck Kettle",
      "Scented Soy Candle Duo",
    ],
    related: [
      "Ceramic Pour-Over Dripper",
      "Electric Gooseneck Kettle",
      "Smart Gooseneck Kettle",
      "Cast Iron Skillet 10-inch",
    ],
  },
  {
    name: "Skincare Hydration Kit",
    category: "beauty",
    brand: "PureGlow Organics",
    sku: "QC-BT-504",
    price: 22000,
    oldPrice: 28000,
    stock: 3,
    rating: 4.9,
    sold: 830,
    reviewCount: 115,
    badge: "SALE",
    description:
      "Hydrating serum, essence and cream trio with verified batch numbers.",
    features: [
      "Hyaluronic Acid Serum 30ml",
      "Rice Water Essence 100ml",
      "Ceramide Cream 50ml",
      "Verified Batch Numbers",
    ],
    colors: [
      { name: "Classic Trio", hex: "#f3e5dc" },
      { name: "Fragrance-Free Trio", hex: "#e6eef0" },
    ],
    specs: [
      {
        group: "Formula & Skin Type",
        label: "Key Ingredients",
        value: "Hyaluronic acid, ceramides, rice water, niacinamide",
      },
      {
        group: "Formula & Skin Type",
        label: "Skin Type",
        value: "All skin types, including sensitive",
      },
      {
        group: "Formula & Skin Type",
        label: "Free From",
        value: "Parabens, sulfates, mineral oil",
      },
      {
        group: "Formula & Skin Type",
        label: "Dermatologist Tested",
        value: "Yes, non-comedogenic",
      },
      {
        group: "Formula & Skin Type",
        label: "Routine",
        value: "Morning and night (essence → serum → cream)",
      },
      {
        group: "Size, Shelf Life & Box Contents",
        label: "Serum",
        value: "30ml dropper bottle",
      },
      {
        group: "Size, Shelf Life & Box Contents",
        label: "Essence",
        value: "100ml bottle",
      },
      {
        group: "Size, Shelf Life & Box Contents",
        label: "Cream",
        value: "50ml jar",
      },
      {
        group: "Size, Shelf Life & Box Contents",
        label: "Shelf Life",
        value: "24 months sealed / 12 months after opening",
      },
      {
        group: "Size, Shelf Life & Box Contents",
        label: "Included in Box",
        value: "Serum, essence, cream, batch authenticity card",
      },
    ],
    tags: ["skincare", "self-care", "featured", "recommended"],
    highlights: [
      {
        icon: "water_drop",
        title: "72-Hour Deep Hydration",
        text: "Hyaluronic acid and ceramides lock moisture into the skin, keeping it plump and soft even in harmattan.",
      },
      {
        icon: "verified",
        title: "Verified Authentic Batches",
        text: "Every kit carries a batch number you can check against our authenticity card, so you know it's the real thing.",
      },
      {
        icon: "spa",
        title: "Gentle Three-Step Routine",
        text: "A simple essence, serum and cream routine that suits all skin types, including sensitive skin.",
      },
    ],
    ratingCounts: [104, 9, 2, 0, 0], // 90%, 8%, 2%, 0%, 0% of 115
    bundle: [
      "Botanical Radiance Elixir",
      "Scented Soy Candle Duo",
      "Eco Grip Yoga Mat",
    ],
    related: [
      "Botanical Radiance Elixir",
      "Scented Soy Candle Duo",
      "Eco Grip Yoga Mat",
      "Insulated 1L Hydro Flask",
    ],
  },
  {
    name: "Smart Watch Ultra",
    category: "electronics",
    brand: "Aura Wearables",
    sku: "QC-WTCH-88",
    price: 55000,
    stock: 42,
    rating: 4.6,
    reviewCount: 67,
    description:
      "Titanium casing with an always-on AMOLED screen, GPS + Cellular, and multi-day battery life.",
    features: [
      '1.9" Always-On AMOLED',
      "Titanium Case, 49mm",
      "GPS + Cellular (eSIM)",
      "Up to 72h Battery",
    ],
    colors: [
      { name: "Natural Titanium", hex: "#b9b4ab" },
      { name: "Black Titanium", hex: "#2f2f33" },
      { name: "Ocean Blue", hex: "#1e3a5f" },
    ],
    specs: [
      {
        group: "Display & Connectivity",
        label: "Display",
        value: '1.9" always-on AMOLED, 2000 nits',
      },
      {
        group: "Display & Connectivity",
        label: "Cellular",
        value: "eSIM, 4G LTE calls and data",
      },
      {
        group: "Display & Connectivity",
        label: "Location",
        value: "Dual-band GPS, GLONASS, Galileo",
      },
      {
        group: "Display & Connectivity",
        label: "Sensors",
        value: "Heart rate, SpO2, skin temperature, compass",
      },
      {
        group: "Display & Connectivity",
        label: "Compatibility",
        value: "Android 10+ and iOS 15+",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Battery Life",
        value: "Up to 72 hrs (typical) / 36 hrs (GPS on)",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Case",
        value: "49mm aerospace-grade titanium, sapphire glass",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Water Resistance",
        value: "10 ATM (swim-proof)",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Weight",
        value: "61 grams (case only)",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Included in Box",
        value: "Watch, silicone sport band, magnetic USB-C charger",
      },
    ],
    tags: ["wearables", "watch", "new-arrival"],
    highlights: [
      {
        icon: "watch",
        title: "Always-On Titanium Build",
        text: "A sapphire-covered AMOLED screen in a light titanium case that stays readable in full Lagos sunshine.",
      },
      {
        icon: "devices",
        title: "Calls Without Your Phone",
        text: "Built-in eSIM and GPS let you take calls, get messages and track runs while your phone stays at home.",
      },
      {
        icon: "battery_charging_full",
        title: "Multi-Day Battery",
        text: "Up to 72 hours on a single charge, and a 30-minute top-up gives you a full day of use.",
      },
    ],
    ratingCounts: [49, 12, 4, 1, 1], // 73%, 18%, 6%, 1%, 1% of 67
    bundle: [
      "Compact GaN Fast Charger 65W",
      "Fast Dual USB-C GaN Charger 35W",
      "True Wireless ANC Earbuds",
    ],
    related: [
      "Apex Tracker Watch",
      "AeroPro Wireless Buds",
      "True Wireless ANC Earbuds",
      "Bluetooth Portable Speaker",
    ],
  },
  {
    name: "Eco Grip Yoga Mat",
    category: "sports",
    brand: "ZenFit Athletics",
    sku: "QC-FT-881",
    price: 7500,
    stock: 4,
    rating: 4.6,
    sold: 640,
    reviewCount: 53,
    description:
      "Non-slip, non-toxic yoga mat made from biodegradable natural rubber.",
    features: [
      "Natural Tree Rubber Base",
      "6mm Joint-Friendly Cushion",
      "Non-Slip Wet Grip",
      "Carry Strap Included",
    ],
    colors: [
      { name: "Forest Green", hex: "#2f5d50" },
      { name: "Terracotta", hex: "#c0674a" },
      { name: "Slate Grey", hex: "#5b6470" },
    ],
    specs: [
      {
        group: "Size & Materials",
        label: "Dimensions",
        value: "183cm × 61cm",
      },
      {
        group: "Size & Materials",
        label: "Thickness",
        value: "6mm",
      },
      {
        group: "Size & Materials",
        label: "Base Material",
        value: "Biodegradable natural tree rubber",
      },
      {
        group: "Size & Materials",
        label: "Top Layer",
        value: "Polyurethane grip surface",
      },
      {
        group: "Size & Materials",
        label: "Free From",
        value: "PVC, latex additives, toxic dyes",
      },
      {
        group: "Grip, Care & Box Contents",
        label: "Grip",
        value: "Non-slip when dry or sweaty",
      },
      {
        group: "Grip, Care & Box Contents",
        label: "Weight",
        value: "2.2 kg",
      },
      {
        group: "Grip, Care & Box Contents",
        label: "Alignment Lines",
        value: "Laser-etched centre and edge guides",
      },
      {
        group: "Grip, Care & Box Contents",
        label: "Care",
        value: "Wipe with a damp cloth; dry away from direct sun",
      },
      {
        group: "Grip, Care & Box Contents",
        label: "Included in Box",
        value: "Yoga mat, cotton carry strap",
      },
    ],
    tags: ["yoga", "fitness", "new-arrival"],
    highlights: [
      {
        icon: "eco",
        title: "Earth-Friendly Natural Rubber",
        text: "Made from biodegradable tree rubber with no PVC or toxic dyes, so it's kinder to your skin and the planet.",
      },
      {
        icon: "self_improvement",
        title: "Grip That Holds Every Pose",
        text: "The polyurethane top layer stays grippy even when you sweat, so hands and feet stay put in downward dog.",
      },
      {
        icon: "fitness_center",
        title: "6mm Joint Support",
        text: "Thick, springy cushioning protects knees and wrists on tiled or concrete floors.",
      },
    ],
    ratingCounts: [39, 9, 3, 1, 1], // 74%, 17%, 6%, 2%, 2% of 53
    bundle: [
      "Resistance Workout Bands",
      "Stainless Steel Thermal Flask",
      "Insulated 1L Hydro Flask",
    ],
    related: [
      "Resistance Workout Bands",
      "Insulated 1L Hydro Flask",
      "Stainless Steel Thermal Flask",
      "Apex Tracker Watch",
    ],
  },
  {
    name: "Design Systems Handbook",
    category: "books",
    brand: "Techstudio",
    sku: "QC-BK-301",
    price: 6000,
    stock: 100,
    rating: 4.7,
    reviewCount: 38,
    description:
      "Hardcover collector edition by Techstudio: build and scale design systems.",
    features: [
      "Hardcover Collector Edition",
      "320 Full-Colour Pages",
      "Real Case Studies",
      "Figma Starter Kit Included",
    ],
    colors: [
      { name: "Midnight Blue Cover", hex: "#1e2a4a" },
      { name: "Ivory Cover", hex: "#f2ede1" },
    ],
    specs: [
      {
        group: "Book Details",
        label: "Author",
        value: "Techstudio Academy design team",
      },
      {
        group: "Book Details",
        label: "Edition",
        value: "Collector hardcover, 1st edition",
      },
      {
        group: "Book Details",
        label: "Pages",
        value: "320 full-colour pages",
      },
      {
        group: "Book Details",
        label: "Language",
        value: "English",
      },
      {
        group: "Book Details",
        label: "Level",
        value: "Beginner to intermediate",
      },
      {
        group: "Contents, Size & Extras",
        label: "Topics",
        value: "Tokens, components, documentation, governance",
      },
      {
        group: "Contents, Size & Extras",
        label: "Case Studies",
        value: "6 real product teams, step by step",
      },
      {
        group: "Contents, Size & Extras",
        label: "Dimensions",
        value: "24cm × 17cm × 2.5cm",
      },
      {
        group: "Contents, Size & Extras",
        label: "Weight",
        value: "780 grams",
      },
      {
        group: "Contents, Size & Extras",
        label: "What's Included",
        value: "Book, Figma starter kit download code, bookmark",
      },
    ],
    tags: ["design", "learning", "new-arrival"],
    highlights: [
      {
        icon: "menu_book",
        title: "From First Token To Full System",
        text: "Clear chapters walk you from colours and spacing tokens to a complete, documented component library.",
      },
      {
        icon: "palette",
        title: "Real Product Case Studies",
        text: "Six case studies show how real teams built, shipped and scaled their design systems.",
      },
      {
        icon: "workspace_premium",
        title: "Collector Hardcover",
        text: "A sewn hardcover binding with full-colour pages that lies flat on your desk while you work.",
      },
    ],
    ratingCounts: [30, 6, 1, 1, 0], // 79%, 16%, 3%, 3%, 0% of 38
    bundle: [
      "Daily Planner & Hardcover Journal",
      "Minimalist LED Desk Lamp",
      "Ceramic Mug Set",
    ],
    related: [
      "Daily Planner & Hardcover Journal",
      "Mechanical Wireless Keyboard",
      "Minimalist LED Desk Lamp",
      "Alloy Adjustable Stand",
    ],
  },
  {
    name: "Minimalist LED Desk Lamp",
    category: "home-living",
    brand: "Aurora Home",
    sku: "QC-HM-411",
    price: 12000,
    oldPrice: 15000,
    stock: 18,
    rating: 4.2,
    reviewCount: 19,
    badge: "SALE",
    description:
      "Matte desk lamp with warm 3000K LED light and anti-glare eye protection.",
    features: [
      "Warm 3000K LED",
      "Anti-Glare Diffuser",
      "3 Brightness Levels",
      "USB-C Powered",
    ],
    colors: [
      { name: "Matte Black", hex: "#1f1f1f" },
      { name: "Matte White", hex: "#f2f2f0" },
      { name: "Sand Beige", hex: "#d8c8ad" },
    ],
    specs: [
      {
        group: "Light & Controls",
        label: "Colour Temperature",
        value: "3000K warm white",
      },
      {
        group: "Light & Controls",
        label: "Brightness",
        value: "450 lumens, 3 levels",
      },
      {
        group: "Light & Controls",
        label: "Controls",
        value: "Touch dimmer on the base",
      },
      {
        group: "Light & Controls",
        label: "Eye Care",
        value: "Flicker-free, anti-glare diffuser",
      },
      {
        group: "Light & Controls",
        label: "LED Lifespan",
        value: "25,000 hours",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Power",
        value: "USB-C, 8W (adapter included)",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Arm",
        value: "Adjustable 180° head, 45cm reach",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Material",
        value: "Powder-coated aluminium",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Weight",
        value: "900 grams",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Included in Box",
        value: "Lamp, USB-C cable, wall adapter",
      },
    ],
    tags: ["lighting", "workspace", "new-arrival", "recommended"],
    highlights: [
      {
        icon: "light_mode",
        title: "Soft Warm Light",
        text: "A 3000K warm glow that's bright enough for reading but gentle enough for late-night work.",
      },
      {
        icon: "shield",
        title: "Anti-Glare Eye Protection",
        text: "A flicker-free LED behind a frosted diffuser cuts glare and eye strain during long study sessions.",
      },
      {
        icon: "bolt",
        title: "Runs On USB-C",
        text: "Plug it into the wall, your laptop or a power bank, so the light stays on during a power cut.",
      },
    ],
    ratingCounts: [10, 5, 2, 1, 1], // 53%, 26%, 11%, 5%, 5% of 19
    bundle: [
      "Alloy Adjustable Stand",
      "Daily Planner & Hardcover Journal",
      "Compact GaN Fast Charger 65W",
    ],
    related: [
      "Atmosphere Ambient Lamp",
      "Scented Soy Candle Duo",
      "Ergonomic Mesh Office Chair",
      "Alloy Adjustable Stand",
    ],
  },
  {
    name: "Stainless Steel Thermal Flask",
    category: "sports",
    brand: "ZenFit Athletics",
    sku: "QC-SP-202",
    price: 6500,
    stock: 80,
    rating: 4.9,
    reviewCount: 78,
    description:
      "Double-walled steel flask that keeps drinks cold or hot all day.",
    features: [
      "750ml Capacity",
      "Double-Wall Vacuum Insulation",
      "18/8 Food-Grade Steel",
      "Leak-Proof Screw Lid",
    ],
    colors: [
      { name: "Brushed Steel", hex: "#c0c4c8" },
      { name: "Matte Black", hex: "#222222" },
      { name: "Coral Red", hex: "#e2584d" },
    ],
    specs: [
      {
        group: "Capacity & Insulation",
        label: "Capacity",
        value: "750ml",
      },
      {
        group: "Capacity & Insulation",
        label: "Insulation",
        value: "Double-wall vacuum",
      },
      {
        group: "Capacity & Insulation",
        label: "Keeps Cold",
        value: "Up to 24 hours",
      },
      {
        group: "Capacity & Insulation",
        label: "Keeps Hot",
        value: "Up to 12 hours",
      },
      {
        group: "Capacity & Insulation",
        label: "Condensation",
        value: "Sweat-free outside",
      },
      {
        group: "Build, Care & Box Contents",
        label: "Material",
        value: "18/8 food-grade stainless steel, BPA-free lid",
      },
      {
        group: "Build, Care & Box Contents",
        label: "Lid",
        value: "Leak-proof screw cap with carry loop",
      },
      {
        group: "Build, Care & Box Contents",
        label: "Weight",
        value: "380 grams (empty)",
      },
      {
        group: "Build, Care & Box Contents",
        label: "Care",
        value: "Hand wash only",
      },
      {
        group: "Build, Care & Box Contents",
        label: "Included in Box",
        value: "Flask, screw lid",
      },
    ],
    tags: ["hydration", "outdoors"],
    highlights: [
      {
        icon: "thermostat",
        title: "Cold All Day, Hot All Morning",
        text: "Vacuum insulation keeps water icy for 24 hours or tea hot for 12, from the gym to the office.",
      },
      {
        icon: "water_drop",
        title: "Leak-Proof Lid",
        text: "A tight screw cap means you can toss it in your bag without worrying about spills on your laptop.",
      },
      {
        icon: "recycling",
        title: "Ditch Plastic Bottles",
        text: "Food-grade steel that never holds on to tastes or smells, and replaces hundreds of plastic bottles a year.",
      },
    ],
    ratingCounts: [71, 6, 1, 0, 0], // 91%, 8%, 1%, 0%, 0% of 78
    bundle: [
      "Eco Grip Yoga Mat",
      "Resistance Workout Bands",
      "Cotton Twill Backpack",
    ],
    related: [
      "Insulated 1L Hydro Flask",
      "Eco Grip Yoga Mat",
      "Resistance Workout Bands",
      "Apex Tracker Watch",
    ],
  },
  {
    name: "Ergonomic Mesh Office Chair",
    category: "office",
    brand: "WorkWell",
    sku: "QC-OFF-920",
    price: 85000,
    stock: 2,
    rating: 4.9,
    reviewCount: 92,
    badge: "FEATURED",
    description:
      "Breathable mesh chair with adjustable lumbar support, headrest and armrests.",
    features: [
      "Adjustable Lumbar Support",
      "Breathable Mesh Back",
      "3D Adjustable Armrests",
      "120kg Load Capacity",
    ],
    colors: [
      { name: "Graphite Black", hex: "#2a2a2e" },
      { name: "Cool Grey", hex: "#9aa0a6" },
    ],
    specs: [
      {
        group: "Comfort & Adjustment",
        label: "Back",
        value: "Breathable elastic mesh",
      },
      {
        group: "Comfort & Adjustment",
        label: "Lumbar Support",
        value: "Height and depth adjustable",
      },
      {
        group: "Comfort & Adjustment",
        label: "Headrest",
        value: "Adjustable height and angle",
      },
      {
        group: "Comfort & Adjustment",
        label: "Armrests",
        value: "3D (height, width, angle)",
      },
      {
        group: "Comfort & Adjustment",
        label: "Recline",
        value: "90° – 135° with tilt lock",
      },
      {
        group: "Frame, Size & Box Contents",
        label: "Seat Height",
        value: "46 – 56 cm (gas lift)",
      },
      {
        group: "Frame, Size & Box Contents",
        label: "Base",
        value: "Nylon 5-star base with silent PU castors",
      },
      {
        group: "Frame, Size & Box Contents",
        label: "Max Load",
        value: "120 kg",
      },
      {
        group: "Frame, Size & Box Contents",
        label: "Weight",
        value: "17 kg",
      },
      {
        group: "Frame, Size & Box Contents",
        label: "Included in Box",
        value: "Chair parts, Allen key, assembly guide",
      },
    ],
    tags: ["furniture", "workspace"],
    highlights: [
      {
        icon: "chair",
        title: "Support Where You Need It",
        text: "Adjustable lumbar support and a headrest keep your spine in line through long workdays.",
      },
      {
        icon: "air",
        title: "Stays Cool In The Heat",
        text: "An open mesh back lets air flow through, so you don't stick to the chair on hot afternoons.",
      },
      {
        icon: "verified",
        title: "Sturdy, Quiet Frame",
        text: "A 120kg-rated base with silent castors that glide over tiles without scratching them.",
      },
    ],
    ratingCounts: [83, 7, 2, 0, 0], // 90%, 8%, 2%, 0%, 0% of 92
    bundle: [
      "Alloy Adjustable Stand",
      "Mechanical Wireless Keyboard",
      "Minimalist LED Desk Lamp",
    ],
    related: [
      "Alloy Adjustable Stand",
      "Compact Mechanical Keypad",
      "Minimalist LED Desk Lamp",
      "Mechanical Wireless Keyboard",
    ],
  },
  {
    name: "Compact GaN Fast Charger 65W",
    category: "electronics",
    brand: "Voltron",
    sku: "QC-EL-201",
    price: 14000,
    stock: 75,
    rating: 4.5,
    reviewCount: 49,
    description:
      "Charges a laptop, phone and earbuds at once from one pocket-sized 65W plug.",
    features: [
      "65W GaN Technology",
      "2× USB-C + 1× USB-A",
      "Power Delivery 3.0",
      "UK 3-Pin Plug",
    ],
    colors: [
      { name: "Matte Black", hex: "#1c1c1e" },
      { name: "Cloud White", hex: "#f4f4f4" },
    ],
    specs: [
      {
        group: "Output & Compatibility",
        label: "Total Output",
        value: "65W max",
      },
      {
        group: "Output & Compatibility",
        label: "Ports",
        value: "2× USB-C, 1× USB-A",
      },
      {
        group: "Output & Compatibility",
        label: "Single USB-C",
        value: "Up to 65W (laptops)",
      },
      {
        group: "Output & Compatibility",
        label: "Protocols",
        value: "USB PD 3.0, PPS, Quick Charge 4+",
      },
      {
        group: "Output & Compatibility",
        label: "Works With",
        value: "Laptops, phones, tablets, earbuds, watches",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Input",
        value: "100 – 240V AC, 50/60Hz",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Plug Type",
        value: "UK 3-pin (Type G)",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Safety",
        value: "Over-heat, over-current and surge protection",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Weight",
        value: "115 grams",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Included in Box",
        value: "Charger, 1.5m USB-C to USB-C cable",
      },
    ],
    tags: ["charging", "accessories"],
    highlights: [
      {
        icon: "bolt",
        title: "One Plug, Three Devices",
        text: "Charge your laptop, phone and earbuds together from a single socket, perfect for crowded extension boxes.",
      },
      {
        icon: "devices",
        title: "Laptop-Grade Power",
        text: "65W through USB-C fast-charges most laptops and gets a phone to 50% in about 30 minutes.",
      },
      {
        icon: "shield",
        title: "Surge-Safe Charging",
        text: "Built-in protection against overheating and power surges keeps your devices safe when the power flickers.",
      },
    ],
    ratingCounts: [33, 11, 3, 1, 1], // 67%, 22%, 6%, 2%, 2% of 49
    bundle: [
      "Gold-Plated 3.5mm AUX Cable",
      "Hi-Res DAC Audio Adapter",
      "True Wireless ANC Earbuds",
    ],
    related: [
      "Fast Dual USB-C GaN Charger 35W",
      "Magnetic Headphone Stand & USB Hub",
      "Hi-Res DAC Audio Adapter",
      "Mechanical Wireless Keyboard",
    ],
  },
  {
    name: "Mechanical Wireless Keyboard",
    category: "electronics",
    brand: "KeyCraft",
    sku: "QC-EL-202",
    price: 38000,
    stock: 40,
    rating: 4.9,
    reviewCount: 121,
    badge: "TOP SELLER",
    description:
      "Tactile mechanical switches, a solid aluminium frame and wireless connection to three devices.",
    features: [
      "Tactile Brown Switches",
      "CNC Aluminium Frame",
      "Bluetooth 5.1 + 2.4GHz",
      "Connects 3 Devices",
    ],
    colors: [
      { name: "Space Grey", hex: "#4a4d52" },
      { name: "Silver", hex: "#d4d6d9" },
      { name: "Navy Blue", hex: "#1f2d4d" },
    ],
    specs: [
      {
        group: "Typing & Connectivity",
        label: "Switches",
        value: "Tactile brown, hot-swappable",
      },
      {
        group: "Typing & Connectivity",
        label: "Layout",
        value: "75% (84 keys), UK/US keycaps",
      },
      {
        group: "Typing & Connectivity",
        label: "Keycaps",
        value: "Double-shot PBT",
      },
      {
        group: "Typing & Connectivity",
        label: "Connection",
        value: "Bluetooth 5.1, 2.4GHz dongle, USB-C wired",
      },
      {
        group: "Typing & Connectivity",
        label: "Compatibility",
        value: "Windows, macOS, Android, iOS",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Battery",
        value: "4000mAh, up to 200 hrs (backlight off)",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Backlight",
        value: "White LED, 5 levels",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Frame",
        value: "CNC-machined aluminium",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Weight",
        value: "980 grams",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Included in Box",
        value: "Keyboard, 2.4GHz receiver, USB-C cable, keycap puller",
      },
    ],
    tags: ["keyboard", "workspace"],
    highlights: [
      {
        icon: "keyboard",
        title: "Satisfying Tactile Typing",
        text: "Hot-swappable brown switches give a gentle bump on every key press without the loud click.",
      },
      {
        icon: "bluetooth",
        title: "Switch Between 3 Devices",
        text: "Pair your laptop, tablet and phone, then jump between them with one key press.",
      },
      {
        icon: "battery_charging_full",
        title: "Weeks On One Charge",
        text: "A 4000mAh battery lasts up to 200 hours, and you can keep typing over USB-C while it charges.",
      },
    ],
    ratingCounts: [109, 10, 2, 0, 0], // 90%, 8%, 2%, 0%, 0% of 121
    bundle: [
      "Alloy Adjustable Stand",
      "Compact GaN Fast Charger 65W",
      "Minimalist LED Desk Lamp",
    ],
    related: [
      "Compact Mechanical Keypad",
      "Alloy Adjustable Stand",
      "Magnetic Headphone Stand & USB Hub",
      "Compact GaN Fast Charger 65W",
    ],
  },
  {
    name: "Premium Linen Overshirt",
    category: "fashion",
    brand: "Lagos Linen Co.",
    sku: "QC-FA-102",
    price: 16000,
    stock: 45,
    rating: 4.5,
    reviewCount: 34,
    description:
      "Breathable olive linen overshirt, perfect for warm Lagos evenings.",
    features: [
      "100% European Flax Linen",
      "Relaxed Fit",
      "Two Chest Pockets",
      "Sizes S – XXL",
    ],
    colors: [
      { name: "Olive", hex: "#6b6b3a" },
      { name: "Sand", hex: "#d6c4a1" },
      { name: "Navy", hex: "#1f2a44" },
    ],
    specs: [
      {
        group: "Fit & Fabric",
        label: "Fabric",
        value: "100% flax linen, 185 gsm",
      },
      {
        group: "Fit & Fabric",
        label: "Fit",
        value: "Relaxed, slightly boxy",
      },
      {
        group: "Fit & Fabric",
        label: "Sizes",
        value: "S, M, L, XL, XXL",
      },
      {
        group: "Fit & Fabric",
        label: "Collar",
        value: "Classic point collar",
      },
      {
        group: "Fit & Fabric",
        label: "Model Wears",
        value: "Size L (model is 1.83m)",
      },
      {
        group: "Details, Care & Box Contents",
        label: "Pockets",
        value: "Two button-flap chest pockets",
      },
      {
        group: "Details, Care & Box Contents",
        label: "Buttons",
        value: "Natural corozo buttons",
      },
      {
        group: "Details, Care & Box Contents",
        label: "Care",
        value: "Machine wash cold; line dry; warm iron",
      },
      {
        group: "Details, Care & Box Contents",
        label: "Made In",
        value: "Lagos, Nigeria",
      },
      {
        group: "Details, Care & Box Contents",
        label: "What's Included",
        value: "Overshirt, spare button",
      },
    ],
    tags: ["clothing", "shirts"],
    highlights: [
      {
        icon: "air",
        title: "Breathes In The Heat",
        text: "Pure flax linen lets air through and dries fast, keeping you cool on warm Lagos evenings.",
      },
      {
        icon: "checkroom",
        title: "Wear It Two Ways",
        text: "Button it up as a shirt or wear it open over a tee as a light jacket.",
      },
      {
        icon: "workspace_premium",
        title: "Made In Lagos",
        text: "Cut and sewn by local tailors with natural corozo buttons and neat flat-felled seams.",
      },
    ],
    ratingCounts: [23, 8, 2, 1, 0], // 68%, 24%, 6%, 3%, 0% of 34
    bundle: [
      "Polarized UV Sunglasses",
      "Minimalist Leather Wallet",
      "Canvas Low-Top Sneakers",
    ],
    related: [
      "Canvas Low-Top Sneakers",
      "Court Classic Lows",
      "Polarized UV Sunglasses",
      "Cotton Twill Backpack",
    ],
  },
  {
    name: "Scented Soy Candle Duo",
    category: "home-living",
    brand: "Aurora Home",
    sku: "QC-HM-412",
    price: 8500,
    stock: 70,
    rating: 4.9,
    reviewCount: 47,
    description:
      "Two hand-poured soy candles: Linen & Fig and Sandalwood & Amber.",
    features: [
      "100% Natural Soy Wax",
      "2 × 200g Candles",
      "Up to 45h Burn Each",
      "Cotton Wicks",
    ],
    colors: [
      { name: "Amber Glass", hex: "#a8642a" },
      { name: "Frosted White", hex: "#eeeae4" },
    ],
    specs: [
      {
        group: "Scent & Wax",
        label: "Scents",
        value: "Linen & Fig, Sandalwood & Amber",
      },
      {
        group: "Scent & Wax",
        label: "Wax",
        value: "100% natural soy wax",
      },
      {
        group: "Scent & Wax",
        label: "Wick",
        value: "Lead-free cotton",
      },
      {
        group: "Scent & Wax",
        label: "Fragrance",
        value: "Phthalate-free fragrance oils",
      },
      {
        group: "Scent & Wax",
        label: "Scent Strength",
        value: "Medium, fills a bedroom or lounge",
      },
      {
        group: "Size, Safety & Box Contents",
        label: "Net Weight",
        value: "200 grams per candle",
      },
      {
        group: "Size, Safety & Box Contents",
        label: "Burn Time",
        value: "Up to 45 hours each",
      },
      {
        group: "Size, Safety & Box Contents",
        label: "Vessel",
        value: "Reusable glass jar with lid",
      },
      {
        group: "Size, Safety & Box Contents",
        label: "Safety Tip",
        value: "Trim wick to 5mm; never leave burning unattended",
      },
      {
        group: "Size, Safety & Box Contents",
        label: "Included in Box",
        value: "2 candles in a gift box",
      },
    ],
    tags: ["candles", "gifts"],
    highlights: [
      {
        icon: "local_fire_department",
        title: "Clean, Even Burn",
        text: "Natural soy wax and cotton wicks burn slowly and cleanly for up to 45 hours per candle.",
      },
      {
        icon: "spa",
        title: "Two Calming Scents",
        text: "Fresh Linen & Fig for the daytime and warm Sandalwood & Amber for winding down at night.",
      },
      {
        icon: "favorite",
        title: "Ready To Gift",
        text: "Packed in a gift box with reusable glass jars, ideal for birthdays, housewarmings and Valentine's.",
      },
    ],
    ratingCounts: [43, 3, 1, 0, 0], // 91%, 6%, 2%, 0%, 0% of 47
    bundle: [
      "Atmosphere Ambient Lamp",
      "Ceramic Mug Set",
      "Skincare Hydration Kit",
    ],
    related: [
      "Atmosphere Ambient Lamp",
      "Minimalist LED Desk Lamp",
      "Ceramic Mug Set",
      "Skincare Hydration Kit",
    ],
  },
  {
    name: "Bluetooth Portable Speaker",
    category: "electronics",
    brand: "Aura",
    sku: "QC-EL-203",
    price: 28000,
    oldPrice: 34000,
    stock: 55,
    rating: 4.6,
    reviewCount: 62,
    badge: "SALE",
    description:
      "Room-filling 360° sound in a rugged, water-resistant body with 20 hours of playtime.",
    features: [
      "360° Omnidirectional Sound",
      "IPX7 Water Resistant",
      "20h Playtime",
      "Bluetooth 5.3 Stereo Pairing",
    ],
    colors: [
      { name: "Charcoal Black", hex: "#27272a" },
      { name: "Ocean Teal", hex: "#0f766e" },
      { name: "Sunset Coral", hex: "#f97362" },
    ],
    specs: [
      {
        group: "Sound & Connectivity",
        label: "Output Power",
        value: "30W (2 x 15W full-range drivers)",
      },
      {
        group: "Sound & Connectivity",
        label: "Frequency Response",
        value: "60 Hz – 20,000 Hz",
      },
      {
        group: "Sound & Connectivity",
        label: "Bluetooth Version",
        value: "v5.3 with 30m range",
      },
      {
        group: "Sound & Connectivity",
        label: "Stereo Pairing",
        value: "Pair two speakers for left/right sound",
      },
      {
        group: "Sound & Connectivity",
        label: "Built-in Microphone",
        value: "Hands-free calls with echo cancelling",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Battery Life",
        value: "Up to 20 hrs at 50% volume",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Charging Port",
        value: "USB Type-C (3 hrs full charge)",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Water Rating",
        value: "IPX7 (submersible to 1m for 30 mins)",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Total Weight",
        value: "540 grams",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Included in Box",
        value: "Speaker, USB-C Cable, Carry Strap",
      },
    ],
    tags: ["audio", "speaker", "bluetooth"],
    highlights: [
      {
        icon: "graphic_eq",
        title: "True 360° Room-Filling Sound",
        text: "Two full-range drivers and a passive bass radiator push sound evenly in every direction, so everyone in the room hears the same rich mix.",
      },
      {
        icon: "water_drop",
        title: "IPX7 Rugged & Waterproof",
        text: "A sealed, shock-absorbing body survives rain, pool splashes and dusty beaches. Rinse it under the tap when the party is over.",
      },
      {
        icon: "battery_charging_full",
        title: "20 Hours of Playtime",
        text: "One full charge lasts a whole weekend outing. A 15-minute USB-C top-up gives you another 2 hours of music.",
      },
    ],
    ratingCounts: [45, 12, 3, 1, 1], // 73%, 19%, 5%, 2%, 2% of 62
    bundle: [
      "Fast Dual USB-C GaN Charger 35W",
      "Gold-Plated 3.5mm AUX Cable",
      "Cotton Twill Backpack",
    ],
    related: [
      "Wireless Noise-Cancelling Headphones",
      "True Wireless ANC Earbuds",
      "AeroPro Wireless Buds",
      "Over-Ear Studio Monitors",
    ],
  },
  {
    name: "Minimalist Leather Wallet",
    category: "fashion",
    brand: "Atelier",
    sku: "QC-FA-103",
    price: 11500,
    stock: 60,
    rating: 4.6,
    reviewCount: 55,
    description:
      "Slim full-grain leather card wallet with quick-access pockets.",
    features: [
      "Full-Grain Cowhide Leather",
      "Holds 4–8 Cards",
      "RFID-Blocking Lining",
      "Hand-Stitched Edges",
    ],
    colors: [
      { name: "Cognac Brown", hex: "#9a5b2e" },
      { name: "Classic Black", hex: "#1c1917" },
      { name: "Forest Green", hex: "#365314" },
    ],
    specs: [
      {
        group: "Material & Design",
        label: "Leather",
        value: "Full-grain vegetable-tanned cowhide",
      },
      {
        group: "Material & Design",
        label: "Card Slots",
        value: "4 quick-access pockets (up to 8 cards)",
      },
      {
        group: "Material & Design",
        label: "Cash Slot",
        value: "Centre slip pocket for folded notes",
      },
      {
        group: "Material & Design",
        label: "RFID Protection",
        value: "Blocks 13.56 MHz contactless card skimming",
      },
      {
        group: "Material & Design",
        label: "Stitching",
        value: "Hand-stitched waxed polyester thread",
      },
      {
        group: "Size, Care & Box Contents",
        label: "Dimensions",
        value: "10.2 x 7.5 x 0.6 cm",
      },
      {
        group: "Size, Care & Box Contents",
        label: "Weight",
        value: "38 grams",
      },
      {
        group: "Size, Care & Box Contents",
        label: "Care",
        value: "Wipe clean; condition every 6 months",
      },
      {
        group: "Size, Care & Box Contents",
        label: "Warranty",
        value: "2-year stitching and material warranty",
      },
      {
        group: "Size, Care & Box Contents",
        label: "Included in Box",
        value: "Wallet, Cotton Dust Bag, Gift Box",
      },
    ],
    tags: ["accessories", "leather"],
    highlights: [
      {
        icon: "verified",
        title: "Full-Grain Leather That Ages Well",
        text: "Vegetable-tanned cowhide develops a rich patina over time, so your wallet looks better the longer you carry it.",
      },
      {
        icon: "shield",
        title: "RFID-Blocking Protection",
        text: "A thin shielding layer stops contactless skimmers from reading your bank cards while you move through busy markets.",
      },
      {
        icon: "straighten",
        title: "Slim Enough for a Front Pocket",
        text: "At just 6mm thick it slides into any pocket without a bulge, yet still holds up to eight cards and folded cash.",
      },
    ],
    ratingCounts: [40, 10, 3, 1, 1], // 73%, 18%, 5%, 2%, 2% of 55
    bundle: [
      "Polarized UV Sunglasses",
      "Cotton Twill Backpack",
      "Premium Linen Overshirt",
    ],
    related: [
      "Cotton Twill Backpack",
      "Polarized UV Sunglasses",
      "Premium Linen Overshirt",
      "Court Classic Lows",
    ],
  },
  {
    name: "Cast Iron Skillet 10-inch",
    category: "kitchen",
    brand: "Aurora Home",
    sku: "QC-KT-202",
    price: 19500,
    stock: 35,
    rating: 4.9,
    reviewCount: 83,
    badge: "TOP SELLER",
    description:
      "Pre-seasoned cast iron skillet that goes from stovetop to oven.",
    features: [
      "Pre-Seasoned with Vegetable Oil",
      "Oven Safe to 260°C",
      "Works on Gas, Electric & Induction",
      "Dual Pour Spouts",
    ],
    colors: [
      { name: "Classic Black", hex: "#1f1f1f" },
      { name: "Enamel Red", hex: "#b91c1c" },
    ],
    specs: [
      {
        group: "Cooking & Performance",
        label: "Diameter",
        value: "10 inches (25.4 cm)",
      },
      {
        group: "Cooking & Performance",
        label: "Material",
        value: "Solid cast iron, one-piece casting",
      },
      {
        group: "Cooking & Performance",
        label: "Seasoning",
        value: "Factory pre-seasoned, ready to use",
      },
      {
        group: "Cooking & Performance",
        label: "Heat Sources",
        value: "Gas, electric, induction, oven, open fire",
      },
      {
        group: "Cooking & Performance",
        label: "Oven Safe",
        value: "Up to 260°C (500°F)",
      },
      {
        group: "Build, Care & Box Contents",
        label: "Weight",
        value: "2.4 kg",
      },
      {
        group: "Build, Care & Box Contents",
        label: "Depth",
        value: "5 cm with dual pour spouts",
      },
      {
        group: "Build, Care & Box Contents",
        label: "Care",
        value: "Hand wash, dry and oil lightly",
      },
      {
        group: "Build, Care & Box Contents",
        label: "Dishwasher Safe",
        value: "No",
      },
      {
        group: "Build, Care & Box Contents",
        label: "Included in Box",
        value: "Skillet, Silicone Handle Sleeve, Care Guide",
      },
    ],
    tags: ["cookware"],
    highlights: [
      {
        icon: "local_fire_department",
        title: "Even Heat, Perfect Sear",
        text: "Thick cast iron holds heat and spreads it evenly, giving suya-style steaks, plantain and fried eggs a deep golden crust.",
      },
      {
        icon: "soup_kitchen",
        title: "Stovetop to Oven",
        text: "Start a frittata or jollof on the hob and finish it in the oven. The one-piece body is safe up to 260°C.",
      },
      {
        icon: "verified",
        title: "Pre-Seasoned for Life",
        text: "Ready to cook straight out of the box, and the natural non-stick surface only gets better with every use.",
      },
    ],
    ratingCounts: [76, 5, 1, 1, 0], // 92%, 6%, 1%, 1%, 0% of 83
    bundle: [
      "Electric Gooseneck Kettle",
      "Ceramic Mug Set",
      "Scented Soy Candle Duo",
    ],
    related: [
      "Electric Gooseneck Kettle",
      "Smart Gooseneck Kettle",
      "Ceramic Pour-Over Dripper",
      "Ceramic Mug Set",
    ],
  },
  {
    name: "Noise-Isolating Studio Earbuds",
    category: "electronics",
    brand: "Sonic Pro",
    sku: "QC-EL-204",
    price: 15000,
    stock: 60,
    rating: 4.5,
    reviewCount: 44,
    description:
      "Wired studio earbuds with detachable cables and a balanced sound for mixing on the go.",
    features: [
      "Dual Balanced Armature Drivers",
      "Detachable MMCX Cables",
      "-26dB Passive Isolation",
      "3 Sizes of Memory Foam Tips",
    ],
    colors: [
      { name: "Studio Black", hex: "#18181b" },
      { name: "Clear Smoke", hex: "#94a3b8" },
    ],
    specs: [
      {
        group: "Audio & Connectivity",
        label: "Drivers",
        value: "Dual balanced armature per side",
      },
      {
        group: "Audio & Connectivity",
        label: "Frequency Response",
        value: "20 Hz – 20,000 Hz (flat studio tuning)",
      },
      {
        group: "Audio & Connectivity",
        label: "Impedance",
        value: "32 Ω",
      },
      {
        group: "Audio & Connectivity",
        label: "Sensitivity",
        value: "105 dB SPL/mW",
      },
      {
        group: "Audio & Connectivity",
        label: "Noise Isolation",
        value: "Up to -26dB passive",
      },
      {
        group: "Cable, Build & Box Contents",
        label: "Cable",
        value: "1.2m detachable MMCX, 3.5mm plug",
      },
      {
        group: "Cable, Build & Box Contents",
        label: "Fit",
        value: "Over-ear cable loop for stage use",
      },
      {
        group: "Cable, Build & Box Contents",
        label: "Weight",
        value: "18 grams (pair, without cable)",
      },
      {
        group: "Cable, Build & Box Contents",
        label: "Ear Tips",
        value: "Memory foam and silicone, S/M/L",
      },
      {
        group: "Cable, Build & Box Contents",
        label: "Included in Box",
        value: "Earbuds, 2 Cables, 6 Tip Pairs, Zip Pouch",
      },
    ],
    tags: ["audio", "earbuds"],
    highlights: [
      {
        icon: "graphic_eq",
        title: "Flat, Honest Studio Sound",
        text: "Dual balanced armature drivers are tuned flat, so you hear your mix exactly as it is and can make decisions you trust.",
      },
      {
        icon: "hearing",
        title: "Up to -26dB Isolation",
        text: "Memory foam tips seal out generator hum and street noise without any battery, so you can monitor at safer volumes.",
      },
      {
        icon: "cable",
        title: "Detachable, Replaceable Cables",
        text: "Standard MMCX connectors let you swap a worn cable in seconds instead of replacing the whole set.",
      },
    ],
    ratingCounts: [30, 9, 3, 1, 1], // 68%, 20%, 7%, 2%, 2% of 44
    bundle: [
      "Hi-Res DAC Audio Adapter",
      "Gold-Plated 3.5mm AUX Cable",
      "Protective Hard Shell Case",
    ],
    related: [
      "Over-Ear Studio Monitors",
      "True Wireless ANC Earbuds",
      "AeroPro Wireless Buds",
      "Hi-Res DAC Audio Adapter",
    ],
  },
  {
    name: "Polarized UV Sunglasses",
    category: "fashion",
    brand: "Aura",
    sku: "QC-FA-104",
    price: 13500,
    stock: 50,
    rating: 4.6,
    reviewCount: 39,
    description: "Tortoiseshell frames with polarized UV400 lenses.",
    features: [
      "Polarized UV400 Lenses",
      "Lightweight Acetate Frames",
      "Spring-Loaded Hinges",
      "Scratch-Resistant Coating",
    ],
    colors: [
      { name: "Tortoiseshell", hex: "#7c4a21" },
      { name: "Matte Black", hex: "#1c1917" },
      { name: "Crystal Honey", hex: "#d4a373" },
    ],
    specs: [
      {
        group: "Lenses & Protection",
        label: "Lens Type",
        value: "Polarized TAC, 1.1mm",
      },
      {
        group: "Lenses & Protection",
        label: "UV Protection",
        value: "UV400 (blocks 100% UVA and UVB)",
      },
      {
        group: "Lenses & Protection",
        label: "Lens Tint",
        value: "Brown gradient, glare-cutting",
      },
      {
        group: "Lenses & Protection",
        label: "Coating",
        value: "Scratch-resistant and anti-smudge",
      },
      {
        group: "Lenses & Protection",
        label: "Lens Width",
        value: "52 mm",
      },
      {
        group: "Frame, Fit & Box Contents",
        label: "Frame Material",
        value: "Hand-polished cellulose acetate",
      },
      {
        group: "Frame, Fit & Box Contents",
        label: "Bridge / Temple",
        value: "20 mm / 145 mm",
      },
      {
        group: "Frame, Fit & Box Contents",
        label: "Hinges",
        value: "5-barrel spring-loaded metal",
      },
      {
        group: "Frame, Fit & Box Contents",
        label: "Weight",
        value: "26 grams",
      },
      {
        group: "Frame, Fit & Box Contents",
        label: "Included in Box",
        value: "Sunglasses, Hard Case, Microfibre Cloth",
      },
    ],
    tags: ["accessories", "eyewear"],
    highlights: [
      {
        icon: "light_mode",
        title: "Polarized Glare Control",
        text: "Polarized lenses cut harsh reflections from roads, water and windscreens, so colours look natural even under the midday sun.",
      },
      {
        icon: "shield",
        title: "Full UV400 Protection",
        text: "Blocks 100% of UVA and UVB rays to protect your eyes during long days outdoors.",
      },
      {
        icon: "favorite",
        title: "All-Day Comfort",
        text: "At just 26 grams with spring-loaded hinges, the frames sit gently on your face from morning school runs to evening hangouts.",
      },
    ],
    ratingCounts: [28, 8, 2, 1, 0], // 72%, 21%, 5%, 3%, 0% of 39
    bundle: [
      "Minimalist Leather Wallet",
      "Premium Linen Overshirt",
      "Insulated 1L Hydro Flask",
    ],
    related: [
      "Minimalist Leather Wallet",
      "Premium Linen Overshirt",
      "Cotton Twill Backpack",
      "Canvas Low-Top Sneakers",
    ],
  },
  {
    name: "Electric Gooseneck Kettle",
    category: "kitchen",
    brand: "Brewline",
    sku: "QC-KT-203",
    price: 24000,
    oldPrice: 30000,
    stock: 30,
    rating: 4.8,
    reviewCount: 51,
    badge: "SALE",
    description:
      "Precision-pour gooseneck kettle with temperature control for pour-over coffee.",
    features: [
      "Variable Temperature 40–100°C",
      "Precision Gooseneck Spout",
      "1200W Rapid Boil",
      "60-Minute Keep Warm",
    ],
    colors: [
      { name: "Matte Black", hex: "#1f2937" },
      { name: "Brushed Steel", hex: "#a8a29e" },
      { name: "Cream White", hex: "#f5f0e6" },
    ],
    specs: [
      {
        group: "Brewing & Performance",
        label: "Capacity",
        value: "0.9 litres",
      },
      {
        group: "Brewing & Performance",
        label: "Temperature Range",
        value: "40°C – 100°C in 1°C steps",
      },
      {
        group: "Brewing & Performance",
        label: "Power",
        value: "1200W (boils 0.9L in about 5 mins)",
      },
      {
        group: "Brewing & Performance",
        label: "Keep Warm",
        value: "Holds temperature for up to 60 mins",
      },
      {
        group: "Brewing & Performance",
        label: "Spout",
        value: "Narrow gooseneck for steady, slow pours",
      },
      {
        group: "Build, Safety & Box Contents",
        label: "Body",
        value: "304 food-grade stainless steel",
      },
      {
        group: "Build, Safety & Box Contents",
        label: "Display",
        value: "LCD on the base with live temperature",
      },
      {
        group: "Build, Safety & Box Contents",
        label: "Safety",
        value: "Auto shut-off and boil-dry protection",
      },
      {
        group: "Build, Safety & Box Contents",
        label: "Plug",
        value: "UK 3-pin, 220–240V",
      },
      {
        group: "Build, Safety & Box Contents",
        label: "Included in Box",
        value: "Kettle, Heating Base, User Guide",
      },
    ],
    tags: ["coffee", "appliances"],
    highlights: [
      {
        icon: "thermostat",
        title: "Exact Temperature Control",
        text: "Dial in any temperature from 40°C to 100°C, so green tea, pour-over coffee and baby formula each get the water they need.",
      },
      {
        icon: "coffee",
        title: "Barista-Grade Pouring",
        text: "The slim gooseneck spout gives you a slow, steady stream for an even bloom and a balanced, sweet cup.",
      },
      {
        icon: "timer",
        title: "Rapid Boil, Long Keep-Warm",
        text: "1200W heats a full kettle in about five minutes, then holds your chosen temperature for up to an hour.",
      },
    ],
    ratingCounts: [43, 6, 1, 1, 0], // 84%, 12%, 2%, 2%, 0% of 51
    bundle: [
      "Ceramic Pour-Over Dripper",
      "Ceramic Mug Set",
      "Stainless Steel Thermal Flask",
    ],
    related: [
      "Smart Gooseneck Kettle",
      "Ceramic Pour-Over Dripper",
      "Ceramic Mug Set",
      "Cast Iron Skillet 10-inch",
    ],
  },
  {
    name: "Cotton Twill Backpack",
    category: "fashion",
    brand: "UrbanStride",
    sku: "QC-FA-105",
    price: 21000,
    stock: 40,
    rating: 4.5,
    reviewCount: 66,
    description:
      "Durable cotton twill backpack with leather straps and a padded laptop sleeve.",
    features: [
      "Fits 15.6-inch Laptops",
      "Water-Repellent Cotton Twill",
      "Genuine Leather Straps",
      "22-Litre Capacity",
    ],
    colors: [
      { name: "Olive Green", hex: "#556b2f" },
      { name: "Sand Khaki", hex: "#c2b280" },
      { name: "Navy Blue", hex: "#1e3a5f" },
    ],
    specs: [
      {
        group: "Material & Storage",
        label: "Outer Fabric",
        value: "16oz water-repellent cotton twill",
      },
      {
        group: "Material & Storage",
        label: "Capacity",
        value: "22 litres",
      },
      {
        group: "Material & Storage",
        label: "Laptop Sleeve",
        value: "Padded, fits up to 15.6-inch",
      },
      {
        group: "Material & Storage",
        label: "Pockets",
        value: "Front zip, 2 side bottle, hidden back pocket",
      },
      {
        group: "Material & Storage",
        label: "Straps & Trim",
        value: "Genuine leather with brass buckles",
      },
      {
        group: "Size, Care & Box Contents",
        label: "Dimensions",
        value: "45 x 30 x 15 cm",
      },
      {
        group: "Size, Care & Box Contents",
        label: "Weight",
        value: "0.9 kg",
      },
      {
        group: "Size, Care & Box Contents",
        label: "Shoulder Straps",
        value: "Padded and adjustable, with air-mesh back",
      },
      {
        group: "Size, Care & Box Contents",
        label: "Care",
        value: "Spot clean; do not machine wash",
      },
      {
        group: "Size, Care & Box Contents",
        label: "Included in Box",
        value: "Backpack, Dust Bag",
      },
    ],
    tags: ["bags", "accessories"],
    highlights: [
      {
        icon: "backpack",
        title: "Room for the Whole Day",
        text: "22 litres of space carries your laptop, charger, lunch and a change of clothes, with side pockets for a water bottle.",
      },
      {
        icon: "water_drop",
        title: "Water-Repellent Twill",
        text: "Heavyweight cotton twill is treated to shrug off light rain, keeping your gadgets dry on the walk to the bus stop.",
      },
      {
        icon: "devices",
        title: "Padded Laptop Sleeve",
        text: "A raised, foam-padded sleeve protects laptops up to 15.6 inches from knocks and drops.",
      },
    ],
    ratingCounts: [45, 14, 5, 1, 1], // 68%, 21%, 8%, 2%, 2% of 66
    bundle: [
      "Minimalist Leather Wallet",
      "Stainless Steel Thermal Flask",
      "Compact GaN Fast Charger 65W",
    ],
    related: [
      "Minimalist Leather Wallet",
      "Canvas Low-Top Sneakers",
      "Premium Linen Overshirt",
      "Court Classic Lows",
    ],
  },
  {
    name: "Resistance Workout Bands",
    category: "sports",
    brand: "ZenFit Athletics",
    sku: "QC-SP-203",
    price: 5500,
    stock: 90,
    rating: 4.8,
    reviewCount: 70,
    description:
      "Five stackable resistance bands with handles and ankle straps.",
    features: [
      "5 Levels: 4.5kg to 22.7kg",
      "Stack up to 68kg",
      "Natural Latex Tubes",
      "Door Anchor Included",
    ],
    colors: [
      { name: "Rainbow Set", hex: "#f59e0b" },
      { name: "Graphite Set", hex: "#374151" },
    ],
    specs: [
      {
        group: "Resistance & Training",
        label: "Band Levels",
        value: "4.5, 6.8, 9, 13.6 and 22.7 kg",
      },
      {
        group: "Resistance & Training",
        label: "Max Stacked Resistance",
        value: "68 kg (all five bands)",
      },
      {
        group: "Resistance & Training",
        label: "Band Length",
        value: "120 cm",
      },
      {
        group: "Resistance & Training",
        label: "Material",
        value: "Natural latex with protective sleeve",
      },
      {
        group: "Resistance & Training",
        label: "Suitable For",
        value: "Strength, rehab, stretching and Pilates",
      },
      {
        group: "Accessories & Box Contents",
        label: "Handles",
        value: "2 foam-padded handles",
      },
      {
        group: "Accessories & Box Contents",
        label: "Ankle Straps",
        value: "2 padded neoprene straps",
      },
      {
        group: "Accessories & Box Contents",
        label: "Door Anchor",
        value: "Padded anchor fits standard doors",
      },
      {
        group: "Accessories & Box Contents",
        label: "Weight",
        value: "1.1 kg (full set)",
      },
      {
        group: "Accessories & Box Contents",
        label: "Included in Box",
        value: "5 Bands, Handles, Straps, Anchor, Bag, Guide",
      },
    ],
    tags: ["fitness", "home-workout"],
    highlights: [
      {
        icon: "fitness_center",
        title: "A Full Gym in a Bag",
        text: "Stack the five bands to train from light rehab work up to 68kg of resistance for squats, rows and presses.",
      },
      {
        icon: "self_improvement",
        title: "Train Anywhere",
        text: "The door anchor and ankle straps turn any room into a workout space, and the whole set packs into its own travel bag.",
      },
      {
        icon: "verified",
        title: "Snap-Safe Latex Tubes",
        text: "Natural latex inside a woven protective sleeve gives smooth tension and guards against sudden snaps.",
      },
    ],
    ratingCounts: [59, 8, 2, 1, 0], // 84%, 11%, 3%, 1%, 0% of 70
    bundle: [
      "Eco Grip Yoga Mat",
      "Insulated 1L Hydro Flask",
      "Apex Tracker Watch",
    ],
    related: [
      "Eco Grip Yoga Mat",
      "Insulated 1L Hydro Flask",
      "Stainless Steel Thermal Flask",
      "Apex Tracker Watch",
    ],
  },
  {
    name: "Ceramic Pour-Over Dripper",
    category: "kitchen",
    brand: "Brewline",
    sku: "QC-KT-204",
    price: 7200,
    stock: 50,
    rating: 4.6,
    reviewCount: 29,
    description:
      "Classic ceramic pour-over dripper for a clean, bright cup of coffee.",
    features: [
      "Brews 1–4 Cups",
      "Spiral Ribbed Walls",
      "Fits Size 02 Cone Filters",
      "Heat-Retaining Porcelain",
    ],
    colors: [
      { name: "Gloss White", hex: "#f8fafc" },
      { name: "Speckled Clay", hex: "#b08968" },
      { name: "Matte Black", hex: "#262626" },
    ],
    specs: [
      {
        group: "Brewing",
        label: "Brew Size",
        value: "1 to 4 cups (up to 600ml)",
      },
      {
        group: "Brewing",
        label: "Filter Type",
        value: "Size 02 paper cone filters",
      },
      {
        group: "Brewing",
        label: "Flow Design",
        value: "Spiral ribs with a single large outlet",
      },
      {
        group: "Brewing",
        label: "Recommended Grind",
        value: "Medium-fine",
      },
      {
        group: "Brewing",
        label: "Brew Time",
        value: "About 2.5 – 3 minutes",
      },
      {
        group: "Build, Care & Box Contents",
        label: "Material",
        value: "Glazed porcelain",
      },
      {
        group: "Build, Care & Box Contents",
        label: "Dimensions",
        value: "12 cm wide x 9.5 cm tall",
      },
      {
        group: "Build, Care & Box Contents",
        label: "Weight",
        value: "380 grams",
      },
      {
        group: "Build, Care & Box Contents",
        label: "Dishwasher Safe",
        value: "Yes",
      },
      {
        group: "Build, Care & Box Contents",
        label: "Included in Box",
        value: "Dripper, 40 Paper Filters, Brew Guide",
      },
    ],
    tags: ["coffee", "ceramics"],
    highlights: [
      {
        icon: "coffee",
        title: "Clean, Bright Coffee",
        text: "Paper filtration catches oils and fine grounds, so the natural fruity notes of your beans come through clearly.",
      },
      {
        icon: "air",
        title: "Spiral Ribs for Even Flow",
        text: "Raised spiral ribs let air escape as you pour, keeping extraction steady from the first drip to the last.",
      },
      {
        icon: "thermostat",
        title: "Heat-Holding Porcelain",
        text: "Thick glazed porcelain keeps the brew bed warm, which helps every cup taste consistent.",
      },
    ],
    ratingCounts: [21, 6, 1, 1, 0], // 72%, 21%, 3%, 3%, 0% of 29
    bundle: [
      "Electric Gooseneck Kettle",
      "Ceramic Mug Set",
      "Stainless Steel Thermal Flask",
    ],
    related: [
      "Electric Gooseneck Kettle",
      "Smart Gooseneck Kettle",
      "Ceramic Mug Set",
      "Cast Iron Skillet 10-inch",
    ],
  },
  {
    name: "Daily Planner & Hardcover Journal",
    category: "books",
    brand: "Techstudio",
    sku: "QC-BK-302",
    price: 4800,
    stock: 120,
    rating: 4.9,
    reviewCount: 41,
    description:
      "Undated daily planner and a ruled hardcover journal with a ribbon marker.",
    features: [
      "Undated: Start Any Day",
      "120gsm Bleed-Resistant Paper",
      "Lay-Flat Binding",
      "Ribbon Marker & Back Pocket",
    ],
    colors: [
      { name: "Midnight Navy", hex: "#1e293b" },
      { name: "Terracotta", hex: "#c2410c" },
      { name: "Sage Green", hex: "#84a98c" },
    ],
    specs: [
      {
        group: "Paper & Layout",
        label: "Planner Pages",
        value: "180 undated daily pages",
      },
      {
        group: "Paper & Layout",
        label: "Journal Pages",
        value: "192 ruled pages",
      },
      {
        group: "Paper & Layout",
        label: "Paper Weight",
        value: "120gsm acid-free, bleed-resistant",
      },
      {
        group: "Paper & Layout",
        label: "Planner Layout",
        value: "Top 3 priorities, schedule, notes, habits",
      },
      {
        group: "Paper & Layout",
        label: "Line Spacing",
        value: "7 mm ruled",
      },
      {
        group: "Build & Box Contents",
        label: "Size",
        value: "A5 (14.8 x 21 cm)",
      },
      {
        group: "Build & Box Contents",
        label: "Cover",
        value: "Linen-wrapped hardcover",
      },
      {
        group: "Build & Box Contents",
        label: "Binding",
        value: "Thread-sewn, opens flat",
      },
      {
        group: "Build & Box Contents",
        label: "Extras",
        value: "Ribbon marker, elastic band, back pocket",
      },
      {
        group: "Build & Box Contents",
        label: "Included in Box",
        value: "Daily Planner, Hardcover Journal, Sticker Sheet",
      },
    ],
    tags: ["stationery", "planning"],
    highlights: [
      {
        icon: "edit",
        title: "Plan Your Day in Minutes",
        text: "Each page guides you to pick three priorities, block your schedule and track habits, so busy days stay under control.",
      },
      {
        icon: "menu_book",
        title: "Lay-Flat, Thread-Sewn Binding",
        text: "Pages open fully flat for comfortable writing on both sides, and the sewn spine survives a full year of daily use.",
      },
      {
        icon: "workspace_premium",
        title: "Premium 120gsm Paper",
        text: "Thick, smooth paper takes fountain pens and highlighters without ghosting or bleeding through.",
      },
    ],
    ratingCounts: [37, 3, 1, 0, 0], // 90%, 7%, 2%, 0%, 0% of 41
    bundle: [
      "Design Systems Handbook",
      "Minimalist LED Desk Lamp",
      "Ceramic Mug Set",
    ],
    related: [
      "Design Systems Handbook",
      "Minimalist LED Desk Lamp",
      "Alloy Adjustable Stand",
      "Compact Mechanical Keypad",
    ],
  },

  // ---------- Home page: Flash Sale ----------
  {
    name: "AeroPro Wireless Buds",
    category: "electronics",
    brand: "Aura Sound Labs",
    sku: "QC-EL-205",
    price: 16500,
    oldPrice: 30000,
    stock: 6,
    rating: 4.7,
    flashSaleStock: 33,
    reviewCount: 58,
    description:
      "Compact true wireless buds with active noise cancelling and a pocket charging case.",
    features: [
      "Active Noise Cancelling",
      "Bluetooth 5.3 Low Latency",
      "24h with Charging Case",
      "IPX4 Sweat Resistant",
    ],
    colors: [
      { name: "Pearl White", hex: "#f1f5f9" },
      { name: "Carbon Black", hex: "#1f2937" },
    ],
    specs: [
      {
        group: "Audio & Connectivity",
        label: "Driver Size",
        value: "10mm dynamic graphene",
      },
      {
        group: "Audio & Connectivity",
        label: "Noise Cancellation",
        value: "Active ANC up to -30dB with Transparency",
      },
      {
        group: "Audio & Connectivity",
        label: "Bluetooth Version",
        value: "v5.3 with 60ms gaming mode",
      },
      {
        group: "Audio & Connectivity",
        label: "Supported Codecs",
        value: "AAC, SBC",
      },
      {
        group: "Audio & Connectivity",
        label: "Controls",
        value: "Touch controls with in-ear detection",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Battery Life",
        value: "6 hrs buds + 18 hrs case (24 hrs total)",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Charging Port",
        value: "USB Type-C, 10 mins = 1.5 hrs",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Water Rating",
        value: "IPX4 sweat and splash resistant",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Weight",
        value: "4.5 grams per bud",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Included in Box",
        value: "Buds, Charging Case, USB-C Cable, 3 Ear Tip Sizes",
      },
    ],
    tags: ["audio", "earbuds", "flash-deal", "fast-deal"],
    highlights: [
      {
        icon: "hearing",
        title: "Pocket-Sized Noise Cancelling",
        text: "Active noise cancelling quietens danfo engines and office chatter, and Transparency mode lets the world back in with a tap.",
      },
      {
        icon: "bluetooth",
        title: "Instant, Low-Latency Pairing",
        text: "Bluetooth 5.3 connects the moment you open the case, and gaming mode keeps sound in sync with video.",
      },
      {
        icon: "battery_charging_full",
        title: "24 Hours of Listening",
        text: "Six hours per charge plus three refills from the pocket case. A 10-minute top-up gives you 1.5 hours of play.",
      },
    ],
    ratingCounts: [45, 9, 2, 1, 1], // 78%, 16%, 3%, 2%, 2% of 58
    bundle: [
      "Fast Dual USB-C GaN Charger 35W",
      "Smart Watch Ultra",
      "Bluetooth Portable Speaker",
    ],
    related: [
      "True Wireless ANC Earbuds",
      "Noise-Isolating Studio Earbuds",
      "Wireless Noise-Cancelling Headphones",
      "Bluetooth Portable Speaker",
    ],
  },
  {
    name: "Smart Gooseneck Kettle",
    category: "kitchen",
    brand: "Brewline",
    sku: "QC-HM-102",
    price: 19500,
    oldPrice: 30000,
    stock: 14,
    rating: 4.7,
    flashSaleStock: 40,
    reviewCount: 24,
    description: "App-connected gooseneck kettle with keep-warm mode.",
    features: [
      "Wi-Fi App Control",
      "Schedule & Keep-Warm Modes",
      "Precision Gooseneck Spout",
      "1000W Fast Heating",
    ],
    colors: [
      { name: "Matte Black", hex: "#1f2937" },
      { name: "Frost White", hex: "#f1f5f9" },
    ],
    specs: [
      {
        group: "Smart Features & Brewing",
        label: "Capacity",
        value: "0.8 litres",
      },
      {
        group: "Smart Features & Brewing",
        label: "App Control",
        value: "Set temperature and start boiling from your phone",
      },
      {
        group: "Smart Features & Brewing",
        label: "Connectivity",
        value: "2.4 GHz Wi-Fi",
      },
      {
        group: "Smart Features & Brewing",
        label: "Temperature Range",
        value: "40°C – 100°C",
      },
      {
        group: "Smart Features & Brewing",
        label: "Keep Warm",
        value: "Up to 2 hours at your chosen temperature",
      },
      {
        group: "Build, Safety & Box Contents",
        label: "Power",
        value: "1000W, 220–240V UK plug",
      },
      {
        group: "Build, Safety & Box Contents",
        label: "Body",
        value: "304 stainless steel with matte finish",
      },
      {
        group: "Build, Safety & Box Contents",
        label: "Safety",
        value: "Auto shut-off and boil-dry protection",
      },
      {
        group: "Build, Safety & Box Contents",
        label: "Weight",
        value: "1.1 kg",
      },
      {
        group: "Build, Safety & Box Contents",
        label: "Included in Box",
        value: "Kettle, Smart Base, Quick Start Guide",
      },
    ],
    tags: ["coffee", "appliances", "flash-deal"],
    highlights: [
      {
        icon: "devices",
        title: "Control It from Your Phone",
        text: "Start the kettle from bed and set the exact temperature in the app, so hot water is ready when you reach the kitchen.",
      },
      {
        icon: "timer",
        title: "Schedules & Keep-Warm",
        text: "Set a morning schedule and the kettle heats itself, then holds your temperature for up to two hours.",
      },
      {
        icon: "coffee",
        title: "Built for Pour-Over",
        text: "A slim gooseneck spout gives a slow, steady pour for even, sweet extraction every time.",
      },
    ],
    ratingCounts: [19, 3, 1, 1, 0], // 79%, 13%, 4%, 4%, 0% of 24
    bundle: [
      "Ceramic Pour-Over Dripper",
      "Ceramic Mug Set",
      "Insulated 1L Hydro Flask",
    ],
    related: [
      "Electric Gooseneck Kettle",
      "Ceramic Pour-Over Dripper",
      "Ceramic Mug Set",
      "Cast Iron Skillet 10-inch",
    ],
  },
  {
    name: "Botanical Radiance Elixir",
    category: "beauty",
    brand: "Aura Botanica",
    sku: "QC-BT-505",
    price: 14000,
    oldPrice: 20000,
    stock: 3,
    rating: 4.7,
    flashSaleStock: 30,
    reviewCount: 42,
    description: "Natural vitamin C glow serum for brighter, even-toned skin.",
    features: [
      "15% Vitamin C (Ascorbyl Glucoside)",
      "Niacinamide & Hyaluronic Acid",
      "Fragrance-Free, Vegan",
      "Suits All Skin Types",
    ],
    colors: [
      { name: "Amber Glass", hex: "#b45309" },
      { name: "Frosted Gold", hex: "#d4a373" },
    ],
    specs: [
      {
        group: "Formula & Skin Benefits",
        label: "Key Actives",
        value: "15% Vitamin C, 5% Niacinamide",
      },
      {
        group: "Formula & Skin Benefits",
        label: "Hydrators",
        value: "Hyaluronic acid and aloe vera",
      },
      {
        group: "Formula & Skin Benefits",
        label: "Botanicals",
        value: "Kakadu plum, liquorice root, baobab oil",
      },
      {
        group: "Formula & Skin Benefits",
        label: "Skin Type",
        value: "All skin types, including sensitive",
      },
      {
        group: "Formula & Skin Benefits",
        label: "Free From",
        value: "Fragrance, parabens, alcohol, sulphates",
      },
      {
        group: "Usage & Box Contents",
        label: "Size",
        value: "30ml glass dropper bottle",
      },
      {
        group: "Usage & Box Contents",
        label: "How to Use",
        value: "3–4 drops morning and night, then moisturise",
      },
      {
        group: "Usage & Box Contents",
        label: "Shelf Life",
        value: "12 months after opening",
      },
      {
        group: "Usage & Box Contents",
        label: "Certification",
        value: "NAFDAC registered, cruelty-free",
      },
      {
        group: "Usage & Box Contents",
        label: "Included in Box",
        value: "Serum Bottle, Dropper, Usage Leaflet",
      },
    ],
    tags: ["skincare", "flash-deal"],
    highlights: [
      {
        icon: "light_mode",
        title: "Visible Glow in 4 Weeks",
        text: "Stable vitamin C and niacinamide fade dark spots and even out skin tone for a brighter, healthier glow.",
      },
      {
        icon: "eco",
        title: "Powered by Botanicals",
        text: "Kakadu plum, liquorice root and baobab oil add natural antioxidants that calm and protect your skin.",
      },
      {
        icon: "spa",
        title: "Gentle Enough for Daily Use",
        text: "Fragrance-free and alcohol-free, the lightweight serum absorbs fast and layers easily under sunscreen and makeup.",
      },
    ],
    ratingCounts: [33, 6, 2, 1, 0], // 79%, 14%, 5%, 2%, 0% of 42
    bundle: [
      "Skincare Hydration Kit",
      "Scented Soy Candle Duo",
      "Eco Grip Yoga Mat",
    ],
    related: [
      "Skincare Hydration Kit",
      "Scented Soy Candle Duo",
      "Eco Grip Yoga Mat",
      "Atmosphere Ambient Lamp",
    ],
  },
  {
    name: "Alloy Adjustable Stand",
    category: "office",
    brand: "WorkWell",
    sku: "QC-AC-540",
    price: 8400,
    oldPrice: 14000,
    stock: 8,
    rating: 4.7,
    flashSaleStock: 31,
    reviewCount: 26,
    description: "Ergonomic aluminium laptop riser with six height settings.",
    features: [
      "Aircraft-Grade Aluminium",
      "6 Height Settings",
      "Fits 10–17 inch Laptops",
      "Folds Flat in Seconds",
    ],
    colors: [
      { name: "Space Grey", hex: "#4b5563" },
      { name: "Silver", hex: "#d1d5db" },
    ],
    specs: [
      {
        group: "Fit & Adjustment",
        label: "Compatible Devices",
        value: "Laptops and tablets from 10 to 17 inches",
      },
      {
        group: "Fit & Adjustment",
        label: "Height Range",
        value: "6 levels, 5 cm – 15 cm",
      },
      {
        group: "Fit & Adjustment",
        label: "Viewing Angle",
        value: "15° – 50° tilt",
      },
      {
        group: "Fit & Adjustment",
        label: "Maximum Load",
        value: "10 kg",
      },
      {
        group: "Fit & Adjustment",
        label: "Cooling",
        value: "Open-frame design for passive airflow",
      },
      {
        group: "Build & Box Contents",
        label: "Material",
        value: "Anodised aluminium alloy",
      },
      {
        group: "Build & Box Contents",
        label: "Grip Pads",
        value: "Non-slip silicone on the base and arms",
      },
      {
        group: "Build & Box Contents",
        label: "Folded Size",
        value: "26 × 5 × 2.5 cm",
      },
      {
        group: "Build & Box Contents",
        label: "Weight",
        value: "520 grams",
      },
      {
        group: "Build & Box Contents",
        label: "Included in Box",
        value: "Stand, Carry Pouch, User Guide",
      },
    ],
    tags: ["workspace", "flash-deal"],
    highlights: [
      {
        icon: "self_improvement",
        title: "Healthier Eye-Level Posture",
        text: "Raise your screen up to 15 cm so your neck stays straight through long workdays, easing shoulder and back strain.",
      },
      {
        icon: "air",
        title: "Open-Frame Cooling",
        text: "The open aluminium frame lets air flow under your laptop, helping it stay cooler and quieter under heavy load.",
      },
      {
        icon: "backpack",
        title: "Folds Flat for Travel",
        text: "Collapses to the size of a ruler in seconds and slips into its pouch, ready for the office, café or co-working space.",
      },
    ],
    ratingCounts: [21, 4, 1, 0, 0], // 81%, 15%, 4%, 0%, 0% of 26
    bundle: [
      "Compact Mechanical Keypad",
      "Magnetic Headphone Stand & USB Hub",
      "Compact GaN Fast Charger 65W",
    ],
    related: [
      "Ergonomic Mesh Office Chair",
      "Compact Mechanical Keypad",
      "Minimalist LED Desk Lamp",
      "Mechanical Wireless Keyboard",
    ],
  },

  // ---------- Home page: Today's Deals ----------
  {
    name: "Compact Mechanical Keypad",
    category: "office",
    brand: "KeyCraft",
    sku: "QC-OF-302",
    price: 24000,
    oldPrice: 36000,
    stock: 30,
    rating: 4.6,
    reviewCount: 33,
    description:
      "Wireless multi-device Bluetooth keypad with hot-swappable switches.",
    features: [
      "Hot-Swappable Switches",
      "Bluetooth 5.1 + USB-C",
      "3-Device Quick Switch",
      "120h Battery Life",
    ],
    colors: [
      { name: "Graphite", hex: "#374151" },
      { name: "Cloud White", hex: "#f3f4f6" },
      { name: "Sage", hex: "#9caf88" },
    ],
    specs: [
      {
        group: "Keys & Connectivity",
        label: "Layout",
        value: "Compact 75% (84 keys)",
      },
      {
        group: "Keys & Connectivity",
        label: "Switches",
        value: "Pre-lubed linear, hot-swappable (3 & 5-pin)",
      },
      {
        group: "Keys & Connectivity",
        label: "Connection",
        value: "Bluetooth 5.1 (3 devices) and wired USB-C",
      },
      {
        group: "Keys & Connectivity",
        label: "Compatibility",
        value: "Windows, macOS, iOS, Android",
      },
      {
        group: "Keys & Connectivity",
        label: "Backlight",
        value: "White LED with 4 brightness levels",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Battery",
        value: "3000 mAh, up to 120 hrs (backlight off)",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Keycaps",
        value: "Double-shot PBT",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Frame",
        value: "ABS case with steel mounting plate",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Weight",
        value: "680 grams",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Included in Box",
        value: "Keypad, USB-C Cable, Keycap & Switch Puller",
      },
    ],
    tags: ["keyboard", "workspace", "deal"],
    highlights: [
      {
        icon: "keyboard",
        title: "Swap Switches Without Soldering",
        text: "Pull a switch out and push a new one in to change the feel of every key. Works with most 3-pin and 5-pin switches.",
      },
      {
        icon: "bluetooth",
        title: "One Keypad, Three Devices",
        text: "Pair your laptop, tablet and phone, then jump between them with a single key combination.",
      },
      {
        icon: "battery_charging_full",
        title: "Weeks on One Charge",
        text: "A 3000 mAh battery lasts up to 120 hours of typing, and USB-C charging gets you back to full in about 3 hours.",
      },
    ],
    ratingCounts: [25, 5, 2, 1, 0], // 76%, 15%, 6%, 3%, 0% of 33
    bundle: [
      "Alloy Adjustable Stand",
      "Compact GaN Fast Charger 65W",
      "Magnetic Headphone Stand & USB Hub",
    ],
    related: [
      "Mechanical Wireless Keyboard",
      "Alloy Adjustable Stand",
      "Ergonomic Mesh Office Chair",
      "Minimalist LED Desk Lamp",
    ],
  },
  {
    name: "Insulated 1L Hydro Flask",
    category: "sports",
    brand: "ZenFit Athletics",
    sku: "QC-SP-204",
    price: 11500,
    oldPrice: 19500,
    stock: 45,
    rating: 4.7,
    reviewCount: 36,
    description: "Keeps drinks chilled for 24 hours or hot for 12.",
    features: [
      "Double-Wall Vacuum Insulation",
      "24h Cold / 12h Hot",
      "1 Litre Capacity",
      "BPA-Free Leakproof Lid",
    ],
    colors: [
      { name: "Ocean Blue", hex: "#1d4ed8" },
      { name: "Matte Black", hex: "#111827" },
      { name: "Mint", hex: "#a7f3d0" },
    ],
    specs: [
      {
        group: "Capacity & Insulation",
        label: "Capacity",
        value: "1 litre (32 oz)",
      },
      {
        group: "Capacity & Insulation",
        label: "Cold Retention",
        value: "Up to 24 hours",
      },
      {
        group: "Capacity & Insulation",
        label: "Hot Retention",
        value: "Up to 12 hours",
      },
      {
        group: "Capacity & Insulation",
        label: "Insulation",
        value: "Double-wall vacuum, sweat-free outside",
      },
      {
        group: "Capacity & Insulation",
        label: "Mouth Opening",
        value: "Wide mouth, fits standard ice cubes",
      },
      {
        group: "Build & Box Contents",
        label: "Material",
        value: "18/8 food-grade stainless steel",
      },
      {
        group: "Build & Box Contents",
        label: "Lid",
        value: "BPA-free flex cap with carry loop",
      },
      {
        group: "Build & Box Contents",
        label: "Finish",
        value: "Powder coat, non-slip grip",
      },
      {
        group: "Build & Box Contents",
        label: "Weight",
        value: "430 grams (empty)",
      },
      {
        group: "Build & Box Contents",
        label: "Included in Box",
        value: "Flask, Flex Cap",
      },
    ],
    tags: ["hydration", "outdoors", "deal"],
    highlights: [
      {
        icon: "thermostat",
        title: "All-Day Temperature Lock",
        text: "Double-wall vacuum insulation keeps water ice-cold for 24 hours in the Lagos heat, or tea hot for 12.",
      },
      {
        icon: "water_drop",
        title: "Leakproof and Sweat-Free",
        text: "A sealed flex cap means no spills in your gym bag, and the outside never gets wet with condensation.",
      },
      {
        icon: "eco",
        title: "Built to Replace Plastic",
        text: "Food-grade stainless steel with no metallic taste, made to be refilled every day for years.",
      },
    ],
    ratingCounts: [29, 5, 1, 1, 0], // 81%, 14%, 3%, 3%, 0% of 36
    bundle: [
      "Resistance Workout Bands",
      "Eco Grip Yoga Mat",
      "Apex Tracker Watch",
    ],
    related: [
      "Stainless Steel Thermal Flask",
      "Eco Grip Yoga Mat",
      "Resistance Workout Bands",
      "Apex Tracker Watch",
    ],
  },
  {
    name: "Apex Tracker Watch",
    category: "electronics",
    brand: "Aura Wearables",
    sku: "QC-EL-206",
    price: 42000,
    oldPrice: 57000,
    stock: 30,
    rating: 4.6,
    reviewCount: 37,
    description:
      "Heart rate, sleep tracking & GPS in a lightweight sports watch.",
    features: [
      '1.4" AMOLED Display',
      "Built-in GPS",
      "24/7 Heart Rate & Sleep",
      "10-Day Battery Life",
    ],
    colors: [
      { name: "Carbon Black", hex: "#1f2937" },
      { name: "Volt Green", hex: "#84cc16" },
      { name: "Glacier Blue", hex: "#7dd3fc" },
    ],
    specs: [
      {
        group: "Display & Tracking",
        label: "Display",
        value: '1.4" AMOLED, 454 × 454, always-on option',
      },
      {
        group: "Display & Tracking",
        label: "Sensors",
        value: "Optical heart rate, SpO2, accelerometer, gyroscope",
      },
      {
        group: "Display & Tracking",
        label: "GPS",
        value: "Built-in dual-band GPS",
      },
      {
        group: "Display & Tracking",
        label: "Sport Modes",
        value: "100+ including running, cycling and swimming",
      },
      {
        group: "Display & Tracking",
        label: "Health Tracking",
        value: "Sleep stages, stress, steps and calories",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Battery Life",
        value: "Up to 10 days (20 hrs with GPS on)",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Water Resistance",
        value: "5 ATM (swim-proof)",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Connectivity",
        value: "Bluetooth 5.2, iOS and Android app",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Weight",
        value: "32 grams (without strap)",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Included in Box",
        value: "Watch, Silicone Strap, Magnetic Charger",
      },
    ],
    tags: ["wearables", "fitness", "deal"],
    highlights: [
      {
        icon: "fitness_center",
        title: "Built for Every Workout",
        text: "Over 100 sport modes and dual-band GPS map your runs and rides accurately, even between tall buildings.",
      },
      {
        icon: "favorite",
        title: "Round-the-Clock Health Insights",
        text: "Continuous heart rate, SpO2 and sleep-stage tracking help you see how well you recover each night.",
      },
      {
        icon: "battery_charging_full",
        title: "Ten Days Between Charges",
        text: "A full week and more of everyday use on one charge, with 20 hours of continuous GPS for long sessions.",
      },
    ],
    ratingCounts: [28, 6, 2, 1, 0], // 76%, 16%, 5%, 3%, 0% of 37
    bundle: [
      "AeroPro Wireless Buds",
      "Insulated 1L Hydro Flask",
      "Resistance Workout Bands",
    ],
    related: [
      "Smart Watch Ultra",
      "AeroPro Wireless Buds",
      "True Wireless ANC Earbuds",
      "Bluetooth Portable Speaker",
    ],
  },
  {
    name: "Atmosphere Ambient Lamp",
    category: "home-living",
    brand: "Aurora Home",
    sku: "QC-HM-413",
    price: 10500,
    oldPrice: 15500,
    stock: 40,
    rating: 4.6,
    reviewCount: 28,
    description: "Nordic ceramic lamp with 3-step dimming warm light.",
    features: [
      "Handmade Ceramic Base",
      "3-Step Touch Dimming",
      "Warm 2700K Glow",
      "Energy-Saving LED Bulb",
    ],
    colors: [
      { name: "Sand Beige", hex: "#e7d8c4" },
      { name: "Terracotta", hex: "#c2410c" },
      { name: "Chalk White", hex: "#f5f5f4" },
    ],
    specs: [
      {
        group: "Lighting",
        label: "Colour Temperature",
        value: "2700K warm white",
      },
      {
        group: "Lighting",
        label: "Brightness Levels",
        value: "3 steps (30%, 60%, 100%)",
      },
      {
        group: "Lighting",
        label: "Control",
        value: "Touch-sensitive base",
      },
      {
        group: "Lighting",
        label: "Bulb",
        value: "E14 LED, 5W (included)",
      },
      {
        group: "Lighting",
        label: "Power",
        value: "220–240V mains with 1.5m fabric cable",
      },
      {
        group: "Build & Box Contents",
        label: "Base Material",
        value: "Hand-glazed ceramic",
      },
      {
        group: "Build & Box Contents",
        label: "Shade",
        value: "Linen-blend fabric",
      },
      {
        group: "Build & Box Contents",
        label: "Dimensions",
        value: "Height 32 cm, shade diameter 22 cm",
      },
      {
        group: "Build & Box Contents",
        label: "Weight",
        value: "1.2 kg",
      },
      {
        group: "Build & Box Contents",
        label: "Included in Box",
        value: "Lamp Base, Shade, LED Bulb",
      },
    ],
    tags: ["lighting", "deal"],
    highlights: [
      {
        icon: "light_mode",
        title: "Soft, Cosy Warm Light",
        text: "A 2700K glow sets a calm mood in the bedroom or living room without the harsh glare of ceiling lights.",
      },
      {
        icon: "palette",
        title: "Hand-Glazed Ceramic",
        text: "Each Nordic-style base is glazed by hand, so the finish on your lamp is slightly unique.",
      },
      {
        icon: "eco",
        title: "Low-Energy LED",
        text: "The included 5W LED bulb uses a fraction of the power of a classic bulb and lasts for years.",
      },
    ],
    ratingCounts: [21, 5, 1, 1, 0], // 75%, 18%, 4%, 4%, 0% of 28
    bundle: [
      "Scented Soy Candle Duo",
      "Ceramic Mug Set",
      "Daily Planner & Hardcover Journal",
    ],
    related: [
      "Minimalist LED Desk Lamp",
      "Scented Soy Candle Duo",
      "Ceramic Mug Set",
      "Ceramic Pour-Over Dripper",
    ],
  },
  {
    name: "Court Classic Lows",
    category: "fashion",
    brand: "UrbanStride",
    sku: "QC-FA-106",
    price: 15800,
    oldPrice: 23000,
    stock: 35,
    rating: 4.5,
    reviewCount: 31,
    description:
      "Low-top court sneakers with a heavyweight cotton canvas upper.",
    features: [
      "Heavyweight Cotton Canvas",
      "Vulcanised Rubber Sole",
      "Cushioned Insole",
      "Sizes 39–46",
    ],
    colors: [
      { name: "Optic White", hex: "#fafafa" },
      { name: "Navy", hex: "#1e3a8a" },
      { name: "Black", hex: "#0a0a0a" },
    ],
    specs: [
      {
        group: "Fit & Comfort",
        label: "Sizes",
        value: "EU 39–46 (true to size)",
      },
      {
        group: "Fit & Comfort",
        label: "Fit",
        value: "Regular width, unisex",
      },
      {
        group: "Fit & Comfort",
        label: "Insole",
        value: "Removable cushioned foam footbed",
      },
      {
        group: "Fit & Comfort",
        label: "Closure",
        value: "Flat cotton laces, 6 eyelets",
      },
      {
        group: "Fit & Comfort",
        label: "Lining",
        value: "Breathable cotton",
      },
      {
        group: "Materials & Care",
        label: "Upper",
        value: "12 oz heavyweight cotton canvas",
      },
      {
        group: "Materials & Care",
        label: "Outsole",
        value: "Vulcanised natural rubber with herringbone grip",
      },
      {
        group: "Materials & Care",
        label: "Toe Cap",
        value: "Reinforced rubber",
      },
      {
        group: "Materials & Care",
        label: "Care",
        value: "Spot clean with a damp cloth",
      },
      {
        group: "Materials & Care",
        label: "Included in Box",
        value: "One Pair of Sneakers, Spare Laces",
      },
    ],
    tags: ["footwear", "sneakers", "deal"],
    highlights: [
      {
        icon: "checkroom",
        title: "Goes With Everything",
        text: "A clean court silhouette that pairs as easily with jeans and a T-shirt as it does with chinos and a linen shirt.",
      },
      {
        icon: "shield",
        title: "Tough Heavyweight Canvas",
        text: "A 12 oz cotton canvas upper and reinforced toe cap hold their shape through daily wear.",
      },
      {
        icon: "verified",
        title: "Grippy Vulcanised Sole",
        text: "A natural rubber herringbone outsole keeps its grip on smooth tiles and wet pavements alike.",
      },
    ],
    ratingCounts: [21, 7, 2, 1, 0], // 68%, 23%, 6%, 3%, 0% of 31
    bundle: [
      "Premium Linen Overshirt",
      "Minimalist Leather Wallet",
      "Polarized UV Sunglasses",
    ],
    related: [
      "Canvas Low-Top Sneakers",
      "Premium Linen Overshirt",
      "Cotton Twill Backpack",
      "Polarized UV Sunglasses",
    ],
  },

  // ---------- Product Details page: bundle add-ons and related products ----------
  {
    name: "Protective Hard Shell Case",
    category: "electronics",
    brand: "Aura Sound Labs",
    sku: "QC-AU-311",
    price: 6500,
    stock: 90,
    rating: 4.7,
    reviewCount: 28,
    description:
      "Shockproof EVA interior that keeps over-ear headphones safe in your bag.",
    tagline: "Shockproof EVA interior",
    features: [
      "Rigid EVA Shell",
      "Soft Velvet Lining",
      "Mesh Cable Pocket",
      "Splash-Resistant Zip",
    ],
    colors: [
      { name: "Midnight Black", hex: "#1f2937" },
      { name: "Slate Grey", hex: "#64748b" },
    ],
    specs: [
      {
        group: "Protection & Fit",
        label: "Compatible With",
        value: "Most folding and flat-folding over-ear headphones",
      },
      {
        group: "Protection & Fit",
        label: "Shell",
        value: "Hard-pressed EVA, crush resistant",
      },
      {
        group: "Protection & Fit",
        label: "Lining",
        value: "Soft velvet, scratch free",
      },
      {
        group: "Protection & Fit",
        label: "Water Resistance",
        value: "Splash-resistant fabric and zip",
      },
      {
        group: "Protection & Fit",
        label: "Storage",
        value: "Inner mesh pocket for cables and adapters",
      },
      {
        group: "Size & Box Contents",
        label: "Outer Size",
        value: "21 × 18 × 8 cm",
      },
      {
        group: "Size & Box Contents",
        label: "Inner Size",
        value: "19.5 × 16.5 × 7 cm",
      },
      {
        group: "Size & Box Contents",
        label: "Carry",
        value: "Fabric wrist strap",
      },
      {
        group: "Size & Box Contents",
        label: "Weight",
        value: "190 grams",
      },
      {
        group: "Size & Box Contents",
        label: "Included in Box",
        value: "Hard Shell Case",
      },
    ],
    tags: ["audio", "accessories"],
    highlights: [
      {
        icon: "shield",
        title: "Shockproof Protection",
        text: "A rigid EVA shell absorbs knocks and resists crushing, so your headphones survive a packed bag or a busy commute.",
      },
      {
        icon: "cable",
        title: "Room for Every Cable",
        text: "An inner mesh pocket keeps your charging cable, AUX lead and flight adapter tidy and in one place.",
      },
      {
        icon: "backpack",
        title: "Slim Enough to Carry",
        text: "A compact shape and wrist strap mean it slips easily into a backpack or carry-on.",
      },
    ],
    ratingCounts: [22, 5, 1, 0, 0], // 79%, 18%, 4%, 0%, 0% of 28
    bundle: [
      "Wireless Noise-Cancelling Headphones",
      "Gold-Plated 3.5mm AUX Cable",
      "Hi-Res DAC Audio Adapter",
    ],
    related: [
      "Magnetic Headphone Stand & USB Hub",
      "Gold-Plated 3.5mm AUX Cable",
      "Fast Dual USB-C GaN Charger 35W",
      "Hi-Res DAC Audio Adapter",
    ],
  },
  {
    name: "Gold-Plated 3.5mm AUX Cable",
    category: "electronics",
    brand: "Aura Sound Labs",
    sku: "QC-AU-312",
    price: 2200,
    stock: 150,
    rating: 4.6,
    reviewCount: 33,
    description: "Braided 1.8m lossless wire with gold-plated connectors.",
    tagline: "Braided 1.8m lossless wire",
    features: [
      "24K Gold-Plated Plugs",
      "Braided Nylon Jacket",
      "Oxygen-Free Copper Core",
      "1.8m Length",
    ],
    colors: [
      { name: "Space Grey", hex: "#4b5563" },
      { name: "Rose Gold", hex: "#e8b4a0" },
    ],
    specs: [
      {
        group: "Audio",
        label: "Connectors",
        value: "3.5mm male to 3.5mm male (TRS)",
      },
      {
        group: "Audio",
        label: "Plating",
        value: "24K gold",
      },
      {
        group: "Audio",
        label: "Conductor",
        value: "Oxygen-free copper (OFC)",
      },
      {
        group: "Audio",
        label: "Shielding",
        value: "Double shielded against interference",
      },
      {
        group: "Audio",
        label: "Compatible With",
        value: "Headphones, car stereos, speakers, laptops",
      },
      {
        group: "Build & Box Contents",
        label: "Length",
        value: "1.8 metres",
      },
      {
        group: "Build & Box Contents",
        label: "Jacket",
        value: "Braided nylon, tangle resistant",
      },
      {
        group: "Build & Box Contents",
        label: "Plug Housing",
        value: "Aluminium, slim fit for phone cases",
      },
      {
        group: "Build & Box Contents",
        label: "Bend Lifespan",
        value: "Tested to 10,000+ bends",
      },
      {
        group: "Build & Box Contents",
        label: "Included in Box",
        value: "AUX Cable, Velcro Cable Tie",
      },
    ],
    tags: ["audio", "accessories", "cable"],
    highlights: [
      {
        icon: "graphic_eq",
        title: "Clean, Lossless Sound",
        text: "Oxygen-free copper and double shielding carry a clear signal with no hiss or hum from nearby devices.",
      },
      {
        icon: "cable",
        title: "Braided to Last",
        text: "A tangle-resistant nylon jacket and strain-relieved plugs are tested to survive over 10,000 bends.",
      },
      {
        icon: "verified",
        title: "Gold-Plated Connectors",
        text: "24K gold-plated plugs resist corrosion and keep a firm, crackle-free connection for years.",
      },
    ],
    ratingCounts: [25, 5, 2, 1, 0], // 76%, 15%, 6%, 3%, 0% of 33
    bundle: [
      "Wireless Noise-Cancelling Headphones",
      "Protective Hard Shell Case",
      "Hi-Res DAC Audio Adapter",
    ],
    related: [
      "Hi-Res DAC Audio Adapter",
      "Protective Hard Shell Case",
      "Noise-Isolating Studio Earbuds",
      "Over-Ear Studio Monitors",
    ],
  },
  {
    name: "Fast Dual USB-C GaN Charger 35W",
    category: "electronics",
    brand: "Voltron",
    sku: "QC-AU-313",
    price: 8000,
    stock: 80,
    rating: 4.5,
    reviewCount: 21,
    description: "35W rapid power adapter with two USB-C ports.",
    tagline: "35W rapid power adapter",
    features: [
      "35W GaN Technology",
      "Two USB-C Ports",
      "PD 3.0 Fast Charging",
      "Foldable Plug",
    ],
    colors: [
      { name: "Arctic White", hex: "#f9fafb" },
      { name: "Jet Black", hex: "#111827" },
    ],
    specs: [
      {
        group: "Charging",
        label: "Total Output",
        value: "35W maximum",
      },
      {
        group: "Charging",
        label: "Ports",
        value: "2 × USB-C",
      },
      {
        group: "Charging",
        label: "Single Port Output",
        value: "Up to 35W (5V–20V)",
      },
      {
        group: "Charging",
        label: "Dual Port Output",
        value: "17.5W + 17.5W",
      },
      {
        group: "Charging",
        label: "Protocols",
        value: "USB Power Delivery 3.0, PPS",
      },
      {
        group: "Safety, Build & Box Contents",
        label: "Input",
        value: "100–240V AC, 50/60 Hz",
      },
      {
        group: "Safety, Build & Box Contents",
        label: "Protection",
        value: "Over-voltage, over-current and over-heat",
      },
      {
        group: "Safety, Build & Box Contents",
        label: "Plug",
        value: "Foldable UK-style 3-pin",
      },
      {
        group: "Safety, Build & Box Contents",
        label: "Weight",
        value: "68 grams",
      },
      {
        group: "Safety, Build & Box Contents",
        label: "Included in Box",
        value: "Charger, User Guide",
      },
    ],
    tags: ["charging", "accessories"],
    highlights: [
      {
        icon: "bolt",
        title: "Fast Charge Two Devices",
        text: "Power Delivery 3.0 tops up a phone to 50% in about 30 minutes, with a second port free for your earbuds or watch.",
      },
      {
        icon: "devices",
        title: "Small but Mighty GaN",
        text: "Gallium nitride parts make it far smaller than older 35W bricks while staying cool to the touch.",
      },
      {
        icon: "shield",
        title: "Built-In Safety",
        text: "Over-voltage, over-current and temperature protection keep your devices safe through power surges and voltage swings.",
      },
    ],
    ratingCounts: [14, 5, 1, 1, 0], // 67%, 24%, 5%, 5%, 0% of 21
    bundle: [
      "Wireless Noise-Cancelling Headphones",
      "True Wireless ANC Earbuds",
      "Smart Watch Ultra",
    ],
    related: [
      "Compact GaN Fast Charger 65W",
      "Magnetic Headphone Stand & USB Hub",
      "Hi-Res DAC Audio Adapter",
      "Gold-Plated 3.5mm AUX Cable",
    ],
  },
  {
    name: "Over-Ear Studio Monitors",
    category: "electronics",
    brand: "Sonic Pro",
    sku: "QC-AU-314",
    price: 52000,
    oldPrice: 61000,
    stock: 25,
    rating: 4.7,
    reviewCount: 39,
    badge: "SALE",
    description:
      "Professional flat-response headphones for mixing and mastering.",
    tagline: "Professional flat-response mixing",
    features: [
      "50mm Studio Drivers",
      "Flat Reference Response",
      "Detachable Cables",
      "Closed-Back Isolation",
    ],
    colors: [
      { name: "Studio Black", hex: "#18181b" },
      { name: "Gunmetal", hex: "#52525b" },
    ],
    specs: [
      {
        group: "Audio",
        label: "Driver Size",
        value: "50mm neodymium, CCAW voice coil",
      },
      {
        group: "Audio",
        label: "Frequency Response",
        value: "5 Hz – 40,000 Hz",
      },
      {
        group: "Audio",
        label: "Impedance",
        value: "38 ohms",
      },
      {
        group: "Audio",
        label: "Sensitivity",
        value: "99 dB",
      },
      {
        group: "Audio",
        label: "Design",
        value: "Closed-back, circumaural",
      },
      {
        group: "Build & Box Contents",
        label: "Cables",
        value: "Detachable: 1.2m straight, 3m straight, 3m coiled",
      },
      {
        group: "Build & Box Contents",
        label: "Ear Cups",
        value: "90° swivel with protein leather pads",
      },
      {
        group: "Build & Box Contents",
        label: "Connector",
        value: "3.5mm with 6.3mm screw-on adapter",
      },
      {
        group: "Build & Box Contents",
        label: "Weight",
        value: "285 grams (without cable)",
      },
      {
        group: "Build & Box Contents",
        label: "Included in Box",
        value: "Headphones, 3 Cables, 6.3mm Adapter, Pouch",
      },
    ],
    tags: ["audio", "studio"],
    highlights: [
      {
        icon: "graphic_eq",
        title: "Honest, Flat Sound",
        text: "A flat reference response shows you exactly what is in the mix, so tracks sound right on every speaker.",
      },
      {
        icon: "hearing",
        title: "Closed-Back Isolation",
        text: "Sealed ear cups block out room noise and stop sound leaking into your microphone while recording.",
      },
      {
        icon: "cable",
        title: "Three Detachable Cables",
        text: "Swap between short, long and coiled cables for the desk, the booth or the stage, and replace them easily.",
      },
    ],
    ratingCounts: [31, 6, 1, 1, 0], // 79%, 15%, 3%, 3%, 0% of 39
    bundle: [
      "Hi-Res DAC Audio Adapter",
      "Magnetic Headphone Stand & USB Hub",
      "Protective Hard Shell Case",
    ],
    related: [
      "Wireless Noise-Cancelling Headphones",
      "Noise-Isolating Studio Earbuds",
      "Hi-Res DAC Audio Adapter",
      "Magnetic Headphone Stand & USB Hub",
    ],
  },
  {
    name: "True Wireless ANC Earbuds",
    category: "electronics",
    brand: "Aura Sound Labs",
    sku: "QC-AU-315",
    price: 32000,
    stock: 45,
    rating: 4.6,
    reviewCount: 57,
    description:
      "IPX5 water resistant · 28h battery with the charging case. Free shipping.",
    tagline: "IPX5 water resistant · 28h battery",
    priceNote: "Free shipping",
    features: [
      "Active Noise Cancelling",
      "IPX5 Water Resistant",
      "28h with Charging Case",
      "Bluetooth 5.3",
    ],
    colors: [
      { name: "Onyx Black", hex: "#0f172a" },
      { name: "Pearl White", hex: "#f8fafc" },
      { name: "Ocean Teal", hex: "#0f766e" },
    ],
    specs: [
      {
        group: "Audio & Connectivity",
        label: "Driver Size",
        value: "11mm dynamic",
      },
      {
        group: "Audio & Connectivity",
        label: "Noise Cancellation",
        value: "Hybrid ANC with Transparency Mode",
      },
      {
        group: "Audio & Connectivity",
        label: "Bluetooth Version",
        value: "v5.3",
      },
      {
        group: "Audio & Connectivity",
        label: "Supported Codecs",
        value: "AAC, SBC",
      },
      {
        group: "Audio & Connectivity",
        label: "Microphones",
        value: "6 mics with AI call noise reduction",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Battery Life",
        value: "7 hrs buds / 28 hrs with case (ANC On)",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Charging",
        value: "USB-C and Qi wireless charging case",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Water Resistance",
        value: "IPX5 (sweat and rain)",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Weight",
        value: "5 grams per bud",
      },
      {
        group: "Power, Build & Box Contents",
        label: "Included in Box",
        value: "Earbuds, Charging Case, 3 Ear Tip Sizes, USB-C",
      },
    ],
    tags: ["audio", "earbuds", "wireless"],
    highlights: [
      {
        icon: "hearing",
        title: "Quiet on Demand",
        text: "Hybrid ANC softens traffic and generator noise, and Transparency Mode lets the world back in with a tap.",
      },
      {
        icon: "water_drop",
        title: "Sweat and Rain Ready",
        text: "IPX5 water resistance means a workout or a sudden Lagos downpour won't stop your music.",
      },
      {
        icon: "battery_charging_full",
        title: "28 Hours in Your Pocket",
        text: "Seven hours per charge plus three refills from the case, and a 10-minute top-up gives another hour of play.",
      },
    ],
    ratingCounts: [43, 9, 3, 1, 1], // 75%, 16%, 5%, 2%, 2% of 57
    bundle: [
      "Fast Dual USB-C GaN Charger 35W",
      "Apex Tracker Watch",
      "Bluetooth Portable Speaker",
    ],
    related: [
      "AeroPro Wireless Buds",
      "Noise-Isolating Studio Earbuds",
      "Wireless Noise-Cancelling Headphones",
      "Bluetooth Portable Speaker",
    ],
  },
  {
    name: "Magnetic Headphone Stand & USB Hub",
    category: "electronics",
    brand: "Aura Sound Labs",
    sku: "QC-AU-316",
    price: 12500,
    stock: 35,
    rating: 4.8,
    reviewCount: 62,
    description:
      "A desk essential: headphone stand with a 3-port USB 3.0 hub and RGB illumination.",
    tagline: "3-Port USB 3.0 + RGB illumination",
    priceNote: "Desk essential",
    features: [
      "3-Port USB 3.0 Hub",
      "RGB Light Base",
      "Magnetic Headphone Hook",
      "Weighted Non-Slip Base",
    ],
    colors: [
      { name: "Matte Black", hex: "#171717" },
      { name: "Aluminium Silver", hex: "#cbd5e1" },
    ],
    specs: [
      {
        group: "Hub & Lighting",
        label: "USB Ports",
        value: "3 × USB-A 3.0",
      },
      {
        group: "Hub & Lighting",
        label: "Data Speed",
        value: "Up to 5 Gbps",
      },
      {
        group: "Hub & Lighting",
        label: "Connection",
        value: "USB-C cable to computer (1.2m)",
      },
      {
        group: "Hub & Lighting",
        label: "Lighting",
        value: "RGB base with 9 modes, touch controlled",
      },
      {
        group: "Hub & Lighting",
        label: "Compatibility",
        value: "Windows, macOS, Linux (plug & play)",
      },
      {
        group: "Build & Box Contents",
        label: "Material",
        value: "Aluminium arm with ABS base",
      },
      {
        group: "Build & Box Contents",
        label: "Hook",
        value: "Detachable magnetic headphone hook",
      },
      {
        group: "Build & Box Contents",
        label: "Height",
        value: "27 cm",
      },
      {
        group: "Build & Box Contents",
        label: "Weight",
        value: "460 grams",
      },
      {
        group: "Build & Box Contents",
        label: "Included in Box",
        value: "Stand, USB-C to USB-A Cable, User Guide",
      },
    ],
    tags: ["audio", "workspace", "accessories"],
    highlights: [
      {
        icon: "devices",
        title: "Three Extra USB Ports",
        text: "Plug in a keyboard, mouse and flash drive right at the front of your desk, with fast 5 Gbps USB 3.0 transfers.",
      },
      {
        icon: "light_mode",
        title: "Touch-Controlled RGB Glow",
        text: "Nine lighting modes in the base give your setup a soft accent light, switched with a single tap.",
      },
      {
        icon: "workspace_premium",
        title: "A Proper Home for Headphones",
        text: "A weighted base and padded magnetic hook keep your headphones off the desk and their headband in shape.",
      },
    ],
    ratingCounts: [52, 8, 1, 1, 0], // 84%, 13%, 2%, 2%, 0% of 62
    bundle: [
      "Wireless Noise-Cancelling Headphones",
      "Mechanical Wireless Keyboard",
      "Alloy Adjustable Stand",
    ],
    related: [
      "Protective Hard Shell Case",
      "Over-Ear Studio Monitors",
      "Wireless Noise-Cancelling Headphones",
      "Hi-Res DAC Audio Adapter",
    ],
  },
  {
    name: "Hi-Res DAC Audio Adapter",
    category: "electronics",
    brand: "Sonic Pro",
    sku: "QC-AU-317",
    price: 8500,
    stock: 70,
    rating: 4.6,
    reviewCount: 49,
    description: "Plug & play 32bit/384kHz lossless USB Type-C audio adapter.",
    tagline: "32bit/384kHz lossless Type-C",
    priceNote: "Plug & Play",
    features: [
      "32bit/384kHz DAC Chip",
      "USB-C to 3.5mm",
      "Plug & Play, No Drivers",
      "Inline Mic Support",
    ],
    colors: [
      { name: "Graphite", hex: "#374151" },
      { name: "Silver", hex: "#d1d5db" },
    ],
    specs: [
      {
        group: "Audio",
        label: "DAC Resolution",
        value: "32-bit / 384 kHz",
      },
      {
        group: "Audio",
        label: "Signal-to-Noise Ratio",
        value: "120 dB",
      },
      {
        group: "Audio",
        label: "Output Power",
        value: "Up to 60 mW @ 32 ohms",
      },
      {
        group: "Audio",
        label: "Headphone Impedance",
        value: "16 – 300 ohms",
      },
      {
        group: "Audio",
        label: "Microphone",
        value: "Supports inline mic and remote buttons",
      },
      {
        group: "Build & Box Contents",
        label: "Connectors",
        value: "USB Type-C to 3.5mm female",
      },
      {
        group: "Build & Box Contents",
        label: "Compatibility",
        value: "Android, iPad, Mac, Windows (no drivers)",
      },
      {
        group: "Build & Box Contents",
        label: "Housing",
        value: "Aluminium alloy with braided cable",
      },
      {
        group: "Build & Box Contents",
        label: "Weight",
        value: "9 grams",
      },
      {
        group: "Build & Box Contents",
        label: "Included in Box",
        value: "DAC Adapter, Carry Pouch",
      },
    ],
    tags: ["audio", "accessories"],
    highlights: [
      {
        icon: "graphic_eq",
        title: "True Hi-Res Playback",
        text: "A 32-bit/384kHz DAC chip plays lossless files with more detail than your phone's built-in audio.",
      },
      {
        icon: "bolt",
        title: "Plug In and Listen",
        text: "No apps or drivers needed. Connect it to any USB-C phone, tablet or laptop and it works straight away.",
      },
      {
        icon: "hearing",
        title: "Drives Studio Headphones",
        text: "Enough power for headphones up to 300 ohms, so studio monitors sound full instead of thin and quiet.",
      },
    ],
    ratingCounts: [37, 8, 3, 1, 0], // 76%, 16%, 6%, 2%, 0% of 49
    bundle: [
      "Over-Ear Studio Monitors",
      "Gold-Plated 3.5mm AUX Cable",
      "Noise-Isolating Studio Earbuds",
    ],
    related: [
      "Gold-Plated 3.5mm AUX Cable",
      "Over-Ear Studio Monitors",
      "Noise-Isolating Studio Earbuds",
      "Magnetic Headphone Stand & USB Hub",
    ],
  },
];
