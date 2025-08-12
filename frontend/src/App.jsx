// frontend/src/App.jsx

import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ErrorBoundary from "./components/shared/ErrorBoundary.jsx";

// --- Context Providers ---
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { OrderProvider } from "./context/OrderContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { ProductListsProvider } from "./context/ProductListsContext.jsx";
import { ShopProvider } from "./context/ShopContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { CMSProvider } from "./context/CMSContext.jsx";
import { MediaProvider } from "./context/MediaContext.jsx";
import { SettingsProvider, useSettings } from "./context/SettingsContext.jsx";

// --- Components and Utilities ---
import Header from "./components/common/Header.jsx";
import Footer from "./components/common/Footer.jsx";
import ScrollToTop from "./utils/ScrollToTop.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import AdminRoute from "./routes/AdminRoute.jsx";
import CouponPopupManager from "./components/common/CouponPopupManager.jsx";
import { FaSpinner } from "react-icons/fa";

// --- LAZY-LOADED PAGES ---
// Core Public Pages
const Home = lazy(() => import("./pages/Home.jsx"));
const Shop = lazy(() => import("./pages/Shop.jsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.jsx"));
const Cart = lazy(() => import("./pages/Cart.jsx"));
const Checkout = lazy(() => import("./pages/Checkout.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const PaymentStatus = lazy(() => import("./pages/PaymentStatus.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const OffersPage = lazy(() => import("./pages/OffersPage.jsx"));
const MaintenancePage = lazy(() => import("./pages/MaintenancePage.jsx"));

// Auth Pages
const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.jsx"));

// Policy & Info Pages
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy.jsx"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions.jsx"));
const MoneyBackGuarantee = lazy(() => import("./pages/MoneyBackGuarantee.jsx"));
const ProductReturns = lazy(() => import("./pages/ProductReturns.jsx"));
const Careers = lazy(() => import("./pages/Careers.jsx"));

// Profile Pages
const Profile = lazy(() => import("./pages/Profile.jsx"));
const OrderDetail = lazy(() => import("./pages/OrderDetail.jsx"));
const Wishlist = lazy(() => import("./components/profile/Wishlist.jsx"));
const Compare = lazy(() => import("./components/profile/Compare.jsx"));
const AllOrders = lazy(() => import("./pages/profile/AllOrders.jsx"));
const ProfileSettings = lazy(() =>
  import("./pages/settings/ProfileSettings.jsx")
);

// --- Admin Dashboard Pages ---
const AdminLayout = lazy(() => import("./dashboard/AdminLayout.jsx"));
const AdminDashboard = lazy(() => import("./dashboard/AdminDashboard.jsx"));
const UserManagement = lazy(() =>
  import("./dashboard/pages/UserManagement.jsx")
);
const Customers = lazy(() => import("./dashboard/pages/Customers.jsx"));
const OrdersList = lazy(() => import("./dashboard/pages/OrdersList.jsx"));
const Transactions = lazy(() => import("./dashboard/pages/Transactions.jsx"));
const AdminOrderDetail = lazy(() =>
  import("./dashboard/pages/orders/AdminOrderDetail.jsx")
);
const ReturnsManagement = lazy(() =>
  import("./dashboard/pages/orders/ReturnsManagement.jsx")
);
const Categories = lazy(() =>
  import("./dashboard/pages/categories/Categories.jsx")
);
const SubCategories = lazy(() =>
  import("./dashboard/pages/categories/SubCategories.jsx")
);
const ChildCategories = lazy(() =>
  import("./dashboard/pages/categories/ChildCategories.jsx")
);
const SetCoupons = lazy(() =>
  import("./dashboard/pages/ecommerce/SetCoupons.jsx")
);
const Shipping = lazy(() => import("./dashboard/pages/ecommerce/Shipping.jsx"));
const ProductsList = lazy(() =>
  import("./dashboard/pages/products/ProductsList.jsx")
);
const AddProduct = lazy(() =>
  import("./dashboard/pages/products/AddProduct.jsx")
);
const StockOutProducts = lazy(() =>
  import("./dashboard/pages/products/StockOutProducts.jsx")
);
const ProductReviews = lazy(() =>
  import("./dashboard/pages/products/ProductReviews.jsx")
);
const EditProduct = lazy(() =>
  import("./dashboard/pages/products/EditProduct.jsx")
);
const CampaignList = lazy(() =>
  import("./dashboard/pages/campaign/CampaignList.jsx")
);
const AddCampaign = lazy(() =>
  import("./dashboard/pages/campaign/AddCampaign.jsx")
);
const EditCampaign = lazy(() =>
  import("./dashboard/pages/campaign/EditCampaign.jsx")
);
const Reports = lazy(() => import("./dashboard/pages/reports/Reports.jsx"));
const ManageContent = lazy(() =>
  import("./dashboard/pages/cms/ManageContent.jsx")
);
const CustomerReports = lazy(() =>
  import("./dashboard/pages/reports/CustomerReports.jsx")
);
const FileManager = lazy(() =>
  import("./dashboard/pages/media/FileManager.jsx")
);
const RoleManagement = lazy(() =>
  import("./dashboard/pages/RoleManagement.jsx")
);
const AbandonedCarts = lazy(() =>
  import("./dashboard/pages/marketing/AbandonedCarts.jsx")
);
const Inbox = lazy(() => import("./dashboard/pages/Inbox.jsx"));
const BrandsList = lazy(() =>
  import("./dashboard/pages/products/BrandsList.jsx")
);
const CSVManager = lazy(() =>
  import("./dashboard/pages/products/CSVManager.jsx")
);
const WishlistReport = lazy(() =>
  import("./dashboard/pages/reports/WishlistReport.jsx")
);
const SearchResults = lazy(() =>
  import("./dashboard/pages/search/SearchResults.jsx")
);
const StoreSettings = lazy(() =>
  import("./dashboard/pages/ecommerce/StoreSettings.jsx")
);
const Payment = lazy(() => import("./dashboard/pages/ecommerce/Payment.jsx"));
const Tax = lazy(() => import("./dashboard/pages/ecommerce/Tax.jsx"));
const NewsletterList = lazy(() =>
  import("./dashboard/pages/marketing/NewsletterList.jsx")
);
// <<<--- THIS IS THE FIRST ADDED LINE ---<<<
const AuditLog = lazy(() => import("./dashboard/pages/AuditLog.jsx"));

