import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global resilience handler for Google Maps API authentication errors
(window as any).gm_authFailure = () => {
  console.warn('[Google Maps] Authentication failure intercepted (InvalidKeyMapError). Graceful fallback activated.');
  window.dispatchEvent(new CustomEvent('gmp-auth-failure'));
};

const origError = console.error;
console.error = (...args: unknown[]) => {
  const msg = args.map(a => String(a)).join(' ');
  if (
    msg.includes('InvalidKeyMapError') || 
    msg.includes('OverQuotaMapError') || 
    msg.includes('QuotaExceededError') ||
    msg.includes('Google Maps JavaScript API error')
  ) {
    window.dispatchEvent(new CustomEvent('gmp-auth-failure'));
    return; // Suppress crash
  }
  origError.apply(console, args);
};

window.addEventListener('error', (event) => {
  const isMapsError = 
    (event.message && (
      event.message.includes('InvalidKeyMapError') || 
      event.message.includes('google.maps') || 
      event.message.includes('Google Maps') ||
      event.message.includes('Script error.')
    )) ||
    (event.filename && event.filename.includes('maps.googleapis.com'));

  if (isMapsError) {
    event.preventDefault();
    event.stopPropagation();
    window.dispatchEvent(new CustomEvent('gmp-auth-failure'));
    return true;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = String(event.reason || '');
  if (reason.includes('InvalidKeyMapError') || reason.includes('google.maps') || reason.includes('Google Maps')) {
    event.preventDefault();
    window.dispatchEvent(new CustomEvent('gmp-auth-failure'));
  }
});

createRoot(document.getElementById('root')!).render(<App />);
