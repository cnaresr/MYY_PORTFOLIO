// Local brand-logo registry backed by the bundled `simple-icons` package.
// Icons render as inline SVG at runtime — no CDN, works offline, no broken images.
// src: https://simpleicons.org/ (open source, CC0 / various brand licenses).

import {
  siTypescript, siJavascript, siRust, siGo, siPython, siCplusplus, siC, siGnubash,
  siPostgresql, siMysql, siMongodb, siSqlite, siRedis, siGraphql, siApachekafka,
  siAstro, siReact, siNextdotjs, siVite, siNodedotjs, siTailwindcss, siSvelte,
  siVuedotjs, siAngular, siDocker, siKubernetes, siGooglecloud, siCloudflare,
  siVercel, siNestjs, siExpress, siWebpack, siEslint, siPrettier, siElectron,
  siDjango, siFlask, siFastapi, siSpring, siLaravel, siRuby, siPhp, siSwift,
  siKotlin, siDart, siFlutter, siTerraform, siAnsible, siJenkins, siGithub,
  siGitlab, siGit, siNpm, siYarn, siPnpm, siJest, siVitest, siCypress, siFigma,
} from 'simple-icons';

export interface BrandLogo {
  slug: string;
  label: string;
}

// Curated picklist shown in the admin logo dropdown, covering common tech.
// Slug = simple-icons key in kebab/lowercase ("nextdotjs" -> siNextdotjs).
export const BRAND_LOGO_OPTIONS: BrandLogo[] = [
  { slug: 'typescript', label: 'TypeScript' },
  { slug: 'javascript', label: 'JavaScript' },
  { slug: 'rust', label: 'Rust' },
  { slug: 'go', label: 'Go' },
  { slug: 'python', label: 'Python' },
  { slug: 'cplusplus', label: 'C++' },
  { slug: 'c', label: 'C' },
  { slug: 'gnubash', label: 'Bash' },
  { slug: 'postgresql', label: 'PostgreSQL' },
  { slug: 'mysql', label: 'MySQL' },
  { slug: 'mongodb', label: 'MongoDB' },
  { slug: 'sqlite', label: 'SQLite' },
  { slug: 'redis', label: 'Redis' },
  { slug: 'graphql', label: 'GraphQL' },
  { slug: 'apachekafka', label: 'Kafka' },
  { slug: 'astro', label: 'Astro' },
  { slug: 'react', label: 'React' },
  { slug: 'nextdotjs', label: 'Next.js' },
  { slug: 'vite', label: 'Vite' },
  { slug: 'nodedotjs', label: 'Node.js' },
  { slug: 'tailwindcss', label: 'Tailwind CSS' },
  { slug: 'svelte', label: 'Svelte' },
  { slug: 'vuedotjs', label: 'Vue.js' },
  { slug: 'angular', label: 'Angular' },
  { slug: 'docker', label: 'Docker' },
  { slug: 'kubernetes', label: 'Kubernetes' },
  { slug: 'googlecloud', label: 'Google Cloud' },
  { slug: 'cloudflare', label: 'Cloudflare' },
  { slug: 'vercel', label: 'Vercel' },
  { slug: 'nestjs', label: 'NestJS' },
  { slug: 'express', label: 'Express' },
  { slug: 'webpack', label: 'Webpack' },
  { slug: 'eslint', label: 'ESLint' },
  { slug: 'prettier', label: 'Prettier' },
  { slug: 'electron', label: 'Electron' },
  { slug: 'django', label: 'Django' },
  { slug: 'flask', label: 'Flask' },
  { slug: 'fastapi', label: 'FastAPI' },
  { slug: 'spring', label: 'Spring' },
  { slug: 'laravel', label: 'Laravel' },
  { slug: 'ruby', label: 'Ruby' },
  { slug: 'php', label: 'PHP' },
  { slug: 'swift', label: 'Swift' },
  { slug: 'kotlin', label: 'Kotlin' },
  { slug: 'dart', label: 'Dart' },
  { slug: 'flutter', label: 'Flutter' },
  { slug: 'terraform', label: 'Terraform' },
  { slug: 'ansible', label: 'Ansible' },
  { slug: 'jenkins', label: 'Jenkins' },
  { slug: 'github', label: 'GitHub' },
  { slug: 'gitlab', label: 'GitLab' },
  { slug: 'git', label: 'Git' },
  { slug: 'npm', label: 'npm' },
  { slug: 'yarn', label: 'Yarn' },
  { slug: 'pnpm', label: 'pnpm' },
  { slug: 'jest', label: 'Jest' },
  { slug: 'vitest', label: 'Vitest' },
  { slug: 'cypress', label: 'Cypress' },
  { slug: 'figma', label: 'Figma' },
];

