/**
 * Dynamic CV PDF generator — writes a formal, print-ready PDF straight from the
 * site content store (content/profile.json + skills.json + projects.json +
 * certificates.json + about-me.json).
 *
 * Ensures all CV information and metrics perfectly match the live portfolio data.
 *
 * Usage: node scripts/generate-cv.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const safeRead = (p, fallback = {}) => {
  try {
    return JSON.parse(readFileSync(resolve(root, p), 'utf8'));
  } catch {
    return fallback;
  }
};

export function generateCvPdf() {
  const profile = safeRead('content/profile.json', {});
  const skills = safeRead('content/skills.json', { languages: [], frameworks: [] });
  const projects = safeRead('content/projects.json', []);
  const certs = safeRead('content/certificates.json', []);
  const aboutMe = safeRead('content/about-me.json', {});

  /* ---------- page geometry (A4 portrait, 72dpi units) ---------- */
  const PAGE_W = 595.28;
  const PAGE_H = 841.89;
  const MARGIN = 40;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  /* ---------- colour palette ---------- */
  const INK = '0.06 0.09 0.16'; // Deep slate-950
  const MUTED = '0.34 0.38 0.44'; // Refined secondary slate
  const RULE = '0.80 0.83 0.86'; // Clean hairline rule

  /* ---------- PDF string escaping ---------- */
  const esc = (s) =>
    String(s ?? '')
      .replace(/[—–]/g, ' - ')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/[^\x20-\x7E\xA0-\xFF]/g, '');

  /* Width of Helvetica text */
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
    for (const ch of String(str ?? '')) total += table[ch] ?? 556;
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

  /** Section heading */
  const section = (label) => {
    need(34);
    y -= 22;
    ops.push(`BT /F2 10 Tf ${INK} rg ${MARGIN} ${y.toFixed(2)} Td (${esc(label)}) Tj ET`);
    y -= 4;
    ops.push(`${INK} RG 0.8 w ${MARGIN} ${y.toFixed(2)} m ${(PAGE_W - MARGIN).toFixed(2)} ${y.toFixed(2)} l S`);
    y -= 10;
  };

  /** Word wrap helper */
  const wrap = (str, size, bold = false, width = CONTENT_W) => {
    const words = String(str ?? '').split(/\s+/).filter(Boolean);
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

  const paragraph = (str, { size = 8.8, color = MUTED, leading = 12.2, bold = false, indent = 0 } = {}) => {
    const effW = CONTENT_W - indent;
    for (const line of wrap(str, size, bold, effW)) {
      need(leading);
      y -= leading;
      ops.push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf ${color} rg ${(MARGIN + indent).toFixed(2)} ${y.toFixed(2)} Td (${esc(line)}) Tj ET`);
    }
  };

  /** Split line: Left text + right aligned text on same baseline */
  const splitLine = (left, right, { size = 9.3, boldLeft = true } = {}) => {
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
  ops.push(`BT /F2 20 Tf ${INK} rg ${MARGIN} ${y.toFixed(2)} Td (${esc(fullName)}) Tj ET`);

  y -= 14;
  const roleTitle = profile.role || aboutMe.title || 'Full-Stack Developer';
  const subtitleLine = profile.subtitle ? `  |  ${profile.subtitle}` : '';
  ops.push(`BT /F1 10 Tf ${MUTED} rg ${MARGIN} ${y.toFixed(2)} Td (${esc(`${roleTitle}${subtitleLine}`)}) Tj ET`);

  // Contact Bar
  y -= 13;
  const contactParts = [
    profile.email || 'cezar.nares@gmail.com',
    profile.homeAddress || 'Semarang, Central Java, Indonesia',
    ...(profile.socialLinks || [])
      .filter((s) => s.href && !s.href.includes('instagram'))
      .map((s) => s.href.replace(/^https?:\/\/(www\.)?/, '')),
  ];
  if (!contactParts.some((p) => p.includes('github.com'))) {
    contactParts.push('github.com/cnaresr');
  }
  ops.push(`BT /F1 8.3 Tf ${MUTED} rg ${MARGIN} ${y.toFixed(2)} Td (${esc(contactParts.join('   |   '))}) Tj ET`);

  y -= 6;
  ops.push(`${INK} RG 1 w ${MARGIN} ${y.toFixed(2)} m ${(PAGE_W - MARGIN).toFixed(2)} ${y.toFixed(2)} l S`);
  y -= 2;

  // 2. PROFESSIONAL SUMMARY
  section('PROFESSIONAL SUMMARY');
  const summaryText =
    profile.summary ||
    aboutMe.quote ||
    'Full-Stack Developer specializing in modern web applications, scalable backend systems, responsive user interfaces, and database architectures.';
  paragraph(summaryText, { size: 8.8, leading: 12.2 });
  y -= 4;

  // 3. TECHNICAL COMPETENCIES (Synchronized dynamically with skills.json)
  section('TECHNICAL COMPETENCIES');
  const langList = (skills.languages || []).map((s) => s.name).join(', ');
  const fwList = (skills.frameworks || []).map((s) => s.name).join(', ');

  const skillCategories = [
    ...(langList ? [{ category: 'Languages & Systems:', items: langList }] : []),
    ...(fwList ? [{ category: 'Frameworks & Engines:', items: fwList }] : []),
  ];

  for (const sc of skillCategories) {
    need(16);
    y -= 13;
    ops.push(`BT /F2 8.6 Tf ${INK} rg ${MARGIN} ${y.toFixed(2)} Td (${esc(sc.category)}) Tj ET`);
    const catWidth = textWidth(sc.category, 8.6, true) + 6;
    ops.push(`BT /F1 8.6 Tf ${MUTED} rg ${(MARGIN + catWidth).toFixed(2)} ${y.toFixed(2)} Td (${esc(sc.items)}) Tj ET`);
  }
  y -= 4;

  // 4. FEATURED ENGINEERING PROJECTS (Synchronized dynamically with projects.json)
  section('FEATURED ENGINEERING PROJECTS');
  const fmtRange = (start, end) => {
    const pretty = (v) => {
      if (!v) return '';
      if (v === 'now' || v === 'NOW' || v === 'Present') return 'Present';
      const m = /^(\d{4})-(\d{2})$/.exec(v);
      if (!m) return v;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[Number(m[2]) - 1]} ${m[1]}`;
    };
    const s = pretty(start);
    const e = pretty(end);
    if (s && e) return `${s} - ${e}`;
    return s || e || '';
  };

  const activeProjects = (projects || []).filter((p) => p.status !== 'archived');
  for (const p of activeProjects) {
    const tech = (p.technologies || []).join(' · ');
    splitLine(p.title, fmtRange(p.startDate, p.endDate), { size: 9.3 });

    if (tech) {
      need(12);
      y -= 11;
      ops.push(`BT /F2 8.0 Tf ${INK} rg ${(MARGIN + 8).toFixed(2)} ${y.toFixed(2)} Td (Tech: ${esc(tech)}) Tj ET`);
    }

    y -= 2;
    paragraph(`-  ${p.description}`, { size: 8.4, leading: 11.2, indent: 8 });

    if (p.abstract) {
      paragraph(`-  Architecture: ${p.abstract}`, { size: 8.1, leading: 10.8, indent: 8, color: MUTED });
    }

    if (p.metrics && p.metrics.length > 0) {
      const metricLine = p.metrics.map((m) => `${m.label}: ${m.value}`).join('   |   ');
      paragraph(`-  Metrics: ${metricLine}`, { size: 7.9, leading: 10.5, indent: 8, color: INK });
    }

    y -= 6;
  }

  // 5. CERTIFICATIONS & CREDENTIALS
  if (certs && certs.length > 0) {
    section('CERTIFICATIONS & CREDENTIALS');
    for (const c of certs) {
      const rightMeta = `${c.issuer}   |   ${c.validityLabel}: ${c.validityValue}`;
      splitLine(c.title, rightMeta, { size: 8.8 });
      y -= 3;
    }
  }

  // 6. EDUCATION
  section('EDUCATION');
  splitLine('Politeknik Negeri Semarang (POLINES)', 'Semarang, Indonesia', { size: 9.1 });
  need(14);
  y -= 12;
  ops.push(
    `BT /F1 8.5 Tf ${MUTED} rg ${(MARGIN + 8).toFixed(2)} ${y.toFixed(2)} Td (Diploma Degree in Informatics / Computer Engineering) Tj ET`
  );

  // Footer verification rule
  rule(16, 6);
  paragraph(
    `Verified Dossier: https://github.com/cnaresr   |   Synchronized with live portfolio store`,
    { size: 7.5, leading: 9.5 }
  );

  if (ops.length) pages.push(ops.join('\n'));

  /* ---------- assemble the PDF ---------- */
  const objects = [];
  const push = (body) => {
    objects.push(body);
    return objects.length;
  };

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

  const cvPdfPath = (profile.cvPdf || '/Cezar_Nareswara_Resume.pdf').replace(/^\//, '');
  const outPath = resolve(root, 'public', cvPdfPath);
  writeFileSync(outPath, Buffer.from(pdf, 'latin1'));
  console.log(`Generated ${outPath} (${pages.length} page(s), ${Buffer.byteLength(pdf, 'latin1')} bytes)`);
  return { outPath, pagesCount: pages.length };
}

// Execute directly if run as a script
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateCvPdf();
}
