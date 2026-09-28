# MYY Portfolio — Build, Quality & Compliance Specification

**Purpose:** Agent-ready blueprint for building, reviewing, and improving a professional developer portfolio.
**Stack:** Astro + React + Vite + Tailwind CSS + TypeScript
**Data:** Local files only; no database
**Visual source of truth:** `DESIGN.md`
**Public reference:** `Photo/screen.png`
**Admin references:** `Photo/screen (2).png` through `Photo/screen (5).png`

## 1. How to Use This Specification

Treat this file as an implementation standard and audit checklist. Before changing code, inspect the existing workspace. Do not reinitialize a working Astro project, delete working features, or replace the provided design with a generic template.

Inspect when present:

```text
package.json
astro.config.*
tsconfig.json
src/
public/
content/
Photo/
DESIGN.md
PROJECT_SPEC_AGENT_READY.md
ADMIN_DASHBOARD_SPEC_AGENT_READY.md
```

Preserve all user-provided reference images and existing working functionality.

## 2. Portfolio Goal

Build a professional developer portfolio that quickly communicates:

- identity and role
- software-engineering interests
- skills and technologies
- selected projects
- credentials/certificates
- contact methods
- professional links

Prioritize clarity, visual hierarchy, responsive behavior, accessibility, SEO, performance, maintainability, and easy content updates.

Do not invent achievements, clients, users, performance numbers, awards, production usage, or other unsupported claims.

## 3. Technology Architecture

Use:

```text
Astro
React
Vite (through Astro)
Tailwind CSS
TypeScript
Lucide React
```

Framer Motion is optional and must only be added when genuinely necessary.

### Astro

Astro is the primary framework for routing, page structure, static rendering, layouts, SEO, and static content.

### React

React is only for genuinely interactive UI such as project filtering, dialogs, stateful forms, mobile-menu state, charts, and admin controls.

Do not turn the entire public portfolio into a React SPA.

### Vite

Vite is managed by Astro. Do not install a separate standalone Vite application without a concrete reason.

## 4. Data Architecture — No Database

The portfolio does not require PostgreSQL, MySQL, MongoDB, Prisma, Firebase, Supabase, or another database for normal portfolio content.

Prefer a simple local content source such as:

```text
content/
├── profile.json
├── skills.json
├── tech-stack.json
├── projects.json
├── certificates.json
└── inquiries.json
```

Astro Content Collections may be used when Markdown/content schemas are genuinely useful, but there must be one unambiguous source of truth.

If an admin dashboard exists:

```text
Admin Dashboard
      ↓
Server-side content operation
      ↓
Validated local content
      ↓
Public Portfolio
```

The admin interface and public portfolio must not keep duplicated project/skill/certificate data.

For editable content, support where applicable:

- Create
- Read
- Update
- Delete
- Reorder
- Publish/unpublish

Validate content before writing it. Prevent path traversal and arbitrary filesystem access. Do not expose private files as public assets.

## 5. Public Portfolio Structure

Implement the sections represented by `Photo/screen.png` and the existing project specification.

### Navigation

Responsive navigation with clear active states, keyboard access, appropriate anchors, and mobile behavior. Smooth scrolling may be used but must not be the only navigation method.

### Hero

Clearly communicate:

- who the developer is
- role/focus
- short supporting statement
- useful CTA actions

Typical CTAs:

```text
View Projects
Download CV
Contact Me
```

Only expose CTAs that actually work.

### Skills Matrix

Organize real skills into meaningful groups such as:

```text
Frontend
Backend
Database
DevOps / Tools
```

Do not fabricate skills. Do not present proficiency percentages as objective measurements; if percentages are displayed, treat them as presentation values.

### Projects Showcase

Each project should communicate, where available:

- title
- purpose/problem
- description
- technologies
- role/contribution
- status/result
- repository
- live URL
- image

Project filtering may be a React island and must work without a full page reload.

### Certificates

Show relevant credentials with issuer, date, and real verification links when available. Never fabricate verification URLs.

### Contact

Provide a real email, professional links, or a functional form. Forms need validation, loading, success, error, and accessible labels. Never expose secrets in frontend code.

## 6. Design System

Read `DESIGN.md` before modifying visual styling. It is the single source of truth for colors, typography, spacing, elevation, radius, and component states.

Unless `DESIGN.md` supersedes these values:

```text
Platinum:              #E5E7EB
Pure White:            #FFFFFF
Deep Midnight Navy:   #0A1128
Structural Border:     rgba(10, 17, 40, 0.08)
```

Typography:

```text
Space Grotesk   → headlines and section indexing
Hanken Grotesk  → body and long-form text
JetBrains Mono  → metadata, tags, metrics, technical labels
```

Prefer 1px structural borders and subtle elevation. Avoid heavy blur shadows, excessive glassmorphism, excessive gradients, and unnecessary glowing effects.

