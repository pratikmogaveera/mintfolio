# Mintfolio — Design System

Implementation-ready tokens and specs. Use this when building components.

---

## Brand

- **Name:** Mintfolio
- **Logo:** Green dot wordmark — `● mintfolio`
- **Favicon:** Green dot `●` on transparent/dark background
- **Tagline direction:** Personal portfolio tracker (not a platform, not a service — YOUR money)

---

## Colors

### Dark Mode (Primary) — Implemented via CSS variables in `globals.css`

| CSS Variable | OKLCH | Approx Hex | Use |
|-------|-------|-----|-----|
| `--background` | `oklch(0.09 0.005 285)` | `#09090b` | Page background |
| `--card` / `--popover` | `oklch(0.19 0.005 285)` | ~`#1a1a1d` | Cards, popovers, elevated surfaces |
| `--secondary` / `--muted` | `oklch(0.21 0.006 285)` | `#18181b` | Secondary buttons, dropdown hover |
| `--input` | `oklch(0.18 0.005 285)` | ~`#161618` | Input field background |
| `--border` | `oklch(0.2 0.004 285)` | `#1c1c1e` | Subtle dividers, input borders (at 70% opacity) |
| `--primary` / `--accent` | `oklch(0.77 0.2 150)` | `#4ade80` | Gains, active nav, CTA buttons, brand, focus ring |
| `--accent-muted` | `oklch(0.77 0.2 150 / 8%)` | — | Change badge bg, chart fill |
| `--signal` / `--destructive` | `oklch(0.7 0.19 40)` | `#fb923c` | Losses, alerts, notification dot |
| `--signal-muted` | `oklch(0.7 0.19 40 / 4%)` | — | Notification background |
| `--signal-border` | `oklch(0.7 0.19 40 / 12%)` | — | Notification border |
| `--foreground` | `oklch(0.985 0 0)` | `#fafafa` | Primary text, headings, values |
| `--muted-foreground` | `oklch(0.55 0.014 285)` | `#71717a` | Meta text, placeholders, inactive nav |
| `--ring` | `oklch(0.77 0.2 150)` | `#4ade80` | Focus ring color |

### Light Mode

| CSS Variable | OKLCH | Approx Hex | Use |
|-------|-------|-----|-----|
| `--background` | `oklch(0.985 0 0)` | `#fafafa` | Page background |
| `--card` / `--popover` | `oklch(1 0 0)` | `#ffffff` | Cards (with shadow) |
| `--secondary` / `--muted` | `oklch(0.96 0.003 264)` | `#f3f4f6` | Secondary buttons, tab backgrounds |
| `--border` | `oklch(0.96 0.003 264)` | `#f3f4f6` | Nav divider (very subtle) |
| `--primary` / `--accent` | `oklch(0.56 0.2 145)` | `#16a34a` | Gains, active states, CTA |
| `--accent-muted` | `oklch(0.56 0.2 145 / 8%)` | — | Change badge bg |
| `--signal` / `--destructive` | `oklch(0.63 0.19 40)` | `#ea580c` | Losses, alerts |
| `--foreground` | `oklch(0.145 0.014 285.82)` | `#111827` | Primary text |
| `--muted-foreground` | `oklch(0.505 0.017 285.88)` | `#6b7280` | Meta text |

### Tailwind Usage

| Design intent | Tailwind class |
|---|---|
| Page background | `bg-background` |
| Card/surface background | `bg-card` |
| Primary text | `text-foreground` |
| Muted/secondary text | `text-muted-foreground` |
| Green accent (brand, gains, CTA) | `bg-primary` / `text-primary` |
| Orange signal (losses, alerts) | `bg-destructive` / `text-destructive` / `text-signal` |
| Form errors | `text-red-600` (intentionally red, not orange) |
| Focus ring | `ring-ring` (auto via shadcn) |
| Input background | `bg-input/50` |
| Input border (unfocused) | `border-border/70` |

### Usage Rules

- Green = gains, positive actions, brand. NEVER decorative background fills.
- Orange = losses, alerts, warnings. NEVER used for success or progress.
- No second accent color. Green is the only "brand" color.
- Notification uses warm-tinted background + border in dark mode; white card with shadow in light mode.
- Form validation errors use `text-red-600` (intentionally red, distinct from orange signal).

