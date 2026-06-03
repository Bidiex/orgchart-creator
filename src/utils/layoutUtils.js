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
    nodeHeights = {},
    visibleOnly = false,
  } = options

  // En modo vertical usamos LR (Left-to-Right) y rotamos las coordenadas.
  // En modo horizontal usamos TB (Top-to-Bottom) directamente.
  const rankdir = layoutMode === 'vertical' ? 'LR' : 'TB'

  // Helper para determinar la altura de forma dinámica
  const getNodeHeight = (node) => {
    if (nodeHeights && nodeHeights[node.id]) {
      return nodeHeights[node.id]
    }
    // Estimación: 80 para nodos con sublabel, 60 para nodos sin ella
    const hasSublabel = !!node.data?.sublabel
    return hasSublabel ? 80 : 60
  }

  // Filtrar nodos y edges si visibleOnly es true
  let nodesToProcess = nodes
  let edgesToProcess = edges
  let visibleNodeIds = new Set(nodes.map(n => n.id))

  if (visibleOnly) {
    const parentMap = {}
    edges.forEach(edge => {
      parentMap[edge.target] = edge.source
    })

    const nodeMap = new Map(nodes.map(n => [n.id, n]))
    visibleNodeIds = new Set()

    nodes.forEach(node => {
      let isVisible = true
      let currentId = node.id
      while (parentMap[currentId]) {
        const parentId = parentMap[currentId]
        const parentNode = nodeMap.get(parentId)
        if (parentNode && parentNode.data?.isCollapsed) {
          isVisible = false
          break
        }
        currentId = parentId
      }
      if (isVisible) {
        visibleNodeIds.add(node.id)
      }
    })

    nodesToProcess = nodes.filter(n => visibleNodeIds.has(n.id))
    edgesToProcess = edges.filter(e => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target))
  }

  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir, nodesep, ranksep })
  g.setDefaultEdgeLabel(() => ({}))

  nodesToProcess.forEach(node => {
    // Tomar las dimensiones del estilo si existen o usar valores por defecto
    const w = node.data?.style?.width || nodeWidth
    const h = getNodeHeight(node)
    
    // En LR dagre trata width/height al revés, compensar
    const w_dagre = layoutMode === 'vertical' ? h : w
    const h_dagre = layoutMode === 'vertical' ? w : h
    g.setNode(node.id, { width: w_dagre, height: h_dagre })
  })

  edgesToProcess.forEach(edge => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  const laidOutNodes = nodes.map(node => {
    // Si no es visible, mantenemos su posición original
    if (visibleOnly && !visibleNodeIds.has(node.id)) {
      return node
    }

    const pos = g.node(node.id)
    const w = node.data?.style?.width || nodeWidth
    const h = getNodeHeight(node)
    
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

  // Post-procesar para childLayout: 'vertical'
  // childrenMap: parentId -> array of child nodes
  const childrenMap = {}
  edges.forEach(edge => {
    if (visibleOnly && (!visibleNodeIds.has(edge.source) || !visibleNodeIds.has(edge.target))) {
      return
    }
    if (!childrenMap[edge.source]) {
      childrenMap[edge.source] = []
    }
    const childNode = laidOutNodes.find(n => n.id === edge.target)
    if (childNode) {
      childrenMap[edge.source].push(childNode)
    }
  })

  // Ordenar hijos según su posición x original de Dagre para conservar el orden
  Object.keys(childrenMap).forEach(parentId => {
    childrenMap[parentId].sort((a, b) => a.position.x - b.position.x)
  })

  const parentMap = {}
  edges.forEach(edge => {
    parentMap[edge.target] = edge.source
  })

  const roots = laidOutNodes.filter(node => !parentMap[node.id] && visibleNodeIds.has(node.id))

  // Desplazar recursivamente todo un subárbol
  const shiftSubtree = (nodeId, deltaX, deltaY) => {
    if (deltaX === 0 && deltaY === 0) return
    const queue = [nodeId]
    const visited = new Set([nodeId])
    while (queue.length > 0) {
      const currentId = queue.shift()
      const children = childrenMap[currentId] || []
      children.forEach(child => {
        if (!visited.has(child.id)) {
          visited.add(child.id)
          child.position.x += deltaX
          child.position.y += deltaY
          queue.push(child.id)
        }
      })
    }
  }

  // Obtener el valor máximo de Y dentro de un subárbol completo
  const getSubtreeMaxY = (nodeId) => {
    const nodeObj = laidOutNodes.find(n => n.id === nodeId)
    let maxY = nodeObj.position.y + getNodeHeight(nodeObj)
    const queue = [nodeId]
    const visited = new Set([nodeId])
    while (queue.length > 0) {
      const currentId = queue.shift()
      const children = childrenMap[currentId] || []
      children.forEach(child => {
        if (!visited.has(child.id)) {
          visited.add(child.id)
          const childMaxY = child.position.y + getNodeHeight(child)
          if (childMaxY > maxY) {
            maxY = childMaxY
          }
          queue.push(child.id)
        }
      })
    }
    return maxY
  }

  // Función recursiva para reposicionar ramas verticales
  const postProcessNode = (node) => {
    const children = childrenMap[node.id] || []
    if (children.length === 0) {
      return
    }

    // Procesar primero en profundidad (hijos primero)
    children.forEach(child => postProcessNode(child))

    const isVertical = node.data?.childLayout === 'vertical'
    if (isVertical) {
      let currentY = node.position.y + getNodeHeight(node) + ranksep
      
      children.forEach(child => {
        const oldX = child.position.x
        const oldY = child.position.y
        
        // Alinear al borde izquierdo del padre (mismo X) y apilar en Y
        child.position.x = node.position.x
        child.position.y = currentY
        
        const deltaX = child.position.x - oldX
        const deltaY = child.position.y - oldY
        
        // Mover descendientes por el mismo desplazamiento
        shiftSubtree(child.id, deltaX, deltaY)
        
        // El siguiente hermano se colocará debajo de todo este subárbol
        const subTreeMaxY = getSubtreeMaxY(child.id)
        currentY = subTreeMaxY + ranksep
      })
    }
  }

  roots.forEach(root => postProcessNode(root))

  return laidOutNodes
}
