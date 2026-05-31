# DESIGN-SYSTEM-V2.md
# AI-Enforced Design System — Source of Truth

Version: 2.0
Status: AUTHORITATIVE
Priority: OVERRIDES LOCAL DESIGN DECISIONS

---

# 1. DESIGN DNA

The UI must communicate:

- Premium SaaS
- AI-native product
- Clarity before decoration
- Confidence without aggressiveness
- Modern 2026 software aesthetics

Reference characteristics:

- Large whitespace
- Rounded geometry
- Soft borders
- Light surfaces
- Strong typography
- Sparse color usage
- Product-first visuals

If a design decision conflicts with this document:
THIS DOCUMENT WINS.

---

# 2. CORE PRINCIPLES

## Principle 1

Whitespace is a feature.

## Principle 2

Hierarchy is created through:
- scale
- spacing
- weight

Not colors.

## Principle 3

Every screen should feel lighter after removing 20% of elements.

## Principle 4

One brand color.

No rainbow interfaces.

## Principle 5

Every component must look premium by default.

---

# 3. DESIGN TOKENS

## Colors

```css
:root {

--primary: #2155FF;
--primary-hover: #1746E0;
--primary-soft: #EAF0FF;

--bg: #FFFFFF;
--bg-soft: #FAFAFB;
--bg-muted: #F5F6F8;

--surface: #FFFFFF;

--text-primary: #111111;
--text-secondary: #6B7280;
--text-muted: #9CA3AF;

--border: #ECECEC;
--border-soft: #F3F4F6;

--success: #16A34A;
--warning: #D97706;
--danger: #DC2626;

}
```

---

# 4. TYPOGRAPHY

## Font Stack

```css
Inter,
system-ui,
sans-serif
```

## Scale

```css
H1 64
H2 48
H3 32
H4 24
Body 16
Small 14
Caption 12
```

## Rules

Never use:

- decorative fonts
- condensed fonts
- serif fonts

except marketing campaigns.

---

# 5. SPACING SYSTEM

Base unit:

```css
8px
```

Scale:

```css
4
8
12
16
24
32
48
64
80
120
160
```

Rule:

Never use arbitrary spacing.

---

# 6. BORDER RADIUS

```css
12
18
24
32
999
```

Default card:

```css
24px
```

Default button:

```css
999px
```

---

# 7. SHADOW SYSTEM

Default:

```css
0 10px 30px rgba(0,0,0,.06)
```

Hover:

```css
0 20px 50px rgba(0,0,0,.10)
```

Avoid dramatic shadows.

---

# 8. GRID SYSTEM

Desktop:

12 columns

Tablet:

6 columns

Mobile:

1 column

Container:

```css
1280px
```

---

# 9. RESPONSIVE RULES

Desktop:
1440+

Laptop:
1024+

Tablet:
768+

Mobile:
below 768

Mandatory:

- Mobile first
- No horizontal scroll
- Maintain hierarchy

---

# 10. BUTTON SYSTEM

## Primary

Blue background.

## Secondary

Black background.

## Ghost

Transparent.

Rules:

- Always rounded
- Never square
- Never uppercase

---

# 11. INPUT SYSTEM

Height:

```css
52px
```

Radius:

```css
999px
```

Focus:

Brand blue.

Error:

Red border only.

---

# 12. CARD SYSTEM

Structure:

- icon
- title
- description
- action

Card padding:

```css
32px
```

Card radius:

```css
24px
```

---

# 13. LANDING PAGE BLUEPRINT

Order:

1. Hero
2. Problem
3. Solution
4. Features
5. Integrations
6. Pricing
7. FAQ
8. Newsletter
9. Footer

---

# 14. HERO SPECIFICATION

Contains:

- floating nav
- headline
- subheadline
- primary CTA
- secondary CTA
- product mockup

Must occupy:
80–100vh

---

# 15. DASHBOARD RULES

Dashboards must be:

- breathable
- modern
- visual

Avoid:

- dense tables
- tiny widgets
- clutter

---

# 16. DATA VISUALIZATION

Charts:

- rounded bars
- minimal gridlines
- blue highlight
- gray secondary data

Never use more than:

4 colors

---

# 17. TABLES

Requirements:

- zebra rows OFF
- light borders
- large row height
- generous padding

Actions aligned right.

---

# 18. MODALS

Width:

```css
480-720px
```

Radius:

```css
32px
```

Must support:

- ESC close
- outside click

---

# 19. DRAWERS

Slide from right.

Background:

white.

Maximum width:

```css
520px
```

---

# 20. EMPTY STATES

Must contain:

- illustration or icon
- title
- explanation
- CTA

Never leave blank screens.

---

# 21. COMMAND PALETTE

Inspired by:

- Linear
- Raycast

Features:

- keyboard-first
- fuzzy search
- grouped results

---

# 22. NAVIGATION

Desktop:

Floating pill navbar.

Mobile:

Bottom sheet or drawer.

---

# 23. ICONOGRAPHY

Style:

- outline
- simple
- geometric

Preferred:

Lucide.

---

# 24. ANIMATION SYSTEM

Duration:

```css
150ms
200ms
300ms
```

Never:

- bounce
- elastic
- flashy effects

---

# 25. AI GENERATED COMPONENT RULES

Whenever AI generates UI:

Must follow:

- existing spacing scale
- typography scale
- radius scale
- color scale

Must not invent new tokens.

---

# 26. COMPONENT INVENTORY

Required reusable components:

- Button
- Input
- Select
- Textarea
- Checkbox
- Switch
- Modal
- Drawer
- Tooltip
- Dropdown
- Card
- Table
- Tabs
- Badge
- Toast
- EmptyState
- Skeleton
- CommandPalette

No duplicates allowed.

---

# 27. DESIGN DEBT RULES

If a new component:

- duplicates an existing one
- introduces a new radius
- introduces a new shadow
- introduces a new color

Reject implementation.

---

# 28. ACCESSIBILITY

Minimum:

WCAG AA

Requirements:

- visible focus
- keyboard navigation
- semantic html
- aria labels

---

# 29. DARK MODE

Dark mode is not an inversion.

Create dedicated palette.

Keep:

- blue accent
- spacing
- typography

---

# 30. IDE ENFORCEMENT PROMPT

When generating UI:

1. Reuse existing tokens.
2. Prefer simplicity.
3. Reduce visual noise.
4. Increase whitespace.
5. Use premium SaaS aesthetics.
6. Avoid trendy gimmicks.
7. Respect component inventory.
8. Respect design hierarchy.
9. Never invent colors.
10. Never invent spacing scales.
11. Never invent radii.
12. Maintain consistency above creativity.

END OF TRUTH SOURCE.
