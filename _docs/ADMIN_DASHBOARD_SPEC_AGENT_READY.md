# Admin Dashboard Specification — MYY Portfolio

**Project:** MYY Portfolio
**Dashboard Route:** `/user/admin`
**Purpose:** Private content-management dashboard for editing the public developer portfolio
**Primary Stack:** Astro + React + Vite + Tailwind CSS
**Icons:** Lucide React
**Database:** **NONE**
**Persistence:** File-based portfolio content (JSON/TypeScript data files), not PostgreSQL
**Development Environment:** Antigravity IDE
**Specification Status:** Agent-Ready

---

# 1. IMPORTANT ARCHITECTURE DECISION — NO DATABASE

This portfolio MUST NOT use PostgreSQL, MySQL, MongoDB, SQLite, Supabase, Firebase, or any other database.

This is a personal developer portfolio, not a data-intensive application. Portfolio content should be maintained through local project files.

However, the private admin dashboard must still be able to **add, edit, reorder, publish/unpublish, and delete portfolio content**.

Because a browser cannot safely write directly to project source files, use a **file-based content layer** for persistence.

Recommended model:

```text
Admin Dashboard
      |
      v
Server-side content API
      |
      v
content/*.json
      |
      v
Public Portfolio
```

The content files become the single source of truth for editable portfolio content.

Example:

```text
content/
├── profile.json
├── skills.json
├── tech-stack.json
├── projects.json
├── certificates.json
└── inquiries.json
```

Do not create a database layer simply to support CRUD operations.

---

# 2. IMPORTANT LIMITATION OF FILE-BASED PERSISTENCE

The implementation agent MUST understand the deployment implication:

A purely static CDN deployment cannot persist arbitrary changes made from a browser into repository files.

Therefore:

- During local development, the dashboard may read/write files through Astro server endpoints.
- On deployment, the dashboard requires a server/runtime with writable persistent storage if edits must survive restarts and be visible to all visitors.
- If the deployment platform uses an ephemeral filesystem, file-based persistence is not sufficient for permanent production editing.
- Do not falsely claim that a static deployment can permanently save dashboard edits without a persistence mechanism.

For the initial MYY Portfolio project, prioritize a clean **file-based CMS/editor architecture** and keep the public portfolio static-friendly.

Do not add a database just to solve deployment persistence.

---

# 3. REFERENCE IMAGES — MANDATORY

The user has already provided dashboard design references inside the project `Photo/` folder.

The following files are mandatory visual references:

```text
Photo/screen (2).png
Photo/screen (3).png
Photo/screen (4).png
Photo/screen (5).png
```

**These exact files MUST be inspected and used during implementation.**

They are not optional inspiration.

Before coding:

1. Open `Photo/screen (2).png`.
2. Open `Photo/screen (3).png`.
3. Open `Photo/screen (4).png`.
4. Open `Photo/screen (5).png`.
5. Identify which visual layout belongs to each module.
6. Compare spacing, dimensions, cards, typography, colors, borders, controls, icons, and responsive behavior.
7. Implement the UI based on those actual references.

Do not substitute generic dashboard templates.

Do not rename, delete, or overwrite these reference images.

If the files exist with a slightly different extension (`.jpg`, `.jpeg`, etc.), inspect the actual `Photo/` directory and use the corresponding files while preserving the original assets.

---

# 4. REFERENCE MAPPING

Use the references as follows:

| Reference | Required Module |
|---|---|
| `Photo/screen (5).png` | Overview & Analytics |
| `Photo/screen (2).png` | Inquiries / Secure Transmission Console |
| `Photo/screen (3).png` | Projects Showcase Manager |
| `Photo/screen (4).png` | Skills & Tech Stack Manager |

The visual reference is authoritative for composition unless this specification explicitly overrides it.

---

# 5. PUBLIC PORTFOLIO + ADMIN RELATIONSHIP

The project consists of two related experiences:

```text
PUBLIC
/
├── Hero
├── Skills / Tech Stack
├── Projects
├── Certificates
├── Contact
└── Footer

PRIVATE
/user/admin
├── Overview
├── Profile & Hero
├── Projects
├── Tech Stack
├── Skills
├── Credentials
└── Inquiries
```

The admin dashboard edits the content displayed by the public portfolio.

Example:

```text
Admin edits project
       ↓
projects.json updated
       ↓
Public portfolio reads projects.json
       ↓
Project appears/changes on portfolio
```

Do not maintain separate duplicated project data for the public page and dashboard.

---

# 6. ROUTING & SECURITY

## 6.1 Protected Route

The entire dashboard MUST be restricted to:

