import { getAboutMeData } from '../lib/contentStore';

export interface AboutMeData {
  badgeLabel?: string;
  topLabel: string;
  title: string;
  subtitle: string;
  stackLabel?: string;
  stackText: string;
  quote?: string;
  paragraphs: string[];
}

export const defaultAboutMe: AboutMeData = {
  badgeLabel: "ABOUT ME // BACKGROUND",
  topLabel: "BASED IN SEMARANG, TEMBALANG",
  title: "Full-Stack Developer",
  subtitle: "Membuat Website Sesuai Kebutuhan",
  stackLabel: "TECH / STACK HIGHLIGHT",
  stackText: "NODEJS · EXPRESSJS · CSS · HTML",
  quote: "Fokus menciptakan antarmuka yang bersih, responsif, dan fungsional dengan performa yang konsisten.",
  paragraphs: [
    "Hello, my name is Cezar Nareswara Respati. I am a diploma student at a polytechnic in Indonesia. I am a budding full-stack developer who enjoys learning new things, both on and off campus. However, I focus more on backend development than frontend; I have more experience working on backend systems—particularly SQL databases—than on design (simply because I’m not particularly gifted in that area). Like most people, I use AI to assist with projects, assignments, and personal tasks, but I don't just have the AI ​​do the work for me; I ask it to explain concepts so I can learn from them.",
    "Beyond being a full-stack developer, I’m someone who enjoys making friends wherever I go—I’m an easy-going person who adapts well to new environments. My hobbies include gaming (mostly competitive FPS or story-driven titles) and sports, specifically soccer, badminton, and running. If you’re curious about me, scroll down to get in touch."
  ]
};

export function getLiveAboutMe(): AboutMeData {
  const data = getAboutMeData();
  if (!data) return defaultAboutMe;
  return {
    badgeLabel: data.badgeLabel || defaultAboutMe.badgeLabel,
    topLabel: data.topLabel || defaultAboutMe.topLabel,
    title: data.title || defaultAboutMe.title,
    subtitle: data.subtitle || defaultAboutMe.subtitle,
    stackLabel: data.stackLabel || defaultAboutMe.stackLabel,
    stackText: data.stackText || defaultAboutMe.stackText,
    quote: data.quote !== undefined ? data.quote : defaultAboutMe.quote,
    paragraphs: (data.paragraphs && data.paragraphs.length > 0) ? data.paragraphs : defaultAboutMe.paragraphs,
  };
}
