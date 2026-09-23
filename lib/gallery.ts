// Photographs for the Photos section on the landing page.
//
// Gallery entries are not dish records. They live apart from MENU_ITEMS and
// DISHES on purpose: adding a picture here never changes which photo a menu
// card shows, and a dish with no verified photo of its own stays hidden on the
// menu whether or not the gallery carries a shot of something similar.
//
// Where a photograph is already served for a menu card, the entry points at
// that same file rather than a second copy of it. Every file was content-hashed
// on import, so no two entries below are the same picture.
//
// `label` is both the caption and the alt text.

export type GalleryPhoto = {
  src: string;
  label: string;
};

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  { src: "/images/gallery/70-mm-dosa.jpg", label: "70 mm Dosa" },
  { src: "/images/gallery/andhra-chicken-curry.jpg", label: "Andhra Chicken Curry" },
  { src: "/images/dishes/butter-chicken.png", label: "Butter Chicken" },
  { src: "/images/dishes/chicken-65.jpg", label: "Chicken 65" },
  { src: "/images/gallery/chicken-chettinad.png", label: "Chicken Chettinad" },
  { src: "/images/dishes/chicken-dosa.jpg", label: "Chicken Dosa" },
  { src: "/images/dishes/chicken-fried-rice.jpg", label: "Chicken Fried Rice" },
  { src: "/images/dishes/chicken-korma.jpg", label: "Chicken Korma" },
  { src: "/images/gallery/chicken-tandoori.jpg", label: "Chicken Tandoori" },
  { src: "/images/dishes/chicken-tikka-masala.jpg", label: "Chicken Tikka Masala" },
  { src: "/images/gallery/chicken-vindaloo.jpg", label: "Chicken Vindaloo" },
  { src: "/images/dishes/chilli-chicken-dry-gravy.jpg", label: "Chilli Chicken (Dry)" },
  { src: "/images/dishes/chilli-paneer.jpg", label: "Chilli Paneer" },
  { src: "/images/gallery/chocolate-dosa.jpg", label: "Chocolate Dosa" },
  { src: "/images/dishes/chole-bhature.jpg", label: "Chole Bhature" },
  { src: "/images/dishes/cut-mirchi.jpg", label: "Cut Mirchi" },
  { src: "/images/dishes/dahi-bhalla.jpg", label: "Dahi Bhalla" },
  { src: "/images/gallery/dahi-papdi.jpg", label: "Dahi Papdi" },
  { src: "/images/dishes/dahi-puri-6-pcs.jpg", label: "Dahi Puri" },
  { src: "/images/dishes/dal-makhani.png", label: "Dal Makhani" },
  { src: "/images/gallery/dosa.jpg", label: "Dosa" },
  { src: "/images/gallery/dosa-2.jpg", label: "Dosa" },
  { src: "/images/gallery/dosa-3.jpg", label: "Dosa" },
  { src: "/images/dishes/egg-65-biryani.jpg", label: "Egg 65 Biryani" },
  { src: "/images/gallery/egg-dosa.jpg", label: "Egg Dosa" },
  { src: "/images/gallery/family-chicken-65-biryani.jpg", label: "Family Chicken 65 Biryani" },
  { src: "/images/dishes/goat-curry.png", label: "Goat Curry" },
  { src: "/images/dishes/gobi-65-biryani.jpg", label: "Gobi 65 Biryani" },
  { src: "/images/gallery/gulab-jamun.jpg", label: "Gulab Jamun" },
  { src: "/images/dishes/chicken-dum-biryani.jpg", label: "Hyderabadi Chicken Dum Biryani" },
  { src: "/images/gallery/jumbo-chicken-65-biryani.jpg", label: "Jumbo Chicken 65 Biryani" },
  { src: "/images/dishes/lamb-roganjosh.png", label: "Lamb Roganjosh" },
  { src: "/images/gallery/malai-kofta.jpg", label: "Malai Kofta" },
  { src: "/images/dishes/masala-dosa.jpg", label: "Masala Dosa" },
  { src: "/images/dishes/mirchi-bhaji-3-pc.jpg", label: "Mirchi Bhaji" },
  { src: "/images/dishes/mixed-noodles.jpg", label: "Mixed Noodles" },
  { src: "/images/gallery/mixed-veg-curry.jpg", label: "Mixed Veg Curry" },
  { src: "/images/gallery/mutton-biryani.jpg", label: "Mutton Biryani" },
  { src: "/images/gallery/naan.jpg", label: "Naan" },
  { src: "/images/gallery/noodles.png", label: "Noodles" },
  { src: "/images/dishes/palak-paneer.jpg", label: "Palak Paneer" },
  { src: "/images/dishes/paneer-butter-masala.jpg", label: "Paneer Butter Masala" },
  { src: "/images/dishes/paneer-pudina-kali-mirch.jpg", label: "Paneer Pudina Kali Mirch" },
  { src: "/images/dishes/paneer-tikka-masala.jpg", label: "Paneer Tikka Masala" },
  { src: "/images/dishes/pani-puri-6-pcs.jpg", label: "Pani Puri" },
  { src: "/images/dishes/papdi-chaat.jpg", label: "Papdi Chaat" },
  { src: "/images/dishes/pav-bhaji.jpg", label: "Pav Bhaji" },
  { src: "/images/gallery/prawn-korma.jpg", label: "Prawn Korma" },
  { src: "/images/gallery/rasmalai.jpg", label: "Rasmalai" },
  { src: "/images/dishes/rava-plain-dosa.jpg", label: "Rava Dosa" },
  { src: "/images/gallery/roti.jpg", label: "Roti" },
  { src: "/images/gallery/saffron-rice.jpg", label: "Saffron Rice" },
  { src: "/images/dishes/seekh-kebab-lamb.jpg", label: "Sheekh Kebab" },
  { src: "/images/gallery/soya-chaap-makhani.jpg", label: "Soya Chaap Makhani" },
  { src: "/images/gallery/stuffed-naan.jpg", label: "Stuffed Naan" },
  { src: "/images/dishes/veg-kolhapuri.png", label: "Veg Kolhapuri" },
];
