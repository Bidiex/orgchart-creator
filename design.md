# design.md

# Design System Truth Source
Version: 1.0

## Design Philosophy

Este sistema visual combina:

- SaaS premium
- AI-first product
- Minimalismo editorial
- Glassmorphism ligero
- Espacios amplios
- UI extremadamente limpia
- Alto contraste en jerarquía, bajo contraste en superficies

La sensación general debe ser:

> Apple + Linear + Stripe + SaaS AI moderno

Nunca debe sentirse:
- Enterprise legacy
- Bootstrap
- Material Design clásico
- Dashboard recargado
- Neumorphism

---

# Color System

## Primary Brand

```css
--primary: #2155FF;
--primary-hover: #1746E0;
--primary-light: #EAF0FF;
```

Uso:
- CTA principal
- Links activos
- Charts destacados
- Toggles
- Focus states

## Background

```css
--bg: #FFFFFF;
--bg-soft: #FAFAFB;
--bg-muted: #F5F6F8;
```

## Text

```css
--text-primary: #111111;
--text-secondary: #6B7280;
--text-muted: #9CA3AF;
```

## Borders

```css
--border: #ECECEC;
--border-soft: #F3F4F6;
```

## Accent

Negro puro para elementos de alto énfasis:

```css
--accent-dark: #000000;
```

---

# Typography

## Font Family

Preferencia:

```css
Inter
```

Fallback:

```css
system-ui
sans-serif
```

## Headings

### H1

```css
font-size: 64px;
font-weight: 700;
line-height: 1.05;
letter-spacing: -0.04em;
```

### H2

```css
font-size: 48px;
font-weight: 700;
letter-spacing: -0.03em;
```

### H3

```css
font-size: 28px;
font-weight: 600;
```

## Body

```css
font-size: 16px;
line-height: 1.7;
color: var(--text-secondary);
```

## Labels

```css
font-size: 12px;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.08em;
```

---

# Radius System

Todos los componentes deben usar bordes suaves.

```css
--radius-sm: 12px;
--radius-md: 18px;
--radius-lg: 24px;
--radius-xl: 32px;
--radius-pill: 999px;
```

---

# Shadows

Muy sutiles.

```css
box-shadow:
0 10px 30px rgba(0,0,0,.06);
```

Hover:

```css
box-shadow:
0 20px 50px rgba(0,0,0,.10);
```

---

# Layout

## Container

```css
max-width: 1280px;
margin: 0 auto;
padding-inline: 32px;
```

## Section Spacing

```css
padding-top: 120px;
padding-bottom: 120px;
```

## Grid

Desktop:

```css
12 columns
```

Cards:

```css
3-column layout
```

Mobile:

```css
1 column
```

---

# Navigation

Características:

- Floating navbar
- Fondo blanco translúcido
- Blur ligero
- Bordes redondeados
- Altura compacta

```css
backdrop-filter: blur(12px);
border-radius: 999px;
```

---

# Buttons

## Primary

```css
background: #2155FF;
color: white;
border-radius: 999px;
padding: 14px 24px;
font-weight: 600;
```

## Secondary

```css
background: #000000;
color: white;
border-radius: 999px;
```

## Ghost

```css
background: transparent;
border: 1px solid var(--border);
```

Regla:

Nunca usar botones cuadrados.

---

# Cards

## Estilo Global

```css
background: white;
border: 1px solid #ECECEC;
border-radius: 24px;
```

Características:

- Mucho padding interno
- Espacio vertical generoso
- Icono arriba
- Título corto
- Descripción breve

---

# Hero Section

## Estructura

1. Navbar flotante
2. H1 grande centrado
3. Subheadline
4. CTA dual
5. Mockup producto gigante

## Fondo

Gradiente suave:

```css
#FFFFFF
→
#EAF2FF
```

Agregar nubes difusas o glow azul extremadamente sutil.

---

# Dashboard UI

## Filosofía

Los dashboards deben parecer:
- ligeros
- aireados
- premium

Nunca:
- densos
- corporativos
- llenos de tablas

## Widgets

```css
background: white;
border-radius: 20px;
border: 1px solid #F1F1F1;
```

Charts:

- barras redondeadas
- azul como color principal
- resto en gris suave

---

# Pricing

## Cards

Card destacada:

```css
background: #EEF4FF;
border: none;
transform: scale(1.03);
```

CTA azul.

Cards secundarias:
blancas.

---

# Integrations

Mostrar:

- logos monocromáticos
- mucho espacio
- diagramas conectados
- sensación de ecosistema

---

# FAQ

Acordeones extremadamente limpios.

```css
border-bottom: 1px solid #ECECEC;
```

Sin cajas pesadas.

---

# Forms

Inputs:

```css
height: 52px;
border-radius: 999px;
border: 1px solid #E5E7EB;
```

Focus:

```css
border-color: #2155FF;
```

---

# Imagery

Usar:

- mockups SaaS
- dashboards modernos
- interfaces blancas
- gráficos minimalistas

Evitar:

- fotografías de stock
- personas sonriendo
- ilustraciones corporativas genéricas

---

# Motion

Duración estándar:

```css
200ms
```

Hover:

```css
transform: translateY(-2px);
```

Nunca usar animaciones exageradas.

---

# AI IDE Enforcement Rules

OBLIGATORIO

1. Toda superficie debe respirar.
2. Priorizar espacios sobre decoración.
3. Máximo 1 color protagonista.
4. Azul como único color de marca.
5. Negro solo para contraste.
6. Sin gradientes agresivos.
7. Sin skeuomorphism.
8. Sin neumorphism.
9. Sin sombras pesadas.
10. Todo debe parecer producto SaaS premium 2026.

Si existe duda entre:
- más simple
- más complejo

Elegir siempre:
- más simple.