Unless `DESIGN.md` says otherwise:

```text
Micro elements → 4px
Cards          → 8px
```

Do not scatter arbitrary visual values when a design token exists.

## 7. Reference Images

The Agent MUST inspect the supplied images before visual implementation or QA.

Public portfolio:

```text
Photo/screen.png
```

Admin dashboard, when present:

```text
Photo/screen (2).png → Inquiries
Photo/screen (3).png → Projects
Photo/screen (4).png → Skills & Tech Stack
Photo/screen (5).png → Overview & Analytics
```

Use references to verify composition, hierarchy, spacing, typography, cards, navigation, density, and responsive intent. Do not replace the intended design with a generic template.

## 8. Responsive Design

Support:

```text
375 × 812
768 × 1024
1280 × 800
1440 × 900
```

Test navigation, Hero, cards, projects, filters, forms, images, typography, footer, and overflow.

Recommended grid targets when consistent with the reference:

```text
Desktop → 12 columns
Tablet  → 8 columns
Mobile  → 4 columns
```

No unintended horizontal scrolling.

## 9. Performance

Follow Astro's zero-JS-by-default philosophy.

Static content should remain Astro-rendered.

Only use React islands where interaction requires them. Do not add `client:load`, `client:visible`, `client:idle`, or `client:only` without a concrete reason.

Optimize images, avoid unnecessarily large assets, use descriptive `alt`, avoid layout shift where practical, and do not load unnecessary font weights.

Prefer CSS transitions for simple animation. If Framer Motion is used, keep it limited and respect `prefers-reduced-motion`.

## 10. Accessibility

Use semantic HTML:

```html
<header>
<nav>
<main>
<section>
<footer>
```

Ensure:

- logical heading hierarchy
- keyboard navigation
- visible focus states
- accessible buttons and links
- labelled form controls
- useful error messages
- descriptive image alt text
- adequate contrast
- information is not conveyed by color alone
- dialogs manage focus correctly
- touch targets are usable

## 11. SEO

`Layout.astro` should provide reusable defaults for:

- title
- meta description
- language
- viewport
- canonical URL when known
- Open Graph title
- Open Graph description
- Open Graph image when available

Use page-specific metadata when appropriate. Do not fabricate URLs.

## 12. Security

The public portfolio must never expose:

- passwords
- API secrets
- private keys
- session secrets
- internal credentials
- private inquiry data

If `/user/admin` exists, authentication must be enforced server-side. React/client-side checks are not a security boundary.

Do not store credentials or session tokens in localStorage. Do not expose private environment variables to the browser.

The public-portfolio audit must not remove server-side functionality that the admin dashboard actually requires.

## 13. Admin Dashboard Compatibility

If `ADMIN_DASHBOARD_SPEC_AGENT_READY.md` exists, read it before architecture changes.

Treat these as separate concerns:

```text
Public Portfolio
→ lightweight/static where practical

Admin Dashboard
→ protected server-side functionality where required
```

Do not classify required admin authentication/file persistence as unnecessary backend bloat merely because the public portfolio needs no database.

## 14. Recommended Component Structure

A clean implementation may use:

```text
src/
├── components/
│   ├── ui/
│   │   ├── Button.astro
│   │   ├── Badge.astro
│   │   ├── Card.astro
│   │   └── SectionHeading.astro
│   ├── interactive/
│   │   ├── ProjectGrid.tsx
│   │   ├── MobileMenu.tsx
│   │   └── ContactForm.tsx
│   └── sections/
│       ├── HeroSection.astro
│       ├── SkillsSection.astro
│       ├── ProjectsSection.astro
│       ├── CertificatesSection.astro
│       └── ContactSection.astro
├── layouts/
│   └── Layout.astro
├── pages/
│   └── index.astro
└── styles/
    └── global.css
```

The existing project's clean alternative may be preserved. Avoid unnecessary abstraction.

## 15. UI States

Every interactive feature must account for:

```text
Loading
Success
Error
Empty
Disabled
```

Never silently fail. Destructive actions require confirmation.

## 16. Project Content Quality

Prefer evidence over claims.

A project should answer:

```text
What was built?
Why was it built?
What technologies were used?
What did the developer contribute?
What problem did it address?
What is its current status?
```

Label academic, experimental, personal, or production projects accurately.

## 17. Audit Workflow

Do not modify during the initial inspection.

### Phase 1 — Inspect

Inspect project files, dependencies, configuration, reference images, `DESIGN.md`, public portfolio specification, and admin specification.

### Phase 2 — Architecture Audit

Verify Astro, React integration, Tailwind, Vite, content architecture, routing, and existing admin functionality.

Do not delete working functionality simply because it differs from a preferred architecture.

### Phase 3 — Visual Audit

Compare implementation with `DESIGN.md` and the appropriate images in `Photo/`.

