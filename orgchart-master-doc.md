# OrgChart Studio — Documento Maestro
> Herramienta web para creación, edición y gestión de organigramas corporativos  
> Versión 2.0 | Fase inicial: uso personal con localStorage  
> Stack: React 18 + Vite + React Flow + dagre  
> Licencias: 100% MIT / Apache 2.0 — sin restricciones para escalar o comercializar

---

## 1. Visión del Producto

OrgChart Studio es una herramienta web que permite crear y mantener organigramas corporativos de forma estructurada, sin depender de herramientas de diseño manual como Canva. El usuario puede generar organigramas desde un archivo Excel, editarlos libremente en un canvas interactivo, y exportarlos como imagen de alta calidad.

Cada organigrama es un **Proyecto** independiente con su propio historial de cambios, lo que permite auditar la evolución de la estructura organizacional a lo largo del tiempo.

### Fases de evolución previstas

| Fase | Alcance | Persistencia | Auth |
|------|---------|-------------|------|
| **1 — Actual** | Uso personal, un usuario | localStorage | No |
| **2** | Equipo interno compartido | Supabase | Sí |
| **3** | Producto comercializable | Supabase multi-tenant | Planes y pagos |

La arquitectura de Fase 1 está diseñada para que la migración a Fase 2 sea un cambio en la capa de persistencia, sin reescribir lógica de negocio.

---

## 2. Stack Tecnológico

### 2.1 Dependencias principales

| Capa | Tecnología | Versión | Licencia | Justificación |
|------|-----------|---------|----------|---------------|
| Framework | React | 18 | MIT | Ecosistema maduro, compatible con React Flow |
| Bundler | Vite | 5 | MIT | HMR rápido, build optimizado |
| Canvas de diagramas | @xyflow/react (React Flow) | 12 | MIT | Nodos/edges personalizables, zoom/pan nativo |
| Layout jerárquico | @dagrejs/dagre | 1 | MIT | Algoritmo top-down automático, alineación de árboles |
| Estilos | Tailwind CSS | 4 | MIT | Utilidades CSS sin overhead |
| Importación XLSX | SheetJS (xlsx) | community | Apache 2.0 | Parseo Excel sin dependencias problemáticas |
| Exportación imagen | html-to-image | 1.11 | MIT | Captura DOM con pixel ratio configurable |
| IDs únicos | uuid | 9 | MIT | IDs de nodos no colisionables |
| Iconos | lucide-react | latest | MIT | Consistente con ecosistema React |
| Fechas | date-fns | 3 | MIT | Formateo de timestamps del historial |

### 2.2 Instalación completa

```bash
npm create vite@latest orgchart-studio -- --template react
cd orgchart-studio
npm install @xyflow/react
npm install @dagrejs/dagre
npm install tailwindcss @tailwindcss/vite
npm install xlsx
npm install html-to-image
npm install uuid
npm install lucide-react
npm install date-fns
```

### 2.3 Por qué este stack y no otros

**React Flow vs BALKAN OrgChart JS**
BALKAN es técnicamente superior para organigramas pero su licencia comercial genera ambigüedad para escalar. React Flow es MIT puro — sin restricciones. Con dagre configurado en `rankdir: TB`, produce layouts jerárquicos verticales correctamente alineados para organigramas corporativos estándar.

**React Flow vs construcción desde cero**
El motor de layout (calcular posiciones X/Y automáticamente sin solapamiento), el rendering de conectores SVG con curvas, y la interactividad (zoom, pan, drag) son problemas resueltos que tomarían meses construir desde cero. React Flow resuelve toda esa infraestructura. El valor del producto está en la UI, la importación de datos y el historial — no en el motor del canvas.

**React Flow vs D3 hierarchy**
D3 requiere construir manualmente toda la capa de interactividad. React Flow la incluye de fábrica.

**localStorage vs Supabase en Fase 1**
El objetivo inmediato es resolver un problema de productividad personal, no construir un SaaS. La arquitectura de hooks está diseñada para que `storageUtils.js` sea el único archivo que cambia al migrar a Supabase.

