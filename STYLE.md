# Tracker Visual System Specification

> **Status:** Normative design source of truth  
> **Version:** 1.0.0  
> **Date:** 2026-08-17  
> **Scope:** Phase 1.5 specification only. This document does not authorize or imply that the current CSS, components, or `/design-system` route already conform.

The keywords **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** define requirement strength. When a feature implementation conflicts with this document, this document wins unless it is deliberately revised.

---

## 1. Visual Thesis

Tracker is an **optimistic biotech-neofuturist instrument for daily life**. It combines the calm precision of a well-designed scientific interface with subtle cues from living systems: cellular contours, branching lines, orbital relationships, and energetic signal colors.

The product is designed first for design-conscious students and young professionals, approximately ages 18–34. It MUST feel youthful without becoming juvenile, futuristic without becoming cyberpunk, and expressive without competing with the user's tasks or finances.

The emotional model is:

- **Calm foundation:** neutral canvases, clear hierarchy, restrained density, and stable surfaces.
- **Energetic moments:** color and motion appear when the user chooses, focuses, completes, encounters urgency, or needs recovery guidance.
- **Financial trust:** bill views remain factual, legible, and stable. Artistic treatment never obscures amounts, due dates, or payment states.
- **ADHD-aware attention:** one dominant action or focus target per viewport; everything else supports it rather than competing with it.

### 1.1 Personality attributes

Tracker MUST feel:

- precise;
- optimistic;
- alive;
- composed;
- tactile without skeuomorphism;
- technically credible;
- quietly distinctive.

Tracker MUST NOT feel:

- dystopian;
- gamer-oriented;
- corporate-enterprise generic;
- toy-like;
- excessively luxurious;
- sterile to the point of emotional distance;
- visually generated from a generic AI dashboard prompt.

---

## 2. Anti-Generic and Anti-“AI Slop” Rules

The following patterns are prohibited unless this document is explicitly amended:

- purple-to-blue gradient buttons;
- glass cards with `backdrop-filter`;
- blurred neon blobs behind every page;
- excessive rounded cards or pills;
- cards nested inside cards when simple spacing or a divider would work;
- a decorative icon box next to every heading;
- stock 3D characters, floating productivity objects, or generic AI sparkles;
- rainbow gradients used as a substitute for hierarchy;
- bento-grid layouts with no information-architecture reason;
- giant centered marketing copy followed by interchangeable feature cards;
- glowing borders around ordinary controls;
- unexplained charts, decorative metrics, or fake data visualizations;
- constant pulses, shimmer, parallax, or ambient movement;
- confetti as default completion feedback;
- emoji used as functional interface icons;
- monospace typography used everywhere to signal “technology.”

Distinctiveness MUST come from composition, typography, token discipline, asymmetrical geometry, biological line motifs, and interaction quality—not from piling on effects.

---

## 3. Implementation Architecture

### 3.1 Required technologies

- **Tailwind CSS v4** MUST provide utility generation and map semantic design tokens through `@theme inline`.
- **shadcn/ui** MUST provide accessible component structure and behavior. Components are copied into the repository and become owned source code.
- **Motion for React**—the current package formerly known as Framer Motion—MUST be installed as `motion` and imported from `motion/react` when JavaScript-driven animation is warranted.
- **Lucide React** MUST remain the default functional icon library.

shadcn/ui is a construction foundation, not a visual brand. Stock shadcn styling MUST be replaced with Tracker tokens and recipes. Future `components.json` configuration MUST use Tailwind v4, CSS variables, and the repository's global stylesheet.

### 3.2 Token layers

The implementation MUST use three layers:

1. **Primitive values:** raw OKLCH values, spacing units, durations, easing curves, radii, and font metrics.
2. **Semantic tokens:** `background`, `surface`, `foreground`, `muted-foreground`, `primary`, `danger`, `border`, `focus-ring`, and similar purpose-driven roles.
3. **Component recipes:** Button, Card, Input, Dialog, Badge, PlannerBlock, BillRow, and other component-level mappings.

Feature components MUST consume semantic utilities such as `bg-background`, `text-foreground`, `border-border`, and `bg-primary`. They MUST NOT contain direct Tailwind palette colors such as `indigo-500`, arbitrary hex values, or copied token values.

### 3.3 Theme selectors

The resolved document state MUST use:

```html
<html data-theme="dark" data-accent="chlorophyll">
```

Supported values are:

- `data-theme="light|dark"`
- `data-accent="chlorophyll|ultraviolet|solar"`

The stored appearance mode supports `system|light|dark`. `system` is resolved to `light` or `dark` before first paint. The DOM SHOULD contain the resolved mode, not the word `system`.

### 3.4 Appearance persistence

- First-time users default to `mode: "system"` and `accent: "chlorophyll"`.
- Anonymous preferences MUST be stored locally and applied before React renders.
- Authenticated preferences MUST synchronize to `profiles.preferences.appearance`.
- The local value MUST render immediately; the remote value MAY reconcile after session load.
- A pre-paint script MUST prevent a light/dark or accent flash.
- The root MUST set an appropriate `color-scheme` value.
- Appearance controls MUST present `System`, `Light`, and `Dark` separately from the three accent swatches.

Suggested local keys:

```text
tracker.appearance.mode
tracker.appearance.accent
```

---

## 4. Color System

All authored color tokens MUST use OKLCH. Hex values below are references for design review and fallback inspection; OKLCH is authoritative.

### 4.1 Base neutral themes

| Semantic role | Light theme | Hex reference | Dark theme | Hex reference |
| :--- | :--- | :--- | :--- | :--- |
| `background` | `oklch(97.5% 0.010 175)` | `#f0f9f6` | `oklch(14% 0.022 215)` | `#010b0f` |
| `surface-1` | `oklch(99.5% 0.004 175)` | `#fbfefd` | `oklch(18% 0.022 210)` | `#051417` |
| `surface-2` | `oklch(94% 0.014 175)` | `#e2eeea` | `oklch(23% 0.025 205)` | `#0e2022` |
| `surface-3` | `oklch(89% 0.018 180)` | `#cfdfdb` | `oklch(28% 0.030 200)` | `#162d2f` |
| `foreground` | `oklch(19% 0.025 215)` | `#05171b` | `oklch(94% 0.015 175)` | `#e1efea` |
| `muted-foreground` | `oklch(46% 0.025 210)` | `#485c60` | `oklch(70% 0.025 190)` | `#8ea4a2` |
| `border` | `oklch(82% 0.025 190)` | `#b3cac8` | `oklch(34% 0.028 200)` | `#263c3e` |
| `border-strong` | `oklch(68% 0.035 195)` | `#809f9f` | `oklch(48% 0.035 195)` | `#466464` |

The canvas intentionally carries a subtle blue-green bias. Neutral surfaces MUST NOT drift into generic slate-blue or purple.

### 4.2 Accent presets

Accent choice changes brand and interaction signals. It MUST NOT change semantic success, warning, danger, paid, overdue, or focus meaning.

| Preset | Purpose | Light `primary` | Dark `primary` | Supporting hue |
| :--- | :--- | :--- | :--- | :--- |
| **Chlorophyll** | Default; optimistic growth and forward action | `oklch(47% 0.150 135)` / `#306c00` | `oklch(83% 0.180 130)` / `#a0de53` | Aqua, hue 195 |
| **Ultraviolet** | Creative depth and reflective focus | `oklch(48% 0.190 295)` / `#693abb` | `oklch(74% 0.170 300)` / `#bc8fff` | Electric blue, hue 245 |
| **Solar** | Warm momentum and sociable energy | `oklch(50% 0.170 35)` / `#af2f09` | `oklch(76% 0.160 45)` / `#ff8c53` | Amber, hue 85 |

Foreground pairings:

- Light-theme primary fills MUST use `oklch(99% 0.004 175)` (`#f9fdfb`) as `on-primary`.
- Dark-theme primary fills MUST use `oklch(16% 0.030 210)` (`#001114`) as `on-primary`.
- Supporting hues are for charts, selection ranges, decorative diagrams, and secondary signals. They MUST NOT carry text without a contrast audit.
- Chlorophyll is the default accent.
- Only one accent preset may be active at a time.

### 4.3 Fixed semantic colors

| State | Light strong | Dark strong | Required meaning |
| :--- | :--- | :--- | :--- |
| Success / paid | `oklch(46% 0.130 160)` / `#006d3d` | `oklch(78% 0.140 160)` / `#56d298` | Completed, paid, successful |
| Warning / due soon | `oklch(49% 0.130 75)` / `#8a5200` | `oklch(82% 0.150 85)` / `#f0bb3b` | Attention needed soon |
| Danger / overdue | `oklch(49% 0.190 25)` / `#b31220` | `oklch(72% 0.180 25)` / `#ff6f69` | Destructive, invalid, overdue |
| Information | `oklch(47% 0.140 235)` / `#00649d` | `oklch(76% 0.130 235)` / `#4ebdf7` | Neutral guidance or system info |

Status MUST never rely on color alone. Use a text label and, where useful, an icon or shape.

### 4.4 Contrast rules

- Normal text MUST meet or exceed a 4.5:1 contrast ratio.
- Large text and essential component boundaries MUST meet or exceed 3:1.
- Focus indicators MUST meet or exceed 3:1 against adjacent colors.
- Disabled controls remain legible but are not required to resemble enabled controls.
- Every 2-theme × 3-accent combination MUST pass automated contrast tests.
- The supplied primary/on-primary pairs are designed above 4.5:1, but implementation acceptance still requires browser-computed audits.

### 4.5 Accent restraint

- A viewport SHOULD have one dominant accent-colored action or active focus region.
- Accent color MAY appear in selected navigation, active timers, drag targets, focus rings, progress, and primary actions.
- Accent color MUST NOT decorate every heading, border, badge, and icon simultaneously.
- Semantic colors override accent colors when communicating status.
- Large accent-filled regions SHOULD be reserved for Focus mode, onboarding, or a singular hero state.

---

## 5. Typography

### 5.1 Families

- **Display:** Syne, self-hosted WOFF2, weights 600 and 700.
- **Interface/body:** Manrope variable, self-hosted WOFF2, required range 400–700.
- **Fallback:** `system-ui, -apple-system, "Segoe UI", sans-serif`.
- A third font family MUST NOT be introduced without revising the performance budget.
- Timers, dates, and financial amounts MUST use Manrope with `font-variant-numeric: tabular-nums` rather than loading a monospace font.

### 5.2 Type scale

| Token | Size / line height | Weight | Use |
| :--- | :--- | :--- | :--- |
| `display-xl` | `clamp(2.5rem, 6vw, 4.75rem) / 0.95` | Syne 700 | Marketing statement only |
| `display` | `clamp(2rem, 4vw, 3.5rem) / 1.0` | Syne 700 | Focus hero, major empty state |
| `heading-1` | `clamp(1.75rem, 3vw, 2.5rem) / 1.1` | Syne 700 | Page title |
| `heading-2` | `1.75rem / 1.2` | Syne 600 | Major section |
| `heading-3` | `1.25rem / 1.3` | Manrope 700 | Component section |
| `body-lg` | `1.125rem / 1.6` | Manrope 450–500 | Lead or onboarding text |
| `body` | `1rem / 1.5` | Manrope 400–500 | Default interface text |
| `body-sm` | `0.875rem / 1.45` | Manrope 450–600 | Secondary interface text |
| `label` | `0.75rem / 1.3` | Manrope 650 | Short labels and metadata |

Rules:

- Display type MUST be used sparingly; it is identity, not body copy.
- All-caps text is limited to short labels of approximately 20 characters or fewer.
- Uppercase labels SHOULD use `0.06em–0.10em` tracking.
- Body copy MUST NOT use negative tracking.
- Monetary values and timers MUST use tabular numerals.
- Headings SHOULD use sentence case, not title case.
- Text line length SHOULD remain between 45 and 75 characters in reading contexts.

---

## 6. Geometry, Spacing, and Layout

### 6.1 Spacing

- The spacing system is based on a 4px unit.
- Preferred steps are `4, 8, 12, 16, 24, 32, 48, 64, 96`.
- Arbitrary spacing values SHOULD NOT appear in feature components.
- Dense operational screens use 8–16px internal spacing.
- Focus, onboarding, and empty states use 24–48px breathing room.

### 6.2 Radius and shape

| Token | Value | Use |
| :--- | :--- | :--- |
| `radius-xs` | 2px | Progress tracks, tiny markers |
| `radius-sm` | 4px | Badges, compact controls |
| `radius-md` | 8px | Inputs and buttons |
| `radius-lg` | 12px | Cards, dialogs, large controls |
| `radius-display` | 16px | Hero/focus surfaces only |

- Pills are reserved for true tags, compact filters, segmented controls, and status chips.
- Cards and buttons MUST NOT default to fully rounded shapes.
- Signal surfaces MAY use asymmetric corners such as `12px 12px 4px 12px`.
- Asymmetry SHOULD mark importance or direction, not appear randomly.
- Decorative corner cuts MUST NOT clip focus rings or reduce the interactive hit target.

### 6.3 Layout widths

- Minimum supported viewport: 320px.
- App shell maximum content width: 1440px.
- Marketing/showcase maximum content width: 1200px.
- Reading/form column maximum width: 720px.
- Mobile layouts MUST be usable without hover.
- Pages MUST NOT cause accidental horizontal overflow.
- The planner MAY use an intentional internal horizontal or vertical scroll region with visible affordance and sticky time labels.

### 6.4 Adaptive density

- Focus and onboarding views SHOULD be spacious and singular.
- Planner, bills, task tables, and time logs SHOULD be compact but never cramped.
- Density MUST change by context, not by shrinking text below readable sizes.
- Mobile views SHOULD reduce simultaneous information before reducing touch-target size.

---

## 7. Surfaces and Artistic Material

Tracker uses **solid technical surfaces with biological interruptions**.

### 7.1 Surface rules

- Primary surfaces are opaque.
- Depth is expressed with luminance steps, 1px borders, overlap, and restrained shadows.
- `backdrop-filter` and glassmorphism are prohibited.
- Ordinary cards MUST NOT glow.
- Dark mode SHOULD rely more on borders and surface steps than large shadows.
- Light mode MAY use a low-opacity, low-diffusion shadow for dialogs and floating menus.
- Dense content SHOULD prefer section boundaries and dividers over wrapping every group in a card.

### 7.2 Biotech motifs

Allowed motifs:

- static topographic or cellular contour lines;
- branching pathways;
- orbit-like relationship lines;
- cropped circles and membrane arcs;
- micro-grid coordinates and restrained scientific annotations;
- asymmetric curved interruptions within precise rectangular composition.

Motifs MUST:

- be implemented as optimized SVG or CSS;
- remain static by default;
- stay at or below roughly 8% opacity in dark mode and 5% in light mode;
- avoid sitting behind dense text, financial amounts, or planner blocks;
- disappear when they harm readability on small screens.

### 7.3 Gradient policy

- Gradients are atmospheric, not structural.
- A page MAY use one restrained ambient gradient region.
- Buttons, inputs, badges, and routine cards MUST use solid semantic colors.
- Accent gradients MAY appear in marketing art, Focus hero artwork, or the design-system showcase.
- Gradients MUST NOT combine all three accent presets at once.

---

## 8. Icons and Illustration

- Functional icons use Lucide.
- Default icon stroke is visually equivalent to 1.75px at 24px.
- Standard sizes are 16px, 20px, and 24px.
- Icons MUST accompany or supplement labels unless the action is universally understood and has an accessible name.
- Icons MUST NOT be placed in decorative gradient squares by default.
- Filled icons are reserved for selected or completed state when outline alone lacks clarity.
- Custom illustrations SHOULD be line-based biotech diagrams authored as optimized SVG.
- Custom decorative SVGs MUST use `currentColor` or semantic token variables where practical.
- Stock 3D illustration, AI-generated productivity characters, and decorative emoji are prohibited.

The initial brand treatment is a typographic `TRACKER` wordmark using Syne. A permanent abstract logo is deferred until the product name and positioning are validated.

---

## 9. Motion System

Motion communicates causality, spatial change, completion, and recovery. It is not ambient decoration.

### 9.1 Technology boundary

Use CSS for:

- color transitions;
- focus and hover feedback;
- simple press state;
- uncomplicated opacity changes;
- one-element transforms with no orchestration.

Use Motion for React for:

- enter/exit orchestration;
- shared-layout transitions;
- reordered lists;
- planner drag overlays and snap feedback;
- dialogs, sheets, and popovers with coordinated presence;
- state transitions involving multiple elements.

The future implementation SHOULD use `LazyMotion` where it reduces shipped code and MUST configure `<MotionConfig reducedMotion="user">`.

### 9.2 Timing tokens

| Token | Duration | Use |
| :--- | :--- | :--- |
| `instant` | 100ms | Press and tiny state response |
| `fast` | 160ms | Hover, focus, selection |
| `standard` | 240ms | Popover, row change, completion |
| `deliberate` | 300ms | Dialog, sheet, major view transition |

No ordinary interface animation may exceed 300ms.

Recommended curves:

- Enter: `cubic-bezier(0.16, 1, 0.3, 1)`
- Exit: `cubic-bezier(0.7, 0, 0.84, 0)`
- Standard: `cubic-bezier(0.2, 0, 0, 1)`

Recommended Motion springs:

- Snappy: stiffness 420, damping 34, mass 0.7
- Gentle layout: stiffness 280, damping 30, mass 0.8

### 9.3 Interaction rules

- Button press MAY scale to 0.985.
- Cards SHOULD NOT bounce or lift more than 1px on hover.
- Route/view entry MAY combine opacity with at most 4px of translation.
- List staggering, when justified, MUST be limited to the first four visible items and approximately 30ms between items.
- Completion SHOULD use a check-path draw, brief surface tint, and stable strikethrough within 240ms.
- Confetti is prohibited by default and MAY only be introduced as an explicitly enabled milestone celebration.
- Active timers MAY use one restrained status animation; unrelated elements remain static.
- Scroll-jacking, parallax, autoplay backgrounds, perpetual floating, and shimmer loops are prohibited.

### 9.4 Reduced motion

With reduced motion enabled:

- transform and layout animation MUST be removed;
- drag operations MUST remain functional with static overlays;
- opacity transitions MAY remain at 100ms or less;
- path drawing SHOULD resolve immediately;
- no information may depend on animation;
- CSS and Motion settings MUST respond to preference changes without a reload.

---

## 10. Component Recipes

### 10.1 Buttons

Required variants:

- **Primary:** solid active accent, high-contrast `on-primary` text.
- **Secondary:** `surface-2`, strong border, foreground text.
- **Outline:** transparent background, strong border.
- **Ghost:** transparent; gains a subtle surface on hover/focus.
- **Danger:** fixed danger color; never uses the selected accent.
- **Icon:** square geometry with an accessible name.

Rules:

- Default button height is 44px.
- Compact desktop-only controls MAY be 36px when their total hit region remains at least 44px.
- Large primary actions MAY be 48px.
- Buttons use `radius-md`, never full pills by default.
- Primary buttons use solid color, not gradients or glow.
- Loading state preserves width and exposes progress semantics.
- Destructive labels name the action, such as “Archive bill,” not “Confirm.”

### 10.2 Cards and sections

Required treatments:

- **Section:** spacing plus heading/divider; preferred for most grouping.
- **Surface:** `surface-1` or `surface-2` with a border.
- **Signal:** asymmetric radius and restrained accent edge for active focus.
- **Interactive:** visible hover/focus/selected states without large movement.

There is no `glass` card variant. Gradient cards are limited to explicit hero/art roles.

### 10.3 Badges and statuses

- Badges use `radius-sm` unless they are true filter/status chips.
- Status chips include text and MAY include a dot or icon.
- Pulsing dots are reserved for a genuinely active process, such as a running timer.
- “Paid,” “Due soon,” and “Overdue” always use fixed semantic colors.
- Badge density MUST NOT turn a task row into a collection of labels.

### 10.4 Forms

- Labels remain visible; placeholder text is not a label.
- Default input height is at least 44px.
- Inputs use opaque surfaces and `radius-md`.
- Focus uses a 2px semantic focus ring plus adequate offset.
- Error state includes a message and icon where useful, not color alone.
- Help text explains format or recovery, not obvious restatement.
- Floating labels SHOULD NOT be used unless usability testing justifies them.

### 10.5 Dialogs, sheets, and popovers

- Behavior SHOULD come from shadcn/Radix primitives.
- Escape dismissal, focus trapping, focus return, labelled titles, and scroll lock are mandatory where applicable.
- Overlays use a solid alpha color; no backdrop blur.
- Dialog entry uses opacity and no more than 4px translation or 0.98 scale.
- Mobile task flows SHOULD prefer bottom sheets when they preserve context better than centered dialogs.
- Popovers anchor to the triggering time slot/control and remain within the viewport.