```text
/user/admin
```

All nested routes must inherit the same protection:

```text
/user/admin
/user/admin/overview
/user/admin/profile
/user/admin/projects
/user/admin/tech-stack
/user/admin/skills
/user/admin/credentials
/user/admin/inquiries
```

## 6.2 Server-Side Protection

Authentication MUST be enforced server-side.

React client-side checks are NOT a security boundary.

Do not implement security using only:

```js
if (authenticated) {
  // render dashboard
}
```

inside React.

Unauthorized requests must be rejected before protected content or protected API data is returned.

## 6.3 Authentication

Use a lightweight server-managed authentication mechanism suitable for a single-admin portfolio.

For the initial implementation:

- Admin credentials must come from environment variables or another server-side secret mechanism.
- Never hardcode the admin password in source code.
- Never store passwords in localStorage.
- Never expose credentials to React/client bundles.
- Use secure, HTTP-only cookies for the authenticated session.
- Implement logout that invalidates the session.
- Protect every dashboard API endpoint, not just the page route.

If the project already contains a suitable authentication system, reuse it rather than introducing a second authentication system.

## 6.4 Development Authentication

For local development, a simple single-admin login is sufficient.

Do not build multi-user role management unless explicitly requested later.

---

# 7. CORE STACK

Use:

```text
Astro
React
Vite through Astro
Tailwind CSS
Lucide React
```

Vite is Astro's build tool and should not be treated as a separate frontend framework.

Use React only for genuinely interactive dashboard components.

Prefer Astro components for static shell/layout elements.

Do not turn the entire application into an unnecessary React SPA.

---

# 8. DASHBOARD VISUAL DIRECTION

The dashboard must follow a technical, data-dense, systems-architect aesthetic.

Visual direction:

- Clean white/grey surfaces
- Deep Midnight Navy accents
- Strong technical hierarchy
- Monospace typography for metrics/logs/telemetry
- Subtle structural borders
- Restrained corner radius
- Minimal decorative shadows
- Dense but readable information architecture

Core colors:

```text
Platinum:
#E5E7EB

Pure White:
#FFFFFF

Deep Midnight Navy:
#0A1128

Structural Border:
rgba(10, 17, 40, 0.08)
```

Typography:

```text
Headings / section indexes:
Space Grotesk

Body:
Hanken Grotesk

Metrics / logs / metadata:
JetBrains Mono
```

Do not introduce unrelated colors or excessive gradients unless the provided references clearly contain them.

---

# 9. MAIN DASHBOARD SHELL

Implement:

```text
┌──────────────────────────────────────────────┐
│                 TOP HEADER                   │
├──────────────┬───────────────────────────────┤
│              │                               │
│   SIDEBAR    │       SCROLLABLE MAIN         │
│              │          CONTENT              │
│              │                               │
│              │                               │
└──────────────┴───────────────────────────────┘
```

## Fixed Left Sidebar

Contains global dashboard navigation.

## Fixed Top Header

Contains:

- Current module title
- Global system state
- Profile controls
- Logout
- Optional notifications

## Scrollable Main Content

Only the content area should scroll independently where appropriate.

Do not create nested scrollbars unnecessarily.

---

# 10. SIDEBAR NAVIGATION

Use this exact information architecture:

## PLATFORM CORE

- Overview & Analytics
- Profile & Hero

## EDITORIAL & ASSETS

- Projects Showcase
- Tech Stack & Marquee
- Skills Matrix
- Credentials

## DISPATCH

- Inquiries

Display an unread notification badge on Inquiries when unread messages exist.

## SYSTEM STATUS

At the bottom of the sidebar show a database-free system status such as:

```text
● FILE STORE
SYNCED
```

Do **not** display a fake PostgreSQL status.

Do not show:

```text
Postgres v16 Synced
```

because this project does not use PostgreSQL.

The status should represent the actual file-content system when possible.

---

# 11. ROUTE STRUCTURE

Recommended routes:

```text
/user/admin
/user/admin/overview
/user/admin/profile
/user/admin/projects
/user/admin/tech-stack
/user/admin/skills
/user/admin/credentials
/user/admin/inquiries
```

The root `/user/admin` may redirect to `/user/admin/overview` after authentication.

All routes must share the protected admin layout.

---

# 12. CONTENT FILE STRUCTURE

Create a dedicated content directory:

```text
content/
├── profile.json
├── skills.json
├── tech-stack.json
├── projects.json
├── certificates.json
└── inquiries.json
```

Example project data:

```json
[
  {
    "id": "project-001",
    "title": "Project Name",
    "description": "Project description.",
    "image": "/images/project-001.webp",
    "technologies": ["Astro", "React", "Tailwind"],
    "url": "",
    "github": "",
    "status": "published",
    "order": 1
  }
]
```

Use stable IDs.

Do not use array indexes as permanent IDs.

---

# 13. FILE-BASED CONTENT API

Create server-side endpoints or services for content operations.

The exact Astro server endpoint structure may follow the installed Astro version, but the architecture should provide operations equivalent to:

```text
GET    /api/admin/projects
POST   /api/admin/projects
PUT    /api/admin/projects/:id
DELETE /api/admin/projects/:id
```

Equivalent APIs should exist for:

```text
profile
skills
tech-stack
certificates
inquiries
```

Every `/api/admin/*` endpoint MUST verify authentication server-side.

Do not expose unrestricted write endpoints.

Validate all incoming data before writing files.

Prevent path traversal and arbitrary filesystem writes.

The API must only read/write approved files inside the project's designated content directory.

---

# 14. FILE WRITE SAFETY

Because the dashboard modifies project files, implement safe file handling.

Requirements:

- Only allow predefined content files.
- Never accept arbitrary filesystem paths from the browser.
- Validate JSON before writing.
- Preserve valid existing content if a write fails.
- Handle concurrent writes safely enough for a single-admin application.
- Return useful errors to the UI.
- Do not expose server filesystem paths to the browser.
- Do not expose environment variables.

When possible, write to a temporary file and replace the target after successful serialization/validation to reduce the risk of corrupting content.

---

# 15. OVERVIEW & ANALYTICS

**Reference:** `Photo/screen (5).png`

Inspect the reference first and reproduce its layout.

Required areas:

## Top Metrics

Four interactive summary cards representing values such as:

- Live Portfolio Visits
- Active Projects
- Direct Transmissions
- Credentials & Skills

During initial development, values may be mock/demo values.

Clearly separate demo metrics from real metrics.

Do not claim real analytics without a real analytics source.

## Section Health & Quick Edit

Show:

- Hero
- Vector Tech Stack
- Skills Matrix
- Showcase
- Credentials

Each item should show an appropriate content status and actions such as:

- Edit
- Reorder
- View

## System Telemetry

Telemetry may include:

- Content file status
- Last content sync
- Build status
- File validation status
- Static generation status

Do not fabricate PostgreSQL, CDN, or server telemetry.

## Recent Activity

Use a local activity log for dashboard actions such as:

```text
Project updated
Skill added
Certificate removed
Hero content saved
```

The initial activity log may be mock/demo data or local session data.

---

# 16. INQUIRIES / SECURE TRANSMISSION CONSOLE

**Reference:** `Photo/screen (2).png`

Inspect the exact reference and reproduce its visual structure.

## Inbox List

Show incoming inquiries with:

- Sender name
- Subject
- Date/time
- Status
- Priority if applicable
- Read/unread state

## Message Detail

Show:

- Sender
- Contact information when supplied
- Date/time
- Status
- Message body

Any IP address displayed during UI testing must be clearly fictional/mock data.

Do not expose sensitive data publicly.

## Quick Reply

Provide:

- Text area
- Template selector
- Save Draft
- Send/Transmit action

If no real email delivery provider is configured, the send button MUST NOT falsely claim that an email was delivered.

It may instead save a draft or mark a mock transmission in demo mode.

## Gateway Settings

If the visual reference includes:

- Social links
- Relay destination
- Public PGP key

implement the UI without exposing private secrets.

Private cryptographic keys must never be stored in frontend source or committed to the repository.

---

# 17. PROJECT SHOWCASE MANAGER

**Reference:** `Photo/screen (3).png`

Inspect the reference before implementation.

## Project Operations

Support:

```text
Create
Read
Update
Delete
Reorder
Publish / Unpublish
```

## Project Form

At minimum support fields appropriate to the public portfolio:

- Title
- Short description
- Full description if needed
- Image
- Technologies
- Project URL
- GitHub URL
- Status
- Display order

Only include fields supported by the public design.

## Project Cards

Cards should reproduce the reference visual hierarchy.

Technology taxonomy tags must be data-driven.

If mini-graphs are shown by the reference, they must be explicitly labeled as demo/mock telemetry unless a real data source exists.

Do not claim that mock charts represent actual project infrastructure.

---

# 18. SKILLS & TECH STACK MANAGER

**Reference:** `Photo/screen (4).png`

Inspect the reference before implementation.

## Skills

Support:

- Add
- Edit
- Delete
- Reorder
- Proficiency adjustment
- Publish/unpublish where appropriate

Example:

```text
TypeScript   85%
React        80%
Astro        75%
```

