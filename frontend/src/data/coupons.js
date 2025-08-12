// F:\React projects\e-fashion\src\data\coupons.js

export const coupons = [
    {
        id: 'coupon_1', // Using string IDs is generally safer
        code: 'SITEWIDE15',
        type: 'Percentage',
        value: 15,
        status: 'Active',
        scope: {
            type: 'all',
            target: []
        },
        display: 'popup', // <--- This will be a popup
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2029-12-31T23:59:59Z'
    },
    {
        id: 'coupon_2',
        code: 'KURTISPECIAL',
        type: 'Fixed',
        value: 750,
        status: 'Active',
        scope: {
            type: 'category',
            target: ['Kurtis']
        },
        display: 'standard', // <--- This is a standard coupon
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2029-12-31T23:59:59Z'
    },
    {
        id: 'coupon_3',
        code: 'BRIDALFEST',
        type: 'Percentage',
        value: 10,
        status: 'Active',
        scope: {
            type: 'product',
            target: [9]
        },
        display: 'popup', // <--- This will also be a popup
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2029-12-31T23:59:59Z'
    },
    {
        id: 'coupon_4',
        code: 'EXPIREDCODE',
        type: 'Percentage',
        value: 50,
        status: 'Active',
        scope: {
            type: 'all',
            target: []
        },
        display: 'standard',
        startDate: '2023-01-01T00:00:00Z',
        endDate: '2023-12-31T23:59:59Z' // This coupon is expired by date
    }
];