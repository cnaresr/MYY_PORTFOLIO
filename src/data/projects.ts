import { getProjectsData } from '../lib/contentStore';

function statusLabel(status?: string): string {
  switch (status) {
    case 'published':
      return 'PROD // SHIPPED';
    case 'inprogress':
      return 'IN PROGRESS // ACTIVE';
    case 'draft':
      return 'DRAFT // STAGING';
    default:
      return String(status || 'DRAFT').toUpperCase();
  }
}

function defaultMetricsFor(_title?: string): Metric[] {
  return [
    { label: 'Availability', value: '99.99%' },
    { label: 'Latency P99', value: '< 5ms' },
    { label: 'Scaling', value: 'Horizontal' },
  ];
}

export interface Metric {
  label: string;
  value: string;
}

export interface Project {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  image: string;
  abstract: string;
  metrics?: Metric[];
}

const defaultProjects: Project[] = [
  {
    id: "veloce",
    status: "PROD // SHIPPED",
    startDate: "Q1 2023",
    endDate: "Q3 2024",
    title: "Veloce Query Fabric",
    description:
      "Distributed telemetry aggregator and sharded PostgreSQL cluster fabric with live partition rebalancing.",
    technologies: ["PostgreSQL", "Rust", "Kafka", "Docker"],
    githubUrl: "https://github.com",
    image: "/images/project-veloce.jpg",
    abstract:
      "Veloce Architecture Document V2.1 — Citus/Pgpool partition strategies, Rust memory pools, and zero-copy socket IO.",
    metrics: [
      { label: "Ingest Throughput", value: "450k TPS" },
      { label: "Latency P99", value: "< 2ms" },
      { label: "Shard Zones", value: "3-zone" },
    ],
  },
  {
    id: "aetherlog",
    status: "LIVE // STABLE",
    startDate: "Q3 2023",
    endDate: "Q1 2024",
    title: "AetherLog Realtime Analytics",
    description:
      "Astro SSR combined with a Server-Sent Events streaming pipeline with a zero-JS initial baseline.",
    technologies: ["Astro SSR", "SSE Streams", "Cloudflare Workers", "Tailwind"],
    githubUrl: "https://github.com",
    image: "/images/project-aetherlog.jpg",
    abstract:
      "AetherLog Architecture — HTTP/2 SSE streaming engine and zero-hydration Islands fallback.",
    metrics: [
      { label: "Stream Uptime", value: "99.99%" },
      { label: "Event Latency", value: "< 90ms" },
      { label: "JS Overhead", value: "0 + 0" },
    ],
  },
  {
    id: "hyperion",
    status: "PROD // ACTIVE",
    startDate: "Q1 2023",
    endDate: "Q4 2023",
    title: "Hyperion Design System Engine",
    description:
      "AST-driven design token compiler written in Rust and executed in WebAssembly across React and Vite ecosystems.",
    technologies: ["Rust / Wasm", "Vite Plugin", "React", "TypeScript AST"],
    githubUrl: "https://github.com",
    image: "/images/project-hyperion.jpg",
    abstract:
      "Hyperion Architecture — AST token graph resolution, CSS variable emission trees, and WebAssembly memory sharing.",
    metrics: [
      { label: "Token Resolve", value: "< 1ms" },
      { label: "Build Delta", value: "-38%" },
      { label: "Module Shrink", value: "2.1×" },
    ],
  },
];

export function getLiveProjects(): Project[] {
  try {
    const raw = getProjectsData();
    if (!Array.isArray(raw) || raw.length === 0) return defaultProjects;
    return raw
      .filter((p: any) => p.status !== 'archived')
      .map((p: any) => ({
        id: p.id || 'project',
        status: statusLabel(p.status),
        startDate: p.startDate || '2024',
        endDate: p.endDate || '2024',
        title: p.title || 'System Architecture',
        description: p.description || '',
        technologies: p.technologies || ['TypeScript', 'Astro'],
        githubUrl: p.githubUrl || 'https://github.com',
        image: p.image || p.telemetryImage || '/images/project-veloce.jpg',
        abstract: p.abstract || p.spec?.abstract || p.description || '',
        metrics: p.metrics || defaultMetricsFor(p.title),
      }));
  } catch {
    return defaultProjects;
  }
}

export const projects: Project[] = new Proxy([] as Project[], {
  get: (_, prop: string | symbol) => {
    const list = getLiveProjects();
    const val = (list as any)[prop];
    if (typeof val === 'function') {
      return val.bind(list);
    }
    return val;
  },
});