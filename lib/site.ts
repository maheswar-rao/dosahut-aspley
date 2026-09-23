// Central place for anything that might change — copy, links, hours.

export const SITE = {
  name: "Dosa Hut Aspley",
  orderUrl: "https://aspley.dosahut.net.au/",
  menuPdfUrl:
    "https://www.dosahut.net.au/wp-content/uploads/2025/10/NIC_Dosa-Hut-menuASPLEY-8-10-25.pdf",
  phoneDisplay: "0466 977 674",
  phoneHref: "tel:+61466977674",
  addressLine1: "Shop 6 & 7/46 Gayford Street",
  addressLine2: "Aspley, QLD 4034",
  addressFull: "Shop 6 & 7/46 Gayford Street, Aspley QLD 4034",
  // Exact listing coordinates. Used for the directions link so it resolves
  // without the maps.app.goo.gl shortener's extra redirect hop.
  lat: -27.3634881,
  lng: 153.0163604,
  placeUrl:
    "https://www.google.com/maps/place/Dosa+Hut+Indian+Multi+Cuisine+Restaurant+Aspley/@-27.3634881,153.0163604,17z/data=!3m2!4b1!5s0x6b93e2b2bd54e7b1:0x14c90cc425e89373!4m6!3m5!1s0x6b93e36fcf53ec53:0x2eebfb8cce6a2619!8m2!3d-27.3634881!4d153.0163604!16s%2Fg%2F11gm6fr62l?entry=ttu&g_ep=EgoyMDI2MDkxNC4wIKXMDSoASAFQAw%3D%3D",
  directionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=-27.3634881,153.0163604",
  mapEmbedUrl:
    "https://www.google.com/maps?q=46+Gayford+St+Aspley+QLD+4034&z=17&output=embed",
  mainSiteUrl: "https://www.dosahut.net.au/",
  // Verified live; the main site has no privacy policy page, so the footer
  // links only the sitemap.
  sitemapUrl: "https://www.dosahut.net.au/sitemap.html",
  // Canonical origin for this site. Set NEXT_PUBLIC_SITE_URL at build time to
  // the domain it is actually deployed on — the fallback is the ordering
  // domain the business currently points customers at.
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://aspley.dosahut.net.au",
  ogImage: "/images/hero-banner.png",
  cateringUrl: "https://www.dosahut.net.au/catering/indian-catering-aspley/",
  instagramUrl: "https://www.instagram.com/dosahutaspley/",
  facebookUrl: "https://www.facebook.com/DosaHutAspley/",
  uberEatsUrl: "https://www.ubereats.com/au/store/dosa-hut-aspley/AVpvfAxqTOW91C5jWeVfVw",
  doorDashUrl: "https://www.doordash.com/store/dosa-hut-aspley-983073/",
};

// No "Location" entry — the "Aspley" pin in the navbar already
// links to #location.
export const NAV_LINKS = [
  { label: "Home", href: "#top" },
  { label: "Menu", href: "#menu" },
  { label: "Catering", href: "#catering" },
];

export const HOURS = [
  { day: "Mon – Thu", time: "11:00 am – 3:00 pm, 5:00 pm – 10:00 pm" },
  { day: "Fri", time: "11:00 am – 10:00 pm" },
  { day: "Sat", time: "9:00 am – 10:00 pm" },
  { day: "Sun", time: "11:00 am – 10:00 pm" },
];

export type Diet = "Veg" | "Non-Veg" | "Egg";
export type SpiceLevel = "Mild" | "Medium" | "Spicy";

// diet and spiceLevel are optional because they are only set where the real
// menu states them. Craving Finder filters strictly on these, so an untagged
// dish is intentionally unfilterable rather than guessed into a bucket.
export type Dish = {
  category: string;
  name: string;
  price: string;
  diet?: Diet;
  spiceLevel?: SpiceLevel;
  image?: string;
  alt?: string;
  /**
   * Keeps the dish out of the showcase without deleting it. Set on the dishes
   * with no photograph: an entry with no picture reads as an oversight next to
   * the ones that have one. Delete the flag as soon as a photo lands.
   */
  hidden?: boolean;
};