### 10.6 Navigation

- Selected navigation uses accent plus shape/weight, not color alone.
- Navigation icons remain visually quiet until selected.
- Mobile navigation prioritizes Focus, Tasks, Planner, and Bills.
- Labels SHOULD remain visible in primary navigation.

### 10.7 Planner and drag states

- Time slots use quiet borders and clear hour hierarchy.
- Task blocks use category tint sparingly; active/dragged state uses the selected accent.
- Valid drop targets gain a clear outline and surface shift.
- Conflicting targets use warning or danger semantics and text/icon explanation.
- Drag overlays are opaque enough to read and MUST NOT use blur.
- Keyboard drag state receives the same visual prominence as pointer drag.

### 10.8 Bills and financial data

- Amounts use tabular numerals and align consistently.
- Due date, amount, and payment state form the dominant row hierarchy.
- Paid rows remain legible; they are not reduced to low-opacity text.
- Overdue treatment is calm and unmistakable, never flashing.
- Archive actions are secondary and clearly separated from payment actions.

### 10.9 Appearance selector

- Theme mode uses a labelled segmented control or radio group: System, Light, Dark.
- Accent uses three labelled swatches: Chlorophyll, Ultraviolet, Solar.
- Swatches show selected state with shape, checkmark, and accessible text.
- Accent preview MUST demonstrate primary action, focus ring, and selected state—not color alone.

---

## 11. ADHD-Oriented Attention Rules

- Each viewport MUST establish one obvious “next useful action.”
- Bright accent is reserved for current focus, primary action, or active drag target.
- Must-Win 3 items remain visually grouped and limited to three visible slots.
- Completed priorities remain visible with a check and stable strikethrough; they do not disappear unexpectedly.
- Dense pages use progressive disclosure rather than exposing every option at once.
- Secondary metadata MUST remain available without competing with title, time, amount, or status.
- Empty states provide one clear recovery or creation action.
- Errors explain what happened and the next action.
- Completion feedback is brief, satisfying, and non-manipulative.
- Streaks, guilt language, loss framing, and artificial urgency are prohibited.
- The Focus view SHOULD have fewer simultaneous controls than task/planner views.

---

## 12. Content and Interface Voice

Tracker speaks briefly, directly, warmly, and with slight technical precision.

### 12.1 Voice rules

- Use clear verbs: “Add block,” “Start timer,” “Mark paid,” “Move to tomorrow.”
- Prefer sentence case.
- State consequences before destructive or irreversible actions.
- Financial warnings remain factual: “Internet bill is 2 days overdue.”
- Errors include recovery: “We couldn’t move the block. Your original time is unchanged.”
- Completion copy may acknowledge progress without exaggerated praise.
- Empty states answer what the user can do next.

### 12.2 Prohibited voice

Do not use:

- “Unlock your potential”;
- “Supercharge your productivity”;
- “Crush your goals”;
- “AI-powered” as decorative marketing language;
- guilt, shame, or scolding;
- infantilizing celebration;
- vague buttons such as “Continue” or “Confirm” when a specific verb is available.

---

## 13. Accessibility Requirements

- Target WCAG 2.2 AA as the minimum release bar.
- Interactive targets MUST be at least 44×44 CSS pixels, including touch spacing.
- All workflows MUST support keyboard operation.
- No essential action may be hover-only, drag-only, color-only, or motion-only.
- Focus indicators MUST remain visible in all six appearance combinations.
- Focus order MUST follow visual and logical order.
- Dialogs, sheets, menus, and popovers MUST expose correct names, roles, and states.
- Status changes SHOULD use an appropriately polite live region.
- Drag-and-drop MUST have tap/form and keyboard equivalents.
- Text zoom to 200% MUST preserve operation and content.
- Layout MUST reflow at narrow widths without hiding essential information.
- Reduced-motion behavior is mandatory, not optional polish.
- Decorative SVGs are hidden from assistive technology; informative SVGs receive accessible names.

---

## 14. Performance Requirements

Performance is part of the visual system.

### 14.1 User-experience targets

At the 75th percentile, segmented across mobile and desktop:

- Largest Contentful Paint (LCP): **≤ 2.5 seconds**
- Interaction to Next Paint (INP): **≤ 200ms**
- Cumulative Layout Shift (CLS): **≤ 0.1**

