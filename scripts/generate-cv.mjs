/**
 * One-off CV generator — writes a formal, print-ready PDF straight from the
 * site content store (content/profile.json + skills.json + projects.json +
 * certificates.json), so the downloaded CV never drifts from the live data.
 *
 * No PDF library is installed in this project, so this emits a minimal,
 * spec-valid PDF 1.4 by hand: standard Helvetica base-14 fonts, one content
 * stream per page, and a correct xref table.
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
const MARGIN = 52;
const CONTENT_W = PAGE_W - MARGIN * 2;

/* ---------- colour ---------- */
const INK = '0.06 0.09 0.16'; // slate-950-ish
const MUTED = '0.42 0.45 0.50';
const RULE = '0.85 0.87 0.90';

/* ---------- PDF string escaping ---------- */
const esc = (s) =>
  String(s)
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
// Helvetica-Bold widths differ from regular for these glyphs.
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

const rule = (gapBefore = 6, gapAfter = 10) => {
  need(gapBefore + gapAfter);
  y -= gapBefore;
  ops.push(`${RULE} RG 0.7 w ${MARGIN} ${y.toFixed(2)} m ${(PAGE_W - MARGIN).toFixed(2)} ${y.toFixed(2)} l S`);
  y -= gapAfter;
};

/** Section heading: small caps-ish label with a hairline rule and letter spacing. */
const section = (label) => {
  need(46);
  y -= 8;
  ops.push(`BT /F2 10.5 Tf ${INK} rg ${MARGIN} ${y.toFixed(2)} Td (${esc(label)}) Tj ET`);
  y -= 7;
  ops.push(`${INK} RG 1.1 w ${MARGIN} ${y.toFixed(2)} m ${(MARGIN + 26).toFixed(2)} ${y.toFixed(2)} l S`);
  y -= 12;
};

/** Greedy word wrap to CONTENT_W. */
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

const paragraph = (str, { size = 9.6, color = MUTED, leading = 13 } = {}) => {
  for (const line of wrap(str, size)) {
    need(leading);
    y -= leading;
    ops.push(`BT /F1 ${size} Tf ${color} rg ${MARGIN} ${y.toFixed(2)} Td (${esc(line)}) Tj ET`);
  }
};

/** Left label + right-aligned meta on the same baseline (dates, locations). */
const splitLine = (left, right, { size = 10, boldLeft = true } = {}) => {
  need(size + 6);
  y -= size + 2;
  ops.push(
    `BT /${boldLeft ? 'F2' : 'F1'} ${size} Tf ${INK} rg ${MARGIN} ${y.toFixed(2)} Td (${esc(left)}) Tj ET`
  );
  if (right) {
    const w = textWidth(right, size - 1, false);
    ops.push(
      `BT /F1 ${size - 1} Tf ${MUTED} rg ${(PAGE_W - MARGIN - w).toFixed(2)} ${y.toFixed(2)} Td (${esc(right)}) Tj ET`
    );
  }
};

/** Two-column "Label   values" row used for the skills matrix. */
const twoCol = (leftLabel, leftValue, rightLabel, rightValue) => {
  const size = 9.6;
  need(size + 12);
  y -= size + 4;
  const colW = (CONTENT_W - 24) / 2;
  const rightX = MARGIN + colW + 24;
  ops.push(`BT /F2 ${size} Tf ${INK} rg ${MARGIN} ${y.toFixed(2)} Td (${esc(leftLabel)}) Tj ET`);
  ops.push(`BT /F1 ${size} Tf ${MUTED} rg ${(MARGIN + textWidth(leftLabel, size, true) + 8).toFixed(2)} ${y.toFixed(2)} Td (${esc(leftValue)}) Tj ET`);
  if (rightLabel) {
    ops.push(`BT /F2 ${size} Tf ${INK} rg ${rightX.toFixed(2)} ${y.toFixed(2)} Td (${esc(rightLabel)}) Tj ET`);
    ops.push(`BT /F1 ${size} Tf ${MUTED} rg ${(rightX + textWidth(rightLabel, size, true) + 8).toFixed(2)} ${y.toFixed(2)} Td (${esc(rightValue)}) Tj ET`);
  }
};

/* ---------- document body ---------- */
// Masthead
ops.push(`BT /F2 22 Tf ${INK} rg ${MARGIN} ${(y - 24).toFixed(2)} Td (${esc(profile.name)}) Tj ET`);
y -= 24;
ops.push(`BT /F1 11.5 Tf ${MUTED} rg ${MARGIN} ${(y - 18).toFixed(2)} Td (${esc(profile.subtitle || profile.role)}) Tj ET`);
y -= 18;

const contactBits = [
  profile.email,
  profile.timezone || profile.country,
  ...(profile.socialLinks || []).map((s) => String(s.href).replace(/^https?:\/\/(www\.)?/, '')),
].filter(Boolean);
for (const line of wrap(contactBits.join('   |   '), 8.8)) {
  y -= 12;
  ops.push(`BT /F1 8.8 Tf ${MUTED} rg ${MARGIN} ${y.toFixed(2)} Td (${esc(line)}) Tj ET`);
}
y -= 6;
ops.push(`${INK} RG 1.2 w ${MARGIN} ${y.toFixed(2)} m ${(PAGE_W - MARGIN).toFixed(2)} ${y.toFixed(2)} l S`);
y -= 16;

// Profile
section('PROFESSIONAL PROFILE');
paragraph(profile.summary || '');

// Core competencies (from the live skills matrix)
section('CORE COMPETENCIES');
const topLanguages = (skills.languages || [])
  .slice()
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  .map((s) => `${s.name} (${s.percentage}%)`);
const topFrameworks = (skills.frameworks || [])
  .slice()
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  .map((s) => `${s.name} (${s.percentage}%)`);
for (let i = 0; i < Math.max(topLanguages.length, topFrameworks.length); i += 1) {
  twoCol('Language', topLanguages[i] ?? '', 'Framework', topFrameworks[i] ?? '');
}

// Experience
section('PROFESSIONAL EXPERIENCE');
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
  const tech = (p.technologies || []).join(' / ');
  splitLine(p.title, fmtRange(p.startDate, p.endDate));
  if (tech) {
    need(12);
    y -= 12;
    ops.push(`BT /F1 8.8 Tf ${MUTED} rg ${MARGIN} ${y.toFixed(2)} Td (${esc(tech)}) Tj ET`);
  }
  y -= 8;
  paragraph(p.description || '');
  if (p.abstract) {
    y -= 4;
    paragraph(p.abstract, { size: 8.8, leading: 11.5 });
  }
  y -= 10;
}

// Certifications
section('CERTIFICATIONS');
for (const c of certs) {
  const meta = `${c.issuer}  |  Issued ${c.issued}  |  ${c.validityLabel} ${c.validityValue}`;
  splitLine(c.title, c.level);
  need(12);
  y -= 12;
  ops.push(`BT /F1 8.8 Tf ${MUTED} rg ${MARGIN} ${y.toFixed(2)} Td (${esc(meta)}) Tj ET`);
  y -= 9;
}

// Footer note
rule(14, 6);
paragraph(
  `Portfolio and source of truth: this CV is generated from the live content store. Contact ${profile.email} for the full dossier.`,
  { size: 8.4, leading: 11 }
);

if (ops.length) pages.push(ops.join('\n'));

/* ---------- assemble the PDF ---------- */
const objects = [];
const push = (body) => {
  objects.push(body);
  return objects.length; // 1-based object number
};

// Reserve: 1 = Catalog, 2 = Pages, 3 = F1, 4 = F2 (filled after page objects).
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