# PROJECT SPECIFICATION — Developer Portfolio

**Project Name:** Developer Portfolio  
**Project Type:** Personal developer portfolio website  
**Primary Framework:** Astro  
**UI Library:** React (Astro Islands, only where interactivity is needed)  
**Build Tool:** Vite (managed by Astro)  
**Styling:** Tailwind CSS  
**Optional Animation:** Framer Motion  
**Development Environment:** Antigravity IDE  
**Specification Status:** Agent-Ready

---

# 1. ROLE AND OBJECTIVE

You are the implementation agent responsible for building the Developer Portfolio described in this document.

The goal is to create a polished, high-performance, responsive portfolio website that closely follows the provided visual references while remaining maintainable, accessible, and production-ready.

The website must:

- Match the provided design references as closely as reasonably possible.
- Use Astro as the primary framework and page/routing layer.
- Use React only for interactive components that benefit from client-side behavior.
- Use Tailwind CSS for styling.
- Be responsive across desktop, tablet, and mobile devices.
- Use semantic HTML and accessible interaction patterns.
- Avoid unnecessary JavaScript and client-side hydration.
- Keep content and reusable components organized for future editing.
- Never replace or ignore the provided visual references with an unrelated design.

**Important:** The visual reference files in the project are the source of truth for layout, composition, visual hierarchy, and component appearance unless this specification explicitly overrides them.

---

# 2. FIRST ACTION — INSPECT THE PROJECT BEFORE CODING

Before creating or modifying application code, inspect the entire workspace.

The project is being developed inside **Antigravity IDE**.

Perform these checks first:

1. Inspect the current directory structure.
2. Identify whether an Astro project already exists.
3. Inspect `package.json` if present.
4. Inspect all files inside the provided design/reference folder.
5. Inspect image dimensions, filenames, and formats where useful.
6. Read `DESIGN.md` if it exists.
7. Locate all screenshots/mockups/reference images.
8. Determine which image corresponds to which page/section before implementation.
9. Check whether any existing source code should be preserved rather than replaced.

The user has already placed the required design/reference photos inside the project workspace. **Use those actual files. Do not invent substitute screenshots or pretend that missing reference images exist.**

If the reference folder is named `Photo`, inspect it recursively.

Example expected structure may be:

```text
Portfolio/
├── Photo/
│   ├── ...
├── DESIGN.md
├── PROJECT_SPEC.md
└── ...
```

The exact filenames may differ. Do not assume filenames before inspecting the workspace.

---

# 3. REFERENCE FILE PRIORITY

Use the following priority when resolving design decisions:

1. **Explicit requirements in this document**
2. **Actual provided visual reference images**
3. **`DESIGN.md` design tokens and rules**
4. Existing project conventions that do not conflict with the above
5. Reasonable implementation defaults

When a visual reference and an implementation assumption conflict, follow the visual reference unless doing so would violate an explicit requirement in this document.

Do not redesign the page merely because another layout appears more modern.

---

# 4. VISUAL REFERENCE IMPLEMENTATION

The provided design images define the intended visual structure.

Identify and reproduce, where present in the references:

- Header / navigation
- Hero section
- Introduction / profile area
- Skills / technical skills
- Projects / project showcase
- Certificates / achievements
- Contact section
- Footer
- Section numbering
- Cards
- Buttons
- Tags / chips
- Images
- Dividers
- Typography hierarchy
- Spacing rhythm
- Alignment
- Responsive behavior
- Hover and interactive states

Do not add major sections that are not supported by the references unless they are required for functionality or accessibility.

Do not remove major sections shown in the references.

---

# 5. DESIGN SYSTEM

## 5.1 Color Tokens

Use these values as the base design tokens:

```text
Platinum / Main Background:
#E5E7EB

Pure White / Elevated Surface:
#FFFFFF

Deep Midnight Navy / Primary Accent:
#0A1128

Structural Border:
rgba(10, 17, 40, 0.08)
```

Use the colors consistently.

### Rules

- The primary page background is Platinum `#E5E7EB`.
- Elevated structural cards use Pure White `#FFFFFF`.
- Deep Midnight Navy `#0A1128` is used for:
  - Primary typography
  - Important headings
  - Primary buttons
  - Interactive states
  - Dark structural sections
- Do not introduce arbitrary accent colors unless the reference images clearly require them.
- If a reference contains an additional color that is not specified above, inspect `DESIGN.md` before adding it.
- Avoid excessive use of dark surfaces; preserve the visual hierarchy shown by the references.

---

# 6. TYPOGRAPHY

