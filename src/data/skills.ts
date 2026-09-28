import { getSkillsData, getTechStackData } from '../lib/contentStore';
import { resolveBrandSlug } from '../lib/techBrands';

export interface SkillItem {
  name: string;
  detail: string;
  proof?: string;
  percentage: number;
  master?: boolean;
  iconSlug?: string;
}

export interface TickerItem {
  name: string;
  type?: string;
  iconSvg?: string;
  iconName?: string;
  iconSlug?: string;
}

const defaultLanguages: SkillItem[] = [
  { name: "TypeScript", detail: "v5.4 • Strict Typing", proof: "Strict-mode islands, typed CMS payloads, zero any in public pages.", percentage: 98, iconSlug: "typescript" },
  { name: "Rust", detail: "Tokio • Wasm • Zero-Copy", proof: "Tokio + Wasm pipelines, zero-copy buffers on hot paths.", percentage: 95, iconSlug: "rust" },
  { name: "Go", detail: "Concurrency • Channels • Microservices", proof: "Channel-based workers for microservice fan-out.", percentage: 92, iconSlug: "go" },
  { name: "Python", detail: "AsyncIO • Data Pipelines", proof: "AsyncIO ETL + PyTorch jobs on scheduled pipelines.", percentage: 90, iconSlug: "python" },
  { name: "C++", detail: "C++20 • Memory Optimization", proof: "C++20 SIMD kernels, tuned allocators on tight loops.", percentage: 88, iconSlug: "cplusplus" },
  { name: "SQL & PostgreSQL", detail: "pgvector • Hypertables • Tuning", proof: "pgvector + hypertables, query plans tuned under load.", percentage: 98, iconSlug: "postgresql" },
];

const defaultFrameworks: SkillItem[] = [
  { name: "Astro Islands", detail: "v5.x • Zero-JS Baseline • SSR", proof: "Zero-JS baseline pages, islands only where interaction lives.", percentage: 98, iconSlug: "astro" },
  { name: "React 19 & Vite", detail: "Concurrent Mode • Sub-10ms INP", proof: "Concurrent islands, INP kept under 10ms on key routes.", percentage: 96, iconSlug: "react" },
  { name: "Next.js App Router", detail: "RSC Streaming • Edge Middleware", proof: "RSC streaming + edge middleware on app-router work.", percentage: 94, iconSlug: "nextdotjs" },
  { name: "Tailwind CSS v4", detail: "Token Engines • CSS Cascades", proof: "Token engines + Lightning CSS, one cascade across themes.", percentage: 96, iconSlug: "tailwindcss" },
  { name: "Node.js LTS", detail: "v22 • Worker Threads • Streams", proof: "Worker threads + streams for CPU-bound admin jobs.", percentage: 92, iconSlug: "nodedotjs" },
  { name: "Cloudflare Edge", detail: "Workers • KV • Sub-1ms Routing", proof: "Workers + KV/D1, sub-ms routing at the edge.", percentage: 95, iconSlug: "cloudflare" },
];

const defaultTicker1: TickerItem[] = [
  { name: "TypeScript 5.4", type: "lang" },
  { name: "Rust 2024", type: "lang" },
  { name: "Go 1.22", type: "lang" },
  { name: "Python 3.12", type: "lang" },
  { name: "C++ 20", type: "lang" },
  { name: "PostgreSQL 16 & pgvector", type: "db" },
  { name: "Bash & POSIX", type: "cli" },
  { name: "GraphQL & gRPC", type: "api" },
];

const defaultTicker2: TickerItem[] = [
  { name: "Astro 5 Islands", type: "framework" },
  { name: "React 19", type: "framework" },
  { name: "Next.js App Router", type: "framework" },
  { name: "Vite 6 Engine", type: "tool" },
  { name: "Node.js 22 LTS", type: "runtime" },
  { name: "Tailwind CSS v4", type: "styling" },
  { name: "Redis Sentinel & Streams", type: "db" },
  { name: "Docker & Kubernetes", type: "infra" },
];

export function getLiveLanguageSkills(): SkillItem[] {
  try {
    const raw = getSkillsData();
    if (raw && Array.isArray(raw.languages) && raw.languages.length > 0) {
      return raw.languages.map((l: any) => ({
        name: l.name,
        detail: l.detail || '',
        proof: l.proof || '',
        percentage: l.percentage || 80,
        master: l.master === undefined ? (l.percentage || 0) >= 95 : l.master,
        iconSlug: l.iconSlug || resolveBrandSlug(l.name) || undefined,
      }));
    }
  } catch {}
  return defaultLanguages;
}

export function getLiveFrameworkSkills(): SkillItem[] {
  try {
    const raw = getSkillsData();
    if (raw && Array.isArray(raw.frameworks) && raw.frameworks.length > 0) {
      return raw.frameworks.map((f: any) => ({
        name: f.name,
        detail: f.detail || '',
        proof: f.proof || '',
        percentage: f.percentage || 80,
        master: f.master === undefined ? (f.percentage || 0) >= 95 : f.master,
        iconSlug: f.iconSlug || resolveBrandSlug(f.name) || undefined,
      }));
    }
  } catch {}
  return defaultFrameworks;
}

export function getLiveTickerRow1(): TickerItem[] {
  try {
    const stack = getTechStackData();
    if (stack && Array.isArray(stack.track1) && stack.track1.length > 0) {
      return stack.track1
        .filter((b: any) => b.enabled !== false)
        .map((b: any) => ({
          name: b.name,
          type: b.category,
          iconSlug: b.iconSlug || resolveBrandSlug(b.name),
        }));
    }
  } catch {}
  return defaultTicker1;
}

export function getLiveTickerRow2(): TickerItem[] {
  try {
    const stack = getTechStackData();
    if (stack && Array.isArray(stack.track2) && stack.track2.length > 0) {
      return stack.track2
        .filter((b: any) => b.enabled !== false)
        .map((b: any) => ({
          name: b.name,
          type: b.category,
          iconSlug: b.iconSlug || resolveBrandSlug(b.name),
        }));
    }
  } catch {}
  return defaultTicker2;
}

export const languageSkills: SkillItem[] = new Proxy([] as SkillItem[], {
  get: (_, prop: string | symbol) => {
    const list = getLiveLanguageSkills();
    const val = (list as any)[prop];
    return typeof val === 'function' ? val.bind(list) : val;
  },
});

export const frameworkSkills: SkillItem[] = new Proxy([] as SkillItem[], {
  get: (_, prop: string | symbol) => {
    const list = getLiveFrameworkSkills();
    const val = (list as any)[prop];
    return typeof val === 'function' ? val.bind(list) : val;
  },
});

export const tickerRow1: TickerItem[] = new Proxy([] as TickerItem[], {
  get: (_, prop: string | symbol) => {
    const list = getLiveTickerRow1();
    const val = (list as any)[prop];
    return typeof val === 'function' ? val.bind(list) : val;
  },
});

export const tickerRow2: TickerItem[] = new Proxy([] as TickerItem[], {
  get: (_, prop: string | symbol) => {
    const list = getLiveTickerRow2();
    const val = (list as any)[prop];
    return typeof val === 'function' ? val.bind(list) : val;
  },
});