---

## Typography

### Font Stack

```css
--font-display: 'Space Grotesk', system-ui, sans-serif;
--font-body: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
--font-greeting: 'Playfair Display', serif;
```

### Scale

| Token | Font | Size | Weight | Letter Spacing | Use |
|-------|------|------|--------|----------------|-----|
| `display-xl` | Space Grotesk | 2.8rem (44px) | 700 | -1px | Portfolio total value |
| `display-lg` | Space Grotesk | 2.4rem (38px) | 700 | -0.8px | Secondary value displays |
| `display-md` | Space Grotesk | 1.05rem (17px) | 700 | -0.5px | Nav brand |
| `title` | Space Grotesk | 0.95rem (15px) | 600 | -0.2px | Section headings ("Holdings") |
| `greeting` | Playfair Display | 1.2rem (19px) | 400 italic | 0 | "Good morning, Pratik" |
| `body` | Inter | 0.85rem (14px) | 500 | 0 | Fund names, holding text |
| `body-sm` | Inter | 0.8rem (13px) | 400 | 0 | Nav links, buttons |
| `meta` | Inter | 0.7rem (11px) | 400 | 0 | Units, invested amount, timestamps |
| `label` | Inter | 0.65rem (10px) | 500 | 0.04em | Stat labels (uppercase) |
| `mono-value` | JetBrains Mono | 1rem (16px) | 500 | 0 | Stat values (Day P&L, XIRR) |
| `mono-sm` | JetBrains Mono | 0.8rem (13px) | 500 | 0 | Holding P&L values |
| `change-badge` | Space Grotesk | 0.8rem (13px) | 500 | 0 | "+₹2,640 (2.4%)" |
| `btn` | Inter | 0.85rem (14px) | 600 | -0.1px | Button labels |

### Rules

- Display (Space Grotesk) for anything number-heavy or attention-grabbing
- Body (Inter) for anything you READ — text, names, descriptions
- Mono (JetBrains Mono) for values that need vertical alignment in lists
- Greeting (Playfair Italic) — ONLY the greeting line. Never headings, never other text.
- Negative letter-spacing on display sizes only (≥17px)

---

## Spacing

### Base Unit: 4px

| Token | Value | Use |
|-------|-------|-----|
| `--space-1` | 4px | Tight gaps (between label and value) |
| `--space-2` | 8px | Icon gaps, inline spacing |
| `--space-3` | 12px | Small padding, button row gap |
| `--space-4` | 16px | Standard gap between elements |
| `--space-5` | 20px | Card internal padding (compact) |
| `--space-6` | 24px | Content section padding |
| `--space-7` | 28px | Section margins |
| `--space-8` | 32px | Page horizontal padding |
| `--space-10` | 40px | Section separation |
| `--space-12` | 48px | Major section gaps |

### Component Spacing

| Component | Padding | Gap between |
|-----------|---------|-------------|
| Page content | 24px horizontal, 32px top | — |
| Card (holding) | 14px 18px | 8px between cards |
| Stat card | 16px | 12px between stat cards |
| Chart container | 0 (flush) | 24px above/below |
| Button row | — | 12px between buttons |
| Nav | 14px 24px | — |
| Notification | 14px 18px | — |

---

## Shapes

### Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | 8px | Tabs, small badges |
| `--radius-md` | 10px | Buttons, inputs |
| `--radius-lg` | 12px | Chart container, dropdown menus |
| `--radius-xl` | 14px | Holding cards, stat cards, notifications |
| `--radius-2xl` | 18px | App shell, outer containers |
| `--radius-pill` | 9999px | Change badge, avatar |

**Base radius:** `0.625rem` (10px). All radii derive from this via multipliers in `globals.css`.

### Elevation

| Level | Dark Mode | Light Mode |
|-------|-----------|------------|
| Flat | No border, no shadow | No border, no shadow |
| Surface | Background `--surface` differentiates from `--bg` | Background `#fff` + `box-shadow: 0 1px 3px rgba(0,0,0,0.04)` |
| Nav divider | 1px solid `--border` (bottom only) | 1px solid `#f3f4f6` |
| Notification | `--signal-muted` bg + `--signal-border` border | White card + standard shadow |

### Rules

- NO borders on cards in dark mode — surface color alone creates hierarchy
- NO heavy shadows anywhere — single subtle shadow in light mode only
- Nav gets a thin bottom border — only divider line in the system

---

## Components

### Navigation

- Height: 56px
- Brand: `● mintfolio` in `display-md` (Space Grotesk 700, 17px)
- Green dot `●` is the brand mark
- Links: `body-sm` (Inter 400, 13px), muted color, active = accent/text
- Avatar: 28px circle, green-tinted bg in dark, green bg in light
- Bottom border: 1px `--border`

### Portfolio Hero

- Greeting: `greeting` token (Playfair Italic 19px, muted color)
- Value: `display-xl` (Space Grotesk 700, 44px)
- Change badge: `change-badge` (13px), pill-shaped, accent-muted bg + accent text
- Invested amount: `meta` (11px), muted-dim

### Chart

- Container: `--radius-lg` (12px), surface bg in dark, white+shadow in light
- Line: 2px stroke, `--accent` color, rounded linecap/linejoin
- Fill: Linear gradient from accent at 10% opacity → 0% opacity downward
- Period tabs: `body-sm`, muted color, active tab gets elevated bg + text color

### Stat Cards

- Layout: 3-column grid, `--space-3` gap
- Shape: `--radius-xl` (14px), surface bg (no border)
- Label: `label` token (10px, uppercase, muted-dim)
- Value: `mono-value` (JetBrains Mono 16px, 500)
- Positive values: `--accent`
- Negative values: `--signal`

### Holding Cards

- Shape: `--radius-xl` (14px), surface bg (no border), 14px 18px padding
- Gap between cards: 8px
- Left side: fund name (`body`, 14px 500) + meta (`meta`, 11px muted)
- Right side: value (`mono-sm`, 13px) + P&L (`mono-sm`, colored)
- P&L positive: `--accent`
- P&L negative: `--signal`

### Buttons

| Variant | Background | Text | Radius | Padding |
|---------|-----------|------|--------|---------|
| Primary | `--accent` | `--bg` | 10px | 10px 20px |
| Secondary | `--elevated` | muted text | 10px | 10px 20px |
| Ghost | transparent | `--accent` | 10px | 10px 20px |

- Font: `btn` token (Inter 600, 14px)
- Active state: `transform: scale(0.96)`
- Min height: 40px

### Notification

- Shape: `--radius-xl` (14px)
- Dark: signal-muted bg + signal-border + signal dot
- Light: white bg + shadow + signal dot
- Dot: 8px circle, `--signal` color
- Text: strong = `body` weight 600, sub = `meta` at 60% opacity

---

## States & Interactions

| State | Treatment |
|-------|-----------|
| Active/Press | `transform: scale(0.96)`, 100ms transition |
| Focus | Not defined yet (add when implementing with shadcn) |
| Disabled | 50% opacity, no pointer events |
| Loading | Skeleton with surface → elevated pulse animation |

---

## Responsive

| Breakpoint | Width | Changes |
|------------|-------|---------|
| Mobile | < 640px | Single column, stat cards stack, value drops to 2rem |
| Tablet | 640–1024px | Content max-width 600px centered |
| Desktop | > 1024px | Full layout, max-width as needed |

---

## Motion

| Property | Duration | Easing |
|----------|----------|--------|
| Button press | 100ms | ease |
| Page transitions | 200ms | ease-out |
| Skeleton pulse | 1.5s | ease-in-out (infinite) |
| Chart draw (future) | 600ms | ease-out |

---

## Icons

Not yet decided. Likely Lucide (pairs with shadcn/ui) — outline style, 20px default, 1.5px stroke.

---

## Do's and Don'ts

### Do

- Use `--accent` for all positive/action signals — ONE color for "good"
- Use `--signal` ONLY for losses and alerts
- Keep cards borderless in dark mode
- Use Space Grotesk for any number that should catch the eye
- Use JetBrains Mono for numbers in lists (alignment matters)
- Use Playfair Italic only for the greeting — nowhere else

### Don't

- Don't add a second accent color
- Don't put borders on dark-mode cards
- Don't use gradients on the accent color
- Don't use Playfair for headings or any text besides the greeting
- Don't use shadows in dark mode
- Don't use orange decoratively — it's exclusively for negative/warning states
