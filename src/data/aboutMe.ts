import { getAboutMeData } from '../lib/contentStore';

export interface AboutMeData {
  topLabel: string;
  title: string;
  subtitle: string;
  stackText: string;
  paragraphs: string[];
}

export const defaultAboutMe: AboutMeData = {
  topLabel: "BASED IN PROBOLINGGO",
  title: "Frontend Developer",
  subtitle: "Membuat website simpel namun bagus",
  stackText: "NODEJS · SVELTEKIT · CSS · HTML",
  paragraphs: [
    "Halo, aku Aditya Parama Sandya. Aku adalah developer bagian frontend atau lebih tepatnya bagian tampilan websitenya, aku suka mendesain dan menirukan website orang lain sebagai referensi proyek saya untuk kedepannya. Namun selain sebagai developer frontend aku juga ada sedikit skill untuk developer backend di dalam bahasa NodeJS, dan juga aku suka menggunakan Rust namun pada bahasa itu belum aku kuasai secara 100% lalu aku juga bisa menggunakan AI untuk membantu aku dalam membuat suatu proyek yang ingin aku buat.",
    "Hobiku selain coding yaitu bersepeda dan berenang jadi terkadang aku meluangkan waktu saat liburan untuk berenang bersama teman-teman atau bersepeda bersama dan ngopi pagi biar mata melek. Ohh iya aku juga bersekolah di SMA Negeri 1 Dringu Kab. Probolinggo, dan aku mempunyai banyak teman di sana."
  ]
};

export function getLiveAboutMe(): AboutMeData {
  const data = getAboutMeData();
  if (!data) return defaultAboutMe;
  return {
    topLabel: data.topLabel || defaultAboutMe.topLabel,
    title: data.title || defaultAboutMe.title,
    subtitle: data.subtitle || defaultAboutMe.subtitle,
    stackText: data.stackText || defaultAboutMe.stackText,
    paragraphs: (data.paragraphs && data.paragraphs.length > 0) ? data.paragraphs : defaultAboutMe.paragraphs,
  };
}