---

## 3. Estructura del Proyecto

```
orgchart-studio/
├── public/
│   └── template.xlsx                  # Plantilla Excel descargable para importación
│
├── src/
│   ├── main.jsx
│   ├── App.jsx                        # Root: router entre ProjectList y Editor
│   │
│   ├── pages/
│   │   ├── ProjectList.jsx            # Dashboard: lista de proyectos del usuario
│   │   └── Editor.jsx                 # Vista principal del editor de organigrama
│   │
│   ├── components/
│   │   │
│   │   ├── canvas/
│   │   │   ├── OrgCanvas.jsx          # Wrapper de React Flow con config global
│   │   │   ├── OrgNode.jsx            # Nodo personalizado (caja del organigrama)
│   │   │   ├── OrgEdge.jsx            # Conector personalizado (líneas jerarquía)
│   │   │   └── CanvasControls.jsx     # Zoom in/out, fit screen, relayout
│   │   │
│   │   ├── toolbar/
│   │   │   ├── Toolbar.jsx            # Barra superior: nombre proyecto, acciones
│   │   │   ├── SaveButton.jsx         # Guardar + trigger de historial
│   │   │   └── ExportMenu.jsx         # Exportar PNG / historial como imagen
│   │   │
│   │   ├── sidebar/
│   │   │   ├── Sidebar.jsx            # Panel derecho contextual
│   │   │   ├── NodeEditor.jsx         # Editar nombre, cargo, área del nodo
│   │   │   ├── StylePanel.jsx         # Colores, bordes, tipografía del nodo
│   │   │   └── BadgeEditor.jsx        # Gestión de badges/indicadores del nodo
│   │   │
│   │   ├── history/
│   │   │   ├── HistoryPanel.jsx       # Panel lateral: lista de versiones del proyecto
│   │   │   ├── HistoryEntry.jsx       # Tarjeta de una versión con su descripción
│   │   │   └── HistoryExportView.jsx  # Vista oculta renderizada para exportar historial
│   │   │
│   │   ├── projects/
│   │   │   ├── ProjectCard.jsx        # Tarjeta de proyecto en el dashboard
│   │   │   ├── NewProjectModal.jsx    # Modal: crear proyecto (con o sin XLSX)
│   │   │   └── DeleteProjectModal.jsx # Modal: confirmar eliminación de proyecto
│   │   │
│   │   └── shared/
│   │       ├── Modal.jsx              # Componente base de modal reutilizable
│   │       ├── Button.jsx             # Botón con variantes (primary, ghost, danger)
│   │       └── EmptyState.jsx         # Estado vacío reutilizable
│   │
│   ├── hooks/
│   │   ├── useProjects.js             # CRUD de proyectos en localStorage
│   │   ├── useEditor.js               # Estado del canvas: nodes, edges, selección
│   │   ├── useHistory.js              # Snapshots, diff y versiones por proyecto
│   │   └── useExport.js               # Lógica de exportación PNG/WebP
│   │
│   ├── utils/
│   │   ├── layoutUtils.js             # dagre: calcula posiciones automáticas
│   │   ├── diffUtils.js               # Compara snapshots → genera descripción en español
│   │   ├── xlsxParser.js              # XLSX → estructura interna de nodos/edges
│   │   └── storageUtils.js            # Wrappers de localStorage (reemplazable por Supabase)
│   │
│   └── constants/
│       ├── defaultStyles.js           # Estilos por defecto de nodos y edges
│       └── nodeTypes.js               # Registro de tipos de nodo en React Flow
│
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 4. Modelo de Datos

### 4.1 Proyecto (Project)

```javascript
{
  id: "uuid-v4",
  name: "Organigrama SEEMA — Diciembre 2025",
  createdAt: "2025-12-01T10:00:00Z",
  updatedAt: "2025-12-15T14:30:00Z",
  thumbnail: null,                    // Base64 PNG miniatura, generado al guardar
  currentSnapshot: {                  // Estado actual del canvas
    nodes: [...],
    edges: [...],
    viewport: { x: 0, y: 0, zoom: 1 }
  }
}
```

### 4.2 Nodo (OrgNode)

```javascript
{
  id: "uuid-v4",
  type: "orgNode",
  position: { x: 0, y: 0 },          // Calculado por dagre o ajustado manualmente
  data: {
    // Contenido principal
    label: "Gerencia de Tecnología",
    sublabel: "Área de Sistemas",     // Opcional: cargo, área, departamento
    department: "Tecnología",         // Para agrupación visual futura

    // Estilos del nodo
    style: {
      backgroundColor: "#1e3a5f",
      textColor: "#ffffff",
      borderColor: "#2d5a8e",
      borderWidth: 1,
      borderRadius: 6,
      borderStyle: "solid",           // "solid" | "dashed" | "dotted"
      fontSize: 13,
      fontWeight: "600",
      width: 180,
      minHeight: 48,
    },

    // Badges / indicadores visuales
    badges: [
      {
        id: "uuid",
        text: "Nuevo",                // Máx 15 caracteres
        backgroundColor: "#22c55e",
        textColor: "#ffffff",
        position: "top-right"         // "top-right" | "top-left" | "bottom-right" | "bottom-left"
      }
    ],

    // Estado del nodo en el canvas
    isCollapsed: false,               // Colapsar/expandir hijos
  }
}
```

### 4.3 Conector (OrgEdge)

```javascript
{
  id: "e-{sourceId}-{targetId}",
  source: "node-id-padre",
  target: "node-id-hijo",
  type: "orgEdge",
  data: {
    style: {
      stroke: "#94a3b8",
      strokeWidth: 2,
      strokeDasharray: null,          // null = solid | "5,5" = dashed | "2,4" = dotted
    }
  }
}
```

### 4.4 Entrada de Historial (HistoryEntry)

```javascript
{
  id: "uuid-v4",
  projectId: "uuid-v4",              // Referencia al proyecto
  version: 7,                        // Número incremental por proyecto
  timestamp: "2025-12-15T14:30:00Z",
  author: "Usuario",                 // En Fase 1 siempre "Usuario", en Fase 2 email
  description: "...",                // Texto generado automáticamente por diffUtils
  changes: {                         // Resumen estructurado del diff
    added: ["VP Comercial", "Director Pyme"],
    removed: ["Coordinación de Nómina"],
    modified: ["Presidencia — badge añadido", "VP Financiera — color cambiado"],
    structural: 3                    // Número de conexiones que cambiaron
  },
  snapshot: {                        // Copia completa del estado en este momento
    nodes: [...],
    edges: [...],
  }
}
```

### 4.5 Estructura en localStorage

```
localStorage:
│
├── "ocs_projects"          → Project[]           Lista de todos los proyectos
├── "ocs_history_{projectId}" → HistoryEntry[]    Historial por proyecto (máx 100 entradas)
└── "ocs_prefs"             → UserPreferences     Preferencias globales del usuario
```

**Prefijo `ocs_`** (OrgChart Studio) para evitar colisiones con otras apps en el mismo dominio.

---

## 5. Funcionalidades Detalladas

### 5.1 Dashboard de Proyectos (ProjectList)

La pantalla inicial muestra todos los proyectos guardados como tarjetas con:
- Miniatura del organigrama (generada al último guardado)
- Nombre del proyecto
- Fecha de última modificación
- Número de versiones en el historial
- Acciones: Abrir, Renombrar, Duplicar, Eliminar

**Crear nuevo proyecto** — modal con dos caminos:
1. **Desde cero**: proyecto vacío con un nodo raíz en blanco listo para editar
2. **Desde XLSX**: sube el archivo Excel → preview de la estructura detectada → confirmar → genera el organigrama automáticamente

---

### 5.2 Importación desde XLSX

#### Plantilla Excel (template.xlsx)

El archivo `public/template.xlsx` es descargable desde la UI. Estructura de columnas:

| id | label | sublabel | parentId | backgroundColor | badgeText | badgeColor |
|----|-------|----------|----------|----------------|-----------|------------|
| 1 | Presidencia | | | #1e3a5f | | |
| 2 | Secretaría General | Administración | 1 | #1e3a5f | | |
| 3 | Dirección Jurídica | | 1 | #1e3a5f | | |
| 4 | VP Comercial | | 1 | #2d5a8e | | |
| 5 | Director Pyme | Canal Digital | 4 | #2d5a8e | Nuevo | #22c55e |

**Reglas de la plantilla:**
- `id`: número o texto único, obligatorio
- `label`: nombre del nodo, obligatorio
- `sublabel`: cargo o área, opcional
- `parentId`: id del nodo padre; vacío = nodo raíz (solo puede haber uno)
- `backgroundColor`: hex, opcional (usa color por defecto si está vacío)
- `badgeText` / `badgeColor`: opcionales, se ignoran si están vacíos

#### Flujo de importación

```
Usuario sube XLSX
       ↓
