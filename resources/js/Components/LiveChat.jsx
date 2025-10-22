import { useEffect, useMemo } from 'react';

export default function LiveChat() {
  const propertyId = import.meta.env.VITE_TAWK_PROPERTY_ID;
  const widgetId = import.meta.env.VITE_TAWK_WIDGET_ID || 'default';
  const position = (import.meta.env.VITE_TAWK_POSITION || 'br').toLowerCase(); // br=bottom-right
  const delayMs = Number(import.meta.env.VITE_TAWK_DELAY_MS || 0);

  const enabled = useMemo(() => !!propertyId, [propertyId]);

  useEffect(() => {
    if (!enabled) {
      // eslint-disable-next-line no-console
      console.warn('[LiveChat] VITE_TAWK_PROPERTY_ID not set; showing fallback chat button.');
      return;
    }
    if (document.getElementById('tawk-script')) return; // avoid duplicate

    const loadScript = () => {
      // Configure Tawk before load
      // eslint-disable-next-line no-undef
      window.Tawk_API = window.Tawk_API || {};
      // eslint-disable-next-line no-undef
      window.Tawk_LoadStart = new Date();
      // eslint-disable-next-line no-undef
      window.Tawk_API.onLoad = function () {
        try {
          // eslint-disable-next-line no-undef
          if (window.Tawk_API && typeof window.Tawk_API.setPosition === 'function') {
            // Valid options: 'br', 'bl', 'tr', 'tl'
            window.Tawk_API.setPosition(position);
          }
          // eslint-disable-next-line no-console
          console.info('[LiveChat] Tawk loaded, position:', position);
        } catch {}
      };

      const s1 = document.createElement('script');
      s1.async = true;
      s1.id = 'tawk-script';
      s1.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');

      const firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode.insertBefore(s1, firstScript);
    };

    if ('requestIdleCallback' in window && delayMs === 0) {
      // @ts-ignore
      window.requestIdleCallback(loadScript, { timeout: 2000 });
    } else if (delayMs > 0) {
      const t = setTimeout(loadScript, delayMs);
      return () => clearTimeout(t);
    } else {
      loadScript();
    }

    return () => {
      try {
        const added = document.getElementById('tawk-script');
        if (added && added.parentNode) added.parentNode.removeChild(added);
      } catch {}
    };
  }, [enabled, position, propertyId, widgetId, delayMs]);

  return null;
}
