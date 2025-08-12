// This is the new foundational data model.

// NEW: HIERARCHICAL CATEGORY STRUCTURE
// This is now the single source of truth for category data.
export const categories = {
  "Women": [
    { name: "Lawn Collection", image: "/images/categories/c1.webp" },
    { name: "Stitched Suits", image: "/images/categories/c2.jpeg" },
    { name: "Kurtis", image: "/images/categories/c3.webp" },
    { name: "Formal Wear", image: "/images/categories/c5.jpg" },
    { name: "Bridal Collection", image: "/images/categories/c6.webp" },
    { name: "Winter Collection", image: "/images/categories/c9.webp" },
    { name: "Summer Collection", image: "/images/categories/c10.webp" },
  ],
  "Men": [
    { name: "Men's Shalwar Kameez", image: "/images/categories/c11.webp" },
    { name: "Men's Kurta", image: "/images/categories/c7.jfif" },
    { name: "Waistcoats", image: "/images/categories/c8.jpg" },
    { name: "Formal Wear", image: "/images/categories/m5.jpeg" },
    { name: "Stitched Suits", image: "/images/c10.webp" },
  ],
};

export const products = [
    {
        id: 1,
        name: "Embroidered Lawn Suit",
        category: "Lawn Collection",
        brand: "Khaadi",
        gender: "Women", // Parent Category
        price: 5500,
        rating: 4.5,
        reviewCount: 18,
        image: "/images/d1.jpg",
        description: "A beautifully embroidered 3-piece unstitched lawn suit, perfect for the summer season.",
        stock: 50,
        tags: ['new-collection', 'featured'], // NEW: Tags for dynamic sections
        sizes: ['S', 'M', 'L'], // --- FEATURE ADDED ---
    },
    {
        id: 2,
        name: "Classic Black Shalwar Kameez",
        category: "Men's Shalwar Kameez",
        brand: "J.",
        gender: "Men", // Parent Category
        price: 4200,
        rating: 4.8,
        reviewCount: 25,
        image: "/images/m1.webp",
        description: "Elegant black cotton shalwar kameez for men. Premium fabric with a comfortable fit.",
        stock: 0,
        tags: ['bestseller'],
        sizes: ['S', 'M', 'L', 'XL'], // --- FEATURE ADDED ---
    },
    {
        id: 3,
        name: "Printed Silk Kurti",
        category: "Kurtis",
        brand: "Sapphire",
        gender: "Women", // Parent Category
        price: 2800,
        rating: 4.2,
        reviewCount: 12,
        image: "/images/d2.jpeg",
        description: "A vibrant printed silk kurti that can be paired with trousers or jeans.",
        stock: 120,
        tags: ['new-collection'],
        sizes: ['S', 'M', 'L'], // --- FEATURE ADDED ---
    },
    {
        id: 4,
        name: "Jamawar Waistcoat",
        category: "Waistcoats",
        brand: "Alkaram Studio",
        gender: "Men", // Parent Category
        price: 4000,
        rating: 4.6,
        reviewCount: 20,
        image: "/images/m2.webp",
        description: "A stylish Jamawar waistcoat in a deep maroon color, perfect for weddings.",
        stock: 30,
        tags: ['featured'],
        sizes: ['M', 'L', 'XL'], // --- FEATURE ADDED ---
    },
    {
        id: 5,
        name: "Ready-to-Wear Pishwas",
        category: "Formal Wear",
        brand: "Sana Safinaz",
        gender: "Women", // Parent Category
        price: 9999,
        rating: 4.9,
        reviewCount: 30,
        image: "/images/d3.jpg",
        description: "An exquisite ready-to-wear Anarkali Pishwas with heavy embroidery.",
        stock: 15,
        tags: ['featured', 'top-rated'],
        sizes: ['S', 'M', 'L'], // --- FEATURE ADDED ---
    },
    {
        id: 6,
        name: "Crisp White Kurta",
        category: "Men's Kurta",
        brand: "Gul Ahmed",
        gender: "Men", // Parent Category
        price: 3000,
        rating: 4.7,
        reviewCount: 22,
        image: "/images/m3.webp",
        description: "A classic crisp white cotton kurta for men. Timeless design with a modern fit.",
        stock: 0,
        tags: [],
        sizes: ['S', 'M', 'L', 'XL'], // --- FEATURE ADDED ---
    },
    {
        id: 7,
        name: "Digital Printed Lawn",
        category: "Lawn Collection",
        brand: "Nishat Linen",
        gender: "Women", // Parent Category
        price: 6000,
        rating: 4.4,
        reviewCount: 15,
        image: "/images/w1.webp",
        description: "3-piece unstitched suit with a vibrant digital print and an elegant chiffon dupatta.",
        stock: 80,
        tags: ['new-collection'],
        // --- NO SIZES (Item is unstitched) ---
    },
    {
        id: 8,
        name: "Chikankari Kurti",
        category: "Kurtis",
        brand: "Bonanza Satrangi",
        gender: "Women", // Parent Category
        price: 3500,
        rating: 4.8,
        reviewCount: 28,
        image: "/images/w2.jfif",
        description: "Hand-embroidered Chikankari kurti on soft pastel fabric. A timeless piece of art.",
        stock: 45,
        tags: ['featured'],
        sizes: ['S', 'M', 'L'], // --- FEATURE ADDED ---
    },
    {
        id: 9,
        name: "Heavy Bridal Lehenga",
        category: "Bridal Collection",
        brand: "Sana Safinaz",
        gender: "Women", // Parent Category
        price: 90000,
        rating: 5.0,
        reviewCount: 10,
        image: "/images/d4.jpg",
        description: "A magnificent red bridal lehenga with intricate zardozi work, designed to make your big day special.",
        stock: 5,
        tags: [],
        // --- NO SIZES (Item is specialty/custom) ---
    },
    {
        id: 10,
        name: "Navy Blue Shalwar Kameez",
        category: "Men's Shalwar Kameez",
        brand: "J.",
        gender: "Men", // Parent Category
        price: 4500,
        rating: 4.7,
        reviewCount: 19,
        image: "/images/m4.jfif",
        description: "A sophisticated navy blue suit for men, crafted from premium wash-and-wear fabric.",
        stock: 60,
        tags: ['new-collection'],
        sizes: ['S', 'M', 'L', 'XL'], // --- FEATURE ADDED ---
    },
    {
        id: 11,
        name: "Velvet Shawl Suit",
        category: "Winter Collection",
        brand: "Khaadi",
        gender: "Women", // Parent Category
        price: 11000,
        rating: 4.9,
        reviewCount: 21,
        image: "/images/d5.jpeg",
        description: "Luxurious winter khaddar suit paired with a stunning embroidered velvet shawl.",
        stock: 25,
        tags: [],
        sizes: ['S', 'M', 'L'], // --- FEATURE ADDED ---
    },
    {
        id: 12,
        name: "Men's Brocade Sherwani",
        category: "Formal Wear",
        brand: "Alkaram Studio",
        gender: "Men", // Parent Category
        price: 22000,
        rating: 4.9,
        reviewCount: 14,
        image: "/images/m5.jpeg",
        description: "A regal brocade sherwani for the groom or groomsmen, featuring fine detailing and a majestic silhouette.",
        stock: 10,
        tags: ['featured'],
        sizes: ['M', 'L'], // --- FEATURE ADDED ---
    },
    {
        id: 13,
        name: "Classic Stitched Kameez",
        category: "Stitched Suits",
        brand: "J.",
        gender: "Men", // Parent Category
        price: 4200,
        rating: 4.8,
        reviewCount: 25,
        image: "/images/c10.webp",
        description: "Elegant black cotton shalwar kameez for men. Premium fabric with a comfortable fit for any occasion.",
        stock: 35,
        tags: ['new-collection'],
        sizes: ['S', 'M', 'L', 'XL'], // --- FEATURE ADDED ---
    },
     {
        id: 14,
        name: "Elegant Summer Suit",
        category: "Summer Collection",
        brand: "Gul Ahmed",
        gender: "Women", // Parent Category
        price: 6300,
        rating: 4.8,
        reviewCount: 25,
        image: "/images/w3.jpg",
        description: "Elegant black Summer suit. Premium fabric with a comfortable fit for any occasion.",
        stock: 70,
        tags: ['new-collection', 'featured'],
        sizes: ['S', 'M', 'L'], // --- FEATURE ADDED ---
    }
];