// This file simulates your future 'Discounts' or 'Campaigns' database table.
// An admin panel would allow you to create/edit these objects.
// This is the single source of truth for all sales and offers.

export const campaigns = [
  {
    id: 'campaign001',
    name: "Summer Lawn Sale",
    isActive: true, // Set to 'false' to disable this campaign
    // This campaign applies a percentage-based discount.
    discount: {
      type: 'percentage',
      value: 18 // e.g., 18% OFF
    },
    // This discount applies ONLY to products in the 'Lawn Collection' category.
    scope: {
      type: 'category',
      target: ['Lawn Collection']
    },
    // You can optionally set start and end dates for campaigns.
    startDate: '2023-01-01T00:00:00Z',
    endDate: '2029-12-31T23:59:59Z',
  },
  {
    id: 'campaign002',
    name: "Bridal Season Offer",
    isActive: true,
    // This campaign applies a fixed amount discount.
    discount: {
      type: 'fixed',
      value: 15000 // e.g., Rs 15,000 OFF
    },
    // This discount applies ONLY to the specific product with ID 9.
    scope: {
      type: 'product',
      target: [9] // Target is an array of product IDs
    },
    startDate: '2023-01-01T00:00:00Z',
    endDate: '2029-12-31T23:59:59Z',
  },
  {
    id: 'campaign003',
    name: "Waistcoat Wednesday",
    isActive: true,
    discount: {
      type: 'percentage',
      value: 13
    },
    // This discount applies ONLY to products in the 'Waistcoats' category.
    scope: {
      type: 'category',
      target: ['Waistcoats']
    },
    startDate: '2023-01-01T00:00:00Z',
    endDate: '2029-12-31T23:59:59Z',
  },
    {
    id: 'campaign004',
    name: "Formal Wear Flash Deal",
    isActive: true,
    discount: {
      type: 'fixed',
      value: 4000
    },
    // This discount applies to multiple items (products with ID 5 and 12).
    scope: {
      type: 'product',
      target: [5, 12]
    },
    startDate: '2023-01-01T00:00:00Z',
    endDate: '2029-12-31T23:59:59Z',
  },
];