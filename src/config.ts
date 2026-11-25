/**
 * Centralized portfolio configuration & single source of truth.
 * All mutable site identity, theme accent, availability, social/contact links,
 * testimonials, and service packages live here.
 */

export interface IdentityConfig {
  /** Full display name shown in metadata, hero, and footer copyright. */
  name: string;
  /** Short monogram shown on the back of the hero portrait card and brand mark. */
  initials: string;
  /** Primary professional role/title shown in profile badges and metadata. */
  role: string;
  /** Uppercase hero display headline. */
  title: string;
  /** Short tagline rendered in page `<title>` and portrait card back. */
  subtitle: string;
  /** Concise bio used for meta description and hero card back. */
  summary: string;
  /** Primary contact email address. */
  email: string;
  /** Country displayed in location/profile metadata. */
  country: string;
  /** Home city/region displayed in contact/location info. */
  homeAddress: string;
  /** Optional office address (leave empty string if remote/unspecified). */
  officeAddress: string;
  /** Path or URL to the hero portrait and Open Graph image. */
  avatar: string;
  /** Path or URL to the downloadable CV PDF (empty string hides the "See CV" button). */
  cvPdf: string;
}

export interface AvailabilityConfig {
  /** Whether you are currently accepting new projects (controls status dot color & label). */
  open: boolean;
  /** Badge text displayed when `open` is true. */
  label: string;
  /** Badge text displayed when `open` is false. */
  closedLabel: string;
}

export interface LinksConfig {
  /** Direct WhatsApp chat URL (e.g. "https://wa.me/628xxxxxxxxxx"); empty hides WhatsApp CTA. */
  whatsapp: string;
  /** Full LinkedIn profile URL. */
  linkedin: string;
  /** Contact email address used for `mailto:` links in the hire modal and footer. */
  email: string;
  /** Full GitHub profile URL. */
  github: string;
  /** Full Instagram profile URL. */
  instagram: string;
}

export interface TestimonialItem {
  /** Unique identifier for list rendering. */
  id: string;
  /** Client quote text. */
  quote: string;
  /** Client full name. */
  author: string;
  /** Client job title or role. */
  role: string;
  /** Optional client company or organization name. */
  company?: string;
}

export interface ServicePackage {
  /** Unique slug identifier for the service package. */
  id: string;
  /** Display title of the service card. */
  name: string;
  /** Starting price in IDR, or null when pricing depends on scope. */
  price: number | null;
  /** Fallback text rendered when `price` is null. */
  customPriceLabel: string;
  /** Short one-sentence description of the package outcome. */
  summary: string;
  /** Bullet list of included deliverables. */
  features: string[];
  /** Button label on the service card CTA. */
  ctaLabel: string;
}

export interface SiteConversionConfig {
  /** Primary brand accent hex color; drives `--site-accent` across the entire site. */
  accent: string;
  /** Core personal identity & metadata defaults. */
  identity: IdentityConfig;
  /** Project availability indicator shown in the hero. */
  availability: AvailabilityConfig;
  /** Direct contact and social profile URLs. */
  links: LinksConfig;
  /** Client testimonials; when empty, the Testimonials section renders nothing. */
  testimonials: TestimonialItem[];
  /** Service packages; when empty, the Services section renders nothing. */
  services: ServicePackage[];
}

export const portfolioConfig: SiteConversionConfig = {
  // Drives `--site-accent` across the entire site (buttons, indicators, focus rings).
  accent: "#00bc7d",

  identity: {
    name: "Cezar nareswara respati",
    initials: "CNR",
    role: "Full-Stack Architect",
    title: "CEZAR NARESWARA RESPATI",
    subtitle: "Code with Passion, Build with Purpose",
    summary:
      "Full-Stack Developer & Software Architect based in Indonesia, specializing in high-performance web applications, scalable backend systems, and modern digital platforms.",
    email: "cezar.nares@gmail.com",
    country: "Indonesia",
    homeAddress: "Semarang, Tembalang, Central Java",
    officeAddress: "",
    avatar: "/images/avatar-hero.jpg",
    cvPdf: "/Cezar_Nareswara_Resume.pdf",
  },

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