// --- Layouts and Loading Components ---
const MainLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow">
      <AnimatePresence mode="wait">
        <Outlet />
      </AnimatePresence>
    </main>
    <Footer />
  </div>
);
const AuthLayout = () => (
  <div className="flex flex-col min-h-screen">
    <main className="flex-grow">
      <AnimatePresence mode="wait">
        <Outlet />
      </AnimatePresence>
    </main>
  </div>
);

const SuspenseLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm z-[998]">
    <FaSpinner className="animate-spin text-red-500 text-3xl" />
  </div>
);

const AppContent = () => {
  const { settings, loading: settingsLoading } = useSettings();
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();

  if (settingsLoading || authLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[999]">
        <FaSpinner className="animate-spin text-red-500 text-4xl" />
        <p className="mt-4 text-lg text-gray-600">Loading Store...</p>
      </div>
    );
  }

  const isMaintenance =
    settings?.maintenanceMode && user?.role?.name !== "admin";

  if (isMaintenance) {
    return <MaintenancePage />;
  }

  return (
    <>
      <CouponPopupManager />
      <ScrollToTop />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <AnimatePresence mode="wait">
        <Suspense fallback={<SuspenseLoader />}>
          <Routes location={location} key={location.pathname}>
            {/* --- Public & Profile Routes --- */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route
                path="/terms-and-conditions"
                element={<TermsAndConditions />}
              />
              <Route path="/careers" element={<Careers />} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment-status"
                element={
                  <ProtectedRoute>
                    <PaymentStatus />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/money-back-guarantee"
                element={<MoneyBackGuarantee />}
              />
              <Route path="/product-returns" element={<ProductReturns />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="orders" replace />} />
                <Route path="orders" element={<AllOrders />} />
                <Route path="wishlist" element={<Wishlist />} />
                <Route path="compare" element={<Compare />} />
                <Route path="settings" element={<ProfileSettings />} />
              </Route>
              <Route
                path="/profile/orders/:orderId"
                element={
                  <ProtectedRoute>
                    <OrderDetail />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/reset-password/:resettoken"
                element={<ResetPassword />}
              />
            </Route>

            {/* --- Admin Routes --- */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route
                path="search"
                element={
                  <AdminRoute>
                    <SearchResults />
                  </AdminRoute>
                }
              />
              <Route
                index
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              {/* Finances */}
              <Route
                path="transactions"
                element={
                  <AdminRoute permission="order_view">
                    <Transactions />
                  </AdminRoute>
                }
              />

              {/* Reports */}
              <Route
                path="reports"
                element={
                  <AdminRoute permission="report_view">
                    <Reports />
                  </AdminRoute>
                }
              />
              <Route
                path="reports/wishlist"
                element={
                  <AdminRoute permission="report_view">
                    <WishlistReport />
                  </AdminRoute>
                }
              />
              <Route
                path="reports/customers"
                element={
                  <AdminRoute permission="report_view">
                    <CustomerReports />
                  </AdminRoute>
                }
              />

              {/* Products */}
              <Route
                path="products/all"
                element={
                  <AdminRoute permission="product_view">
                    <ProductsList />
                  </AdminRoute>
                }
              />
              <Route
                path="products/add"
                element={
                  <AdminRoute permission="product_create">
                    <AddProduct />
                  </AdminRoute>
                }
              />
              <Route
                path="products/edit/:id"
                element={
                  <AdminRoute permission="product_edit">
                    <EditProduct />
                  </AdminRoute>
                }
              />
              <Route
                path="products/stock-out"
                element={
                  <AdminRoute permission="product_stock_view">
                    <StockOutProducts />
                  </AdminRoute>
                }
              />
              <Route
                path="products/brands"
                element={
                  <AdminRoute permission="brand_manage">
                    <BrandsList />
                  </AdminRoute>
                }
              />
              <Route
                path="products/csv"
                element={
                  <AdminRoute permission="product_manage">
                    <CSVManager />
                  </AdminRoute>
                }
              />
              <Route
                path="reviews"
                element={
                  <AdminRoute permission="review_view">
                    <ProductReviews />
                  </AdminRoute>
                }
              />
              <Route
                path="categories"
                element={
                  <AdminRoute permission="category_manage">
                    <Categories />
                  </AdminRoute>
                }
              />
              <Route
                path="categories/sub"
                element={
                  <AdminRoute permission="category_manage">
                    <SubCategories />
                  </AdminRoute>
                }
              />
              <Route
                path="categories/child"
                element={
                  <AdminRoute permission="category_manage">
                    <ChildCategories />
                  </AdminRoute>
                }
              />

              {/* Orders */}
              <Route
                path="orders/returns"
                element={
                  <AdminRoute permission="order_view">
                    <ReturnsManagement />
                  </AdminRoute>
                }
              />
              <Route
                path="orders/:status"
                element={
                  <AdminRoute permission="order_view">
                    <OrdersList />
                  </AdminRoute>
                }
              />
              <Route
                path="orders/details/:orderId"
                element={
                  <AdminRoute permission="order_view">
                    <AdminOrderDetail />
                  </AdminRoute>
                }
              />

              {/* Users & Roles */}
              <Route
                path="users"
                element={
                  <AdminRoute permission="user_manage">
                    <UserManagement />
                  </AdminRoute>
                }
              />
              <Route
                path="roles"
                element={
                  <AdminRoute permission="user_manage">
                    <RoleManagement />
                  </AdminRoute>
                }
              />
              <Route
                path="customers"
                element={
                  <AdminRoute permission="user_view">
                    <Customers />
                  </AdminRoute>
                }
              />

              {/* Marketing */}
              <Route
                path="offers/campaigns"
                element={
                  <AdminRoute permission="campaign_manage">
                    <CampaignList />
                  </AdminRoute>
                }
              />
              <Route
                path="campaigns/add"
                element={
                  <AdminRoute permission="campaign_create">
                    <AddCampaign />
                  </AdminRoute>
                }
              />
              <Route
                path="campaigns/edit/:campaignId"
                element={
                  <AdminRoute permission="campaign_edit">
                    <EditCampaign />
                  </AdminRoute>
                }
              />
              <Route
                path="ecommerce/coupons"
                element={
                  <AdminRoute permission="coupon_manage">
                    <SetCoupons />
                  </AdminRoute>
                }
              />
              <Route
                path="marketing/abandoned-carts"
                element={
                  <AdminRoute permission="cart_abandoned_view">
                    <AbandonedCarts />
                  </AdminRoute>
                }
              />
              <Route
                path="marketing/newsletter"
                element={
                  <AdminRoute permission="newsletter_view">
                    <NewsletterList />
                  </AdminRoute>
                }
              />

              {/* Web Content */}
              <Route
                path="inbox"
                element={
                  <AdminRoute permission="contact_view">
                    <Inbox />
                  </AdminRoute>
                }
              />
              <Route
                path="cms/content"
                element={
                  <AdminRoute permission="setting_manage">
                    <ManageContent />
                  </AdminRoute>
                }
              />
              <Route
                path="media"
                element={
                  <AdminRoute permission="media_view">
                    <FileManager />
                  </AdminRoute>
                }
              />

              {/* Configuration */}
              <Route
                path="ecommerce/settings"
                element={
                  <AdminRoute permission="setting_manage">
                    <StoreSettings />
                  </AdminRoute>
                }
              />
              <Route
                path="ecommerce/shipping"
                element={
                  <AdminRoute permission="setting_manage">
                    <Shipping />
                  </AdminRoute>
                }
              />
              <Route
                path="ecommerce/payment"
                element={
                  <AdminRoute permission="setting_manage">
                    <Payment />
                  </AdminRoute>
                }
              />
              <Route
                path="ecommerce/tax"
                element={
                  <AdminRoute permission="setting_manage">
                    <Tax />
                  </AdminRoute>
                }
              />
              {/* <<<--- THIS IS THE SECOND ADDED BLOCK ---<<< */}
              <Route
                path="audit-log"
                element={
                  <AdminRoute permission="auditlog_view">
                    <AuditLog />
                  </AdminRoute>
                }
              />
            </Route>

            {/* --- 404 Route --- */}
            <Route
              path="*"
              element={
                <MainLayout>
                  <NotFound />
                </MainLayout>
              }
            />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <SettingsProvider>
              <ShopProvider>
                <OrderProvider>
                  <ProductListsProvider>
                    <CartProvider>
                      <CMSProvider>
                        <MediaProvider>
                          <AppContent />
                        </MediaProvider>
                      </CMSProvider>
                    </CartProvider>
                  </ProductListsProvider>
                </OrderProvider>
              </ShopProvider>
            </SettingsProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;