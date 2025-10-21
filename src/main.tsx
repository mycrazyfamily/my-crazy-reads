import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global error handler for removeChild Portal issues
window.onerror = function(message, source, lineno, colno, error) {
  if (message && typeof message === 'string' && message.includes('removeChild')) {
    console.error('🚨 Portal removeChild error detected:', {
      message,
      source,
      lineno,
      colno,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      location: window.location.href
    });
  }
  return false; // Let default error handling continue
};

createRoot(document.getElementById("root")!).render(<App />);