Use the following typography system:

### Headlines and Section Indexing

**Space Grotesk**

Use for:

- Main headings
- Section headings
- Large display text
- Section numbers/indexes
- Strong visual labels

### Body and Long-form Content

**Hanken Grotesk**

Use for:

- Paragraphs
- Descriptions
- Navigation where appropriate
- General interface text
- Long-form content

### Metadata, Tags and Metrics

**JetBrains Mono**

Use for:

- Technology tags
- Project metadata
- Dates
- Metrics
- Section indexes where appropriate
- Technical labels
- Small utility information

Do not use a random system font when one of the specified fonts applies.

Load the fonts efficiently and avoid unnecessary duplicate font requests.

---

# 7. ELEVATION, BORDERS AND RADIUS

The design uses structural rather than heavily decorative elevation.

## Borders

Use:

```text
rgba(10, 17, 40, 0.08)
```

for subtle structural borders.

Prefer 1px borders over heavy shadows.

## Shadows

Do not use:

- Large dramatic shadows
- Heavy blur effects
- Excessive glassmorphism
- Strong floating-card effects

Use only ultra-subtle ambient shadows when they improve separation of white cards from the Platinum background.

## Border Radius

Use restrained rounding:

```text
Micro elements:
4px / 0.25rem

Cards:
8px / 0.5rem
```

Do not use large pill-shaped containers unless the reference explicitly shows them.

---

# 8. RESPONSIVE GRID

Implement a responsive grid system based on the design specification:

```text
Desktop:
12 columns

Tablet:
8 columns

Mobile:
4 columns
```

The layout must maintain:

- Consistent gutters
- Predictable horizontal padding
- Consistent vertical spacing
- Correct alignment between section content
- Appropriate typography scaling
- No horizontal overflow

Do not arbitrarily change the column structure without a visual or functional reason.

The exact breakpoint values may follow Tailwind defaults unless the reference or `DESIGN.md` specifies otherwise.

---

# 9. PROJECT ARCHITECTURE

Use a clean Astro-first architecture.

Recommended structure:

```text
Portfolio/
├── public/
│   ├── images/
│   ├── icons/
│   └── ...
│
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.astro
│   │   │   ├── Chip.astro
│   │   │   ├── IconButton.astro
│   │   │   └── ...
│   │   │
│   │   └── sections/
│   │       ├── HeroSection.astro
│   │       ├── SkillsSection.astro
│   │       ├── ProjectShowcase.astro
│   │       ├── CertificatesSection.astro
│   │       ├── ContactSection.astro
│   │       └── ...
│   │
│   ├── layouts/
│   │   └── Layout.astro
│   │
│   ├── pages/
│   │   └── index.astro
│   │
│   ├── data/
│   │   ├── projects.ts
│   │   ├── skills.ts
│   │   └── certificates.ts
│   │
│   └── styles/
│       └── global.css
│
├── Photo/
│   └── reference images supplied by the user
│
├── DESIGN.md
├── PROJECT_SPEC.md
├── package.json
├── astro.config.*
└── ...
```

The exact structure may be adapted if the existing project already follows a reasonable architecture.

---

# 10. ASTRO AND REACT RULES

Astro is the primary rendering framework.

Prefer:

```text
.astro
```

components for static content.

Use React components when actual client-side interaction is required.

Examples of suitable React usage:

- Interactive project filtering
- Complex animated interaction
- Stateful UI
- Interactive navigation behavior that genuinely requires React

Do not convert the entire portfolio into a React SPA.

Avoid unnecessary hydration.

When React is used, choose the smallest appropriate Astro client directive, such as:

```astro
client:load
client:visible
client:idle
```

based on the actual interaction requirements.

---

# 11. REQUIRED GLOBAL LAYOUT

Create or update:

```text
src/layouts/Layout.astro
```

It must provide:

- HTML document structure
- `<html lang="en">`
- `<head>`
- Character encoding
- Responsive viewport
- Page title
- Meta description
- Favicon support if available
- Global font loading
- Global CSS
- Slot/content rendering
- Accessible document structure

Do not duplicate global styles unnecessarily across individual pages.

---

# 12. MAIN PAGE

Create or update:

```text
src/pages/index.astro
```

The page should assemble the portfolio sections in the order established by the reference image.

Expected major sections:

1. Navigation / Header
2. Hero
3. Skills
4. Projects
5. Certificates
6. Contact
7. Footer

If the provided design reference uses a different order, follow the reference.

Use semantic elements such as:

```html
<header>
<nav>
<main>
<section>
<footer>
```

