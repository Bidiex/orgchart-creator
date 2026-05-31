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
  showMiniMap
}) {
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  )

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  )

  // Inyectar el callback onAddChild en la data de cada nodo
  const nodesWithCallbacks = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onAddChild: addChildNode
      }
    }))
  }, [nodes, addChildNode])

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

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodesWithCallbacks}
        edges={edges}
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
        <Background variant="dots" color="#273549" gap={18} size={1} />
        
        {/* Controles de canvas propios */}
        <CanvasControls onReorganize={reorganizeNodes} />
        
        {/* MiniMap condicional */}
        {showMiniMap && (
          <MiniMap
            style={{
              background: '#11131E',
              borderRadius: '12px',
              border: '1px solid #1E293B',
              width: 140,
              height: 100
            }}
            nodeColor="#334155"
            maskColor="rgba(7, 8, 12, 0.7)"
            className="!bottom-4 !right-4"
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
