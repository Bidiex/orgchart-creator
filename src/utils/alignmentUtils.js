const DEFAULT_WIDTH = 180
const DEFAULT_HEIGHT = 54

function getNodeDimensions(node) {
  const w = node.data?.style?.width || DEFAULT_WIDTH
  const h = node.data?.style?.minHeight || DEFAULT_HEIGHT
  return { w, h }
}

export function alignLeft(nodes) {
  if (nodes.length < 2) return nodes
  const minX = Math.min(...nodes.map(n => n.position.x))
  return nodes.map(n => ({
    ...n,
    position: { ...n.position, x: minX }
  }))
}

export function alignRight(nodes) {
  if (nodes.length < 2) return nodes
  const rightEdges = nodes.map(n => {
    const { w } = getNodeDimensions(n)
    return n.position.x + w
  })
  const maxX = Math.max(...rightEdges)
  return nodes.map(n => {
    const { w } = getNodeDimensions(n)
    return {
      ...n,
      position: { ...n.position, x: maxX - w }
    }
  })
}

export function alignTop(nodes) {
  if (nodes.length < 2) return nodes
  const minY = Math.min(...nodes.map(n => n.position.y))
  return nodes.map(n => ({
    ...n,
    position: { ...n.position, y: minY }
  }))
}

export function alignBottom(nodes) {
  if (nodes.length < 2) return nodes
  const bottomEdges = nodes.map(n => {
    const { h } = getNodeDimensions(n)
    return n.position.y + h
  })
  const maxY = Math.max(...bottomEdges)
  return nodes.map(n => {
    const { h } = getNodeDimensions(n)
    return {
      ...n,
      position: { ...n.position, y: maxY - h }
    }
  })
}

export function alignCenterH(nodes) {
  if (nodes.length < 2) return nodes
  const centers = nodes.map(n => {
    const { w } = getNodeDimensions(n)
    return n.position.x + w / 2
  })
  const avgCx = centers.reduce((sum, val) => sum + val, 0) / nodes.length
  return nodes.map(n => {
    const { w } = getNodeDimensions(n)
    return {
      ...n,
      position: { ...n.position, x: avgCx - w / 2 }
    }
  })
}

export function alignCenterV(nodes) {
  if (nodes.length < 2) return nodes
  const centers = nodes.map(n => {
    const { h } = getNodeDimensions(n)
    return n.position.y + h / 2
  })
  const avgCy = centers.reduce((sum, val) => sum + val, 0) / nodes.length
  return nodes.map(n => {
    const { h } = getNodeDimensions(n)
    return {
      ...n,
      position: { ...n.position, y: avgCy - h / 2 }
    }
  })
}

export function distributeH(nodes) {
  if (nodes.length < 3) return nodes
  
  // 1. Ordenar por posición X
  const sorted = [...nodes].sort((a, b) => a.position.x - b.position.x)
  
  // 2. Calcular ancho total
  const totalWidth = sorted.reduce((sum, n) => sum + getNodeDimensions(n).w, 0)
  
  // 3. Calcular espacio total disponible
  const minX = sorted[0].position.x
  const lastNode = sorted[sorted.length - 1]
  const lastNodeWidth = getNodeDimensions(lastNode).w
  const maxX = lastNode.position.x + lastNodeWidth
  
  const totalSpan = maxX - minX
  const totalAvailableGap = totalSpan - totalWidth
  const gapSize = totalAvailableGap / (sorted.length - 1)
  
  // 4. Actualizar coordenadas secuencialmente
  let currentX = minX
  return sorted.map((n, idx) => {
    const { w } = getNodeDimensions(n)
    const updated = {
      ...n,
      position: { ...n.position, x: currentX }
    }
    currentX += w + gapSize
    return updated
  })
}

export function distributeV(nodes) {
  if (nodes.length < 3) return nodes
  
  // 1. Ordenar por posición Y
  const sorted = [...nodes].sort((a, b) => a.position.y - b.position.y)
  
  // 2. Calcular altura total
  const totalHeight = sorted.reduce((sum, n) => sum + getNodeDimensions(n).h, 0)
  
  // 3. Calcular espacio total disponible
  const minY = sorted[0].position.y
  const lastNode = sorted[sorted.length - 1]
  const lastNodeHeight = getNodeDimensions(lastNode).h
  const maxY = lastNode.position.y + lastNodeHeight
  
  const totalSpan = maxY - minY
  const totalAvailableGap = totalSpan - totalHeight
  const gapSize = totalAvailableGap / (sorted.length - 1)
  
  // 4. Actualizar coordenadas secuencialmente
  let currentY = minY
  return sorted.map((n, idx) => {
    const { h } = getNodeDimensions(n)
    const updated = {
      ...n,
      position: { ...n.position, y: currentY }
    }
    currentY += h + gapSize
    return updated
  })
}
