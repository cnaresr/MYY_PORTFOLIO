import { getProfileData } from '../lib/contentStore';

export interface SiteConfig {
  name: string;
  initials: string;
  role: string;
  title: string;
  subtitle: string;
  summary: string;
  email: string;
  country: string;
  officeAddress: string;
  homeAddress: string;
  avatar: string;
  cvPdf: string;
  navLinks: { name: string; href: string }[];
  socialLinks: { name: string; href: string; icon: string }[];
}

const defaultSiteConfig: SiteConfig = {
  name: "Cezar nareswara respati",
  initials: "CNR",
  role: "Full-Stack Architect",
  title: "CEZAR NARESWARA RESPATI",
  subtitle: "Code with Passion, Build with Purpose",
  summary:
    "Di mana ada kemauan, di situ ada jalan. Teruslah melangkah, berkarya, dan berinovasi tanpa henti.",
  email: "cezar.nares@gmail.com",
  country: "Indonesia",
  officeAddress: "",
  homeAddress: "",
  avatar: "/images/foto-pp-385190-087084-cropped-119042.png",
  cvPdf: "",
  navLinks: [
    { name: "Overview", href: "#" },
    { name: "About Me", href: "#about" },
    { name: "Skills", href: "#skills" },
    { name: "Projects", href: "#projects" },
    { name: "Certificate", href: "#certificates" },
    { name: "Contact", href: "#contact" },
  ],
  socialLinks: [
    { name: "GitHub", href: "https://github.com", icon: "code" },
    { name: "LinkedIn", href: "https://linkedin.com", icon: "arrow_outward" },
    { name: "X / Twitter", href: "https://x.com", icon: "arrow_outward" },
  ],
};

export function getLiveSiteConfig(): SiteConfig {
  try {
    const profile = getProfileData();
    if (!profile || !profile.name) return defaultSiteConfig;
    return {
      name: profile.name || defaultSiteConfig.name,
      initials: profile.initials || defaultSiteConfig.initials,
      role: profile.role || defaultSiteConfig.role,
      title: profile.title || (profile.name ? profile.name.toUpperCase() : defaultSiteConfig.title),
      subtitle: profile.subtitle || defaultSiteConfig.subtitle,
      summary: profile.summary || defaultSiteConfig.summary,
      email: profile.email || defaultSiteConfig.email,
      country: profile.country || defaultSiteConfig.country,
      officeAddress: (profile as any).officeAddress || defaultSiteConfig.officeAddress,
      homeAddress: (profile as any).homeAddress || defaultSiteConfig.homeAddress,
      avatar: profile.avatar || defaultSiteConfig.avatar,
      cvPdf: profile.cvPdf || defaultSiteConfig.cvPdf,
      navLinks: defaultSiteConfig.navLinks,
      socialLinks: (profile.socialLinks && profile.socialLinks.length > 0)
        ? profile.socialLinks
        : defaultSiteConfig.socialLinks,
    };
  } catch {
    return defaultSiteConfig;
  }
}

export const siteConfig: SiteConfig = new Proxy({} as SiteConfig, {
  get: (_, prop: string | symbol) => {
    const current = getLiveSiteConfig();
    return (current as any)[prop];
  },
});
