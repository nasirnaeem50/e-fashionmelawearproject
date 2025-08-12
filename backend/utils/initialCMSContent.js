// This is the complete, correct initial content object for your CMS.
// It serves as the default template for your site's content.

const initialContent = {
  hero: {
    mainBanners: [
      {
        headline: "Satin Elegance",
        subheadline: "New Collection",
        buttonText: "Shop Now",
        link: "/shop",
        imageUrl: "/images/banner3.jpg",
      },
    ],
    sideBanners: [
      {
        title: "Trending Now",
        subtitle: "Women's Summer Edit",
        linkLabel: "Discover More",
        // ✅ CORRECTED: Using parent category for consistent linking
        link: "/shop?parent=Women's+Fashion",
        imageUrl: "/images/w1.webp",
      },
      {
        title: "For Him",
        subtitle: "Men's Formal Collection",
        linkLabel: "Shop The Look",
        // ✅ CORRECTED: Using parent category for consistent linking
        link: "/shop?parent=Men's+Fashion",
        imageUrl: "/images/m1.webp",
      },
      {
        title: "Special Offer",
        subtitle: "Get 30% Off Formal Wear",
        linkLabel: "Shop The Sale",
        // ✅ CORRECTED: Using parent category for consistent linking
        link: "/shop?parent=Women's+Fashion",
        imageUrl: "/images/w2.webp",
      },
    ],
  },
  header: {
    logoUrl: "/images/logop.png",
    navigation: [
      { name: "Home", path: "/" },
      { name: "About Us", path: "/about" },
      { name: "Shop", path: "/shop" },
      { name: "Contact Us", path: "/contact" },
    ],
  },
  // ✅ ADDED: Missing categorySpotlight section to prevent crashes.
  categorySpotlight: {
    title: "Shop by Category",
    subtitle: "Explore our most popular collections for every occasion.",
    items: [
      {
        title: "Women's Fashion",
        link: "/shop?parent=Women's+Fashion",
        imageUrl: "/images/category-women.jpg",
      },
      {
        title: "Men's Fashion",
        link: "/shop?parent=Men's+Fashion",
        imageUrl: "/images/category-men.jpg",
      },
      {
        title: "Kids Collection",
        link: "/shop?parent=Kids+Collection",
        imageUrl: "/images/category-kids.jpg",
      },
    ],
  },
  specialOffer: {
    defaultTitle: "Always in Style",
    defaultHeadline: "Explore Our Collections",
    defaultSubheadline:
      "Discover timeless designs and the latest trends. Find your new favorite style today.",
    defaultButtonText: "Browse the Shop",
    backgroundBanners: [
      { imageUrl: "/images/banner2.webp" },
      { imageUrl: "/images/banner3.jpg" },
      { imageUrl: "/images/banner4.jpg" },
    ],
  },
  about: {
    heroHeadline: "About Fashion Mela",
    heroSubheadline:
      "Weaving the Threads of Pakistani Heritage into Modern Wardrobes",
    heroImageUrl:
      "https://images.unsplash.com/photo-1598895698885-cce7d115e81e?q=80&w=1973&auto=format&fit=crop",
    storyTitle: "Our Story",
    storyContent:
      "Founded in 2025, Fashion Mela was born from a desire to bring the vibrant, intricate, and timeless beauty of Pakistani attire to a global audience. We started as a small boutique in Peshawar, passionate about preserving traditional craftsmanship while embracing contemporary styles. Today, we are a leading online destination for authentic Pakistani fashion, offering a curated collection that celebrates our rich cultural heritage.",
    storyImageUrl: "/images/banner.avif",
    featuresHeadline: "What We Stand For",
    features: [
      {
        icon: "FaTshirt",
        title: "Authentic Craftsmanship",
        text: "We partner with local artisans to bring you genuine, handcrafted pieces that tell a story of tradition and skill.",
      },
      {
        icon: "FaGem",
        title: "Uncompromising Quality",
        text: "From the finest fabrics to the most intricate details, every item in our collection is vetted for superior quality.",
      },
      {
        icon: "FaHeart",
        title: "Customer Delight",
        text: "Your satisfaction is our priority. We are dedicated to providing exceptional service and a seamless shopping experience.",
      },
    ],
    teamHeadline: "Meet Our Team",
    teamMembers: [
      {
        name: "Ayesha Khan",
        role: "Founder & CEO",
        imageUrl:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop",
      },
      {
        name: "Bilal Ahmed",
        role: "Head of Design",
        imageUrl:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
      },
      {
        name: "Fatima Ali",
        role: "Marketing Director",
        imageUrl:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop",
      },
      {
        name: "Usman Sharif",
        role: "Operations Manager",
        imageUrl:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop",
      },
    ],
    ctaHeadline: "Discover Our Collection",
    ctaSubheadline:
      "Ready to experience the beauty of Pakistani fashion? Explore our latest arrivals and find your perfect outfit today.",
    ctaButtonText: "Shop Now",
    ctaButtonLink: "/shop",
  },
  contact: {
    address: "KP IT Park, Training Centre Board\nPeshawar, Pakistan",
    phone: "0341 9169022",
    email: "info@fashionmelawear.com",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.747971033069!2d71.56840561521366!3d34.00223798062086!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d91737e2be1a3b%3A0x6a2d216f2d2b5e2d!2sPeshawar%2C%20Khyber%20Pakhtunkhwa%2C%20Pakistan!5e0!3m2!1sen!2s!4v1678886543210!5m2!1sen!2s",
  },
  footer: {
    copyrightText: "Copyright © 2024 Fashion Mela Wear. All Rights Reserved.",
    paymentMethodIcons: [
        { altText: "Payment Methods", iconUrl: "/images/payment-methods.png" }
    ],
    socialLinks: [
        { platform: "Facebook", url: "https://facebook.com" },
        { platform: "Twitter", url: "https://twitter.com" },
        { platform: "Instagram", url: "https://instagram.com" },
        { platform: "Pinterest", url: "https://pinterest.com" }
    ]
  }
};

module.exports = initialContent;