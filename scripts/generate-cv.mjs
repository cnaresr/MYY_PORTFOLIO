/**
 * One-off CV generator — writes a formal, print-ready PDF straight from the
 * site content store (content/profile.json + skills.json + projects.json +
 * certificates.json + about-me.json).
 *
 * Adheres to standard software engineering / architect CV guidelines:
 * - Professional contact header & clear title
 * - Technical summary (objective, factual, no proverbs/fluff)
 * - Categorized technical skills (Languages, Frameworks, Systems/Infra)
 * - Featured engineering projects with architectural specs & metrics
 * - Verified certifications & credentials
 * - Education
 * - Spacious vertical rhythm that is relaxed and comfortable for HR readers
 *
 * Usage: node scripts/generate-cv.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(readFileSync(resolve(root, p), 'utf8'));

const profile = read('content/profile.json');
const skills = read('content/skills.json');
const projects = read('content/projects.json');
const certs = read('content/certificates.json');

/* ---------- page geometry (A4 portrait, 72dpi units) ---------- */
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 42; // Generous margins (no cramped edges)
const CONTENT_W = PAGE_W - MARGIN * 2;

/* ---------- colour palette ---------- */
const INK = '0.06 0.09 0.16'; // Deep slate-950
const MUTED = '0.34 0.38 0.44'; // Refined secondary slate
const RULE = '0.80 0.83 0.86'; // Clean hairline rule

/* ---------- PDF string escaping ---------- */
const esc = (s) =>
  String(s)
    .replace(/[—–]/g, ' - ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    // PDF text strings are byte-oriented; strip anything outside Latin-1.
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '');

/* Width of Helvetica text, used for wrapping and right-alignment. */
const HELV = {
  ' ': 278, '!': 278, '"': 355, '#': 556, $: 556, '%': 889, '&': 667, "'": 191,
  '(': 333, ')': 333, '*': 389, '+': 584, ',': 278, '-': 333, '.': 278, '/': 278,
  0: 556, 1: 556, 2: 556, 3: 556, 4: 556, 5: 556, 6: 556, 7: 556, 8: 556, 9: 556,
  ':': 278, ';': 278, '<': 584, '=': 584, '>': 584, '?': 556, '@': 1015,
  A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 500,
  K: 667, L: 556, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611,
  U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  '[': 278, ']': 278, '^': 469, _: 556, '`': 333,
  a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556, i: 222, j: 222,
  k: 500, l: 222, m: 833, n: 556, o: 556, p: 556, q: 556, r: 333, s: 500, t: 278,
  u: 556, v: 500, w: 722, x: 500, y: 500, z: 500,
  '{': 334, '|': 260, '}': 334, '~': 584,
};
const HELV_B = { ...HELV };
Object.assign(HELV_B, {
  ' ': 278, '!': 333, '"': 474, '#': 556, $: 556, '%': 889, '&': 722, "'": 238,
  '(': 333, ')': 333, '*': 389, '+': 584, ',': 278, '-': 333, '.': 278, '/': 278,
  ':': 333, ';': 333, '<': 584, '=': 584, '>': 584, '?': 611, '@': 975,
  A: 722, B: 722, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 556,
  K: 722, L: 611, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611,
  U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  a: 556, b: 611, c: 556, d: 611, e: 556, f: 333, g: 611, h: 611, i: 278, j: 278,
  k: 556, l: 278, m: 889, n: 611, o: 611, p: 611, q: 611, r: 389, s: 556, t: 333,
  u: 611, v: 556, w: 778, x: 556, y: 556, z: 500,
});

const textWidth = (str, size, bold = false) => {
  const table = bold ? HELV_B : HELV;
  let total = 0;
  for (const ch of String(str)) total += table[ch] ?? 556;
  return (total * size) / 1000;
};

/* ---------- content stream builders ---------- */
const pages = [];
let ops = [];
let y = PAGE_H - MARGIN;

const newPage = () => {
  if (ops.length) pages.push(ops.join('\n'));
  ops = [];
  y = PAGE_H - MARGIN;
};

const need = (space) => {
  if (y - space < MARGIN) newPage();
};

const rule = (gapBefore = 10, gapAfter = 8) => {
  need(gapBefore + gapAfter);
  y -= gapBefore;
  ops.push(`${RULE} RG 0.5 w ${MARGIN} ${y.toFixed(2)} m ${(PAGE_W - MARGIN).toFixed(2)} ${y.toFixed(2)} l S`);
  y -= gapAfter;
};