export const DISH_CATEGORIES = [
  "Dosa",
  "Biryani & More",
  "Tandoori Starters",
  "Vegetarian Curries",
  "Chicken Curries",
  "Indo-Chinese",
  "Goat & Lamb Curry",
] as const;

export function categorySlug(category: string) {
  return category.toLowerCase().replace(/\s+/g, "-");
}

// The full menu per showcase category, in menu order. Every dish the printed
// menu lists appears here, not a curated subset — the carousel renders whatever
// this array holds for the active tab. Price and photo only: diet and spice
// live in the per-section *_MENU arrays below, and duplicating them here is
// what caused those values to drift apart previously. A dish with no photo in
// its category folder simply has no `image`, and the carousel falls back to a
// gradient card rather than borrowing another dish's picture.
export const DISHES: Dish[] = [
  // Dosa
  {
    category: "Dosa",
    name: "Plain Dosa",
    price: "$8.95",
    image: "/images/dishes/plain-dosa.jpg",
    alt: "Folded golden plain dosa on a pale plate beside coconut chutney and sambar",
  },
  {
    category: "Dosa",
    name: "Onion Dosa",
    price: "$10.95",
    image: "/images/dosa_images/Onion_Dosa_2.jpg",
    alt: "Crisp onion dosa topped with onions",
  },
  {
    category: "Dosa",
    name: "Masala Dosa",
    price: "$15.95",
    image: "/images/dishes/masala-dosa.jpg",
    alt: "Crisp masala dosa served with a plate of accompaniments",
  },
  {
    category: "Dosa",
    name: "Paper Dosa",
    price: "$8.95",
    image: "/images/dosa_images/Paper_Dosa_4.jpg",
    alt: "Extra-thin paper dosa rolled tall on the plate",
  },
  {
    category: "Dosa",
    name: "Ghee Plain Dosa",
    price: "$9.95",
    image: "/images/dosa_images/Ghee_Plain_Dosa_5.jpg",
    alt: "Ghee-roasted plain dosa with chutneys and sambar",
  },
  {
    category: "Dosa",
    name: "Ghee Podi Dosa",
    price: "$9.95",
    image: "/images/dosa_images/Ghee_Podi_Dosa_6.jpg",
    alt: "Ghee Podi Dosa at Dosa Hut Aspley",
  },
  {
    category: "Dosa",
    name: "Paneer Dosa",
    price: "$16.95",
    image: "/images/dosa_images/Paneer_Dosa_7.jpg",
    alt: "Paneer dosa filled with spiced cottage cheese",
  },
  {
    category: "Dosa",
    name: "Mysore Masala Dosa",
    price: "$15.95",
    hidden: true,
  },
  {
    category: "Dosa",
    name: "Cheese & Chilli Dosa",
    price: "$15.95",
    image: "/images/dosa_images/Cheese_and_Chilli_Dosa_8.jpg",
    alt: "Cheese and chilli dosa with a melted cheese and green chilli filling",
  },
  {
    category: "Dosa",
    name: "Chicken Dosa",
    price: "$16.95",
    image: "/images/dishes/chicken-dosa.jpg",
    alt: "Chicken Dosa at Dosa Hut Aspley",
  },
  {
    category: "Dosa",
    name: "Chicken 65 Dosa",
    price: "$16.95",
    image: "/images/dosa_images/Chicken_65_Dosa_10.jpg",
    alt: "Chicken 65 Dosa at Dosa Hut Aspley",
  },
  {
    category: "Dosa",
    name: "Lamb Dosa",
    price: "$16.95",
    image: "/images/dosa_images/Lamb_Dosa_11.jpg",
    alt: "Dosa filled with spiced minced lamb",
  },
  {
    category: "Dosa",
    name: "Veg Dosa Chef Special",
    price: "$17.95",
    image: "/images/dosa_images/Vegetable_Dosa_(V)_12.jpg",
    alt: "Dosa filled with a spiced mixed-vegetable masala",
  },
  {
    category: "Dosa",
    name: "Non-Veg Dosa Chef Special",
    price: "$17.95",
    image: "/images/dosa_images/Non_Vegetable_Dosa_13.jpg",
    alt: "Non-Veg Dosa Chef Special at Dosa Hut Aspley",
  },
  {
    category: "Dosa",
    name: "Rava Plain Dosa",
    price: "$15.95",
    image: "/images/dishes/rava-plain-dosa.jpg",
    alt: "Rava Plain Dosa at Dosa Hut Aspley",
  },
  {
    category: "Dosa",
    name: "Rava Onion Dosa",
    price: "$16.95",
    image: "/images/dosa_images/Rava_Onion_Dosa_15.jpg",
    alt: "Lacy rava onion dosa scattered with onion and coriander",
  },
  {
    category: "Dosa",
    name: "Rava Masala Dosa",
    price: "$16.95",
    image: "/images/dosa_images/Rava_Masala_Dosa_16.jpg",
    alt: "Crisp rava masala dosa folded over a potato masala filling",
  },
  {
    category: "Dosa",
    name: "Rava Paneer Dosa",
    price: "$17.95",
    image: "/images/dosa_images/Rava_Paneer_Dosa_17.jpg",
    alt: "Rava Paneer Dosa at Dosa Hut Aspley",
  },
  {
    category: "Dosa",
    name: "Rava Chicken Dosa",
    price: "$18.95",
    hidden: true,
  },
  {
    category: "Dosa",
    name: "Rava Lamb Dosa",
    price: "$18.95",
    image: "/images/dosa_images/Rava_Lamb_Dosa_18.jpg",
    alt: "Rava dosa filled with spiced lamb",
  },
  {
    category: "Dosa",
    name: "Onion Uttapam",
    price: "$16.95",
    image: "/images/dosa_images/Onion_Uttapam_19.jpg",
    alt: "Onion Uttapam at Dosa Hut Aspley",
  },
  {
    category: "Dosa",
    name: "Onion & Chilli Uttapam",
    price: "$16.95",
    image: "/images/dosa_images/Onion_and_Chilli_Uttapam_20.jpg",
    alt: "Onion & Chilli Uttapam at Dosa Hut Aspley",
  },

  // Biryani & More
  {
    category: "Biryani & More",
    name: "Vegetarian Dum Biryani",
    price: "$16.95",
    image: "/images/biryani_images/Vegetarian_Dum_Biryani_(V)_1.jpg",
    alt: "Vegetarian dum biryani with assorted vegetables and basmati rice",
  },
  {
    category: "Biryani & More",
    name: "Gobi 65 Biryani",
    price: "$17.95",
    image: "/images/dishes/gobi-65-biryani.jpg",
    alt: "Gobi 65 Biryani at Dosa Hut Aspley",
  },
  {
    category: "Biryani & More",
    name: "Soya Chaap Tikka Biryani",
    price: "$17.95",
    image: "/images/biryani_images/Soya_Chaap_Tikka_Biryani_(V)_3.jpg",
    alt: "Soya Chaap Tikka Biryani at Dosa Hut Aspley",
  },
  {
    category: "Biryani & More",
    name: "Paneer 65 Biryani",
    price: "$19.95",
    image: "/images/biryani_images/Paneer_65_Biryani_(V)_4.jpg",
    alt: "Paneer 65 Biryani at Dosa Hut Aspley",
  },
  {
    category: "Biryani & More",
    name: "Paneer Tikka Biryani",
    price: "$19.95",
    image: "/images/biryani_images/Paneer_Tikka_Biryani_(V)_5.jpg",
    alt: "Paneer Tikka Biryani at Dosa Hut Aspley",
  },
  {
    category: "Biryani & More",
    name: "Egg Biryani",
    price: "$18.95",
    image: "/images/biryani_images/Egg_Biryani_6.jpg",
    alt: "Egg Biryani at Dosa Hut Aspley",
  },
  {
    category: "Biryani & More",
    name: "Egg 65 Biryani",
    price: "$18.95",
    image: "/images/dishes/egg-65-biryani.jpg",
    alt: "Egg 65 Biryani at Dosa Hut Aspley",
  },
  {
    category: "Biryani & More",
    name: "Chicken Dum Biryani",
    price: "$19.95",
    image: "/images/dishes/chicken-dum-biryani.jpg",
    alt: "Chicken dum biryani with roast drumsticks, served in a hammered copper handi",
  },
  {
    category: "Biryani & More",
    name: "Chicken 65 Biryani",
    price: "$19.95",
    image: "/images/biryani_images/Chicken_65_Biryani_9.jpg",
    alt: "Chicken 65 biryani served in a copper handi with raita and curry on the side",
  },
  {
    category: "Biryani & More",
    name: "Ghee Chicken Roast Biryani",
    price: "$19.95",
    image: "/images/biryani_images/Ghee_Chicken_Roast_Biryani_10.jpg",
    alt: "Ghee Chicken Roast Biryani at Dosa Hut Aspley",
  },
  {
    category: "Biryani & More",
    name: "Chicken Tikka Biryani",
    price: "$19.95",
    image: "/images/biryani_images/Chicken_Tikka_Biryani_11.jpg",
    alt: "Chicken Tikka Biryani at Dosa Hut Aspley",
  },
  {
    category: "Biryani & More",
    name: "Chicken Fry Piece Biryani",
    price: "$19.95",
    image: "/images/biryani_images/Fried_Chicken_Pieces_Biryani_12.jpg",
    alt: "Chicken Fry Piece Biryani at Dosa Hut Aspley",
  },
  {
    category: "Biryani & More",
    name: "Pacchi Mirchi Chicken Biryani",
    price: "$19.95",
    image: "/images/biryani_images/Pacchi_Mirchi_Chicken_Biryani_13.jpg",
    alt: "Pacchi Mirchi Chicken Biryani at Dosa Hut Aspley",
  },
  {
    category: "Biryani & More",
    name: "Prawn Roast Biryani",
    price: "$21.95",
    hidden: true,
  },
  {
    category: "Biryani & More",
    name: "Special Keema Pulao",
    price: "$21.95",
    image: "/images/biryani_images/Special_Keema_Pulao_14.jpg",
    alt: "Special Keema Pulao at Dosa Hut Aspley",
  },

  // Tandoori Starters
  {
    category: "Tandoori Starters",
    name: "Chicken Tikka",
    price: "$18.95",
    image: "/images/dish-chicken-tikka.jpg",
    alt: "Tandoori-grilled chicken tikka skewers with onion, coriander and lemon",
  },
  {
    category: "Tandoori Starters",
    name: "Paneer Tikka",
    price: "$16.95",
    image: "/images/tandoor_starters_images/Paneer_Tikka_1.jpg",
    alt: "Tandoori-grilled paneer tikka skewers",
  },
  {
    category: "Tandoori Starters",
    name: "Tandoori Soya Chaap",
    price: "$16.95",
    image: "/images/tandoor_starters_images/Tandoor_Soya_Chaap_2.jpg",
    alt: "Tandoori Soya Chaap at Dosa Hut Aspley",
  },
  {
    category: "Tandoori Starters",
    name: "Soya Chaap Malai Tikka",
    price: "$16.95",
    image: "/images/tandoor_starters_images/Soya_Chaap_Malai_Tikka_3.jpg",
    alt: "Soya Chaap Malai Tikka at Dosa Hut Aspley",
  },
  {
    category: "Tandoori Starters",
    name: "Chatpata Soya",
    price: "$16.95",
    image: "/images/tandoor_starters_images/Chatpat_Soya_4.jpg",
    alt: "Chatpata Soya at Dosa Hut Aspley",
  },
  {
    category: "Tandoori Starters",
    name: "Murgh Malai Reshmi Tikka",
    price: "$18.95",
    hidden: true,
  },
  {
    category: "Tandoori Starters",
    name: "Tandoori Chicken (Half)",
    price: "$18.95",
    image: "/images/tandoor_starters_images/Tandoor_Chicken_5.jpg",
    alt: "Tandoori roasted chicken pieces with lemon and onion",
  },
  {
    category: "Tandoori Starters",
    name: "Tandoori Chicken (Full)",
    price: "$23.95",
    hidden: true,
  },
  {
    category: "Tandoori Starters",
    name: "Seekh Kebab (Lamb)",
    price: "$19.95",
    image: "/images/dishes/seekh-kebab-lamb.jpg",
    alt: "Seekh Kebab (Lamb) at Dosa Hut Aspley",
  },
  {
    category: "Tandoori Starters",
    name: "Mixed Tandoor Platter",
    price: "$28.95",
    hidden: true,
  },
  {
    category: "Tandoori Starters",
    name: "Lamb Chop",
    price: "$19.95",
    hidden: true,
  },

  // Vegetarian Curries
  {
    category: "Vegetarian Curries",
    name: "Dal Tadka",
    price: "$19.95",
    image: "/images/curry_images/Dal_Tadka_(V)_26.jpg",
    alt: "Dal Tadka at Dosa Hut Aspley",
  },
  {
    category: "Vegetarian Curries",
    name: "Dal Makhani",
    price: "$19.95",
    image: "/images/dishes/dal-makhani.png",
    alt: "Creamy dal makhani made with black lentils and kidney beans",
  },
  {
    category: "Vegetarian Curries",
    name: "Soya Chaap Tikka Masala",
    price: "$18.50",
    image: "/images/curry_images/Soya_Chaap_Tikka_Masala_(V)_28.jpg",
    alt: "Soya Chaap Tikka Masala at Dosa Hut Aspley",
  },
  {
    category: "Vegetarian Curries",
    name: "Paneer Tikka Masala",
    price: "$19.95",
    image: "/images/dishes/paneer-tikka-masala.jpg",
    alt: "Paneer Tikka Masala at Dosa Hut Aspley",
  },
  {
    category: "Vegetarian Curries",
    name: "Paneer Butter Masala",
    price: "$19.95",
    image: "/images/dishes/paneer-butter-masala.jpg",
    alt: "Paneer butter masala in a rich tomato gravy",
  },
  {
    category: "Vegetarian Curries",
    name: "Palak Paneer",
    price: "$19.95",
    image: "/images/dishes/palak-paneer.jpg",
    alt: "Palak paneer with soft paneer cubes in a spiced spinach gravy",
  },
  {
    category: "Vegetarian Curries",
    name: "Paneer Pudina Kali Mirch",
    price: "$19.95",
    image: "/images/dishes/paneer-pudina-kali-mirch.jpg",
    alt: "Paneer Pudina Kali Mirch at Dosa Hut Aspley",
  },
  {
    category: "Vegetarian Curries",
    name: "Kadai Paneer",
    price: "$19.95",
    image: "/images/curry_images/Kadai_Paneer_(V)_33.jpg",
    alt: "Kadai Paneer at Dosa Hut Aspley",
  },
  {
    category: "Vegetarian Curries",
    name: "Veg Kolhapuri",
    price: "$19.95",
    image: "/images/dishes/veg-kolhapuri.png",
    alt: "Veg Kolhapuri at Dosa Hut Aspley",
  },
  {
    category: "Vegetarian Curries",
    name: "Paneer Dhaniya Hara Pyaaz",
    price: "$19.95",
    image: "/images/curry_images/Paneer_Dhaniya_Hara_Pyaaz_(V)_35.jpg",
    alt: "Paneer Dhaniya Hara Pyaaz at Dosa Hut Aspley",
  },
  {
    category: "Vegetarian Curries",
    name: "Veg Korma",
    price: "$19.95",
    image: "/images/curry_images/Vegetable_Korma_36.jpg",
    alt: "Veg Korma at Dosa Hut Aspley",
  },
  {
    category: "Vegetarian Curries",
    name: "Veg Makhani",
    price: "$19.95",
    image: "/images/curry_images/Vegetable_Makhani_37.jpg",
    alt: "Veg Makhani at Dosa Hut Aspley",
  },
  {
    category: "Vegetarian Curries",
    name: "Veg Saag",
    price: "$19.95",
    image: "/images/curry_images/Vegetarian_Saag_38.jpg",
    alt: "Veg Saag at Dosa Hut Aspley",
  },

  // Chicken Curries
  {
    category: "Chicken Curries",
    name: "Butter Chicken",
    price: "$21.95",
    image: "/images/dishes/butter-chicken.png",
    alt: "Creamy butter chicken curry garnished with mint",
  },
  {
    category: "Chicken Curries",
    name: "Punjabi Butter Chicken",
    price: "$21.95",
    // The only photo on hand for this was byte-identical to Butter Chicken's,
    // so the two cards sat side by side showing the same picture. Hidden until
    // there is a photo of the Punjabi version itself.
    hidden: true,
  },
  {
    category: "Chicken Curries",
    name: "Delhi Mughlai Chicken",
    price: "$21.95",
    image: "/images/curry_images/Delhi_Mughlai_Chicken_2.jpg",
    alt: "Delhi Mughlai Chicken at Dosa Hut Aspley",
  },
  {
    category: "Chicken Curries",
    name: "Murgh Pudina Kali Mirch",
    price: "$21.95",
    image: "/images/curry_images/Murgh_Pudina_Kali_Mirch_3.jpg",
    alt: "Murgh Pudina Kali Mirch at Dosa Hut Aspley",
  },
  {
    category: "Chicken Curries",
    name: "Chicken Kolhapuri",
    price: "$21.95",
    image: "/images/curry_images/Chicken_Kolhapuri_4.jpg",
    alt: "Chicken Kolhapuri at Dosa Hut Aspley",
  },
  {
    category: "Chicken Curries",
    name: "Chicken Madras",
    price: "$21.95",
    image: "/images/curry_images/Chicken_Madras_5.jpg",
    alt: "Dark, richly spiced Chicken Madras curry garnished with onion and lemon",
  },
  {
    category: "Chicken Curries",
    name: "Chicken Tikka Masala",
    price: "$21.95",
    image: "/images/dishes/chicken-tikka-masala.jpg",
    alt: "Chicken tikka masala in a creamy tomato gravy",
  },
  {
    category: "Chicken Curries",
    name: "Kadai Chicken",
    price: "$21.95",
    image: "/images/curry_images/Kadai_Chicken_7.jpg",
    alt: "Kadai Chicken at Dosa Hut Aspley",
  },
  {
    category: "Chicken Curries",
    name: "Adarki Rara Chicken",
    price: "$21.95",
    image: "/images/curry_images/Adarki_Rara_Chicken_8.jpg",
    alt: "Adarki Rara Chicken at Dosa Hut Aspley",
  },
  {
    category: "Chicken Curries",
    name: "Chicken Korma",
    price: "$21.95",
    image: "/images/dishes/chicken-korma.jpg",
    alt: "Chicken Korma at Dosa Hut Aspley",
  },
  {
    category: "Chicken Curries",
    name: "Chicken Makhani",
    price: "$21.95",
    // Same story as Punjabi Butter Chicken above: the only photo available was
    // byte-identical to Mango Chicken's. Hidden until there is one of its own.
    hidden: true,
  },
  {
    category: "Chicken Curries",
    name: "Chicken Saag",
    price: "$21.95",
    image: "/images/curry_images/Chicken_Saag_11.jpg",
    alt: "Chicken Saag at Dosa Hut Aspley",
  },
  {
    category: "Chicken Curries",
    name: "Mango Chicken",
    price: "$21.95",
    image: "/images/curry_images/Mango_Chicken_9.jpg",
    alt: "Mango Chicken at Dosa Hut Aspley",
  },

  // Goat & Lamb Curry
  {
    category: "Goat & Lamb Curry",
    name: "Lamb Roganjosh",
    price: "$22.95",
    image: "/images/dishes/lamb-roganjosh.png",
    alt: "Lamb Roganjosh at Dosa Hut Aspley",
  },
  {
    category: "Goat & Lamb Curry",
    name: "Pepper Lamb Masala",
    price: "$22.95",
    image: "/images/curry_images/Pepper_Lamb_Masala_14.jpg",
    alt: "Pepper Lamb Masala at Dosa Hut Aspley",
  },
  {
    category: "Goat & Lamb Curry",
    name: "Lamb Korma",
    price: "$22.95",
    image: "/images/curry_images/Lamb_Korma_15.jpg",
    alt: "Lamb Korma at Dosa Hut Aspley",
  },
  {
    category: "Goat & Lamb Curry",
    name: "Lamb Makhani",
    price: "$22.95",
    image: "/images/curry_images/Lamb_Makhani_16.jpg",
    alt: "Lamb Makhani at Dosa Hut Aspley",
  },
  {
    category: "Goat & Lamb Curry",
    name: "Lamb Saag",
    price: "$22.95",
    image: "/images/curry_images/Lamb_Saag_17.jpg",
    alt: "Lamb Saag at Dosa Hut Aspley",
  },
  {
    category: "Goat & Lamb Curry",
    name: "Goat Curry",
    price: "$23.95",
    image: "/images/dishes/goat-curry.png",
    alt: "Thick, dark, richly spiced goat curry",
  },
  {
    category: "Goat & Lamb Curry",
    name: "Bhuna Goat",
    price: "$23.95",
    image: "/images/curry_images/Bhuna_Goat_20.jpg",
    alt: "Bhuna Goat at Dosa Hut Aspley",
  },
  {
    category: "Goat & Lamb Curry",
    name: "Delhi Mughlai Goat Curry",
    price: "$23.95",
    image: "/images/curry_images/Delhi_Mughlai_Goat_Curry_21.jpg",
    alt: "Delhi Mughlai Goat Curry at Dosa Hut Aspley",
  },
  {
    category: "Goat & Lamb Curry",
    name: "Goat Karahi",
    price: "$23.95",
    image: "/images/curry_images/Goat_Karahi_22.jpg",
    alt: "Goat karahi cooked with tomatoes and green chillies",
  },
  {
    category: "Goat & Lamb Curry",
    name: "Goat Korma",
    price: "$23.95",
    image: "/images/curry_images/Goat_Korma_23.jpg",
    alt: "Goat Korma at Dosa Hut Aspley",
  },
  {
    category: "Goat & Lamb Curry",
    name: "Goat Makhani",
    price: "$23.95",
    image: "/images/curry_images/Goat_Makhani_24.jpg",
    alt: "Goat Makhani at Dosa Hut Aspley",
  },
  {
    category: "Goat & Lamb Curry",
    name: "Goat Saag",
    price: "$23.95",
    image: "/images/curry_images/Goat_Saag_25.jpg",
    alt: "Goat Saag at Dosa Hut Aspley",
  },

  // Indo-Chinese
  {
    category: "Indo-Chinese",
    name: "Vegetarian Manchuria",
    price: "$18.95",
    image: "/images/indo_chinese_images/Vegetarian_Manchuria_(V)_1.jpg",
    alt: "Vegetarian Manchuria at Dosa Hut Aspley",
  },
  {
    category: "Indo-Chinese",
    name: "Gobi Manchuria",
    price: "$18.95",
    image: "/images/indo_chinese_images/Gobi_Manchuria_(V)_2.jpg",
    alt: "Gobi Manchuria at Dosa Hut Aspley",
  },
  {
    category: "Indo-Chinese",
    name: "Gobi 65",
    price: "$18.95",
    image: "/images/indo_chinese_images/Gobi_65_(V)_3.jpg",
    alt: "Crispy fried Gobi 65 cauliflower florets",
  },
  {
    category: "Indo-Chinese",
    name: "Paneer 65",
    price: "$18.95",
    image: "/images/indo_chinese_images/Paneer_65_(V)_4.jpg",
    alt: "Paneer 65 at Dosa Hut Aspley",
  },
  {
    category: "Indo-Chinese",
    name: "Schezwan Paneer",
    price: "$18.95",
    hidden: true,
  },
  {
    category: "Indo-Chinese",
    name: "Chilli Gobi",
    price: "$18.95",
    image: "/images/indo_chinese_images/Chilli_Gobi_(V)_5.jpg",
    alt: "Chilli Gobi at Dosa Hut Aspley",
  },
  {
    category: "Indo-Chinese",
    name: "Chilli Paneer",
    price: "$18.95",
    image: "/images/dishes/chilli-paneer.jpg",
    alt: "Chilli Paneer at Dosa Hut Aspley",
  },
  {
    category: "Indo-Chinese",
    name: "Chilli Idly",
    price: "$18.95",
    image: "/images/indo_chinese_images/Chilli_Idly_(V)_7.jpg",
    alt: "Chilli Idly at Dosa Hut Aspley",
  },
  {
    category: "Indo-Chinese",
    name: "Chicken Manchuria",
    price: "$19.95",
    image: "/images/indo_chinese_images/Chicken_Manchuria_8.jpg",
    alt: "Chicken Manchuria at Dosa Hut Aspley",
  },
  {
    category: "Indo-Chinese",
    name: "Chicken 65",
    price: "$19.95",
    image: "/images/dishes/chicken-65.jpg",
    alt: "Crispy Chicken 65 tossed with curry leaves, garlic and dry chillies",
  },
  {
    category: "Indo-Chinese",
    name: "Chilli Chicken",
    price: "$19.95",
    image: "/images/indo_chinese_images/Chilli_Chicken_10.jpg",
    alt: "Chilli chicken tossed with spring onion, peanuts and green chilli",
  },
  {
    category: "Indo-Chinese",
    name: "Schezwan Chicken",
    price: "$19.95",
    image: "/images/indo_chinese_images/Schezwan_Chicken_11.jpg",
    alt: "Schezwan Chicken at Dosa Hut Aspley",
  },
  {
    category: "Indo-Chinese",
    name: "Ginger Chicken",
    price: "$19.95",
    image: "/images/indo_chinese_images/Ginger_Chicken_12.jpg",
    alt: "Ginger Chicken at Dosa Hut Aspley",
  },
  {
    category: "Indo-Chinese",
    name: "Crispy Goat",
    price: "$20.95",
    image: "/images/indo_chinese_images/Crispy_Goat_13.jpg",
    alt: "Crispy Goat at Dosa Hut Aspley",
  },
  {
    category: "Indo-Chinese",
    name: "Chilli Goat",
    price: "$20.95",
    image: "/images/indo_chinese_images/Chilli_Goat_14.jpg",
    alt: "Chilli Goat at Dosa Hut Aspley",
  },
];

// The full per-section menus used to live here. They now live in lib/menu.ts
// as MENU_ITEMS, which the Craving Finder and search both read — keeping a
// second copy of prices, diet and spice here is what let those values drift
// apart before. DISHES above stays: it is the showcase carousel's own list,
// carrying price and photo only.


export type Stat = {
  value: string;
  label: string;
};

export const STORY_STATS: Stat[] = [
  { value: "25+", label: "Branches Across Australia" },
  { value: "7M+", label: "Customers Served Yearly" },
  { value: "2025", label: "Culinary & Hospitality Award" },
];

export type Feature = {
  title: string;
  description: string;
};

export const FEATURES: Feature[] = [
  {
    title: "100+ Authentic Dishes",
    description: "90+ crisp dosas, rich biryanis, Tandoori grills & street chaats.",
  },
  {
    title: "Prime Location",
    description: "Steps away from Aspley Hypermarket with easy parking.",
  },
  {
    title: "Every Occasion",
    description: "Dine-in, fast takeaways, and custom event catering.",
  },
  {
    title: "Traditional Recipes",
    description: "Fresh local ingredients blended with authentic desi spices.",
  },
];
