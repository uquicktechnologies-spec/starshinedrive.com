import { useEffect } from "react";

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
}

const BASE_URL = "https://starshinedrive.com";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`;

export function useSEO({
  title,
  description,
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  noIndex,
}: SEOProps) {
  useEffect(() => {
    // Title
    document.title = title;

    const setMeta = (name: string, content: string, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    // Core meta
    setMeta("description", description);
    if (keywords) setMeta("keywords", keywords);
    setMeta("robots", noIndex ? "noindex, nofollow" : "index, follow");

    // Canonical
    setLink("canonical", canonical ?? (BASE_URL + window.location.pathname));

    // Open Graph
    setMeta("og:title", ogTitle ?? title, "property");
    setMeta("og:description", ogDescription ?? description, "property");
    setMeta("og:image", ogImage ?? DEFAULT_OG_IMAGE, "property");
    setMeta("og:url", BASE_URL + window.location.pathname, "property");
    setMeta("og:type", "website", "property");
    setMeta("og:site_name", "Starshine Drive", "property");

    // Twitter
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", ogTitle ?? title);
    setMeta("twitter:description", ogDescription ?? description);
    setMeta("twitter:image", ogImage ?? DEFAULT_OG_IMAGE);
  }, [title, description, keywords, canonical, ogTitle, ogDescription, ogImage, noIndex]);
}

// ── JSON-LD helpers ──────────────────────────────────────────────────────────

export function injectJSONLD(id: string, data: object) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.setAttribute("type", "application/ld+json");
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function removeJSONLD(id: string) {
  document.getElementById(id)?.remove();
}

// ── Shared structured data ───────────────────────────────────────────────────

export const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${BASE_URL}/#organization`,
  name: "Starshine Drive",
  alternateName: ["星光传动", "Starshine Drives"],
  url: BASE_URL,
  logo: `${BASE_URL}/favicon-icon.png`,
  description:
    "Starshine Drive is a leading gearbox manufacturer and supplier in India, producing industrial gear reducers, worm gearboxes, helical gearboxes, bevel helical gearboxes, geared motors, and power transmission solutions since 1965.",
  foundingDate: "1965",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Ground Floor, Plot No 4, Survey No 251P2, Jetpar Road",
    addressLocality: "Morbi",
    addressRegion: "Gujarat",
    postalCode: "363642",
    addressCountry: "IN",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+91-9925001323",
      contactType: "sales",
      areaServed: ["IN", "WORLDWIDE"],
      availableLanguage: ["English", "Hindi", "Gujarati"],
    },
    {
      "@type": "ContactPoint",
      email: "sales@starshinedrive.com",
      contactType: "customer service",
    },
  ],
  sameAs: [],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Industrial Gearbox & Gear Reducer Catalog",
    itemListElement: [
      "R Series Helical Gear Reducer",
      "F Series Parallel Shaft Helical Gear Reducer",
      "K Series Helical-Bevel Gear Reducer",
      "S Series Helical-Worm Gear Reducer",
      "NMRV Worm Gear Reducer",
      "RV Series Worm Gear Reducer",
      "Compact Geared Motors",
      "SCK Helical-Hypoid Gear Unit",
      "Planetary Gearbox",
      "Cycloidal Gear Reducer",
    ],
  },
};

export const LOCAL_BUSINESS_LD = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${BASE_URL}/#localbusiness`,
  name: "Starshine Drive – Gearbox Manufacturer India",
  image: `${BASE_URL}/og-image.jpg`,
  url: BASE_URL,
  telephone: "+91-9925001323",
  email: "sales@starshinedrive.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Ground Floor, Plot No 4, Survey No 251P2, Jetpar Road",
    addressLocality: "Morbi",
    addressRegion: "Gujarat",
    postalCode: "363642",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 22.8173,
    longitude: 70.8378,
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "09:00",
    closes: "18:00",
  },
  priceRange: "$$",
  currenciesAccepted: "INR, USD, EUR",
  paymentAccepted: "Bank Transfer, LC",
  areaServed: "Worldwide",
};
