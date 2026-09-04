/**
 * Google Analytics 4 (GA4) Integration
 * Measurement ID: G-7G5BNGMJG3
 * 
 * Provides automated route tracking and custom telemetry to analyze user
 * engagement across Underground Street Collective's operational pillars:
 * - Auru Trinity (AI Core & Automation)
 * - U.S.W Streetwear (Merch & Fashion)
 * - Rent a Wheel (Van Logistics & Rental)
 * - U.S.C. Work (German Turnus & Craftsmen Recruitment)
 * - Trade Zakasajee (Transit & B2B Trading)
 * - U.S.C. Solidarity (Community Support Fund)
 */

export const GA_MEASUREMENT_ID = 'G-7G5BNGMJG3';

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export type USC_PillarKey = 
  | 'HOME'
  | 'AURU_TRINITY'
  | 'USW_STREETWEAR'
  | 'RENT_A_WHEEL'
  | 'USC_WORK'
  | 'TRADE_ZAKASAJEE'
  | 'USC_SOLIDARITY'
  | 'PROMO_DROP'
  | 'ADMIN'
  | 'GENERAL';

/**
 * Maps a given URL pathname to its corresponding Underground Street Collective pillar.
 */
export function getPillarFromPath(pathname: string): { pillarKey: USC_PillarKey; pillarName: string } {
  const path = pathname.toLowerCase();
  
  if (path === '/' || path === '') {
    return { pillarKey: 'HOME', pillarName: 'Underground Street Collective Home' };
  }
  if (path.includes('auru-trinity') || path.includes('trinity') || path.includes('ai')) {
    return { pillarKey: 'AURU_TRINITY', pillarName: 'Auru Trinity AI' };
  }
  if (path.includes('usw') || path.includes('shop') || path.includes('streetwear')) {
    return { pillarKey: 'USW_STREETWEAR', pillarName: 'U.S.W. Streetwear' };
  }
  if (path.includes('rent') || path.includes('wheel') || path.includes('dodavk')) {
    return { pillarKey: 'RENT_A_WHEEL', pillarName: 'Rent a Wheel Logistics' };
  }
  if (path.includes('work') || path.includes('praca') || path.includes('turnus')) {
    return { pillarKey: 'USC_WORK', pillarName: 'U.S.C. Work & Recruitment' };
  }
  if (path.includes('trade') || path.includes('zakasajee')) {
    return { pillarKey: 'TRADE_ZAKASAJEE', pillarName: 'Trade Zakasajee' };
  }
  if (path.includes('solidarity') || path.includes('charity') || path.includes('fond')) {
    return { pillarKey: 'USC_SOLIDARITY', pillarName: 'U.S.C. Solidarity' };
  }
  if (path.includes('promo')) {
    return { pillarKey: 'PROMO_DROP', pillarName: 'Promo & Drops' };
  }
  if (path.includes('admin') || path.includes('login')) {
    return { pillarKey: 'ADMIN', pillarName: 'Admin Operations' };
  }

  return { pillarKey: 'GENERAL', pillarName: 'Underground Street Collective' };
}

/**
 * Dispatch a GA4 event safely
 */
export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, {
      ...params,
      timestamp: new Date().toISOString()
    });
  } else {
    // Fallback: push to dataLayer directly if gtag wrapper is pending
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: eventName,
        ...params
      });
    }
  }
}

/**
 * Track a page view with automatic pillar attribution
 */
export function trackPageView(pathname: string, pageTitle?: string) {
  const { pillarKey, pillarName } = getPillarFromPath(pathname);
  
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: pathname,
      page_title: pageTitle || document.title,
      pillar_key: pillarKey,
      pillar_name: pillarName
    });
  }

  // Trigger a dedicated custom event to measure active pillars in GA4 Explore reports
  trackEvent('pillar_view', {
    pillar_key: pillarKey,
    pillar_name: pillarName,
    page_path: pathname,
    page_title: pageTitle || document.title
  });
}

/**
 * Track specific user interactions within a collective pillar
 */
export function trackPillarEngagement(
  pillar: USC_PillarKey,
  interactionType: string,
  details: Record<string, any> = {}
) {
  trackEvent('pillar_engagement', {
    pillar_key: pillar,
    interaction_type: interactionType,
    ...details
  });
}

/**
 * Track AI Matrix Copilot interactions
 */
export function trackMatrixDispatch(
  promptType: string,
  targetPillar: string,
  multitaskThreadsCount: number = 1
) {
  trackEvent('matrix_dispatch_prompt', {
    prompt_type: promptType,
    target_pillar: targetPillar,
    threads_count: multitaskThreadsCount,
    node: 'AURU_MULTITASK_CORE_369'
  });
}

/**
 * Track E-commerce / Shop actions in U.S.W.
 */
export function trackShopAction(
  action: 'view_item' | 'add_to_cart' | 'remove_from_cart' | 'begin_checkout' | 'purchase',
  item: { id?: string; name: string; price?: number; category?: string }
) {
  trackEvent(action, {
    pillar_key: 'USW_STREETWEAR',
    currency: 'EUR',
    value: item.price || 0,
    items: [
      {
        item_id: item.id || item.name,
        item_name: item.name,
        item_category: item.category || 'Streetwear',
        price: item.price || 0
      }
    ]
  });
}

/**
 * Track Logistics / Rent a Wheel inquiries
 */
export function trackLogisticsCalc(
  origin: string,
  destination: string,
  vehicleType: string,
  estimatedPrice?: number
) {
  trackEvent('logistics_route_calculated', {
    pillar_key: 'RENT_A_WHEEL',
    origin,
    destination,
    vehicle_type: vehicleType,
    estimated_price_eur: estimatedPrice
  });
}

/**
 * Track Worker profile matchmaking in USC Work
 */
export function trackWorkerMatching(profession: string, locationPreference: string) {
  trackEvent('worker_match_requested', {
    pillar_key: 'USC_WORK',
    profession,
    location_preference: locationPreference
  });
}

/**
 * Track Solidarity Donations & Community support
 */
export function trackSolidaritySupport(amountEur: number, method: string = 'PayPal') {
  trackEvent('solidarity_support_pledge', {
    pillar_key: 'USC_SOLIDARITY',
    value: amountEur,
    currency: 'EUR',
    payment_method: method
  });
}

/**
 * Track Promotional Link clicks and affiliate earnings telemetry
 */
export function trackPromoClick(
  promoId: string,
  promoName: string,
  destinationUrl: string,
  estimatedEpc: number = 0.25
) {
  trackEvent('promo_link_click', {
    promo_id: promoId,
    promo_name: promoName,
    destination_url: destinationUrl,
    estimated_epc: estimatedEpc,
    pillar_key: 'PROMO_DROP'
  });
}