xlsxParser.js lee la hoja con SheetJS
       ↓
Validación: ¿tiene columnas requeridas? ¿hay exactamente un nodo raíz?
       ↓ (si hay errores → mostrar lista de errores al usuario)
Normalización → array de OrgNode + array de OrgEdge
       ↓
layoutUtils.js calcula posiciones con dagre (rankdir: TB)
       ↓
Canvas renderiza el organigrama
       ↓
Se guarda entrada en historial: "Importación inicial desde XLSX — X nodos cargados"
```

---

### 5.3 Editor de Organigrama (Canvas)

#### Interacciones del canvas
- **Zoom**: scroll del mouse o botones de control
- **Pan**: click y arrastrar en área vacía
- **Seleccionar nodo**: click simple → abre sidebar con NodeEditor
- **Editar nodo**: doble-click → campos de texto editables inline
- **Mover nodo**: drag & drop (el layout se actualiza visualmente, no se recalcula con dagre)
- **Selección múltiple**: Shift+click o arrastrar área de selección

#### Acciones sobre nodos
- **Añadir hijo**: botón "+" que aparece al hacer hover sobre un nodo → crea nodo vacío conectado
- **Añadir nodo raíz adicional** (ej. comités): desde toolbar → nodo suelto sin padre
- **Eliminar nodo**: tecla Delete o botón en sidebar → si tiene hijos, modal de confirmación pregunta si eliminar también los hijos o reasignarlos al padre del nodo eliminado
- **Colapsar/expandir rama**: botón toggle en nodos con hijos → oculta descendientes visualmente

#### Re-layout automático
Botón "Reorganizar" en toolbar → recalcula todas las posiciones con dagre sin perder cambios de estilo. Útil después de agregar varios nodos manualmente.

---

### 5.4 Editor de Nodos (Sidebar)

Al seleccionar un nodo, el panel derecho muestra:

**Pestaña Contenido:**
- Campo `label` (nombre / cargo)
- Campo `sublabel` (área / departamento)
- Selector de departamento (libre, se usa para agrupación futura)

**Pestaña Estilo:**
- Color de fondo: selector visual + input hex
- Color de texto: selector visual + input hex
- Border: color, grosor (px), estilo (solid/dashed/dotted), radio (px)
- Tamaño de fuente (px)
- Ancho del nodo (px)
- Botón "Aplicar este estilo a todos los nodos" con confirmación

**Pestaña Badges:**
- Lista de badges actuales del nodo (máx 4)
- Añadir badge: texto, color de fondo, color de texto, posición
- Eliminar badge individual
- Casos de uso: "Nuevo", "Vacante", "En revisión", "Crítico", KPIs numéricos

---

### 5.5 Historial de Cambios

El historial es la funcionalidad más diferenciadora del producto. Registra **cambios significativos** de estructura y estilo, no cambios de caracteres individuales.

#### ¿Cuándo se guarda una versión?
Únicamente cuando el usuario hace click en **"Guardar"** (o Ctrl+S). No hay autoguardado — el usuario decide cuándo una versión es significativa.

#### ¿Qué registra el diff?

`diffUtils.js` compara el snapshot anterior con el actual y genera:

**Cambios de estructura (más importantes):**
- Nodos añadidos: lista de nombres
- Nodos eliminados: lista de nombres
- Nodos movidos en jerarquía: "VP Comercial movido de Presidencia a Gerencia de Operaciones"
- Conexiones nuevas o eliminadas que no corresponden a nodos nuevos/eliminados

**Cambios de contenido:**
- Nodos renombrados: "Jefatura de TI → Jefatura de Infraestructura Tecnológica"
- Cambio de sublabel en X nodos

**Cambios de presentación (agrupados, no granulares):**
- "Estilo modificado en 3 nodos (colores)"
- "Badges añadidos en 2 nodos"
- "Badges eliminados en 1 nodo"

**Lo que NO registra:**
- Cambios de posición dentro del canvas (drag sin cambio jerárquico)
- Cambios tipográficos menores (tamaño de fuente, grosor)

#### Descripción generada automáticamente

Ejemplo de texto generado para una versión:

```
v8 — 15 dic 2025, 2:30 PM