/** Section heading: spacious, clean uppercase title with full-width underline. */
const section = (label) => {
  need(38);
  y -= 26; // Generous space before section heading (~18pt visual gap)
  ops.push(`BT /F2 10 Tf ${INK} rg ${MARGIN} ${y.toFixed(2)} Td (${esc(label)}) Tj ET`);
  y -= 4; // Space between text and rule
  ops.push(`${INK} RG 0.8 w ${MARGIN} ${y.toFixed(2)} m ${(PAGE_W - MARGIN).toFixed(2)} ${y.toFixed(2)} l S`);
  y -= 11; // Space after rule before section content
};

/** Word wrap helper. */
const wrap = (str, size, bold = false, width = CONTENT_W) => {
  const words = String(str).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const probe = line ? `${line} ${w}` : w;
    if (textWidth(probe, size, bold) > width && line) {
      lines.push(line);
      line = w;
    } else {
      line = probe;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
};

const paragraph = (str, { size = 8.8, color = MUTED, leading = 12.5, bold = false, indent = 0 } = {}) => {
  const effW = CONTENT_W - indent;
  for (const line of wrap(str, size, bold, effW)) {
    need(leading);
    y -= leading;
    ops.push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf ${color} rg ${(MARGIN + indent).toFixed(2)} ${y.toFixed(2)} Td (${esc(line)}) Tj ET`);
  }
};

/** Split line: Left text + right aligned text on same baseline. */
const splitLine = (left, right, { size = 9.5, boldLeft = true } = {}) => {
  need(size + 6);
  y -= size + 2;
  ops.push(
    `BT /${boldLeft ? 'F2' : 'F1'} ${size} Tf ${INK} rg ${MARGIN} ${y.toFixed(2)} Td (${esc(left)}) Tj ET`
  );
  if (right) {
    const w = textWidth(right, size - 0.6, false);
    ops.push(
      `BT /F1 ${size - 0.6} Tf ${MUTED} rg ${(PAGE_W - MARGIN - w).toFixed(2)} ${y.toFixed(2)} Td (${esc(right)}) Tj ET`
    );
  }
};

/* ==========================================================================
   DOCUMENT BODY
   ========================================================================== */

// 1. MASTHEAD: Name & Professional Title
need(54);
const fullName = (profile.name || 'Cezar Nareswara Respati')
  .split(' ')
  .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
  .join(' ');

y -= 20;
ops.push(`BT /F2 21 Tf ${INK} rg ${MARGIN} ${y.toFixed(2)} Td (${esc(fullName)}) Tj ET`);

y -= 15;
const titleStr = 'Full-Stack Developer  |  Software & Systems Architect';
ops.push(`BT /F1 10.5 Tf ${MUTED} rg ${MARGIN} ${y.toFixed(2)} Td (${esc(titleStr)}) Tj ET`);

// Contact Bar
y -= 13;
const contactParts = [
  profile.email || 'cezar.nares@gmail.com',
  'Semarang, Indonesia',
  'github.com/cnaresr',
  'linkedin.com/in/cezar-nareswara-respati-8b8a55327',
];
ops.push(`BT /F1 8.5 Tf ${MUTED} rg ${MARGIN} ${y.toFixed(2)} Td (${esc(contactParts.join('   |   '))}) Tj ET`);

y -= 6;
ops.push(`${INK} RG 1 w ${MARGIN} ${y.toFixed(2)} m ${(PAGE_W - MARGIN).toFixed(2)} ${y.toFixed(2)} l S`);
y -= 2;

// 2. PROFESSIONAL SUMMARY (Objective, technical, no proverbs)
section('PROFESSIONAL SUMMARY');
const summaryText =
  'Full-Stack Developer and Software Architect specializing in high-performance backend systems, distributed architectures, and database engineering. Experienced in architecting low-latency microservices, real-time event streaming pipelines, and type-safe web applications using TypeScript, Rust, Node.js, and SQL/NoSQL databases. Passionate about system reliability, edge computing, and clean software architecture.';
paragraph(summaryText, { size: 8.8, leading: 12.4 });
y -= 5;

// 3. TECHNICAL COMPETENCIES
section('TECHNICAL COMPETENCIES');
const langList = (skills.languages || []).map((s) => s.name).join(', ') || 'TypeScript, Rust, Go, Python, C++, SQL & PostgreSQL';
const fwList = (skills.frameworks || []).map((s) => s.name).join(', ') || 'React 19, Astro Islands, Next.js, Node.js, Vite, Tailwind CSS';

const skillCategories = [
  {
    category: 'Languages & Core:',
    items: langList,
  },
  {
    category: 'Frameworks & Runtimes:',
    items: fwList,
  },
  {
    category: 'Systems & Infrastructure:',
    items: 'PostgreSQL (Citus / Pgpool), Redis Sentinel, Apache Kafka, Docker, Kubernetes, Cloudflare Edge, WebRTC, Wasm',
  },
];

for (const sc of skillCategories) {
  need(16);
  y -= 14;
  ops.push(`BT /F2 8.7 Tf ${INK} rg ${MARGIN} ${y.toFixed(2)} Td (${esc(sc.category)}) Tj ET`);
  const catWidth = textWidth(sc.category, 8.7, true) + 6;
  ops.push(`BT /F1 8.7 Tf ${MUTED} rg ${(MARGIN + catWidth).toFixed(2)} ${y.toFixed(2)} Td (${esc(sc.items)}) Tj ET`);
}
y -= 5;

// 4. FEATURED ENGINEERING PROJECTS
section('FEATURED ENGINEERING PROJECTS');
const fmtRange = (start, end) => {
  const pretty = (v) => {
    if (!v) return 'Present';
    const m = /^(\d{4})-(\d{2})$/.exec(v);
    if (!m) return v;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[Number(m[2]) - 1]} ${m[1]}`;
  };
  return `${pretty(start)} - ${pretty(end)}`;
};

for (const p of projects) {
  const tech = (p.technologies || []).join(' · ');
  splitLine(p.title, fmtRange(p.startDate, p.endDate), { size: 9.6 });

  if (tech) {
    need(12);
    y -= 11;
    ops.push(`BT /F2 8.1 Tf ${INK} rg ${(MARGIN + 8).toFixed(2)} ${y.toFixed(2)} Td (Tech: ${esc(tech)}) Tj ET`);
  }

  y -= 2;
  // Bullet 1: Description
  paragraph(`-  ${p.description}`, { size: 8.5, leading: 11.4, indent: 8 });

  // Bullet 2: Architecture spec
  if (p.abstract) {
    paragraph(`-  Architecture: ${p.abstract}`, { size: 8.2, leading: 11.0, indent: 8, color: MUTED });
  }

  y -= 8; // Spacious separation between projects
}

// 5. CERTIFICATIONS & CREDENTIALS
section('CERTIFICATIONS & CREDENTIALS');
for (const c of certs) {
  const rightMeta = `${c.issuer}   |   ${c.validityLabel}: ${c.validityValue}`;
  splitLine(c.title, rightMeta, { size: 9.0 });
  y -= 4; // Clean breathing space per credential
}

// 6. EDUCATION
section('EDUCATION');
splitLine('Politeknik Negeri Semarang (POLINES)', 'Semarang, Indonesia', { size: 9.3 });
need(14);
y -= 12;
ops.push(
  `BT /F1 8.6 Tf ${MUTED} rg ${(MARGIN + 8).toFixed(2)} ${y.toFixed(2)} Td (Diploma Degree in Informatics / Computer Engineering) Tj ET`
);

// Footer verification rule
rule(18, 6);
paragraph(
  `Portfolio & verified dossier: https://github.com/cnaresr   |   Generated from verified platform repository`,
  { size: 7.6, leading: 9.6 }
);

if (ops.length) pages.push(ops.join('\n'));

/* ---------- assemble the PDF ---------- */
const objects = [];
const push = (body) => {
  objects.push(body);
  return objects.length; // 1-based object number
};

// Reserve: 1 = Catalog, 2 = Pages, 3 = F1, 4 = F2
const catalogNum = push('');
const pagesNum = push('');
const f1Num = push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
const f2Num = push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');

const pageNums = [];
for (const stream of pages) {
  const contentNum = push(`<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}\nendstream`);
  const pageNum = push(
    `<< /Type /Page /Parent ${pagesNum} 0 R /MediaBox [0 0 ${PAGE_W.toFixed(2)} ${PAGE_H.toFixed(2)}] ` +
      `/Resources << /Font << /F1 ${f1Num} 0 R /F2 ${f2Num} 0 R >> >> /Contents ${contentNum} 0 R >>`
  );
  pageNums.push(pageNum);
}

objects[catalogNum - 1] = `<< /Type /Catalog /Pages ${pagesNum} 0 R >>`;
objects[pagesNum - 1] =
  `<< /Type /Pages /Count ${pageNums.length} /Kids [${pageNums.map((n) => `${n} 0 R`).join(' ')}] >>`;

let pdf = '%PDF-1.4\n';
const offsets = [];
for (let i = 0; i < objects.length; i += 1) {
  offsets.push(Buffer.byteLength(pdf, 'latin1'));
  pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
}
const xrefPos = Buffer.byteLength(pdf, 'latin1');
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (const off of offsets) pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogNum} 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;

const outPath = resolve(root, 'public', profile.cvPdf.replace(/^\//, ''));
writeFileSync(outPath, Buffer.from(pdf, 'latin1'));
console.log(`Wrote ${outPath} (${pages.length} page(s), ${Buffer.byteLength(pdf, 'latin1')} bytes)`);
