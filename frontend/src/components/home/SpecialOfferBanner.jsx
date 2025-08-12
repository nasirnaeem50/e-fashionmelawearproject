import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaBolt, FaTag } from "react-icons/fa";
import { useShop } from "../../context/ShopContext";
import { useCMS } from "../../context/CMSContext";

const SpecialOfferBanner = () => {
    const { products, campaigns } = useShop();
    const { content, loading: cmsLoading } = useCMS();
    const [timeLeft, setTimeLeft] = useState({});
    const [currentBanner, setCurrentBanner] = useState(0);
    const [currentCampaignIndex, setCurrentCampaignIndex] = useState(0);

    // ✅ FIX: Find all currently active campaigns and sort them by the soonest end date
    const activeCampaigns = useMemo(() => {
        const now = new Date();
        const filtered = campaigns.filter(c => {
            if (!c.isActive) return false;
            const startDate = new Date(c.startDate);
            const endDate = new Date(c.endDate);
            return startDate <= now && endDate > now;
        });
        // Sort by end date, soonest first
        filtered.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
        return filtered;
    }, [campaigns]);

    // ✅ FIX: Cycle through active campaigns if there is more than one
    useEffect(() => {
        if (activeCampaigns.length > 1) {
            const campaignInterval = setInterval(() => {
                setCurrentCampaignIndex(prev => (prev + 1) % activeCampaigns.length);
            }, 10000); // Cycle every 10 seconds
            return () => clearInterval(campaignInterval);
        }
    }, [activeCampaigns.length]);
    
    // ✅ FIX: The featured campaign is the one at the current index in the active list
    const featuredCampaign = activeCampaigns.length > 0 ? activeCampaigns[currentCampaignIndex] : null;

    useEffect(() => {
        if (!featuredCampaign) {
            setTimeLeft({});
            return;
        }

        const calculateTimeLeft = () => {
            const difference = +new Date(featuredCampaign.endDate) - +new Date();
            let timeLeftData = {};
            if (difference > 0) {
                timeLeftData = {
                    Days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    Hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    Mins: Math.floor((difference / 1000 / 60) % 60),
                    Secs: Math.floor((difference / 1000) % 60),
                };
            }
            setTimeLeft(timeLeftData);
        };
        calculateTimeLeft();
        const timerInterval = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timerInterval);
    }, [featuredCampaign]);

    // ✅ FIX: Featured offers and max discount are now tied to the currently displayed campaign
    const { featuredOffers, maxDiscount } = useMemo(() => {
        if (!featuredCampaign) {
            return { featuredOffers: [], maxDiscount: 0 };
        }

        const allOnSaleProducts = products.filter(p => p.originalPrice && p.originalPrice > p.price);

        let campaignProducts = [];
        const { type: scopeType, target: scopeTarget = [] } = featuredCampaign.scope;
        const targetSet = new Set(scopeTarget.map(String)); // Use a Set of strings for efficient, correct lookups

        switch (scopeType) {
            case 'all':
                campaignProducts = allOnSaleProducts;
                break;
            case 'product':
                campaignProducts = allOnSaleProducts.filter(p => targetSet.has(p.id));
                break;
            case 'parent-category':
                campaignProducts = allOnSaleProducts.filter(p => targetSet.has(p.gender));
                break;
            case 'category':
                campaignProducts = allOnSaleProducts.filter(p => targetSet.has(p.category));
                break;
            case 'child-category':
                campaignProducts = allOnSaleProducts.filter(p => targetSet.has(p.childCategory));
                break;
            default:
                campaignProducts = [];
        }

        const productsWithDiscount = campaignProducts.map(p => {
            const discount = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
            return { ...p, discount };
        }).sort((a, b) => b.discount - a.discount);

        const topOffers = productsWithDiscount.slice(0, 3);
        
        let headlineDiscount = 0;
        if (featuredCampaign.discount.type === 'percentage') {
            headlineDiscount = Math.round(featuredCampaign.discount.value);
        } else {
            headlineDiscount = topOffers.length > 0 ? topOffers[0].discount : 0;
        }

        return { featuredOffers: topOffers, maxDiscount: headlineDiscount };
    }, [products, featuredCampaign]);

    const banners = useMemo(() => {
        if (cmsLoading || !content) return [];
        const cmsBanners = content?.specialOffer?.backgroundBanners ?? [];
        return cmsBanners.filter(b => b.imageUrl).map(b => b.imageUrl);
    }, [content, cmsLoading]);

    useEffect(() => {
        if (banners.length > 0) {
            const bannerInterval = setInterval(() => {
                setCurrentBanner((prev) => (prev + 1) % banners.length);
            }, 7000);
            return () => clearInterval(bannerInterval);
        }
    }, [banners.length]);

    const textShadow = { textShadow: '0 2px 8px rgba(0,0,0,0.7)' };

    if (cmsLoading) {
        return (
            <div className="antialiased py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="relative overflow-hidden rounded-3xl min-h-[600px] bg-gray-200 animate-pulse"></div>
                </div>
            </div>
        );
    }
    
    return (
        <div id="special-offers" className="antialiased py-12 md:py-16">
            <div className="container mx-auto px-4">
                <div className="relative overflow-hidden rounded-3xl shadow-2xl min-h-[600px] flex items-center p-6 sm:p-8 lg:p-12">
                    <AnimatePresence>
                        {banners.length > 0 && (
                            <motion.div
                                key={currentBanner}
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                className="absolute inset-0"
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
                                <img 
                                    src={banners[currentBanner]} 
                                    alt="Promotional Banner" 
                                    className="w-full h-full object-cover object-center"
                                    onError={(e) => { e.currentTarget.src = '/images/placeholder-brand.png'; }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
        
                    <div className="relative z-20 w-full">
                        <AnimatePresence mode="wait">
                            {featuredCampaign ? (
                                <motion.div
                                    key={featuredCampaign.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-x-12 gap-y-10 items-center">
                                        <div className="flex flex-col text-center lg:text-left order-2 lg:order-1 lg:col-span-3">
                                            <div className="flex items-center justify-center lg:justify-start gap-2.5 mb-2">
                                                {featuredCampaign.name.toLowerCase().includes('flash') ? <FaBolt className="text-amber-400" /> : <FaTag className="text-amber-400" />}
                                                <h2 className="text-lg md:text-xl font-bold text-amber-400 uppercase tracking-widest" style={textShadow}>
                                                    {featuredCampaign.name}
                                                </h2>
                                            </div>
                                            <h1 className="font-black text-5xl md:text-7xl text-white mb-4" style={textShadow}>
                                                <motion.span animate={{ opacity: [1, 0.6, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="text-red-500">
                                                    Up to {maxDiscount}% OFF
                                                </motion.span>
                                            </h1>
                                            <p className="text-md md:text-lg text-neutral-300 max-w-lg mx-auto lg:mx-0" style={textShadow}>
                                                Explore electrifying deals on our best-selling collections before time runs out!
                                            </p>
                                            <div className="grid grid-cols-3 gap-3 md:gap-4 lg:gap-5 mt-8">
                                                {featuredOffers.map((offer) => (
                                                    <Link key={offer.id} to={`/product/${offer.id}`} className="group block overflow-hidden rounded-xl bg-white/5 border border-white/10 transition-all duration-300 hover:border-red-500/50 hover:bg-white/10 hover:-translate-y-1">
                                                        <div className="relative w-full overflow-hidden aspect-square">
                                                            <img src={offer.image} alt={offer.name} className="h-full w-full object-contain p-2 lg:object-cover lg:object-top lg:p-0 transition-transform duration-300 group-hover:scale-105" />
                                                            <span className="absolute top-2 right-2 inline-block bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">-{offer.discount}%</span>
                                                        </div>
                                                        <div className="p-2 md:p-3">
                                                            <p className="font-bold text-xs md:text-sm leading-tight truncate text-white">{offer.name}</p>
                                                            <div className="flex items-baseline gap-2 mt-1.5">
                                                                <span className="text-sm md:text-base font-bold text-amber-400">Rs {offer.price.toLocaleString()}</span>
                                                                <span className="text-[10px] md:text-xs text-neutral-400 line-through">Rs {offer.originalPrice.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center space-y-8 order-1 lg:order-2 lg:col-span-2">
                                            <p className="font-semibold text-xl text-white tracking-wide" style={textShadow}>
                                                Offer Ends In
                                            </p>
                                            {Object.keys(timeLeft).length > 0 ? (
                                                <div className="flex items-start justify-center space-x-3 sm:space-x-4 text-center">
                                                    {Object.entries(timeLeft).map(([interval, value]) => (
                                                        <div key={interval} className="flex flex-col items-center w-16 sm:w-20">
                                                            <span className="text-4xl sm:text-6xl font-bold text-white tabular-nums" style={textShadow}>{String(value).padStart(2, '0')}</span>
                                                            <span className="text-xs text-neutral-400 uppercase tracking-widest mt-1">{interval}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="h-28 flex items-center justify-center">
                                                    <p className="text-2x text-red-500 font-bold">Offer has expired!</p>
                                                </div>
                                            )}
                                            {/* ✅ FIX: Changed link to point to the dedicated /offers page */}
                                            <Link to="/offers" className="w-full max-w-xs text-center bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold py-3.5 px-8 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-red-500/40 text-base md:text-lg">
                                                Shop All Offers
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="default-banner"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.8 }}
                                >
                                    <div className="w-full flex flex-col items-center justify-center text-center">
                                        <h2 className="text-lg md:text-xl font-bold text-amber-400 uppercase tracking-widest" style={textShadow}>
                                            {content?.specialOffer?.defaultTitle ?? 'Always in Style'}
                                        </h2>
                                        <h1 className="font-black text-5xl md:text-7xl text-white my-4" style={textShadow}>
                                            {content?.specialOffer?.defaultHeadline ?? 'Explore Our Collections'}
                                        </h1>
                                        <p className="text-md md:text-lg text-neutral-300 max-w-2xl mx-auto" style={textShadow}>
                                            {content?.specialOffer?.defaultSubheadline ?? 'Discover timeless designs and the latest trends. Find your new favorite style today.'}
                                        </p>
                                        <Link
                                            to="/shop"
                                            className="mt-8 inline-block bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold py-3.5 px-8 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-red-500/40 text-base md:text-lg"
                                        >
                                            {content?.specialOffer?.defaultButtonText ?? 'Browse the Shop'}
                                        </Link>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpecialOfferBanner;