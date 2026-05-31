import React, { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  MiniMap,
  ReactFlowProvider,
  applyNodeChanges,
  applyEdgeChanges
} from '@xyflow/react'
import OrgNode from './OrgNode'
import OrgEdge from './OrgEdge'
import CanvasControls from './CanvasControls'
import { useTheme } from '../../hooks/useTheme'

// Estilos de React Flow (Requeridos en el core del canvas)
import '@xyflow/react/dist/style.css'

// Registrar tipos de nodos y conectores fuera del renderizado
const nodeTypes = {
  orgNode: OrgNode
}

const edgeTypes = {
  orgEdge: OrgEdge
}

function OrgCanvasContent({
  nodes,
  edges,
  setNodes,
  setEdges,
  selectNode,
  addChildNode,
  reorganizeNodes,
  showMiniMap,
  onUpdateNode,
  toggleCollapse
}) {
  const { isDark } = useTheme()
  const dotColor = isDark ? '#273549' : '#cbd5e1'

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  )

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  )

  // Inyectar el callback onAddChild y otros datos útiles en la data de cada nodo
  const nodesWithCallbacks = useMemo(() => {
    // Construir mapa de hijos directos: nodeId -> targetIds
    const childrenMap = {}
    edges.forEach((edge) => {
      if (!childrenMap[edge.source]) {
        childrenMap[edge.source] = []
      }
      childrenMap[edge.source].push(edge.target)
    })

    // Helper recursivo para contar descendientes totales
    const countDescendants = (nodeId) => {
      let count = 0
      const queue = [nodeId]
      const visited = new Set([nodeId])
      while (queue.length > 0) {
        const current = queue.shift()
        const children = childrenMap[current] || []
        for (const child of children) {
          if (!visited.has(child)) {
            visited.add(child)
            count++
            queue.push(child)
          }
        }
      }
      return count
    }

    return nodes.map((node) => {
      const hasChildren = (childrenMap[node.id] || []).length > 0
      const descendantsCount = hasChildren ? countDescendants(node.id) : 0
      return {
        ...node,
        data: {
          ...node.data,
          onAddChild: addChildNode,
          onUpdateNode: onUpdateNode,
          onToggleCollapse: toggleCollapse,
          hasChildren,
          descendantsCount
        }
      }
    })
  }, [nodes, edges, addChildNode, onUpdateNode, toggleCollapse])

  const onNodeClick = useCallback(
    (event, node) => {
      selectNode(node.id)
    },
    [selectNode]
  )

  const onPaneClick = useCallback(
    () => {
      selectNode(null)
    },
    [selectNode]
  )

  // Determinar qué nodos son visibles: un nodo es visible si no tiene ningún ancestro colapsado
  const visibleNodes = useMemo(() => {
    const parentMap = {}
    edges.forEach((edge) => {
      parentMap[edge.target] = edge.source
    })

    return nodesWithCallbacks.filter((node) => {
      let currentId = node.id
      while (parentMap[currentId]) {
        const parentId = parentMap[currentId]
        const parentNode = nodes.find((n) => n.id === parentId)
        if (parentNode && parentNode.data?.isCollapsed) {
          return false
        }
        currentId = parentId
      }
      return true
    })
  }, [nodesWithCallbacks, edges, nodes])

  // Determinar qué aristas son visibles: una arista es visible si tanto su origen como su destino son visibles
  const visibleEdges = useMemo(() => {
    const visibleNodeIds = new Set(visibleNodes.map((n) => n.id))
    return edges.filter((edge) => {
      return visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    })
  }, [visibleNodes, edges])

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={visibleNodes}
        edges={visibleEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        defaultMarkerColor="#94a3b8"
      >
        {/* Fondo con patrón de puntos sutil */}
        <Background variant="dots" color={dotColor} gap={18} size={1} />
        
        {/* Controles de canvas propios */}
        <CanvasControls onReorganize={reorganizeNodes} />
        
        {/* MiniMap condicional */}
        {showMiniMap && (
          <MiniMap
            style={{
              background: isDark ? '#11131E' : '#ffffff',
              borderRadius: '12px',
              border: isDark ? '1px solid #1E293B' : '1px solid #e2e8f0',
              width: 140,
              height: 100
            }}
            nodeColor={isDark ? '#334155' : '#cbd5e1'}
            maskColor={isDark ? 'rgba(7, 8, 12, 0.7)' : 'rgba(241, 245, 249, 0.7)'}
            className="!bottom-4 !right-4 no-export"
          />
        )}
      </ReactFlow>
    </div>
  )
}

export default function OrgCanvas(props) {
  return (
    <ReactFlowProvider>
      <OrgCanvasContent {...props} />
    </ReactFlowProvider>
  )
}
