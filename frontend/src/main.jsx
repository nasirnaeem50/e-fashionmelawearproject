import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// ✅ MODIFIED: We are no longer using react-helmet-async.
// import { HelmetProvider } from 'react-helmet-async';

// ✅ ADDED: Import the provider from react-head
import { HeadProvider } from 'react-head';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* ✅ MODIFIED: Wrap your app with the HeadProvider */}
    <HeadProvider>
      <App />
    </HeadProvider>
  </StrictMode>,
);