The percentage is portfolio presentation data, not a scientific measurement.

## Tech Stack

Support adding/removing/editing technology entries.

Possible fields:

- Name
- Category
- Icon
- Order
- Enabled state

Use actual supplied content where available.

Do not invent professional claims.

## Marquee

Implement the reference's dual-channel marquee configuration if shown:

```text
Track 01 — Right to Left
Track 02 — Left to Right
```

Support enabling/disabling the badge repository.

Use CSS animation where possible.

Respect `prefers-reduced-motion`.

## Live Portfolio Viewport

Provide the preview shown in the reference.

The preview should reflect current unsaved/edited values where practical.

Clearly distinguish preview state from published state.

---

# 19. PROFILE & HERO MANAGER

The admin must be able to edit the public Hero/Profile content.

Possible editable fields:

- Name
- Role/title
- Short introduction
- Profile image
- Primary CTA
- Secondary CTA
- Social links

Only use fields actually supported by the public portfolio design.

Do not fabricate personal information.

---

# 20. CREDENTIALS MANAGER

Support:

- Add credential
- Edit credential
- Delete credential
- Reorder credential
- Publish/unpublish

Possible fields:

- Title
- Issuer
- Date
- Credential URL
- Image/document reference

Do not invent certificate IDs, issuers, dates, or verification URLs.

---

# 21. CRUD UX RULES

Every editable module must provide predictable editing behavior.

Forms must have:

- Loading state
- Validation state
- Success feedback
- Error feedback
- Cancel action
- Unsaved-change handling where appropriate

Destructive actions must require confirmation.

After a successful write:

1. Update the local UI state.
2. Confirm the server/file operation succeeded.
3. Show clear feedback.
4. Refresh dependent data if necessary.

Do not silently fail.

---

# 22. PUBLISHING MODEL

Use a simple file-based publishing model.

Each editable entity may contain:

```json
"status": "draft"
```

or:

```json
"status": "published"
```

The public portfolio must only render content marked as published when the content type supports publication state.

Do not introduce a complex editorial workflow unless required later.

---

# 23. IMAGE MANAGEMENT

The dashboard may need to reference images used by projects, certificates, and profile content.

Do not allow arbitrary filesystem access.

For the initial implementation, prefer selecting/referenceing assets already present in the project.

If image upload is implemented:

- Validate file type.
- Validate file size.
- Store only inside an approved public asset directory.
- Generate safe filenames.
- Reject executable file types.
- Never expose server filesystem paths.

The design reference files remain in:

```text
Photo/
```

and MUST NOT be treated as user-uploaded public portfolio assets automatically.

---

# 24. RESPONSIVE DASHBOARD

Desktop:

- Fixed sidebar
- Fixed header
- Dense multi-column content

Tablet:

- Reduce dashboard density appropriately
- Preserve hierarchy
- Allow content columns to stack when required

Mobile:

- Convert sidebar into an accessible drawer/menu
- Keep header usable
- Stack metric cards
- Stack editor panels
- Avoid horizontal overflow

The exact responsive behavior must be compared against the supplied references where mobile references are available.

---

# 25. ACCESSIBILITY

Implement:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Accessible labels
- Proper form labels
- Accessible dialogs
- Accessible mobile navigation
- Correct heading hierarchy
- Status messages understandable without color alone
- Reduced motion support

Do not use color as the only indicator of status.

---

# 26. PERFORMANCE

Keep the dashboard efficient.

Prefer:

- Astro server rendering where appropriate
- React only for interactive areas
- Minimal hydration
- CSS animations for simple motion
- Lazy loading for non-critical images
- Small icon imports from Lucide

Do not install a charting library if the reference can be reproduced with simple CSS/SVG.

If charts are required, use a lightweight implementation and clearly label demo data.

---

# 27. SECURITY CHECKLIST

The agent MUST verify:

- [ ] `/user/admin` is not publicly accessible without authentication.
- [ ] Nested admin routes are protected.
- [ ] Admin API endpoints are protected.
- [ ] Authentication is server-side.
- [ ] Session cookies are HTTP-only.
- [ ] Passwords/secrets are not in source code.
- [ ] No auth token is stored in localStorage.
- [ ] No private keys are exposed.
- [ ] No arbitrary filesystem path can be supplied by the client.
- [ ] JSON writes are validated.
- [ ] Sensitive inquiry data is never rendered on public pages.
- [ ] Demo telemetry is not presented as real infrastructure telemetry.

---

# 28. AGENT EXECUTION WORKFLOW

## Phase 1 — Inspect

Before coding:

