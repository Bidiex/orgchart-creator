import dagre from '@dagrejs/dagre'

/**
 * Aplica el algoritmo de layout jerárquico (Dagre) a los nodos y conectores.
 * Soporta modo horizontal (TB tradicional) y modo vertical (LR rotado 90 grados).
 * @param {Array} nodes - Nodos de React Flow.
 * @param {Array} edges - Conectores de React Flow.
 * @param {Object} options - Opciones de configuración.
 * @returns {Array} Nodos con posiciones actualizadas.
 */
export function applyDagreLayout(nodes, edges, options = {}) {
  const {
    nodesep = 40,         // Separación horizontal entre nodos del mismo nivel
    ranksep = 80,         // Separación vertical entre niveles jerárquicos
    nodeWidth = 180,
    nodeHeight = 60,
    layoutMode = 'horizontal',
  } = options

  // En modo vertical usamos LR (Left-to-Right) y rotamos las coordenadas.
  // En modo horizontal usamos TB (Top-to-Bottom) directamente.
  const rankdir = layoutMode === 'vertical' ? 'LR' : 'TB'

  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir, nodesep, ranksep })
  g.setDefaultEdgeLabel(() => ({}))

  nodes.forEach(node => {
    // Tomar las dimensiones del estilo si existen o usar valores por defecto
    const w = node.data?.style?.width || nodeWidth
    const h = node.data?.style?.minHeight || nodeHeight
    
    // En LR dagre trata width/height al revés, compensar
    const w_dagre = layoutMode === 'vertical' ? h : w
    const h_dagre = layoutMode === 'vertical' ? w : h
    g.setNode(node.id, { width: w_dagre, height: h_dagre })
  })

  edges.forEach(edge => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  return nodes.map(node => {
    const pos = g.node(node.id)
    const w = node.data?.style?.width || nodeWidth
    const h = node.data?.style?.minHeight || nodeHeight
    
    if (layoutMode === 'vertical') {
      // Rotar: x dagre (horizontal en LR) → y en pantalla
      //        y dagre (vertical en LR)   → x en pantalla
      return {
        ...node,
        position: {
          x: pos.y - w / 2,
          y: pos.x - h / 2,
        }
      }
    }
    
    return {
      ...node,
      position: {
        x: pos.x - w / 2,
        y: pos.y - h / 2,
      }
    }
  })
}
