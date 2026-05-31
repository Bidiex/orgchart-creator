/**
 * Encuentra el label del nodo padre dado un nodeId.
 * @param {string} nodeId - ID del nodo actual.
 * @param {Array} edges - Conectores del canvas.
 * @param {Map} nodesMap - Mapa de ID a nodo.
 * @returns {string} Label del nodo padre o 'Sin padre'.
 */
function getParentLabel(nodeId, edges, nodesMap) {
  const edge = edges.find(e => e.target === nodeId)
  if (!edge) return 'Sin padre'
  const parentNode = nodesMap.get(edge.source)
  return parentNode ? (parentNode.data?.label || 'Sin nombre') : 'Sin padre'
}

/**
 * Convierte el objeto estructurado de cambios en un texto legible en español.
 * @param {Object} changes - El objeto de cambios detectados.
 * @returns {string} La descripción en formato de viñetas.
 */
export function buildDescription(changes) {
  const lines = []

  if (changes.added && changes.added.length > 0) {
    lines.push(`• Se añadieron ${changes.added.length} nodo(s): ${changes.added.join(', ')}`)
  }

  if (changes.removed && changes.removed.length > 0) {
    lines.push(`• Se eliminaron ${changes.removed.length} nodo(s): ${changes.removed.join(', ')}`)
  }

  if (changes.renamed && changes.renamed.length > 0) {
    changes.renamed.forEach(r => {
      lines.push(`• Se renombró: "${r.from}" → "${r.to}"`)
    })
  }

  if (changes.moved && changes.moved.length > 0) {
    changes.moved.forEach(m => {
      lines.push(`• ${m.node} fue movido: ahora reporta a "${m.to}" (antes: "${m.from}")`)
    })
  }

  if (changes.styleChanged && changes.styleChanged.length > 0) {
    lines.push(`• Estilo modificado en ${changes.styleChanged.length} nodo(s)`)
  }

  if (changes.badgeChanges?.added && changes.badgeChanges.added.length > 0) {
    lines.push(`• Etiqueta añadida en: ${changes.badgeChanges.added.join(', ')}`)
  }

  if (changes.badgeChanges?.removed && changes.badgeChanges.removed.length > 0) {
    lines.push(`• Etiqueta eliminada en: ${changes.badgeChanges.removed.join(', ')}`)
  }

  if (lines.length === 0) {
    return 'Sin cambios estructurales registrados'
  }

  return lines.join('\n')
}

/**
 * Compara dos snapshots del organigrama y detecta diferencias estructurales y de presentación.
 * @param {Object} prevSnapshot - Snapshot anterior.
 * @param {Object} currentSnapshot - Snapshot actual.
 * @returns {Object} { hasChanges: boolean, description: string, changes: Object }
 */
export function generateDiff(prevSnapshot, currentSnapshot) {
  const prevNodesList = prevSnapshot?.nodes || []
  const currentNodesList = currentSnapshot?.nodes || []

  const prevNodes = new Map(prevNodesList.map(n => [n.id, n]))
  const currNodes = new Map(currentNodesList.map(n => [n.id, n]))

  const added = []
  const removed = []
  const renamed = []
  const moved = []
  const styleChanged = []
  const badgeChanges = { added: [], removed: [] }

  // 1. Detectar nodos añadidos
  for (const [id, node] of currNodes) {
    if (!prevNodes.has(id)) {
      added.push(node.data?.label || 'Sin nombre')
    }
  }

  // 2. Detectar nodos eliminados
  for (const [id, node] of prevNodes) {
    if (!currNodes.has(id)) {
      removed.push(node.data?.label || 'Sin nombre')
    }
  }

  // 3. Detectar modificaciones en nodos que existen en ambos estados
  for (const [id, curr] of currNodes) {
    const prev = prevNodes.get(id)
    if (!prev) continue

    const prevLabel = prev.data?.label || 'Sin nombre'
    const currLabel = curr.data?.label || 'Sin nombre'

    // Renombrados
    if (prevLabel !== currLabel) {
      renamed.push({ from: prevLabel, to: currLabel })
    }

    // Movimientos jerárquicos (cambio de nodo padre)
    const prevParent = getParentLabel(id, prevSnapshot?.edges || [], prevNodes)
    const currParent = getParentLabel(id, currentSnapshot?.edges || [], currNodes)
    
    if (prevParent !== currParent) {
      moved.push({ node: currLabel, from: prevParent, to: currParent })
    }

    // Cambios de estilo significativos (colores y formato de línea)
    const prevStyle = prev.data?.style || {}
    const currStyle = curr.data?.style || {}
    
    const hasStyleDiff = 
      prevStyle.backgroundColor !== currStyle.backgroundColor ||
      prevStyle.textColor !== currStyle.textColor ||
      prevStyle.borderColor !== currStyle.borderColor ||
      prevStyle.borderStyle !== currStyle.borderStyle

    if (hasStyleDiff) {
      styleChanged.push(currLabel)
    }

    // Cambios de Badges
    const prevBadges = prev.data?.badges || []
    const currBadges = curr.data?.badges || []
    
    if (currBadges.length > prevBadges.length) {
      badgeChanges.added.push(currLabel)
    } else if (currBadges.length < prevBadges.length) {
      badgeChanges.removed.push(currLabel)
    } else {
      // Mismo número de badges, verificar si cambió el texto de alguno
      const prevBadgesStr = JSON.stringify(prevBadges.map(b => b.text).sort())
      const currBadgesStr = JSON.stringify(currBadges.map(b => b.text).sort())
      if (prevBadgesStr !== currBadgesStr) {
        badgeChanges.added.push(currLabel)
      }
    }
  }

  const description = buildDescription({ added, removed, renamed, moved, styleChanged, badgeChanges })
  
  const hasChanges = 
    added.length > 0 || 
    removed.length > 0 || 
    renamed.length > 0 || 
    moved.length > 0 || 
    styleChanged.length > 0 || 
    badgeChanges.added.length > 0 || 
    badgeChanges.removed.length > 0

  return {
    hasChanges,
    description,
    changes: { added, removed, renamed, moved, styleChanged, badgeChanges }
  }
}
