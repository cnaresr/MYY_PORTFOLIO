import { getProfileData } from '../lib/contentStore';
import { portfolioConfig } from '../config';

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

const defaultSocialLinks: { name: string; href: string; icon: string }[] = [
  portfolioConfig.links.github
    ? { name: "GitHub", href: portfolioConfig.links.github, icon: "code" }
    : null,
  portfolioConfig.links.linkedin
    ? { name: "LinkedIn", href: portfolioConfig.links.linkedin, icon: "arrow_outward" }
    : null,
  portfolioConfig.links.instagram
    ? { name: "Instagram", href: portfolioConfig.links.instagram, icon: "arrow_outward" }
    : null,
].filter((item): item is { name: string; href: string; icon: string } => Boolean(item));

const defaultSiteConfig: SiteConfig = {
  ...portfolioConfig.identity,
  navLinks: [
    { name: "Overview", href: "#" },
    { name: "About Me", href: "#about" },
    { name: "Projects", href: "#projects" },
    { name: "Certs", href: "#certificates" },
    { name: "Contact", href: "#contact" },
  ],
  socialLinks: defaultSocialLinks,
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
