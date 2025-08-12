// src/utils/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return; 
      }
    }

    window.scrollTo(0, 0);

  }, [pathname]);

  return null;
};

// --- THIS IS THE FIX ---
// The missing export line has been added below.
export default ScrollToTop; 