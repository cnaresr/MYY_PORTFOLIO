/**
 * Centralized portfolio conversion & business configuration.
 * All mutable conversion values (availability, social/contact links,
 * testimonials, and service packages) live here.
 */

export interface AvailabilityConfig {
  open: boolean;
  label: string;
  closedLabel: string;
}

export interface LinksConfig {
  whatsapp: string;
  linkedin: string;
  email: string;
  github: string;
  instagram: string;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  company?: string;
}

export interface ServicePackage {
  id: string;
  name: string;
  /** Starting price in IDR, or null when pricing depends on scope. */
  price: number | null;
  /** Fallback text rendered when `price` is null. */
  customPriceLabel: string;
  summary: string;
  features: string[];
  ctaLabel: string;
}

export interface SiteConversionConfig {
  availability: AvailabilityConfig;
  links: LinksConfig;
  testimonials: TestimonialItem[];
  services: ServicePackage[];
}

export const portfolioConfig: SiteConversionConfig = {
  availability: {
    open: true,
    label: "Open for projects",
    closedLabel: "Currently unavailable",
  },

  links: {
    // TODO: Fill in your WhatsApp direct link (e.g. "https://wa.me/628xxxxxxxxxx")
    whatsapp: "",
    linkedin: "https://www.linkedin.com/in/cezar-nareswara-respati-8b8a55327/",
    email: "cezar.nares@gmail.com",
    github: "https://github.com/cnaresr",
    instagram: "https://www.instagram.com/czr_nr/",
  },

  // TODO: Add real, verified client testimonials here.
  // While this array is empty, the Testimonials block renders nothing (no empty wrapper).
  testimonials: [],

  services: [
    {
      id: "landing-page",
      name: "Landing Page",
      price: 500000,
      customPriceLabel: "Pricing tailored to requirements",
      summary: "Fast, conversion-focused web presence built to turn visitors into inquiries.",
      features: [
        "Responsive layout crafted for mobile and desktop visitors",
        "Fast page loads with clean SEO and metadata structure",
        "Clear call-to-action flow connected to your contact channel",
        "Ready to deploy with source code and handover guide",
      ],
      ctaLabel: "Discuss via WhatsApp",
    },
    {
      id: "wa-telegram-bot",
      name: "WhatsApp / Telegram Bot",
      // TODO: Set starting price in IDR when fixed pricing is ready
      price: null,
      customPriceLabel: "Pricing tailored to requirements",
      summary: "Automated messaging workflows that answer customers and capture leads 24/7.",
      features: [
        "Instant automated replies for FAQs, orders, or bookings",
        "Webhook integration with spreadsheets, APIs, or databases",
        "Admin notifications so urgent requests never slip through",
        "Reliable error handling and deployment documentation",
      ],
      ctaLabel: "Discuss via WhatsApp",
    },
    {
      id: "automation-script",
      name: "Automation Script",
      // TODO: Set starting price in IDR when fixed pricing is ready
      price: null,
      customPriceLabel: "Pricing tailored to requirements",
      summary: "Custom scripts that eliminate repetitive manual tasks and save weekly hours.",
      features: [
        "Automated data collection, cleaning, and report generation",
        "Scheduled background jobs or one-click CLI execution",
        "Safe logging and retries so workflows stay dependable",
        "Clear setup instructions for your local or server environment",
      ],
      ctaLabel: "Discuss via WhatsApp",
    },
  ],
};

/**
 * Formats an IDR starting price consistently using English copy.
 */
export function formatServicePrice(service: ServicePackage): string {
  if (service.price === null) {
    return service.customPriceLabel;
  }
  const formatted = new Intl.NumberFormat("id-ID").format(service.price);
  return `Starting from Rp${formatted}`;
}
