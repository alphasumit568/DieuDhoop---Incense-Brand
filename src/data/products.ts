import sand1 from "../assets/images/sand1.jpeg";
import sand2 from "../assets/images/sand2.jpeg";
import rose1 from "../assets/images/rose1.jpeg";
import rose2 from "../assets/images/rose2.jpeg";
import lav1 from "../assets/images/lav1.jpeg";
import lav2 from "../assets/images/lav2.jpeg";
import or1 from "../assets/images/or1.jpg";
import or2 from "../assets/images/or2.jpg";
import or3 from "../assets/images/or3.jpg";

export const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Heaven's Aroma Rudra",
    description: "The divine fragrance of Rudra, handcrafted to invoke strength and spiritual clarity. Dipped in pure essential oils for a powerful meditation experience. Hand-rolled meditation incense crafted from premium Mysore Sandalwood. This blend offers a deep, woody aroma that grounds the spirit and clears the mind.",
    price: 599,
    discountPrice: 499,
    images: [sand1, or1],
    categories: ["Agarbatti", "dhoop cones"],
    averageRating: 4.9,
    ratingCount: 124,
    stock: 50,
    benefits: ["Promotes grounding", "Enhances concentration", "Vedic purification"],
    tags: ["Meditation", "Handmade", "Natural"],
    specifications: {
      "Burn Time": "45 mins",
      "Sticks": "25 sticks",
      "Length": "8 inches"
    },
    variants: [
      { id: "v1", name: "25 Sticks", price: 599, discountPrice: 499, stock: 50 },
      { id: "v2", name: "50 Sticks", price: 999, discountPrice: 899, stock: 30 },
      { id: "v3", name: "100 Sticks", price: 1799, discountPrice: 1599, stock: 15 }
    ]
  },
  {
    id: "2",
    name: "Premium Sacred Lavender",
    description: "Experience the calming essence of high-altitude lavender. These dhoop battis are perfect for evening rituals, promoting deep relaxation and peaceful sleep. Crafted with natural essential oils and sacred herbs.",
    price: 499,
    discountPrice: null,
    images: [lav1, lav2],
    categories: ["Dhoop batti"],
    averageRating: 4.8,
    ratingCount: 89,
    stock: 40,
    benefits: ["Relaxation", "Stress relief", "Better sleep"],
    tags: ["Calming", "Organic"],
    variants: [
      { id: "v4", name: "100g Pack", price: 499, discountPrice: null, stock: 40 },
      { id: "v5", name: "250g Pack", price: 999, discountPrice: 899, stock: 20 },
      { id: "v6", name: "500g Divine Bulk", price: 1799, discountPrice: 1599, stock: 10 }
    ]
  },
  {
    id: "3",
    name: "December Flower Lotus",
    description: "The pure scent of blooming lotus, captured in a slow-burning incense stick. Symbolic of spiritual awakening and purity, this fragrance lifts the vibration of any space.",
    price: 449,
    discountPrice: 399,
    images: [sand2, or2],
    categories: ["Dhoop batti"],
    averageRating: 4.7,
    ratingCount: 56,
    stock: 0,
    tags: ["Floral", "Divine"],
    variants: [
      { id: "v7", name: "Standard Pack", price: 449, discountPrice: 399, stock: 0 },
      { id: "v8", name: "Refill Bundle", price: 799, discountPrice: 699, stock: 0 }
    ]
  },
  {
    id: "4",
    name: "Vedic Sambrani Blend",
    description: "Deeply traditional sambrani blend featuring fossilized resin and rare balsamic herbs. Used for centuries in temples to clear negative energies and invite auspiciousness.",
    price: 649,
    discountPrice: null,
    images: [rose1, rose2],
    categories: ["dhoop cones"],
    averageRating: 4.7,
    ratingCount: 42,
    stock: 25,
    tags: ["Temple", "Traditional"],
    variants: [
      { id: "v9", name: "12 Cones", price: 649, discountPrice: null, stock: 25 },
      { id: "v10", name: "24 Cones", price: 1199, discountPrice: 999, stock: 15 }
    ]
  }
];