where appropriate.

---

# 13. UI COMPONENTS

Reusable UI elements should be componentized.

Examples:

- Button
- Secondary Button
- Navigation Link
- Chip / Tag
- Technical Badge
- Project Card
- Certificate Card
- Section Header
- Social Link
- Icon Button
- Image Container

Components should:

- Have clear names.
- Avoid duplicated markup.
- Accept data through props when useful.
- Keep styling close to the component where appropriate.
- Remain consistent with the design system.

Do not create dozens of components for trivial one-off markup.

---

# 14. HERO SECTION

Implement the Hero according to the supplied design reference.

The Hero should establish:

- Developer identity
- Short professional introduction
- Primary visual hierarchy
- Main call-to-action
- Supporting information
- Relevant profile/portrait image if provided

Use the actual provided image asset when the design reference requires a personal image.

Do not fabricate a person's photograph.

If text content is not supplied, use concise editable placeholder content rather than invented personal claims.

Keep personal information easy to replace.

---

# 15. SKILLS SECTION

Create a skills/technical expertise section following the reference.

Skills should be structured data rather than hardcoded repeatedly throughout the markup.

Example:

```ts
export const skills = [
  {
    category: "Frontend",
    items: ["HTML", "CSS", "JavaScript", "React"]
  },
  {
    category: "Backend",
    items: ["PHP", "Laravel", "Node.js"]
  }
];
```

The categories and actual technologies must be adapted to the supplied design/content.

Use technical tags/chips consistently.

---

# 16. PROJECT SHOWCASE

Projects should be represented using reusable data-driven components.

Recommended data structure:

```ts
export const projects = [
  {
    title: "Project Name",
    description: "Short project description.",
    image: "/images/project-name.webp",
    technologies: ["Astro", "React", "Tailwind"],
    link: "#",
    github: "#"
  }
];
```

Requirements:

- Use actual project images when available.
- Keep descriptions concise.
- Display technologies consistently.
- Make links accessible.
- Use meaningful `alt` text.
- Do not invent project achievements, users, metrics, or claims.

If a project link is unavailable, omit the link rather than inventing a URL.

---

# 17. CERTIFICATES / ACHIEVEMENTS

Implement the certificate section according to the reference.

Each certificate should support:

- Certificate title
- Issuer
- Date
- Image or document preview if available
- Optional verification link

Use data-driven rendering.

Do not invent certificate numbers, institutions, dates, or verification URLs.

---

# 18. CONTACT SECTION

Implement the contact section according to the visual reference.

Possible contact actions may include:

- Email
- GitHub
- LinkedIn
- Other provided professional links

Use actual values supplied by the user/project.

If no value is available, use an editable placeholder or omit the item.

Do not create fake social accounts or fake email addresses that could accidentally be published.

If a contact form is present in the design:

- Build the visual form.
- Provide accessible labels.
- Provide client-side validation where appropriate.
- Do not claim that the form sends messages unless a real backend/service is configured.

---

# 19. NAVIGATION

The navigation must:

- Match the reference design.
- Work on desktop.
- Work on mobile.
- Clearly indicate the active section/page.
- Provide keyboard-accessible controls.
- Avoid unnecessary JavaScript.

For a single-page portfolio, anchor navigation is acceptable:

```text
#home
#skills
#projects
#certificates
#contact
```

Use smooth scrolling only if it does not interfere with accessibility or user preferences.

Respect:

```text
prefers-reduced-motion
```

for animated scrolling and transitions.

---

# 20. IMAGES AND ASSETS

The user has already provided design/reference images in the project workspace.

Before implementation:

1. Inspect the image folder.
2. Identify each image.
3. Determine whether it is:
   - Design reference
   - Profile photo
   - Project image
   - Certificate
   - Icon
   - Decorative asset
4. Use the correct asset for the corresponding purpose.

Do not duplicate large image files unnecessarily.

Prefer modern optimized formats where practical.

Every meaningful image must have appropriate `alt` text.

Decorative images should use empty alt text:

```html
alt=""
```

when appropriate.

---

# 21. ANIMATION

Animation is optional and must support the design rather than distract from it.

Use animation for:

- Subtle entrance transitions
- Hover states
- Small interaction feedback
- Section reveal when appropriate

Avoid:

- Excessive motion
- Constant background animation
- Large parallax effects
- Long loading animations
- Motion that makes the site feel slow

If Framer Motion is not genuinely necessary, do not add it.

Prefer CSS transitions for simple effects.

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

---

# 22. ACCESSIBILITY

