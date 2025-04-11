// Type declarations for Google Analytics
declare global {
  interface Window {
    __GA_CLIENT_ID__?: string;
  }
}

// Type definitions for GA4 Measurement Protocol
interface GA4Event {
  name: string;
  params: Record<string, any>;
}

interface GA4Payload {
  client_id: string;
  events: GA4Event[];
}

// Initialize analytics system
export function initAnalytics() {
  if (typeof window === "undefined") return;

  // Instead of injecting the Google Analytics script (which violates CSP),
  // we'll use the Measurement Protocol directly

  // Generate or retrieve client ID on initialization
  getOrCreateClientId().then((clientId) => {
    // Store in memory for this session
    window.__GA_CLIENT_ID__ = clientId;

    // Track initial page view
    trackPageView(window.location.pathname);
  });
}

// Generate or retrieve a persistent client ID
async function getOrCreateClientId(): Promise<string> {
  // For extension, use chrome.storage
  if (typeof chrome !== "undefined" && chrome.storage) {
    return new Promise((resolve) => {
      chrome.storage.local.get("ga_client_id", (result) => {
        if (result.ga_client_id) {
          resolve(result.ga_client_id);
        } else {
          const clientId = generateUUID();
          chrome.storage.local.set({ ga_client_id: clientId });
          resolve(clientId);
        }
      });
    });
  }
  // Fallback to localStorage for development
  else {
    let clientId = localStorage.getItem("ga_client_id");
    if (!clientId) {
      clientId = generateUUID();
      localStorage.setItem("ga_client_id", clientId);
    }
    return clientId;
  }
}

// Generate UUID v4
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Track page views
export async function trackPageView(path: string) {
  if (typeof window === "undefined") return;

  const clientId = await getClientId();

  const eventData: GA4Payload = {
    client_id: clientId,
    events: [
      {
        name: "page_view",
        params: {
          page_location: `chrome-extension://${chrome.runtime.id}${path}`,
          page_title: document.title || path,
          page_path: path,
        },
      },
    ],
  };

  sendToGA(eventData);
}

// Track custom events
export async function trackEvent(
  eventName: string,
  eventParams: Record<string, any> = {}
) {
  if (typeof window === "undefined") return;

  const clientId = await getClientId();

  const eventData: GA4Payload = {
    client_id: clientId,
    events: [
      {
        name: eventName,
        params: {
          ...eventParams,
          // Add useful extension-specific parameters
          ext_version: chrome.runtime.getManifest().version,
        },
      },
    ],
  };

  sendToGA(eventData);
}

// Helper to get client ID (either from memory or storage)
async function getClientId(): Promise<string> {
  if (window.__GA_CLIENT_ID__) {
    return window.__GA_CLIENT_ID__;
  }
  return getOrCreateClientId();
}

// Send data to Google Analytics using Measurement Protocol
function sendToGA(data: GA4Payload): void {
  const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
  const GA_API_SECRET = import.meta.env.VITE_GA_API_SECRET;

  if (!GA_MEASUREMENT_ID || !GA_API_SECRET) {
    console.error(
      "Google Analytics configuration is missing. Please check your .env file."
    );
    return;
  }

  // GA4 Measurement Protocol endpoint
  const endpoint = `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`;

  // Using fetch API which is allowed in extensions
  fetch(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  }).catch((err) => console.error("Analytics error:", err));
}

// For debugging - can be removed in production
export function debugAnalytics() {
  return {
    getClientId: getClientId,
    trackEvent,
    trackPageView,
  };
}
