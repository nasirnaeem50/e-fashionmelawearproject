// src/components/common/CouponPopupManager.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../../context/ShopContext';
import CouponModal from './CouponModal';

const CouponPopupManager = () => {
    const { coupons } = useShop();
    const [couponQueue, setCouponQueue] = useState([]);
    const [currentCoupon, setCurrentCoupon] = useState(null);
    const hasBeenInitialized = useRef(false);

    useEffect(() => {
        if (coupons.length > 0 && !hasBeenInitialized.current) {
            const now = new Date();
            const seenCoupons = JSON.parse(sessionStorage.getItem('seenCoupons') || '[]');
            const popupCouponsToShow = coupons.filter(c =>
                c.display === 'popup' &&
                c.status === 'Active' &&
                new Date(c.endDate) >= now &&
                !seenCoupons.includes(c.id)
            );

            if (popupCouponsToShow.length > 0) {
                setCouponQueue(popupCouponsToShow);
                hasBeenInitialized.current = true;
            }
        }
    }, [coupons]);

    useEffect(() => {
        if (couponQueue.length > 0 && !currentCoupon) {
            const timer = setTimeout(() => {
                const nextCoupon = couponQueue[0];
                const remainingCoupons = couponQueue.slice(1);
                setCurrentCoupon(nextCoupon);
                setCouponQueue(remainingCoupons);
            }, 2000); 

            return () => clearTimeout(timer);
        }
    }, [couponQueue, currentCoupon]);

    const handleClose = () => {
        if (currentCoupon) {
            const seenCoupons = JSON.parse(sessionStorage.getItem('seenCoupons') || '[]');
            sessionStorage.setItem('seenCoupons', JSON.stringify([...seenCoupons, currentCoupon.id]));
        }
        setCurrentCoupon(null); 
    };

    return (
        <CouponModal coupon={currentCoupon} onClose={handleClose} />
    );
};

export default CouponPopupManager;