### 14.2 Asset and rendering budgets

- Maximum two font families and three WOFF2 files.
- Total compressed font target: **≤ 180KB**.
- Fonts MUST use `font-display: swap` or an equivalent non-blocking strategy.
- Style-specific decorative assets MUST be SVG/CSS and **≤ 50KB per route**.
- Raster artwork MUST NOT be required for core navigation or operation.
- `backdrop-filter` is prohibited.
- `filter`, blur, large shadow, and gradient animation are prohibited.
- Ordinary interaction animation MUST use opacity and/or transform.
- JavaScript animation MUST NOT replace a simple CSS transition.
- Continuous animation is prohibited outside a genuinely active status indicator.
- Hidden routes SHOULD NOT eagerly load decorative art or showcase-only motion.
- Motion features SHOULD be imported narrowly and use `LazyMotion` where measurable.
- The implementation MUST be tested on a throttled, mid-tier mobile profile and at 320px width.

---

## 15. `/design-system` Showcase Contract

The future showcase MUST become an implementation test surface, not a decorative portfolio page.

It MUST include:

- System/Light/Dark controls;
- Chlorophyll/Ultraviolet/Solar controls;
- base and semantic token swatches;
- contrast results for required text/surface pairings;
- typography specimens;
- spacing, radius, border, and elevation tokens;
- all component variants and interactive states;
- planner block and drag/drop states;
- bill states and tabular amount examples;
- reduced-motion preview;
- keyboard focus demonstrations;
- representative mobile viewport previews;
- a visible list of prohibited patterns or legacy styles.

The showcase MUST render all 2 × 3 theme/accent combinations without requiring source edits.

---

## 16. Migration Plan for the Current Interface

Current glassmorphism, indigo/violet defaults, hard-coded palette classes, and missing centralized motion rules are legacy behavior.

Future implementation SHOULD proceed in this order:

1. Self-host and preload the approved font files within budget.
2. Initialize/configure shadcn/ui for React 19 and Tailwind v4 with CSS variables.
3. Install `motion` and establish a single app-level Motion configuration.
4. Add primitive and semantic tokens to `src/index.css` using OKLCH and `@theme inline`.
5. Add the pre-paint appearance resolver and profile/local preference synchronization.
6. Replace `.glass-panel`, `.glass-input`, blur, glow, and direct hex styling.
7. Rebuild shared primitives using shadcn behavior and Tracker recipes.
8. Migrate feature pages from hard-coded palette utilities to semantic tokens.
9. Rebuild `/design-system` as the matrix and acceptance surface in Section 15.
10. Run contrast, keyboard, reduced-motion, responsive, visual-regression, and performance tests.

Migration MUST be component-first rather than page-by-page duplication. New feature work MUST NOT introduce additional legacy glass or hard-coded palette styling while migration is pending.

---

## 17. Acceptance Criteria for Phase 1.5 Implementation

The later CSS/React implementation is complete only when:

- all required semantic tokens exist;
- all six theme/accent combinations render correctly;
- appearance persists locally and synchronizes after authentication;
- no first-paint theme flash is visible;
- shared components consume semantic tokens;
- ordinary feature components contain no direct palette colors or hex values;
- glassmorphism and `backdrop-filter` are absent;
- shadcn-derived primitives meet keyboard and assistive-technology expectations;
- Motion is limited to the responsibilities in Section 9;
- reduced motion has automated and manual coverage;
- all required contrast pairings pass;
- 320px layouts remain operable;
- the design-system route satisfies Section 15;
- the performance budgets in Section 14 are measured and pass;
- screenshots are reviewed in light/dark and all three accent presets;
- the user approves the implemented showcase before feature-wide migration is considered final.

---

## 18. Reference Documentation

- [Tailwind CSS theme variables](https://tailwindcss.com/docs/theme)
- [shadcn/ui theming](https://ui.shadcn.com/docs/theming)
- [shadcn/ui with Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4)
- [Motion for React installation](https://motion.dev/docs/react-installation)
- [MotionConfig and reduced-motion policy](https://motion.dev/docs/react-motion-config)
- [Motion `useReducedMotion`](https://motion.dev/docs/react-use-reduced-motion)
- [Core Web Vitals](https://web.dev/articles/vitals)