• Se añadieron 3 nodos: Director Pyme, Gerente Regional Norte, Jefe de Crédito Pymes
• Se eliminó 1 nodo: Coordinación de Nómina
• VP Comercial fue movido: ahora reporta a Gerencia de Operaciones
• Se renombró: "Jefatura de TI" → "Jefatura de Infraestructura Tecnológica"
• Estilo modificado en 2 nodos (colores)
• Badge "Nuevo" añadido en: Director Pyme
```

#### Panel de historial

Lista de versiones accesible desde toolbar, muestra:
- Número de versión (v1, v2, v3...)
- Timestamp formateado
- Descripción auto-generada
- Botón "Restaurar esta versión" → carga ese snapshot con confirmación
- Límite: 100 versiones por proyecto (FIFO — elimina la más antigua)

---

### 5.6 Exportación

#### Exportar organigrama (PNG)

```javascript
import { toPng } from 'html-to-image'

const dataUrl = await toPng(canvasRef.current, {
  pixelRatio: 2,                       // Alta resolución (equivale a ~192 DPI)
  backgroundColor: '#f8fafc',
  filter: (node) => !node.classList?.contains('no-export')  // Excluye controles UI
})
```

- Formato: PNG (predeterminado) o WebP
- Resolución: 2x para presentaciones corporativas
- Fondo: color del canvas (opción de fondo transparente para PNG)
- Nombre del archivo: `{nombreProyecto}-v{version}-{fecha}.png`

#### Exportar historial de cambios (PNG)

Genera una imagen tipo "changelog" exportable para adjuntar en reportes o auditorías:

- Componente React oculto `HistoryExportView` renderiza el historial completo con estilos limpios
- `html-to-image` captura ese componente como PNG de alta resolución
- Cada versión aparece como tarjeta con número, fecha y descripción del diff
- Nombre del archivo: `{nombreProyecto}-historial-{fecha}.png`

#### Exportar datos (JSON)

Exporta el estado completo del proyecto como JSON — útil para backup o migración futura.

---

## 6. Lógica de Layout Automático (layoutUtils.js)

```javascript
import dagre from '@dagrejs/dagre'

