// backend/config/permissions.js (FINAL VERSION with Single Delete)

/**
 * @description Master list of all available permissions in the system.
 * This is the single source of truth for what permissions can be assigned.
 * The naming convention `entity_action` (e.g., 'product_view') is used to allow for dynamic grouping on the frontend.
 */
const ALL_PERMISSIONS = [
    // Product Permissions
    'product_view', 'product_create', 'product_edit', 'product_delete', 'product_manage',
    'product_stock_view', 'product_edit_stock',
    // --- Product Logging Actions ---
    'CREATE_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT',

    // Order Permissions
    'order_view', 'order_edit_status', 'order_delete', 'order_manage', 'order_delete_all', 
    // --- Order Logging Actions ---
    'UPDATE_ORDER_STATUS', 'DELETE_ORDER',

    // User Permissions
    'user_view', 'user_create', 'user_edit', 'user_delete', 'user_manage', 
    // --- User & Role Logging Actions ---
    'UPDATE_USER_ROLE', 'DELETE_USER', 'UPDATE_ROLE_PERMISSIONS', 'CREATE_ROLE', 'DELETE_ROLE',

    // Category Permissions
    'category_create', 'category_edit', 'category_delete', 'category_manage', 
    // --- Category Logging Actions ---
    'CREATE_CATEGORY', 'UPDATE_CATEGORY', 'DELETE_CATEGORY',

    // Brand Permissions
    'brand_create', 'brand_delete', 'brand_manage',
    // --- Brand Logging Actions ---
    'CREATE_BRAND', 'UPDATE_BRAND', 'DELETE_BRAND',

    // Campaign Permissions
    'campaign_create', 'campaign_edit', 'campaign_delete', 'campaign_manage',
    // --- Campaign Logging Actions ---
    'CREATE_CAMPAIGN', 'UPDATE_CAMPAIGN', 'DELETE_CAMPAIGN',

    // Coupon Permissions
    'coupon_view', 'coupon_create', 'coupon_edit', 'coupon_delete', 'coupon_manage',
    // --- Coupon Logging Actions ---
    'CREATE_COUPON', 'UPDATE_COUPON', 'DELETE_COUPON',

    // Cart Permissions
    'cart_abandoned_view', 'cart_delete', 'cart_manage', 

    // Media Permissions
    'media_view', 'media_upload', 'media_delete', 'media_manage', 
    // --- Media Logging Action ---
    'DELETE_MEDIA',

    // Review Permissions
    'review_view', 'review_edit', 'review_delete', 'review_manage', 
    // --- Review Logging Actions ---
    'UPDATE_REVIEW_STATUS', 'DELETE_REVIEW',

    // Newsletter Permissions
    'newsletter_view', 'newsletter_delete', 'newsletter_manage',
    // --- Newsletter Logging Action ---
    'NEWSLETTER_DELETE',

    // Contact Message Permissions
    'contact_view', 'contact_update', 'contact_delete', 'contact_manage',

    // Settings & Reports
    'setting_edit', 'setting_manage', 
    'report_view', 'report_manage',
    // --- Settings Logging Action ---
    'UPDATE_SETTINGS',
    
    // Auth Logging Actions
    'LOGIN_SUCCESS', 'LOGIN_FAIL',
    
    // Audit Log Permissions
    'auditlog_view',
    'auditlog_manage',
    'auditlog_delete_entry',
    'AUDITLOG_CLEAR',
    'AUDITLOG_ENTRY_DELETE'
];

/**
 * @description Permissions for the 'admin' role.
 * Admins have all available permissions. This is now dynamically generated.
 */
const ADMIN_PERMISSIONS = [...ALL_PERMISSIONS];

/**
 * @description Permissions for the 'moderator' role.
 * This is now the single place to manage what a moderator can do.
 * You can easily add or remove permissions from this array.
 */
const MODERATOR_PERMISSIONS = [
    'order_view',
    'order_edit_status',
    'product_view',
    'product_edit',
    'review_manage',
    'user_view',
    'category_manage',
    'contact_view'
];

/**
 * @description Permissions for the standard 'user' role.
 * Standard users have no administrative permissions by default.
 */
const USER_PERMISSIONS = [];


module.exports = {
    ALL_PERMISSIONS,
    ADMIN_PERMISSIONS,
    MODERATOR_PERMISSIONS,
    USER_PERMISSIONS
};