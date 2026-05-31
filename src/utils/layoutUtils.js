import dagre from '@dagrejs/dagre'

/**
 * Aplica el algoritmo de layout jerárquico vertical (Dagre) a los nodos y conectores.
 * @param {Array} nodes - Nodos de React Flow.
 * @param {Array} edges - Conectores de React Flow.
 * @param {Object} options - Opciones de configuración.
 * @returns {Array} Nodos con posiciones actualizadas.
 */
export function applyDagreLayout(nodes, edges, options = {}) {
  const {
    rankdir = 'TB',       // TB = top-to-bottom (vertical)
    nodesep = 40,         // Separación horizontal entre nodos del mismo nivel
    ranksep = 80,         // Separación vertical entre niveles jerárquicos
    nodeWidth = 180,
    nodeHeight = 60,
  } = options

  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir, nodesep, ranksep })
  g.setDefaultEdgeLabel(() => ({}))

  nodes.forEach(node => {
    // Tomar las dimensiones del estilo si existen o usar valores por defecto
    const w = node.data?.style?.width || nodeWidth
    const h = node.data?.style?.minHeight || nodeHeight
    g.setNode(node.id, { width: w, height: h })
  })

  edges.forEach(edge => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  return nodes.map(node => {
    const { x, y } = g.node(node.id)
    const w = node.data?.style?.width || nodeWidth
    const h = node.data?.style?.minHeight || nodeHeight
    
    return {
      ...node,
      position: {
        x: x - w / 2,
        y: y - h / 2,
      }
    }
  })
}