export function applyDagreLayout(nodes, edges, options = {}) {
  const {
    rankdir = 'TB',       // TB = top-to-bottom (vertical, orientación organigrama)
    nodesep = 40,         // Separación horizontal entre nodos del mismo nivel
    ranksep = 80,         // Separación vertical entre niveles jerárquicos
    nodeWidth = 180,
    nodeHeight = 60,
  } = options

  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir, nodesep, ranksep })
  g.setDefaultEdgeLabel(() => ({}))

  nodes.forEach(node => {
    g.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  edges.forEach(edge => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  return nodes.map(node => {
    const { x, y } = g.node(node.id)
    return {
      ...node,
      position: {
        x: x - nodeWidth / 2,
        y: y - nodeHeight / 2,
      }
    }
  })
}
```

**Nota sobre orientación vertical:** React Flow muestra ejemplos horizontales por defecto. Para forzar vertical correctamente, los edges deben configurarse con `sourcePosition: Position.Bottom` y `targetPosition: Position.Top` en el componente `OrgNode`.

---

## 7. Lógica de Diff (diffUtils.js)

```javascript
export function generateDiff(prevSnapshot, currentSnapshot) {
  const prevNodes = new Map(prevSnapshot.nodes.map(n => [n.id, n]))
  const currNodes = new Map(currentSnapshot.nodes.map(n => [n.id, n]))

  const added = []
  const removed = []
  const renamed = []
  const moved = []
  const styleChanged = []
  const badgeChanges = { added: [], removed: [] }

  // Nodos nuevos
  for (const [id, node] of currNodes) {
    if (!prevNodes.has(id)) added.push(node.data.label)
  }

  // Nodos eliminados
  for (const [id, node] of prevNodes) {
    if (!currNodes.has(id)) removed.push(node.data.label)
  }

  // Nodos modificados (solo los que existían en ambos)
  for (const [id, curr] of currNodes) {
    const prev = prevNodes.get(id)
    if (!prev) continue

    if (prev.data.label !== curr.data.label)
      renamed.push({ from: prev.data.label, to: curr.data.label })

    // Cambio de padre = movimiento jerárquico
    const prevParent = getParentLabel(id, prevSnapshot.edges, prevNodes)
    const currParent = getParentLabel(id, currentSnapshot.edges, currNodes)
    if (prevParent !== currParent)
      moved.push({ node: curr.data.label, from: prevParent, to: currParent })

    // Cambios de estilo (agrupados)
    if (JSON.stringify(prev.data.style) !== JSON.stringify(curr.data.style))
      styleChanged.push(curr.data.label)

    // Cambios de badges
    const prevBadges = prev.data.badges?.length ?? 0
    const currBadges = curr.data.badges?.length ?? 0
    if (currBadges > prevBadges) badgeChanges.added.push(curr.data.label)
    if (currBadges < prevBadges) badgeChanges.removed.push(curr.data.label)
  }

  return buildDescription({ added, removed, renamed, moved, styleChanged, badgeChanges })
}

function buildDescription(changes) {
  const lines = []

  if (changes.added.length)
    lines.push(`Se añadieron ${changes.added.length} nodo(s): ${changes.added.join(', ')}`)

  if (changes.removed.length)
    lines.push(`Se eliminaron ${changes.removed.length} nodo(s): ${changes.removed.join(', ')}`)

  changes.renamed.forEach(r =>
    lines.push(`Se renombró: "${r.from}" → "${r.to}"`)
  )

  changes.moved.forEach(m =>
    lines.push(`${m.node} movido: de "${m.from}" a "${m.to}"`)
  )

  if (changes.styleChanged.length)
    lines.push(`Estilo modificado en ${changes.styleChanged.length} nodo(s)`)

  if (changes.badgeChanges.added.length)
    lines.push(`Badge añadido en: ${changes.badgeChanges.added.join(', ')}`)

  if (changes.badgeChanges.removed.length)
    lines.push(`Badge eliminado en: ${changes.badgeChanges.removed.join(', ')}`)

  if (!lines.length)
    lines.push('Sin cambios estructurales registrados')

  return lines.join('\n')
}
```

---

## 8. Parseo de XLSX (xlsxParser.js)

```javascript
import * as XLSX from 'xlsx'
import { v4 as uuid } from 'uuid'

export function parseXLSXToNodes(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(sheet)

        // Validación básica
        const requiredCols = ['id', 'label', 'parentId']
        const cols = Object.keys(rows[0] || {})
        const missing = requiredCols.filter(c => !cols.includes(c))
        if (missing.length) {
          reject({ type: 'MISSING_COLUMNS', missing })
          return
        }

        // Mapeo id original → uuid interno
        const idMap = {}
        rows.forEach(row => { idMap[String(row.id)] = uuid() })

        const nodes = rows.map(row => ({
          id: idMap[String(row.id)],
          type: 'orgNode',
          position: { x: 0, y: 0 },          // dagre calculará las posiciones reales
          data: {
            label: String(row.label),
            sublabel: row.sublabel ? String(row.sublabel) : '',
            department: row.department ? String(row.department) : '',
            style: {
              backgroundColor: row.backgroundColor || '#1e3a5f',
              textColor: '#ffffff',
              borderColor: 'transparent',
              borderWidth: 0,
              borderRadius: 6,
              borderStyle: 'solid',
              fontSize: 13,
              fontWeight: '600',
              width: 180,
              minHeight: 48,
            },
            badges: row.badgeText ? [{
              id: uuid(),
              text: String(row.badgeText).slice(0, 15),
              backgroundColor: row.badgeColor || '#22c55e',
              textColor: '#ffffff',
              position: 'top-right',
            }] : [],
            isCollapsed: false,
          }
        }))

        const edges = rows
          .filter(row => row.parentId !== undefined && row.parentId !== null && row.parentId !== '')
          .map(row => ({
            id: `e-${idMap[String(row.parentId)]}-${idMap[String(row.id)]}`,
            source: idMap[String(row.parentId)],
            target: idMap[String(row.id)],
            type: 'orgEdge',
            data: { style: { stroke: '#94a3b8', strokeWidth: 2 } }
          }))

        resolve({ nodes, edges })
      } catch (err) {
        reject({ type: 'PARSE_ERROR', error: err })
      }
    }
    reader.readAsArrayBuffer(file)
  })
}
```

---

## 9. Plan de Desarrollo por Fases

### Fase 1A — Fundación del Canvas (Semana 1)
- [ ] Setup: Vite + React + React Flow + Tailwind + dagre
- [ ] `OrgNode` personalizado: label, sublabel, estilos dinámicos, badges
- [ ] `OrgEdge` personalizado: línea vertical smoothstep con estilos
- [ ] Layout top-down con dagre (`rankdir: TB`)
- [ ] Zoom, pan, fit-to-screen nativos de React Flow
- [ ] Nodo raíz inicial al crear proyecto desde cero

### Fase 1B — Edición Básica (Semana 1-2)
- [ ] Sidebar: NodeEditor (label, sublabel)
- [ ] Añadir nodo hijo con botón hover
- [ ] Eliminar nodo (con confirmación si tiene hijos)
- [ ] Persistencia del canvas en localStorage
- [ ] Botón "Re-layout" con dagre

### Fase 1C — Proyectos y Dashboard (Semana 2)
- [ ] Dashboard de proyectos (ProjectList)
- [ ] Crear proyecto desde cero
- [ ] `useProjects` hook con CRUD en localStorage
- [ ] Thumbnail del proyecto generado con html-to-image
- [ ] Eliminar y renombrar proyectos

### Fase 1D — Importación XLSX (Semana 2-3)
- [ ] `xlsxParser.js` con validación de columnas
- [ ] Modal de importación con preview de filas detectadas
- [ ] Creación de proyecto desde XLSX
- [ ] Generación de `template.xlsx` descargable

### Fase 1E — Estilos Avanzados y Badges (Semana 3)
- [ ] StylePanel: color de fondo, texto, borde, radio, fuente
- [ ] BadgeEditor: añadir/eliminar badges con posición
- [ ] Paleta de colores corporativos guardable (máx 8 colores en `ocs_prefs`)
- [ ] "Aplicar estilo a todos los nodos"

### Fase 1F — Historial y Exportación (Semana 3-4)
- [ ] `diffUtils.js`: comparación y descripción en español
- [ ] `useHistory.js`: snapshots por proyecto
- [ ] HistoryPanel con lista de versiones
- [ ] Restaurar versión anterior
- [ ] Exportación PNG alta resolución con html-to-image
- [ ] Exportación del historial como imagen PNG (`HistoryExportView`)
- [ ] Exportación JSON del proyecto

### Fase 1G — Polish Final (Semana 4)
- [ ] Colapsar/expandir ramas con contador de hijos ocultos
- [ ] Atajos de teclado: Ctrl+S (guardar), Delete (eliminar nodo), Escape (deseleccionar)
- [ ] Responsive básico (sidebar colapsable)
- [ ] Estados de carga y error en importación

---

## 10. Convenciones de Código

- **Componentes**: PascalCase, un componente por archivo
- **Hooks**: camelCase con prefijo `use`
- **Utils**: camelCase, funciones puras sin side effects
- **Estado**: `useReducer` dentro de cada hook (no Redux, no Zustand en Fase 1)
- **IDs**: siempre `uuid()` — nunca índices numéricos
- **localStorage keys**: prefijo `ocs_` para evitar colisiones
- **Comentarios en código**: negocio en español, lógica técnica en inglés
- **Manejo de errores**: try/catch en todos los parsers y operaciones de storage

---

## 11. Notas Técnicas Críticas

### React Flow — Orientación Vertical Correcta
Para que los conectores se vean como un organigrama real (líneas que bajan del padre a los hijos), configurar en `OrgNode`:
```jsx
sourcePosition={Position.Bottom}
targetPosition={Position.Top}
```
Sin esto, React Flow dibuja los conectores en orientación horizontal.

### html-to-image — Captura del Canvas
React Flow renderiza el canvas en un div con `overflow: hidden`. Para capturar todos los nodos incluyendo los que están fuera del viewport visible, aplicar `fitView()` antes de exportar y usar el ref del contenedor interno de React Flow, no el wrapper externo.

### SheetJS (xlsx) — Versión Community
Instalar `xlsx` desde npm. La versión community es Apache 2.0 y funciona correctamente en Vite con `import * as XLSX from 'xlsx'`. No usar la versión Pro (requiere licencia).

### localStorage — Límite de 5MB
Con proyectos grandes (50+ nodos) y muchas versiones en historial, el storage puede saturarse. Estrategias:
- No guardar imágenes en base64 dentro de los nodos (solo URLs externas si se necesita foto del empleado)
- Limitar historial a 100 versiones por proyecto (FIFO)
- La miniatura del proyecto (thumbnail) guardarla con baja resolución (0.3x pixelRatio)
- `storageUtils.js` debe validar el espacio disponible antes de escribir y avisar al usuario

### dagre — Versión Correcta
Instalar `@dagrejs/dagre` (con el scope `@dagrejs`), no el paquete `dagre` original que tiene issues de compatibilidad con bundlers modernos (Vite, esbuild).

---

## 12. Migración a Fase 2 (Referencia Futura)

Cuando se quiera escalar a multi-usuario con Supabase, los únicos cambios necesarios son:

1. **`storageUtils.js`**: reemplazar los wrappers de localStorage con llamadas a Supabase (`supabase.from('projects').select()` etc.)
2. **`App.jsx`**: añadir rutas de auth (login/registro)
3. **Tablas Supabase**: `projects`, `history_entries`, `user_preferences` — el esquema es idéntico al modelo de datos de este documento
4. **RLS**: políticas de Row Level Security para que cada usuario solo vea sus proyectos

Toda la lógica de negocio en hooks, utils y componentes permanece intacta.

---

*Documento generado para desarrollo con AI IDE*  
*Stack: React 18 + Vite + @xyflow/react + @dagrejs/dagre + Tailwind CSS + SheetJS + html-to-image*  
*Todas las dependencias son MIT o Apache 2.0 — sin restricciones para uso comercial futuro*
