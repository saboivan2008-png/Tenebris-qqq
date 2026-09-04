import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, trackPromoClick } from '../lib/analytics';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * Automatically triggers Google Analytics 4 pageview and pillar engagement
 * telemetry whenever the user navigates between routes, and records promotional
 * referral clicks toward funding and charity goals.
 */
export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);

    // Detect promotional referral links (?ref=... or ?promo=...)
    try {
      const searchParams = new URLSearchParams(location.search);
      const refCode = searchParams.get('ref') || searchParams.get('promo');

      if (refCode) {
        trackPromoClick(refCode, `Referral: ${refCode}`, window.location.href, 0.35);

        // Increment click count in local stats & Firestore
        const cached = localStorage.getItem('usc_promo_links_data');
        if (cached) {
          const links = JSON.parse(cached);
          const updated = links.map((l: any) => {
            if (l.url.includes(refCode) || l.id.includes(refCode)) {
              return { ...l, clicks: l.clicks + 1 };
            }
            return l;
          });
          localStorage.setItem('usc_promo_links_data', JSON.stringify(updated));
        }

        // Firestore async update
        const docRef = doc(db, 'system_stats', 'promo_earnings_matrix');
        getDoc(docRef).then((snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (Array.isArray(data.links)) {
              const updated = data.links.map((l: any) => {
                if (l.url.includes(refCode) || l.id.includes(refCode)) {
                  return { ...l, clicks: (l.clicks || 0) + 1 };
                }
                return l;
              });
              setDoc(docRef, { links: updated, lastUpdated: new Date().toISOString() }, { merge: true });
            }
          }
        }).catch(() => {});
      }
    } catch (e) {
      // Non-blocking
    }
  }, [location.pathname, location.search]);

  return null;
}
