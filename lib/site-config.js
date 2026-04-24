// lib/site-config.js
export const siteConfig = {
  name: "Rumah Kain",
  tagline: "Crafted with soul. Worn with love.",
  description:
    "Kami menciptakan pakaian dengan tangan yang terampil dan bahan pilihan terbaik — dibuat untuk wanita yang menghargai kenyamanan, keindahan, dan keunikan.",
  logo: null, // set to URL string when you have a logo
  contact: {
    whatsapp: "628123456789",
    email: "hello@rumahkain.id",
    instagram: "@rumahkain",
  },
  hero: {
    headline: "Ditenun dari Cerita,",
    headlineAccent: "Dipakai dari Hati.",
    subheadline:
      "Koleksi garmen handcrafted dari bahan linen, rayon, dan katun pilihan — potongan yang mengalir bebas, warna yang berbisik lembut.",
    cta: "Lihat Koleksi",
  },
  about: {
    title: "Tentang Kami",
    body: "Rumah Kain lahir dari kecintaan pada kain-kain alami dan potongan yang bebas bergerak. Setiap busana kami dibuat dengan tangan oleh pengrajin lokal berpengalaman, menggunakan bahan seperti linen gauze, rayon voil, dan cotton muslin yang dipilih dengan cermat.",
    highlight: "Setiap jahitan adalah janji.",
  },
};

// ─── FEATURED STYLES ──────────────────────────────────────────────────────────
// In production: fetch from `styles` table (status = 1)
export const featuredStyles = [
  {
    id: 1,
    name: "Bali Whisper Dress",
    description:
      "Gaun mengalir dari rayon voil halus dengan potongan bebas dan lengan flowy.",
    fabric: "Rayon Voil Halus",
    sizes: ["O/S", "S/M", "M/L"],
    badge: "Bestseller",
  },
  {
    id: 2,
    name: "Isla Dress",
    description:
      "Dress minimalis berkarakter dari linen gauze — ringan, adem, dan cantik.",
    fabric: "Linen Gauze",
    sizes: ["XS/S", "S/M", "M/L", "L/XL"],
    badge: "New",
  },
  {
    id: 3,
    name: "Kimono",
    description:
      "Outer serbaguna dengan motif etnik, cocok dipadukan apa saja.",
    fabric: "Ry Linen Slub",
    sizes: ["O/S"],
    badge: null,
  },
  {
    id: 4,
    name: "Culotte",
    description:
      "Celana kulot lapang dari cotton linen — nyaman dari pagi sampai malam.",
    fabric: "Linen Rayon Dobby",
    sizes: ["S/M", "M/L", "L/XL"],
    badge: null,
  },
  {
    id: 5,
    name: "Wrap Top",
    description: "Atasan lilit elegan yang fleksibel mengikuti lekuk tubuh.",
    fabric: "Ry Paros",
    sizes: ["O/S", "S/M", "M/L"],
    badge: "Favorite",
  },
  {
    id: 6,
    name: "Camille Dress",
    description:
      "Dress feminin dengan siluet romatis, cocok untuk hari spesial.",
    fabric: "Cotton Fringe",
    sizes: ["S/M", "M/L"],
    badge: null,
  },
];

// ─── FEATURED FABRICS ─────────────────────────────────────────────────────────
// In production: fetch from `fabrics` table (status = 1)
export const featuredFabrics = [
  {
    id: 1,
    name: "Linen Gauze",
    material: "Linen",
    description: "Ringan seperti angin, sempurna untuk iklim tropis.",
    color: "sand",
  },
  {
    id: 2,
    name: "Rayon Voil Halus",
    material: "Rayon",
    description: "Jatuh lembut di tubuh, berkilau halus di cahaya.",
    color: "rose",
  },
  {
    id: 3,
    name: "Ry Linen Slub",
    material: "Rayon + Linen",
    description: "Tekstur organik yang natural dan penuh karakter.",
    color: "terracotta",
  },
  {
    id: 4,
    name: "Cotton Muslin",
    material: "Cotton",
    description: "Klasik, breathable, dan semakin lembut setiap kali dicuci.",
    color: "blush",
  },
];