// Explicit icon registry — tree-shakeable, only the icons used by the site
// get bundled (~tens of icons instead of all ~3.5k from the package).
const registry: Record<string, SimpleIcon> = Object.assign(Object.create(null), {
  typescript: siTypescript,
  javascript: siJavascript,
  rust: siRust,
  go: siGo,
  python: siPython,
  cplusplus: siCplusplus,
  c: siC,
  gnubash: siGnubash,
  postgresql: siPostgresql,
  mysql: siMysql,
  mongodb: siMongodb,
  sqlite: siSqlite,
  redis: siRedis,
  graphql: siGraphql,
  apachekafka: siApachekafka,
  astro: siAstro,
  react: siReact,
  nextdotjs: siNextdotjs,
  vite: siVite,
  nodedotjs: siNodedotjs,
  tailwindcss: siTailwindcss,
  svelte: siSvelte,
  vuedotjs: siVuedotjs,
  angular: siAngular,
  docker: siDocker,
  kubernetes: siKubernetes,
  googlecloud: siGooglecloud,
  cloudflare: siCloudflare,
  vercel: siVercel,
  nestjs: siNestjs,
  express: siExpress,
  webpack: siWebpack,
  eslint: siEslint,
  prettier: siPrettier,
  electron: siElectron,
  django: siDjango,
  flask: siFlask,
  fastapi: siFastapi,
  spring: siSpring,
  laravel: siLaravel,
  ruby: siRuby,
  php: siPhp,
  swift: siSwift,
  kotlin: siKotlin,
  dart: siDart,
  flutter: siFlutter,
  terraform: siTerraform,
  ansible: siAnsible,
  jenkins: siJenkins,
  github: siGithub,
  gitlab: siGitlab,
  git: siGit,
  npm: siNpm,
  yarn: siYarn,
  pnpm: siPnpm,
  jest: siJest,
  vitest: siVitest,
  cypress: siCypress,
  figma: siFigma,
});

interface SimpleIcon {
  title: string;
  slug: string;
  hex: string;
  path: string;
}

export interface BrandIconData {
  title: string;
  path: string;
  hex: string;
}

const SLUG_ALIASES: Record<string, string> = {
  bash: 'gnubash',
  gnubash: 'gnubash',
  posix: 'gnubash',
  vitedotjs: 'vite',
  vitejs: 'vite',
  nextjs: 'nextdotjs',
  next: 'nextdotjs',
  nodejs: 'nodedotjs',
  node: 'nodedotjs',
  vue: 'vuedotjs',
  vuejs: 'vuedotjs',
  k8s: 'kubernetes',
  cpp: 'cplusplus',
  cplusplus: 'cplusplus',
  ts: 'typescript',
  js: 'javascript',
  postgres: 'postgresql',
  postgresql: 'postgresql',
  aws: 'amazonwebservices',
  amazonaws: 'amazonwebservices',
};

function normalizeSlug(slug: string): string {
  return slug.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Look up the bundled SVG path data for a slug, or null when unknown. */
export function getBrandIcon(slug?: string | null): BrandIconData | null {
  if (!slug) return null;
  const key = normalizeSlug(slug);
  const canonical = SLUG_ALIASES[key] ?? key;
  const icon = registry[canonical];
  if (!icon) return null;
  return { title: icon.title, path: icon.path, hex: icon.hex };
}

// Best-effort slug lookup from a free-form tech/display name (name may include
// versions, e.g. "TypeScript 5.4", "Docker & K8s"). Falls back to null.
export function resolveBrandSlug(name?: string): string | null {
  if (!name) return null;
  const s = name.toLowerCase().trim();

  const rules: Array<[RegExp, string]> = [
    [/typescript/, 'typescript'],
    [/javascript/, 'javascript'],
    [/\brust\b/, 'rust'],
    [/^go\b|\bgo\b/, 'go'],
    [/python/, 'python'],
    [/c\+\+/, 'cplusplus'],
    [/postgres|pgvector/, 'postgresql'],
    [/mysql/, 'mysql'],
    [/mongo/, 'mongodb'],
    [/sqlite/, 'sqlite'],
    [/redis/, 'redis'],
    [/graphql/, 'graphql'],
    [/grpc/, 'graphql'],
    [/kafka/, 'apachekafka'],
    [/astro/, 'astro'],
    [/react/, 'react'],
    [/next\.js|nextjs/, 'nextdotjs'],
    [/^vite\b|vite\b/, 'vite'],
    [/node\.js|\bnode\b/, 'nodedotjs'],
    [/tailwind/, 'tailwindcss'],
    [/svelte/, 'svelte'],
    [/\bvue\b/, 'vuedotjs'],
    [/angular/, 'angular'],
    [/docker/, 'docker'],
    [/kubernetes|k8s/, 'kubernetes'],
    [/gcp|google cloud/, 'googlecloud'],
    [/cloudflare/, 'cloudflare'],
    [/vercel/, 'vercel'],
    [/nest/, 'nestjs'],
    [/express/, 'express'],
    [/webpack/, 'webpack'],
    [/eslint/, 'eslint'],
    [/prettier/, 'prettier'],
    [/django/, 'django'],
    [/flask/, 'flask'],
    [/fastapi/, 'fastapi'],
    [/spring/, 'spring'],
    [/laravel/, 'laravel'],
    [/ruby/, 'ruby'],
    [/\bphp\b/, 'php'],
    [/swift/, 'swift'],
    [/kotlin/, 'kotlin'],
    [/dart/, 'dart'],
    [/flutter/, 'flutter'],
    [/terraform/, 'terraform'],
    [/ansible/, 'ansible'],
    [/jenkins/, 'jenkins'],
    [/github/, 'github'],
    [/gitlab/, 'gitlab'],
    [/^git\b|\bgit\b/, 'git'],
    [/bash|posix/, 'gnubash'],
  ];

  for (const [re, slug] of rules) {
    if (re.test(s)) return slug;
  }
  return null;
}