The implementation must include basic accessibility requirements.

Ensure:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Accessible button labels
- Accessible navigation
- Correct heading hierarchy
- Form labels
- Meaningful image alt text
- Sufficient text/background contrast
- No interaction that requires a mouse only
- Reduced-motion support

Do not remove focus outlines unless an equivalent visible focus state is implemented.

---

# 23. PERFORMANCE

Performance is a core requirement.

Prefer:

- Astro static rendering
- Minimal JavaScript
- Minimal React hydration
- Optimized images
- Lazy loading for below-the-fold images where appropriate
- Efficient font loading
- No unnecessary libraries
- No unnecessary network requests

Do not install a dependency simply to solve a problem that can be handled cleanly with native HTML/CSS/Astro.

---

# 24. SEO AND METADATA

The page must have:

- Descriptive `<title>`
- Meta description
- Canonical URL placeholder/configuration where appropriate
- Open Graph metadata where practical
- Twitter/X card metadata where practical
- Appropriate heading hierarchy
- Semantic HTML

Do not invent personal information for SEO metadata.

Keep site title, description, and social preview values easy to edit.

---

# 25. TAILWIND IMPLEMENTATION

Use Tailwind CSS as the primary styling system.

Create reusable design tokens where appropriate.

Do not scatter arbitrary values throughout the project when a design token would be more appropriate.

At minimum, centralize:

- Primary background
- Surface
- Navy accent
- Border
- Typography families
- Important spacing values
- Border radius values

Follow the current supported Astro/Tailwind integration for the installed versions.

Do not introduce obsolete configuration patterns simply because they were common in older Tailwind tutorials.

---

# 26. CONTENT MANAGEMENT

Keep portfolio content separate from presentation whenever practical.

Prefer:

```text
src/data/projects.ts
src/data/skills.ts
src/data/certificates.ts
```

over repeating large data objects directly inside `index.astro`.

This allows the user to update:

- Project names
- Descriptions
- Technologies
- Links
- Skills
- Certificates

without restructuring the page.

---

# 27. PLACEHOLDERS

If actual personal content is unavailable, use clearly editable placeholders.

Example:

```text
[YOUR NAME]
[YOUR ROLE]
[YOUR EMAIL]
[YOUR GITHUB URL]
[YOUR LINKEDIN URL]
```

Do not silently replace missing personal information with fabricated information.

Keep placeholders visually compatible with the final design.

---

# 28. ERROR PREVENTION

Before considering the implementation complete:

- Check all imports.
- Check all component paths.
- Check all image paths.
- Check all Astro syntax.
- Check all React syntax.
- Check TypeScript errors if TypeScript is used.
- Check Tailwind classes.
- Check broken links.
- Check missing assets.
- Check console errors.
- Check responsive layout.
- Check for horizontal overflow.

Do not leave knowingly broken code.

---

# 29. DEVELOPMENT COMMANDS

If the project is empty, initialize the Astro project using the current official Astro setup.

After setup, install only the dependencies actually required.

Typical development workflow:

```bash
npm install
npm run dev
```

Production verification:

```bash
npm run build
npm run preview
```

Use the actual scripts defined by `package.json` if they differ.

Do not overwrite an existing working project blindly.

---

# 30. AGENT WORKFLOW

Work in the following sequence.

## Phase 1 — Discovery

1. Inspect workspace.
2. Inspect `Photo/` or the actual reference-image directory.
3. Inspect `DESIGN.md`.
4. Inspect existing source files.
5. Inspect `package.json`.
6. Identify missing dependencies and missing files.

## Phase 2 — Foundation

1. Ensure Astro is correctly configured.
2. Configure React integration if needed.
3. Configure Tailwind using the current supported approach.
4. Establish global fonts.
5. Establish design tokens.
6. Establish global layout and document metadata.

## Phase 3 — Components

Build reusable UI components.

Start with:

1. Navigation
2. Buttons
3. Chips/tags
4. Section headers
5. Project cards
6. Certificate cards
7. Contact/social elements

## Phase 4 — Sections

Build:

1. Hero
2. Skills
3. Projects
4. Certificates
5. Contact
6. Footer

Follow the actual reference image for spacing, alignment, proportions, and composition.

## Phase 5 — Responsive Design

Verify:

- Desktop
- Tablet
- Mobile

Do not simply shrink the desktop design.

Adapt layout according to the 12/8/4-column system and the reference.

## Phase 6 — Interaction

Add only required interactions:

- Navigation behavior
- Hover states
- Mobile menu if needed
- Project interactions if shown
- Subtle animations if supported by the design