### Phase 4 — Performance Audit

Remove genuinely unnecessary client JavaScript, dependencies, oversized assets, and redundant work.

### Phase 5 — Accessibility & SEO Audit

Check semantics, keyboard behavior, focus states, forms, alt text, metadata, and contrast.

### Phase 6 — Remediation

Modify only files that need correction. Avoid unnecessary rewrites.

### Phase 7 — Verification

Run:

```bash
npm run check
npm run build
```

If `npm run check` does not exist, use the project's existing appropriate validation command.

Fix errors before completion.

### Phase 8 — Browser QA

Verify the actual application at the required viewport sizes. Compare against the supplied reference images when possible.

Do not claim visual verification if it was not performed.

## 18. Dependency Audit

Inspect `package.json` and:

```bash
npm list --depth=0
```

Remove a package only when it is demonstrably unused, not required by the admin dashboard/build system, and safe to remove.

Do not add a database or backend framework merely to make the portfolio appear more sophisticated.

## 19. PASS / FIX / REVIEW

Classify findings as:

```text
PASS  → satisfies the requirement
FIX   → violates a documented requirement or causes a real issue
REVIEW → depends on missing information or intentional project behavior
```

Do not turn personal stylistic preference into a defect.

## 20. Definition of Done

- [ ] Astro is the primary framework.
- [ ] Vite is managed through Astro.
- [ ] React is limited to genuinely interactive areas.
- [ ] Tailwind is correctly configured.
- [ ] `DESIGN.md` is respected.
- [ ] Reference images were inspected.
- [ ] Public portfolio sections work.
- [ ] Navigation works.
- [ ] Project filtering works if specified.
- [ ] Contact functionality or real contact links work.
- [ ] Content uses one clear local source.
- [ ] No unnecessary database exists.
- [ ] No unnecessary backend framework exists.
- [ ] Existing admin functionality is not broken.
- [ ] Images have useful alt text.
- [ ] SEO metadata exists.
- [ ] Keyboard navigation works.
- [ ] Responsive layouts work.
- [ ] No unintended horizontal scrolling exists.
- [ ] Unnecessary client JavaScript is removed.
- [ ] No fabricated claims are present.
- [ ] Validation passes.
- [ ] Production build passes.
- [ ] No critical browser console errors remain.

## 21. Required Final Report

The Agent must report:

```text
## Implementation / Audit Summary

### Status
...

### Issues Found
...

### Files Created
...

### Files Modified
...

### Files Removed
...

### Dependencies Added
...

### Dependencies Removed
...

### Public Portfolio
...

### Content Architecture
...

### Admin Dashboard
...

### Performance
...

### Accessibility
...

### SEO
...

### Visual QA
...

### Validation
- npm run check: PASS/FAIL
- npm run build: PASS/FAIL

### Remaining Issues
...
```

Never claim a test, visual comparison, or feature is complete unless it was actually verified.

## 22. AGENT EXECUTION PROMPT

Use the following prompt together with this Markdown file in Antigravity:

```text
Implement and/or audit the MYY Portfolio according to:

PORTFOLIO_BUILD_AND_AUDIT_AGENT_READY.md

Treat the Markdown file as the primary project standard.

Before changing code, inspect the entire existing workspace and understand the current architecture. Read DESIGN.md, PROJECT_SPEC_AGENT_READY.md, and ADMIN_DASHBOARD_SPEC_AGENT_READY.md when they exist.

Inspect these reference images before visual implementation or QA:

Photo/screen.png
Photo/screen (2).png
Photo/screen (3).png
Photo/screen (4).png
Photo/screen (5).png

Do not blindly create a new project. The current Astro project may already be working.

Do not delete reference assets or working functionality.

Build the public website as a professional developer portfolio using Astro as the primary framework, React only for genuinely interactive islands, Vite through Astro, and Tailwind CSS.

Do not introduce PostgreSQL, MySQL, MongoDB, Prisma, Firebase, Supabase, Express, or another database/backend framework unless an existing project requirement explicitly requires it.

Use local structured content as specified in the Markdown file. Keep one clear source of truth for portfolio content.

Treat DESIGN.md as the visual source of truth and the reference images as the visual composition reference.

Prioritize:
- professional information hierarchy
- responsive layout
- accessibility
- SEO
- performance
- minimal client-side JavaScript
- maintainable components
- real working interactions
- truthful portfolio content

If an admin dashboard already exists or is specified, do not remove its required server-side authentication or file-persistence functionality merely to optimize the public portfolio.

Work in this order:

1. Inspect
2. Analyze
3. Plan
4. Implement only required changes
5. Run validation
6. Run production build
7. Perform browser/visual QA
8. Fix discovered issues
9. Rebuild and re-check
10. Provide the required final report

Do not claim success for anything you did not actually verify.

Start by inspecting the workspace. Do not start coding blindly.
```
