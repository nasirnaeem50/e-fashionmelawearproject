import React, { useEffect } from 'react'; // 1. Import useEffect
import { useLocation } from 'react-router-dom'; // 2. Import useLocation
import PageTransition from '../components/shared/PageTransition';
import Hero from '../components/home/Hero';
import NewCollections from '../components/home/NewCollections';
import ShopByCategories from '../components/home/ShopByCategories';
import SpecialOfferBanner from '../components/home/SpecialOfferBanner';
import FeaturedProducts from '../components/home/FeaturedProducts';
import Brands from '../components/home/Brands';
import DownloadApp from '../components/home/DownloadApp';
import Reviews from '../components/home/Reviews';

const Home = () => {
    const location = useLocation(); // 3. Get the current location object

    // 4. This useEffect handles scrolling to a section when the page loads with a URL hash
    useEffect(() => {
        // Check if there is a hash in the URL (e.g., /#special-offers)
        if (location.hash) {
            // Remove the '#' from the hash to get the element's ID
            const id = location.hash.substring(1); 
            const element = document.getElementById(id);
          
            if (element) {
                // We use a small timeout to ensure the browser has fully rendered the
                // component before we attempt to scroll. This makes it more reliable.
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
    }, [location]); // This effect will re-run if the URL location ever changes.

    return (
        <PageTransition>
            <Hero />
            <NewCollections />
            <ShopByCategories />
            {/* This banner needs an id that matches the link in the header, e.g., id="special-offers" */}
            <SpecialOfferBanner />
            <FeaturedProducts />
            <Brands />
            <DownloadApp />
            <Reviews />
        </PageTransition>
    );
};

export default Home;