## Phase 7 — Verification

Run:

```bash
npm run build
```

Fix all build errors.

Then inspect the rendered result and compare it against the supplied reference images.

---

# 31. VISUAL QA CHECKLIST

Before finishing, compare the implementation against the supplied references.

Check:

### Layout
- [ ] Overall composition matches the reference
- [ ] Section order matches
- [ ] Container width is appropriate
- [ ] Grid alignment is consistent
- [ ] Gutters are consistent
- [ ] No unexpected horizontal scrolling

### Typography
- [ ] Space Grotesk used for headings/indexes
- [ ] Hanken Grotesk used for body text
- [ ] JetBrains Mono used for metadata/tags/metrics
- [ ] Font weights match the visual hierarchy
- [ ] Line heights are appropriate

### Colors
- [ ] Platinum background is used correctly
- [ ] White surfaces are used correctly
- [ ] Midnight Navy is used for primary emphasis
- [ ] Borders are subtle
- [ ] No unnecessary colors were introduced

### Components
- [ ] Buttons match the reference
- [ ] Cards match the reference
- [ ] Chips/tags match the reference
- [ ] Images use the correct assets
- [ ] Icons are consistent

### Responsive
- [ ] Desktop layout works
- [ ] Tablet layout works
- [ ] Mobile layout works
- [ ] Navigation works on mobile
- [ ] Text does not overflow
- [ ] Cards do not break
- [ ] Images remain correctly proportioned

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus states are visible
- [ ] Images have appropriate alt text
- [ ] Buttons have accessible labels
- [ ] Heading hierarchy is valid
- [ ] Reduced motion is respected

### Technical
- [ ] `npm run build` succeeds
- [ ] No obvious console errors
- [ ] No missing imports
- [ ] No missing assets
- [ ] No broken internal links
- [ ] React hydration is used only where necessary

---

# 32. IMPORTANT AGENT BEHAVIOR

The implementation agent must follow these rules:

### Do

- Inspect before modifying.
- Reuse existing code when it is correct.
- Reuse provided assets.
- Follow the visual references.
- Keep the architecture maintainable.
- Make decisions explicit when a reference is ambiguous.
- Validate the project after implementation.
- Fix errors rather than ignoring them.

### Do Not

- Do not fabricate personal information.
- Do not fabricate certificates.
- Do not fabricate project metrics.
- Do not invent social URLs.
- Do not replace the supplied design with a generic portfolio template.
- Do not add unnecessary frameworks.
- Do not turn the entire Astro application into a React SPA.
- Do not use excessive animations.
- Do not use excessive shadows or rounded corners.
- Do not ignore the provided `DESIGN.md`.
- Do not delete user-provided reference images.
- Do not overwrite existing project files without inspecting them first.

---

# 33. DEFINITION OF DONE

The project is considered complete only when all of the following are true:

- [ ] Astro project runs successfully.
- [ ] React integration works where required.
- [ ] Tailwind CSS works correctly.
- [ ] Global fonts are implemented.
- [ ] Design tokens are implemented.
- [ ] Main page is assembled.
- [ ] Hero is implemented.
- [ ] Skills section is implemented.
- [ ] Projects section is implemented.
- [ ] Certificates section is implemented.
- [ ] Contact section is implemented.
- [ ] Footer is implemented.
- [ ] Provided reference assets are used appropriately.
- [ ] Desktop layout matches the visual reference.
- [ ] Tablet layout is responsive.
- [ ] Mobile layout is responsive.
- [ ] Accessibility basics are implemented.
- [ ] SEO metadata exists.
- [ ] No obvious console/build errors remain.
- [ ] `npm run build` completes successfully.
- [ ] Final visual QA has been performed against the supplied design references.

---

# 34. FINAL IMPLEMENTATION INSTRUCTION

**Start by inspecting the existing Antigravity IDE workspace and all files inside the reference-image folder.**

Do not begin by blindly generating a new portfolio.

First determine:

1. What already exists.
2. Which images are provided.
3. What `DESIGN.md` specifies.
4. Whether Astro is already initialized.
5. Which dependencies are already installed.
6. Which parts need to be created or modified.

Then implement the portfolio incrementally.

After implementation:

1. Run the project's validation/build command.
2. Fix any errors.
3. Inspect the final result.
4. Compare it against the provided design references.
5. Correct significant visual differences.
6. Confirm the project is ready to run and continue development.

**The supplied visual references and `DESIGN.md` are not optional inspiration. They are implementation references and must be actively consulted during development.**
