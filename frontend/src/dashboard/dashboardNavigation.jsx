import React from 'react';
import { 
    FiGrid, FiShoppingBag, FiUsers, FiDollarSign, FiTag, FiFileText, FiPackage, FiGift, 
    FiTruck, FiSettings, FiShield, FiUserCheck, FiFolder, FiFolderPlus, FiClock, FiCheckCircle, 
    FiXCircle, FiUploadCloud, FiStar, FiPlusCircle, FiZap, FiCreditCard, FiBarChart2, 
    FiImage, FiEdit3, FiKey, FiInbox, FiMail, FiRefreshCw
} from 'react-icons/fi';
import { FaRegHeart, FaCartArrowDown } from 'react-icons/fa';

export const dashboardNavigation = [
  { name: 'Dashboard', parent: 'Home', path: '/admin', icon: <FiGrid />, keywords: ['dashboard', 'home', 'stats', 'analytics'], permission: 'any' },
  
  { name: 'Transactions', parent: 'Finances', path: '/admin/transactions', icon: <FiDollarSign />, keywords: ['transactions', 'payments', 'earnings', 'revenue'], permission: 'order_view' },

  // Reports Group
  { name: 'Sales & Revenue', parent: 'Reports', path: '/admin/reports', icon: <FiBarChart2 />, keywords: ['reports', 'analytics', 'sales', 'stats'], permission: 'report_view' },
  { name: 'Wishlist Insights', parent: 'Reports', path: '/admin/reports/wishlist', icon: <FaRegHeart />, keywords: ['wishlist', 'popular', 'customer interest'], permission: 'report_view' },
  { name: 'Customer Reports', parent: 'Reports', path: '/admin/reports/customers', icon: <FiUsers />, keywords: ['customers', 'vips', 'top spenders'], permission: 'report_view' },
  
  // Order Management Group
  { name: 'All Orders', parent: 'Manage Orders', path: '/admin/orders/all', icon: <FiFileText />, keywords: ['all orders', 'order list'], permission: 'order_view' },
  { name: 'Pending', parent: 'Manage Orders', path: '/admin/orders/pending', icon: <FiClock />, keywords: ['pending orders'], permission: 'order_view' },
  { name: 'In Progress', parent: 'Manage Orders', path: '/admin/orders/progress', icon: <FiTruck />, keywords: ['in progress', 'shipped orders'], permission: 'order_view' },
  { name: 'Delivered', parent: 'Manage Orders', path: '/admin/orders/delivered', icon: <FiCheckCircle />, keywords: ['delivered orders', 'completed'], permission: 'order_view' },
  { name: 'Canceled', parent: 'Manage Orders', path: '/admin/orders/canceled', icon: <FiXCircle />, keywords: ['canceled orders', 'refunded'], permission: 'order_view' },
  { name: 'Returns', parent: 'Manage Orders', path: '/admin/orders/returns', icon: <FiRefreshCw />, keywords: ['returns', 'rma', 'refunds', 'exchanges'], permission: 'order_view' },

  // Product Management Group
  { name: 'All Products', parent: 'Products', path: '/admin/products/all', icon: <FiFileText />, keywords: ['all products', 'product list', 'inventory'], permission: 'product_view' },
  { name: 'Add Product', parent: 'Products', path: '/admin/products/add', icon: <FiPlusCircle />, keywords: ['add product', 'new product', 'create product'], permission: 'product_create' },
  { name: 'Categories', parent: 'Products', path: '/admin/categories', icon: <FiTag />, keywords: ['categories', 'taxonomy'], permission: 'category_manage' },
  { name: 'Brands', parent: 'Products', path: '/admin/products/brands', icon: <FiTag />, keywords: ['brands', 'manufacturers'], permission: 'brand_manage' },
  { name: 'Product Reviews', parent: 'Products', path: '/admin/reviews', icon: <FiStar />, keywords: ['reviews', 'ratings', 'customer feedback'], permission: 'review_view' },
  { name: 'Stock Out', parent: 'Products', path: '/admin/products/stock-out', icon: <FiXCircle />, keywords: ['stock out', 'out of stock', 'inventory'], permission: 'product_stock_view' },
  { name: 'CSV Manager', parent: 'Products', path: '/admin/products/csv', icon: <FiUploadCloud />, keywords: ['csv manager', 'import', 'export', 'bulk upload'], permission: 'product_manage' },

  // Marketing Group
  { name: 'Campaigns', parent: 'Marketing Tools', path: '/admin/offers/campaigns', icon: <FiZap />, keywords: ['campaigns', 'sales', 'offers'], permission: 'campaign_manage' },
  { name: 'Coupons', parent: 'Marketing Tools', path: '/admin/ecommerce/coupons', icon: <FiGift />, keywords: ['coupons', 'discounts', 'promo codes'], permission: 'coupon_manage' },
  { name: 'Abandoned Carts', parent: 'Marketing Tools', path: '/admin/marketing/abandoned-carts', icon: <FaCartArrowDown />, keywords: ['abandoned carts', 'cart recovery'], permission: 'cart_abandoned_view' },
  { name: 'Subscribers', parent: 'Marketing Tools', path: '/admin/marketing/newsletter', icon: <FiMail />, keywords: ['newsletter', 'subscribers', 'email list'], permission: 'newsletter_view' },
  
  // User Management Group
  { name: 'Staff Management', parent: 'User Management', path: '/admin/users', icon: <FiShield />, keywords: ['staff', 'users', 'admin', 'moderator', 'permissions'], permission: 'user_manage' },
  { name: 'Role Management', parent: 'User Management', path: '/admin/roles', icon: <FiKey />, keywords: ['roles', 'permissions', 'access control'], permission: 'user_manage' },
  { name: 'Customers', parent: 'User Management', path: '/admin/customers', icon: <FiUserCheck />, keywords: ['customers', 'clients'], permission: 'user_view' },

  // Content Management Group
  { name: 'Content Manager', parent: 'Web Contents', path: '/admin/cms/content', icon: <FiEdit3 />, keywords: ['cms', 'content', 'pages', 'about', 'contact', 'web'], permission: 'setting_manage' },
  { name: 'Customer Inbox', parent: 'Web Contents', path: '/admin/inbox', icon: <FiInbox />, keywords: ['inbox', 'messages', 'contact'], permission: 'contact_view' },
  { name: 'File Manager', parent: 'Web Contents', path: '/admin/media', icon: <FiImage />, keywords: ['file manager', 'media', 'images', 'uploads', 'web'], permission: 'media_view' },
  
  // Configuration Group
  { name: 'Store Settings', parent: 'Configuration', path: '/admin/ecommerce/settings', icon: <FiSettings />, keywords: ['store settings', 'new product duration'], permission: 'setting_manage' },
  { name: 'Shipping', parent: 'Configuration', path: '/admin/ecommerce/shipping', icon: <FiTruck />, keywords: ['shipping', 'delivery zones', 'rates'], permission: 'setting_manage' },
  { name: 'Payment Gateways', parent: 'Configuration', path: '/admin/ecommerce/payment', icon: <FiCreditCard />, keywords: ['payment gateways', 'cod', 'credit card'], permission: 'setting_manage' },
  { name: 'Tax & Currency', parent: 'Configuration', path: '/admin/ecommerce/tax', icon: <FiDollarSign />, keywords: ['tax', 'currency', 'gst', 'pkr'], permission: 'setting_manage' },
  // <<<--- THIS IS THE NEW LINE WE ADDED ---<<<
  { name: 'Audit Log', parent: 'Configuration', path: '/admin/audit-log', icon: <FiShield />, keywords: ['audit', 'log', 'activity', 'tracking', 'security'], permission: 'auditlog_view' },
];

// This function is unchanged and correct
export const groupNavItems = (items) => {
    const grouped = items.reduce((acc, item) => {
        const parent = item.parent;
        if (!acc[parent]) {
            acc[parent] = {
                icon: undefined,
                items: []
            };
        }
        acc[parent].items.push(item);
        return acc;
    }, {});
    
    Object.keys(grouped).forEach(parentName => {
        if (!grouped[parentName].icon) {
            const parentIcons = {
                'Home': <FiGrid />,
                'Finances': <FiDollarSign />,
                'Reports': <FiBarChart2 />,
                'Manage Orders': <FiShoppingBag />,
                'Products': <FiPackage />,
                'Marketing Tools': <FiGift />,
                'User Management': <FiUsers />,
                'Web Contents': <FiFileText />,
                'Configuration': <FiSettings />,
            };
            grouped[parentName].icon = parentIcons[parentName] || <FiFolder />;
        }
    });

    return grouped;
};