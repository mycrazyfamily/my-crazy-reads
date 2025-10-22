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

// Ensure critical portal containers exist ASAP (pre-render)
(() => {
  const ensure = (id: string) => {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      document.body.appendChild(el);
      console.log(`🛠️ Injected missing #${id} at startup`);
    }
    return el as HTMLElement;
  };
  ensure('portal-root');
  const dp = ensure('datepicker-portal');

  // Guard against accidental removals of #datepicker-portal
  try {
    if (!dp.dataset.pinned) {
      const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          m.removedNodes.forEach((node) => {
            if (node === dp) {
              console.warn('⛔️ Someone tried to remove #datepicker-portal! Re-attaching.');
              document.body.appendChild(dp);
            }
          });
        }
      });
      observer.observe(document.body, { childList: true });
      dp.dataset.pinned = 'true';
      (window as any).__dpObserver__ = observer;
    }
  } catch (e) {
    console.error('Failed to pin #datepicker-portal', e);
  }
})();

createRoot(document.getElementById("root")!).render(<App />);
