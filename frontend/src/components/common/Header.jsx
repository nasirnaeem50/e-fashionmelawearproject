import React, { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch, FiHeart, FiShoppingCart, FiMenu, FiX, FiChevronDown, FiChevronRight,
  FiUser, FiSun, FiMoon, FiLogOut, FiGrid,
} from "react-icons/fi";
import { FaBalanceScale, FaBolt, FaTag } from "react-icons/fa";
import { toast } from "react-toastify";
import { CartContext } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useProductLists } from "../../context/ProductListsContext";
import { useTheme } from "../../context/ThemeContext";
import { useShop } from "../../context/ShopContext";
import { useCMS } from "../../context/CMSContext";

const Header = () => {
  const { getCartItemCount, getCartTotal } = useContext(CartContext);
  const { user, logout } = useAuth();
  const { getWishlistCount, getCompareCount } = useProductLists();
  const { theme, toggleTheme } = useTheme();
  const { categories } = useShop();
  const { content, loading: cmsLoading } = useCMS();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderCategoryOpen, setIsHeaderCategoryOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState("menu");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSearchCategory, setSelectedSearchCategory] = useState("all");
  const navigate = useNavigate();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [activeParentCategory, setActiveParentCategory] = useState(null);
  const [activeSubCategory, setActiveSubCategory] = useState(null);
  const [openMobileCategories, setOpenMobileCategories] = useState({});
  const activeLinkStyle = { color: "#ef4444", fontWeight: "600" };

  // --- NEW: A single, reliable check for staff status ---
  const isStaff = user?.role?.name !== 'user';

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) { toast.warn("Please enter a search term."); return; }
    const params = new URLSearchParams();
    if (selectedSearchCategory !== "all") {
      const [parent, sub] = selectedSearchCategory.split("|");
      if (parent) params.set("parent", parent);
      if (sub) params.set("category", sub);
    }
    params.set("keyword", query);
    navigate(`/shop?${params.toString()}`);
    setIsMenuOpen(false);
    setIsMobileSearchOpen(false);
  };

  const handleCategoryDropdownChange = (e) => {
    const value = e.target.value;
    setSelectedSearchCategory(value);
    if (value !== "all") {
      const [parent, sub] = value.split("|");
      const params = new URLSearchParams();
      if (parent) params.set("parent", parent);
      if (sub) params.set("category", sub);
      navigate(`/shop?${params.toString()}`);
    } else {
      navigate("/shop");
    }
  };
  
  const handleCategoryClick = (parentCat, subCat = "", childCat = "") => {
    const params = new URLSearchParams();
    if (parentCat) params.set("parent", parentCat);
    if (subCat) params.set("category", subCat);
    if (childCat) params.set("child", childCat);
    navigate(`/shop?${params.toString()}`);
    setIsMenuOpen(false);
    setIsHeaderCategoryOpen(false);
    setActiveParentCategory(null);
    setActiveSubCategory(null);
  };
  
  const handleNavLinkClick = (path) => {
    navigate(path);
    setIsMenuOpen(false);
    setIsHeaderCategoryOpen(false);
  };
  
  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
  };
  
  const toggleMobileCategory = (key) => {
    setOpenMobileCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  
  if (cmsLoading) {
    return (
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 h-[68px] lg:h-[88px] animate-pulse">
          <div className="flex justify-between items-center h-full">
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
            <div className="hidden lg:flex h-10 w-96 bg-gray-200 rounded-md"></div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              <div className="h-10 w-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <AnimatePresence mode="wait">
          {isMobileSearchOpen ? (
            <motion.div key="mobile-search" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }} className="flex items-center h-[68px] lg:hidden">
              <form onSubmit={handleSearch} className="flex-grow flex items-center">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search for products..." className="w-full h-10 px-4 border-b-2 border-gray-300 focus:border-red-500 focus:outline-none bg-transparent" autoFocus />
              </form>
              <button onClick={() => setIsMobileSearchOpen(false)} className="ml-4 text-gray-600">
                <FiX size={28} />
              </button>
            </motion.div>
          ) : (
            <motion.div key="main-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex justify-between items-center py-3">
              <div className="flex items-center">
                <button onClick={() => setIsMenuOpen(true)} className="lg:hidden mr-3">
                  <FiMenu size={28} />
                </button>
                <Link to="/" className="flex items-center shrink-0">
                  <img src={content?.header?.logoUrl ?? "/images/logop.png"} alt="Zolmo" className="h-12 w-auto" onError={(e) => { e.target.onerror = null; e.target.src = "/images/logop.png"; }} />
                </Link>
              </div>
              <div className="hidden lg:flex flex-1 justify-center px-8">
                <form onSubmit={handleSearch} className="w-full max-w-xl flex items-center border-2 border-red-500 rounded-md">
                  <div className="relative">
                    <select value={selectedSearchCategory} onChange={handleCategoryDropdownChange} className="h-full bg-transparent pl-4 pr-8 text-sm text-gray-600 focus:outline-none appearance-none border-r border-gray-300">
                      <option value="all">All Categories</option>
                      {Object.keys(categories).map((parent) => (
                        <optgroup key={parent} label={parent}>
                          <option value={`${parent}|`}>All {parent}</option>
                          {categories[parent].map((sub) => (
                            <option key={sub.name} value={`${parent}|${sub.name}`}> {sub.name} </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search for dresses, kurtis, etc." className="w-full py-2.5 px-4 focus:outline-none text-sm" />
                  <button type="submit" className="px-4 text-gray-500 hover:text-red-500">
                    <FiSearch className="h-5 w-5" />
                  </button>
                </form>
              </div>
              <div className="flex items-center space-x-4 md:space-x-6">
                <div className="flex items-center space-x-4 lg:hidden">
                  <button onClick={toggleTheme} className="text-gray-600" aria-label="Toggle theme">
                    {theme === "light" ? <FiMoon size={22} /> : <FiSun size={22} />}
                  </button>
                  <button onClick={() => setIsMobileSearchOpen(true)} className="text-gray-600">
                    <FiSearch size={24} />
                  </button>
                </div>
                <div className="hidden lg:flex items-center space-x-4 md:space-x-6">
                  <button onClick={toggleTheme} className="flex items-center justify-center w-10 h-10 rounded-full text-gray-600 hover:bg-gray-100" aria-label="Toggle theme">
                    {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
                  </button>
                  {user ? (
                    <div className="relative" onMouseEnter={() => setIsUserDropdownOpen(true)} onMouseLeave={() => setIsUserDropdownOpen(false)}>
                      <button className="flex items-center gap-2 text-gray-600">
                        <FiUser size={24} />
                        <div className="text-left">
                          <p className="font-semibold text-sm leading-tight"> Hi, {user.name.split(" ")[0]} </p>
                          {/* --- FIX #1: Use the isStaff check and access role.name --- */}
                          {isStaff && ( <p className="text-xs text-red-500 font-bold capitalize leading-tight"> {user.role.name} </p> )}
                        </div>
                      </button>
                      <AnimatePresence>
                        {isUserDropdownOpen && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2, ease: "easeOut" }} className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100">
                            <div className="px-4 py-2 border-b"> <p className="font-bold text-gray-800"> {user.name} </p> <p className="text-sm text-gray-500 truncate"> {user.email} </p> </div>
                            <div className="py-1">
                              {/* --- FIX #2: Use the isStaff check --- */}
                              {isStaff ? (
                                <>
                                  <Link to="/admin" className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"> <FiGrid /> Dashboard </Link>
                                  <Link to="/profile" className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"> <FiUser /> View My Profile </Link>
                                </>
                              ) : (
                                <>
                                  <Link to="/profile" className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"> <FiUser /> My Profile </Link>
                                  <Link to="/profile/orders" className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"> <FiShoppingCart /> My Orders </Link>
                                </>
                              )}
                            </div>
                            <div className="py-1 border-t"> <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"> <FiLogOut /> Logout </button> </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : ( <Link to="/login" className="flex items-center gap-2 text-gray-600 hover:text-red-500"> <FiUser size={22} /> <span>Login</span> </Link> )}
                  <Link to="/profile/compare" className="flex items-center text-gray-600 hover:text-red-500 relative"> <FaBalanceScale size={22} /> <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"> {getCompareCount()} </span> </Link>
                  <Link to="/profile/wishlist" className="flex items-center text-gray-600 hover:text-red-500 relative"> <FiHeart size={22} /> <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"> {getWishlistCount()} </span> </Link>
                </div>
                <Link to="/cart" className="relative flex items-center text-gray-600 hover:text-gray-800 space-x-3">
                  <div className="relative"> <FiShoppingCart size={26} /> <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"> {getCartItemCount()} </span> </div>
                  <div className="hidden md:block"> <span className="text-sm text-gray-500"> Shopping Cart </span> <p className="font-bold text-gray-800 text-sm"> Rs {getCartTotal().toFixed(2)} </p> </div>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="bg-[#2d2d2d] text-white hidden lg:block">
        <div className="container mx-auto px-4 flex justify-between items-center h-12">
          <div className="flex items-center space-x-6">
            <div className="relative" onMouseLeave={() => { setIsHeaderCategoryOpen(false); setActiveParentCategory(null); setActiveSubCategory(null); }}>
              <button onMouseEnter={() => setIsHeaderCategoryOpen(true)} className="bg-red-600 h-12 flex items-center px-4 lg:px-6 -ml-4 space-x-3"> <FiMenu size={20} /> <span className="font-semibold uppercase text-sm"> All Categories </span> </button>
              <AnimatePresence>
                {isHeaderCategoryOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2, ease: "easeOut" }} className="absolute top-full left-0 bg-white text-black shadow-xl rounded-b-md z-50 border flex">
                    <div className="w-48 border-r border-gray-100">
                      {Object.keys(categories).map((parent) => ( <button key={parent} onMouseEnter={() => { setActiveParentCategory(parent); setActiveSubCategory(null); }} onClick={() => handleCategoryClick(parent)} className={`w-full text-left py-3 px-4 text-sm font-medium flex justify-between items-center transition-colors ${ activeParentCategory === parent ? "bg-red-50 text-red-600" : "hover:bg-gray-100" }`} > {parent} <FiChevronRight size={14} /> </button> ))}
                    </div>
                    <div className="w-56 border-r border-gray-100">
                      <AnimatePresence mode="wait">
                        <motion.div key={activeParentCategory} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                          {activeParentCategory && categories[activeParentCategory] ? ( categories[activeParentCategory].map((sub) => ( <button key={sub.name} onMouseEnter={() => setActiveSubCategory(sub)} onClick={() => handleCategoryClick( activeParentCategory, sub.name )} className={`w-full text-left py-3 px-4 flex justify-between items-center text-sm ${ activeSubCategory?.name === sub.name ? "bg-gray-100" : "hover:bg-gray-100" }`} > {sub.name} {sub.children?.length > 0 && ( <FiChevronRight size={14} /> )} </button> )) ) : ( <div className="p-4 text-center text-gray-400 text-sm"> Hover over a category </div> )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    <div className="w-56">
                      <AnimatePresence mode="wait">
                        <motion.div key={activeSubCategory?.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                          {activeSubCategory && activeSubCategory.children?.length > 0 ? ( activeSubCategory.children.map((child) => ( <button key={child.name} onClick={() => handleCategoryClick( activeParentCategory, activeSubCategory.name, child.name )} className="w-full text-left py-3 px-4 hover:bg-gray-100 text-sm" > {child.name} </button> )) ) : ( <div className="p-4 text-center text-gray-400 text-sm h-full flex items-center justify-center"> Select a sub-category </div> )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center space-x-6 font-medium text-sm">
              {content?.header?.navigation?.map((navItem) => ( <NavLink key={navItem.path} to={navItem.path} style={({ isActive }) => isActive ? activeLinkStyle : undefined } className="hover:text-red-500"> {navItem.name} </NavLink> ))}
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/#special-offers" className="flex items-center space-x-2 hover:text-red-500 text-sm font-medium"> <FaBolt className="text-yellow-400" /> <span>Flash Sale</span> </Link>
            <Link to="/offers" className="flex items-center space-x-2 hover:text-red-500 text-sm font-medium"> <FaTag className="text-red-500" /> <span>Special Offers</span> </Link>
          </div>
        </div>
      </nav>

      <div className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${ isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none" }`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)}></div>
        <div className={`relative h-full w-full max-w-xs bg-[#2d2d2d] text-gray-300 p-5 shadow-xl transition-transform duration-300 ease-in-out ${ isMenuOpen ? "translate-x-0" : "-translate-x-full" }`}>
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"> <FiX size={24} /> </button>
          <form onSubmit={handleSearch} className="relative mb-6">
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pr-10 pl-4 focus:outline-none focus:ring-1 focus:ring-red-500 text-white" />
            <button type="submit" className="absolute right-0 top-0 h-full px-3 text-gray-400"> <FiSearch className="h-5 w-5" /> </button>
          </form>
          <div className="flex border-b border-gray-700 mb-4">
            <button onClick={() => setActiveMobileTab("menu")} className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider ${ activeMobileTab === "menu" ? "text-white border-b-2 border-red-500" : "text-gray-400" }`} > Main Menu </button>
            <button onClick={() => setActiveMobileTab("categories")} className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider ${ activeMobileTab === "categories" ? "text-white border-b-2 border-red-500" : "text-gray-400" }`} > Categories </button>
          </div>
          <div className="overflow-y-auto" style={{ height: "calc(100vh - 150px)" }}>
            {activeMobileTab === "menu" && (
              <nav className="flex flex-col space-y-1">
                {content?.header?.navigation?.map((navItem) => ( <button key={navItem.path} onClick={() => handleNavLinkClick(navItem.path)} className="text-left py-2.5 px-2 rounded hover:bg-gray-700"> {navItem.name} </button> ))}
                <div className="border-t border-gray-700 my-2"></div>
                <button onClick={() => handleNavLinkClick("/profile/wishlist")} className="flex justify-between items-center text-left py-2.5 px-2 rounded hover:bg-gray-700"> <span>Wishlist</span> <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold"> {getWishlistCount()} </span> </button>
                <button onClick={() => handleNavLinkClick("/profile/compare")} className="flex justify-between items-center text-left py-2.5 px-2 rounded hover:bg-gray-700"> <span>Compare</span> <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold"> {getCompareCount()} </span> </button>
                <div className="border-t border-gray-700 my-2"></div>
                {user ? (
                  <>
                    <button onClick={() => handleNavLinkClick("/profile")} className="text-left py-2.5 px-2 rounded hover:bg-gray-700"> My Profile </button>
                    {/* --- FIX #3: Use the isStaff check --- */}
                    {isStaff && ( <button onClick={() => handleNavLinkClick("/admin")} className="text-left py-2.5 px-2 rounded hover:bg-gray-700"> Admin Dashboard </button> )}
                    <button onClick={handleLogout} className="text-left py-2.5 px-2 rounded hover:bg-gray-700"> Logout </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleNavLinkClick("/login")} className="text-left py-2.5 px-2 rounded hover:bg-gray-700"> Login </button>
                    <button onClick={() => handleNavLinkClick("/register")} className="text-left py-2.5 px-2 rounded hover:bg-gray-700"> Register </button>
                  </>
                )}
              </nav>
            )}
            {activeMobileTab === "categories" && (
              <nav className="flex flex-col text-sm">
                {Object.keys(categories).map((parent) => (
                  <div key={parent}>
                    <button onClick={() => toggleMobileCategory(parent)} className="w-full flex justify-between items-center font-bold text-white py-2 px-2 uppercase tracking-wider"> {parent} <FiChevronDown className={`transition-transform ${ openMobileCategories[parent] ? "rotate-180" : "" }`} /> </button>
                    {openMobileCategories[parent] && (
                      <div className="pl-4 border-l border-gray-600">
                        {categories[parent].map((sub) => (
                          <div key={sub.name} className="py-1">
                            <button onClick={() => { if (sub.children?.length > 0) { toggleMobileCategory(`${parent}-${sub.name}`); } else { handleCategoryClick(parent, sub.name); } }} className="w-full flex justify-between items-center text-left py-2 px-2 hover:bg-gray-700 rounded"> {sub.name} {sub.children?.length > 0 && ( <FiChevronDown className={`transition-transform ${ openMobileCategories[ `${parent}-${sub.name}` ] ? "rotate-180" : "" }`} /> )} </button>
                            {sub.children?.length > 0 && openMobileCategories[`${parent}-${sub.name}`] && (
                              <div className="pl-4 border-l border-gray-600">
                                {sub.children.map((child) => ( <button key={child.name} onClick={() => handleCategoryClick( parent, sub.name, child.name )} className="w-full text-left py-2 px-2 hover:bg-gray-700 rounded text-xs" > {child.name} </button> ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={() => handleNavLinkClick("/shop")} className="text-left py-3 px-2 mt-4 font-semibold border-t border-gray-700 hover:bg-gray-700"> View All Categories </button>
              </nav>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;