1. Inspect the complete workspace.
2. Inspect `Photo/` recursively.
3. Open `Photo/screen (2).png`.
4. Open `Photo/screen (3).png`.
5. Open `Photo/screen (4).png`.
6. Open `Photo/screen (5).png`.
7. Inspect `DESIGN.md` if present.
8. Inspect existing Astro files.
9. Inspect `package.json`.
10. Determine the currently installed Astro, React, Tailwind, and Vite configuration.

Do not reinitialize an existing working Astro project.

## Phase 2 — Foundation

Verify/configure:

- Astro
- React integration
- Vite through Astro
- Tailwind CSS
- Lucide React
- TypeScript
- Global styles
- Design tokens

Do not add a database dependency.

## Phase 3 — File Content Layer

Create:

```text
content/
```

and the required JSON content files.

Create server-side read/write services with strict path validation.

## Phase 4 — Authentication

Implement the server-side admin authentication boundary before building sensitive dashboard modules.

## Phase 5 — Dashboard Shell

Build:

- Sidebar
- Header
- Main content area
- Responsive navigation

## Phase 6 — Modules

Implement in this order:

1. Overview
2. Profile & Hero
3. Projects
4. Tech Stack
5. Skills
6. Credentials
7. Inquiries

## Phase 7 — CRUD

Connect each editor to the file-based content API.

## Phase 8 — Public Integration

Make the public portfolio read the same content files.

Verify that an admin edit changes the content source used by the public portfolio.

## Phase 9 — QA

Run:

```bash
npm run check
npm run build
```

Then visually compare the dashboard with all four supplied references.

---

# 29. MOCK DATA RULES

Mock data is allowed during initial UI development.

However:

- Mark demo telemetry as mock.
- Use fictional names for inquiry examples.
- Use fictional IP addresses in demonstrations.
- Do not claim fake analytics are real.
- Do not fabricate the user's actual certificates, projects, skills, or social accounts.

Once real portfolio content is supplied, replace placeholders through the content files.

---

# 30. ERROR AND EMPTY STATES

Every module must handle:

- Loading
- Empty state
- Validation error
- File read error
- File write error
- Unauthorized state
- Not found state

Example:

```text
No projects yet.
Create your first project to display it on the portfolio.
```

Do not leave blank panels with no explanation.

---

# 31. DEFINITION OF DONE

The admin dashboard is complete only when:

- [ ] Astro project runs successfully.
- [ ] React integration works.
- [ ] Tailwind works.
- [ ] Lucide icons work.
- [ ] No database dependency exists.
- [ ] Portfolio content is stored in project files.
- [ ] `/user/admin` is server-side protected.
- [ ] All nested admin routes are protected.
- [ ] Admin APIs are protected.
- [ ] Login/logout works.
- [ ] Projects can be added, edited, deleted, reordered, and published/unpublished.
- [ ] Skills can be added, edited, deleted, reordered, and adjusted.
- [ ] Tech Stack can be edited.
- [ ] Credentials can be managed.
- [ ] Profile/Hero can be edited.
- [ ] Inquiries can be viewed securely.
- [ ] Public portfolio reads the same content source.
- [ ] `Photo/screen (2).png` was inspected and used for the Inquiries module.
- [ ] `Photo/screen (3).png` was inspected and used for the Projects module.
- [ ] `Photo/screen (4).png` was inspected and used for the Skills/Tech Stack module.
- [ ] `Photo/screen (5).png` was inspected and used for the Overview module.
- [ ] Desktop layout matches the references.
- [ ] Tablet layout is usable.
- [ ] Mobile layout is usable.
- [ ] Accessibility basics are implemented.
- [ ] No fake PostgreSQL/database status is displayed.
- [ ] Mock telemetry is clearly treated as mock data.
- [ ] `npm run check` succeeds when available.
- [ ] `npm run build` succeeds.
- [ ] No obvious console errors remain.

---

# 32. FINAL AGENT INSTRUCTION

**Start by inspecting the existing Antigravity IDE workspace and the actual files inside `Photo/`.**

Specifically inspect:

```text
Photo/screen (2).png
Photo/screen (3).png
Photo/screen (4).png
Photo/screen (5).png
```

Do not start by generating a generic admin dashboard.

Do not install or configure PostgreSQL, MySQL, SQLite, Supabase, Firebase, or another database.

Do not fabricate a database connection merely to populate telemetry cards.

Implement a secure, file-based portfolio editor instead.

The public portfolio and admin dashboard MUST share the same portfolio content source.

Build incrementally, validate after each major phase, and finish by running the project's checks/build and comparing the final dashboard visually against all four supplied design references.
