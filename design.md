# FEKRETNA — BRAND IDENTITY & DESIGN SYSTEM SPECIFICATION

> **"من فكرة لفريق" — From Idea to Team**  
> *A friendly and inspiring digital space where ideas meet the right people.*

---

## 1. Brand Philosophy

**Fekretna** (فكرتنا) is the premier collaboration platform built for Tunisian students, young entrepreneurs, developers, designers, and aspiring startup founders.

The core visual and emotional relationship is grounded in a dual-core synergy:
- **CYAN = Connection, Technology, Action** (`#06b6d4` / `#0891b2`)
- **ORANGE = Ideas, Creativity, Energy** (`#f97316` / `#ea580c`)
- **DEEP NAVY = Trust, Focus, Infinite Canvas** (`#070a13` / `#0c1322`)

Fekretna feels futuristic yet deeply approachable. It avoids looking like an overwhelming enterprise dashboard, a gaming site, or a crowded generic social network. Instead, it invites exploration, team building, and bold execution.

---

## 2. Logo Usage Rules

The **Fekretna logo** is the cornerstone of the brand identity:
1. **Components**:
   - Left speech bubble in brand cyan gradient (`#06b6d4` → `#22d3ee` → `#0284c7`).
   - Right speech bubble in warm idea orange gradient (`#f59e0b` → `#f97316` → `#ea580c`).
   - Central interlocking filament bulb representing the spark of innovation, collaboration, and shared vision.
2. **Integrity**:
   - **Do not alter, recolor, distort, flip, or replace the logo.**
   - The logo must always be rendered with its exact SVG geometry and original gradients.
   - Maintain clear padding equal to at least 25% of the logo's height on all sides.
   - On dark surfaces, an optional ambient cyan/orange glow (`withGlow`) is applied.

---

## 3. Primary Cyan Color

Cyan represents **Action, Technology, and Connection**. It is the primary interactive color across the entire application.

| Role | Dark Mode Value | Light Mode Value | Usage |
| :--- | :--- | :--- | :--- |
| **Base Cyan** | `#06b6d4` | `#0891b2` | Primary buttons, active tabs, links, key metrics |
| **Cyan Hover** | `#22d3ee` | `#0e7490` | Hover states, glowing node pulses |
| **Cyan Soft** | `rgba(6, 182, 212, 0.12)` | `rgba(8, 145, 178, 0.08)` | Active pill backgrounds, subtle well highlights |
| **Cyan Ring** | `#06b6d4` | `#0891b2` | Accessible focus rings and selection halos |

**When to use Cyan**:
- Primary call-to-action buttons ("Rejoindre Fekretna", "Créer un projet", "Se connecter", "Envoyer candidature").
- Active navigation links and indicator bars.
- Form focus states and checkbox selections.
- Digital network connection lines, tech skill tags, and progress bars.

---

## 4. Secondary Orange Color

Orange represents **Ideas, Creativity, and Spark**. It is intentionally used as a warm, purposeful accent that complements cyan without competing with it.

| Role | Dark Mode Value | Light Mode Value | Usage |
| :--- | :--- | :--- | :--- |
| **Base Orange** | `#f97316` | `#ea580c` | Idea indicators, advice actions, notification badges |
| **Orange Hover** | `#fb923c` | `#c2410c` | Hover state for advice buttons and idea cards |
| **Orange Soft** | `rgba(249, 115, 22, 0.12)` | `rgba(234, 88, 12, 0.08)` | Idea stage tags, creative skill backgrounds |
| **Warm Gold Accent**| `#f59e0b` | `#d97706` | Creative highlight shimmer, advice star rating |

**When to use Orange**:
- Idea stage tags (`stage === "Idea"`).
- Giving advice to founders ("Donner un conseil", "Idée constructive").
- Unread notification badges on the navigation bar.
- Creative and media skills capsules (`#Design`, `#Branding`, `#UI/UX`).
- "Reels / Idées" discovery highlights.

**Do NOT use Orange for**:
- Standard confirm/submit buttons (use Cyan).
- Error banners (use Red/Rose `#ef4444`).
- General background fills (keep surfaces clean dark navy or crisp white).

---

## 5. Background Colors

Fekretna uses an elegant, deep space navy canvas rather than pure pitch black, providing richer depth and contrast:

| Layer | Dark Mode | Light Mode | Description |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#070a13` | `#f8fafc` | Base application viewport and document root |
| **Main Surface** | `#0c1322` | `#ffffff` | Cards, modal sheets, panels |
| **Elevated Surface** | `#0f192e` | `#f1f5f9` | Dropdowns, popovers, nested stat cards |
| **Secondary Wells** | `#131c33` | `#e2e8f0` | Input wells, inactive tag backgrounds |
| **Glass Nav** | `rgba(7, 10, 19, 0.85)` | `rgba(255, 255, 255, 0.95)` | Floating frosted navigation bars |

---

## 6. Text Colors

Text hierarchy guarantees WCAG AA (contrast ratio $\ge 4.5:1$) in both light and dark themes:

| Level | Dark Mode | Light Mode | Purpose |
| :--- | :--- | :--- | :--- |
| **Primary Text** | `#f8fafc` | `#0f172a` | Page titles, card headers, user names |
| **Secondary Text** | `#94a3b8` | `#475569` | Descriptions, body copy, navigation links |
| **Muted Text** | `#64748b` | `#64748b` | Timestamps, metadata labels, placeholders |
| **Inverse / Button** | `#ffffff` | `#ffffff` | Text on saturated cyan/orange CTA buttons |

---

## 7. Supporting Semantic Colors

| Intent | Dark Mode | Light Mode | Usage |
| :--- | :--- | :--- | :--- |
| **Success** | `#10b981` (Emerald) | `#059669` | Connected state, accepted requests, online dot |
| **Warning** | `#f59e0b` (Amber) | `#d97706` | Pending requests, review notices |
| **Error** | `#ef4444` (Rose/Red) | `#dc2626` | Validation errors, report buttons, rejection |
| **Info** | `#0ea5e9` (Sky) | `#0284c7` | Guidance tips, ecosystem announcements |

---

## 8. Color Tokens

Defined in `src/app/globals.css`:

```css
:root {
  --fekretna-cyan: #06b6d4;
  --fekretna-cyan-hover: #0891b2;
  --fekretna-cyan-soft: rgba(6, 182, 212, 0.12);
  --fekretna-orange: #f97316;
  --fekretna-orange-hover: #ea580c;
  --fekretna-orange-soft: rgba(249, 115, 22, 0.12);
  --fekretna-background: #070a13;
  --fekretna-surface: #0c1322;
  --fekretna-surface-elevated: #0f192e;
  --fekretna-text-primary: #f8fafc;
  --fekretna-text-secondary: #94a3b8;
  --fekretna-text-muted: #64748b;
  --fekretna-border: #1e293b;
  --fekretna-focus: #06b6d4;
  --fekretna-success: #10b981;
  --fekretna-warning: #f59e0b;
  --fekretna-error: #ef4444;
}

html.light {
  --fekretna-cyan: #0891b2;
  --fekretna-cyan-hover: #0e7490;
  --fekretna-cyan-soft: rgba(8, 145, 178, 0.08);
  --fekretna-orange: #ea580c;
  --fekretna-orange-hover: #c2410c;
  --fekretna-orange-soft: rgba(234, 88, 12, 0.08);
  --fekretna-background: #f8fafc;
  --fekretna-surface: #ffffff;
  --fekretna-surface-elevated: #f1f5f9;
  --fekretna-text-primary: #0f172a;
  --fekretna-text-secondary: #475569;
  --fekretna-text-muted: #94a3b8;
  --fekretna-border: #e2e8f0;
  --fekretna-focus: #0891b2;
}
```

---

## 9. Typography

- **Latin Font**: `Plus Jakarta Sans` / System Sans (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`).
- **Arabic Font**: `Cairo` / `Noto Sans Arabic` (`"Segoe UI", Tahoma, sans-serif`).
- **Scale Hierarchy**:
  - `Display / Hero`: `font-extrabold text-3xl sm:text-5xl tracking-tight leading-tight`
  - `Page Titles (H1)`: `font-extrabold text-2xl sm:text-3xl tracking-tight`
  - `Card Titles (H2/H3)`: `font-bold text-base sm:text-lg tracking-tight`
  - `Body`: `text-sm sm:text-base leading-relaxed text-slate-300 dark:text-slate-300`
  - `Captions & Badges`: `text-[10px] / text-[11px] font-semibold tracking-wide uppercase`

---

## 10. Iconography

- **Library**: `lucide-react`.
- **Sizes**: Standardized across components:
  - Navigation icons: `h-4.5 w-4.5`
  - Badges & meta indicators: `h-3.5 w-3.5`
  - Action buttons: `h-4 w-4`
  - Floating reels buttons: `h-5 w-5`
- **Stroke Width**: Default `2px` (or `1.75px` for delicate metadata).
- **Directional Icons**: Back and forward arrows automatically receive `.rtl-flip` for proper Arabic display.

---

## 11. Button Styles

### Primary Button (`.btn-fekretna-primary`)
- **Intent**: Connection, submission, primary actions.
- **Background**: Linear cyan gradient `linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0284c7 100%)`.
- **Text**: Pure white (`#ffffff`).
- **Hover**: Subtle lift `translateY(-1px)`, box shadow `rgba(6, 182, 212, 0.45)`.

### Orange / Idea Button (`.btn-fekretna-orange`)
- **Intent**: Idea creation, giving advice, innovation highlights.
- **Background**: Warm orange gradient `linear-gradient(135deg, #f97316 0%, #ea580c 60%, #c2410c 100%)`.
- **Text**: Pure white (`#ffffff`).
- **Hover**: Subtle lift `translateY(-1px)`, box shadow `rgba(249, 115, 22, 0.45)`.

### Secondary / Outline Button (`.btn-fekretna-outline`)
- **Background**: Transparent with subtle border (`border-slate-300 dark:border-slate-800`).
- **Text**: Slate (`text-slate-700 dark:text-slate-300`).
- **Hover**: `bg-slate-100 dark:bg-slate-800/80`.

---

## 12. Card Styles (`.card-fekretna`)

- **Border Radius**: `rounded-3xl` (24px) for cards, `rounded-2xl` (16px) for inner modules.
- **Surface**: `#0c1322` in dark mode, `#ffffff` in light mode.
- **Border**: 1px subtle slate (`border-slate-200 dark:border-slate-800/80`).
- **Hover Behavior**:
  - Border transitions to `border-cyan-500/40`.
  - Gentle elevation lift: `translateY(-2px)`.
  - Soft ambient glow: `box-shadow: 0 16px 36px -12px rgba(6, 182, 212, 0.15)`.

---

## 13. Navigation Styles

- **Desktop Sidebar**:
  - Docked on the left in LTR (French/English) and on the right in RTL (Arabic).
  - Surface: Frosted glass navy `rgba(8, 13, 26, 0.7)` with `backdrop-blur-xl`.
  - Active item: Brand cyan pill with vertical gradient bar on the inner edge.
  - "Idées / Reels" link: Adorned with a warm brand orange `Reels` pill badge.
- **Top Navbar**:
  - Sticky frosted container.
  - Brand Logo + Arabic tagline *"من فكرة لفريق"*.
  - Unread notification pill in brand orange (`bg-orange-500 text-white`).
- **Mobile Dock**:
  - Floating bottom rounded pill with glass blur and cyan active highlight.

---

## 14. Hover States

- All interactive controls transition with `duration-200` to `duration-300` using `cubic-bezier(0.16, 1, 0.3, 1)`.
- Cards never shift violently; maximum vertical translation is `-2px` to `-3px`.
- Icons inside buttons scale delicately (`scale-105`).

---

## 15. Focus States

- Keyboard accessibility is mandatory:
- Focus ring: `focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2`.
- Form fields: `focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500`.

---

## 16. Animation Rules

- **Principle**: Subtle, performant, never distracting.
- Floating background elements animate with long durations (6s to 8s) using CSS transforms.
- **Reduced Motion**:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

---

## 17. Accessibility Rules (WCAG AA)

1. **Color Independence**: Status is never communicated by color alone (always paired with icons or text).
2. **Text Contrast**: $\ge 4.5:1$ for all body text, $\ge 3.0:1$ for large headings.
3. **Touch Targets**: Minimum interactive area is $44 \times 44\text{ px}$ on mobile screens.
4. **Form Labels**: Inputs always maintain explicit `<label>` or `aria-label` tags.

---

## 18. Light & Dark Mode Behavior

- **Primary Mode**: Dark mode (deep midnight space navy) is the default and signature aesthetic.
- **Light Mode**: Crisp, high-contrast white surfaces (`#ffffff`) over soft slate backgrounds (`#f8fafc`).
- Primary buttons retain crisp white text on colored backgrounds in both modes (`.keep-white`).
- Theme switcher switches instantly and persists user preference.

---

## 19. Arabic & RTL Considerations

- In Arabic (`ar`), the HTML document root receives `dir="rtl"`.
- Layout components flip seamlessly:
  - Sidebar docks to the right side of the viewport.
  - Back arrows and chevrons mirror with `.rtl-flip`.
  - Chat message bubbles align naturally for Arabic readers.
  - Typography uses the Arabic font family (`Cairo` / `Noto Sans Arabic`).

---

## 20. Component Usage Guidelines

| Component | Cyan Usage | Orange Usage | Neutral/Other |
| :--- | :--- | :--- | :--- |
| **Project Card** | Category tag, Apply button, Details link | "Idea" stage badge | City, format, dates |
| **Profile Card** | Connect button, Tech skills, Match % | Creative skills | Location, Availability |
| **Reels / Ideas** | Connect action, collaborate button | Advice button (Lightbulb), Idea tag | Like (Rose), Comments |
| **Navbar** | Logo cyan bubble, Create CTA | Unread notification count | Search, user profile |
| **Modals** | "Connect" modal header & submit | "Advice" modal header & submit | Cancel, close |
