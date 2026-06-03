import { useReducer, useEffect, useCallback, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { getProject, saveProject } from '../utils/storageUtils'
import { applyDagreLayout } from '../utils/layoutUtils'
import { useUndoRedo } from './useUndoRedo'

const DEFAULT_NODE_STYLE = {
  backgroundColor: '#1E2538',
  textColor: '#FFFFFF',
  sublabelColor: '#E2E8F0',
  borderColor: '#334155',
  borderWidth: 1,
  borderRadius: 12, // custom-sm
  borderStyle: 'solid',
  fontSize: 13,
  fontWeight: '600',
  width: 180,
  minHeight: 54
}

const initialState = {
  nodes: [],
  edges: [],
  selectedNodeId: null,
  projectName: '',
  loading: true,
  isDirty: false,
  layoutMode: 'horizontal',
  selectedNodes: []
}

function editorReducer(state, action) {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        nodes: action.payload.nodes || [],
        edges: action.payload.edges || [],
        projectName: action.payload.name || '',
        layoutMode: action.payload.layoutMode || 'horizontal',
        selectedNodeId: null,
        loading: false,
        isDirty: false,
        selectedNodes: []
      }
    case 'SET_NODES':
      return { ...state, nodes: action.payload, isDirty: true }
    case 'SET_EDGES':
      return { ...state, edges: action.payload }
    case 'SET_LAYOUT_MODE':
      return { ...state, layoutMode: action.payload, isDirty: true }
    case 'SET_SELECTED_NODES':
      return { ...state, selectedNodes: action.payload }
    case 'SELECT_NODE':
      return { ...state, selectedNodeId: action.payload }
    case 'ADD_NODE_AND_EDGE': {
      const { node, edge } = action.payload
      const newNodes = [...state.nodes, node]
      const newEdges = edge ? [...state.edges, edge] : state.edges
      return {
        ...state,
        nodes: newNodes,
        edges: newEdges,
        isDirty: true
      }
    }
    case 'DELETE_NODE': {
      const payload = action.payload
      const idsToDelete = Array.isArray(payload) ? payload : [payload]
      const newNodes = state.nodes.filter(n => !idsToDelete.includes(n.id))
      const newEdges = state.edges.filter(e => !idsToDelete.includes(e.source) && !idsToDelete.includes(e.target))
      return {
        ...state,
        nodes: newNodes,
        edges: newEdges,
        selectedNodeId: idsToDelete.includes(state.selectedNodeId) ? null : state.selectedNodeId,
        isDirty: true
      }
    }
    case 'UPDATE_NODE': {
      const { id, data } = action.payload
      const newNodes = state.nodes.map(n => {
        if (n.id === id) {
          return {
            ...n,
            data: {
              ...n.data,
              ...data,
              style: {
                ...n.data?.style,
                ...data?.style
              }
            }
          }
        }
        return n
      })
      return { ...state, nodes: newNodes, isDirty: true }
    }
    case 'APPLY_STYLE_TO_ALL': {
      const style = action.payload
      const newNodes = state.nodes.map(n => ({
        ...n,
        data: {
          ...n.data,
          style: {
            ...n.data?.style,
            ...style
          }
        }
      }))
      return { ...state, nodes: newNodes, isDirty: true }
    }
    case 'UPDATE_PROJECT_NAME':
      return { ...state, projectName: action.payload, isDirty: true }
    case 'TOGGLE_COLLAPSE': {
      return { ...state, nodes: action.payload, isDirty: true }
    }
    case 'MARK_SAVED':
      return { ...state, isDirty: false }
    default:
      return state
  }
}

/**
 * Obtiene recursivamente todos los descendientes de un nodo
 */
function getDescendants(nodeId, edges) {
  const descendants = []
  const queue = [nodeId]
  while (queue.length > 0) {
    const current = queue.shift()
    const children = edges.filter(e => e.source === current).map(e => e.target)
    descendants.push(...children)
    queue.push(...children)
  }
  return descendants
}

export function useEditor(projectId) {
  const [state, dispatch] = useReducer(editorReducer, initialState)

  const {
    canUndo,
    canRedo,
    pushState,
    undo,
    redo,
    clearHistory,
    cleanLastHistoryIfIdentical
  } = useUndoRedo()

  const isTypingRef = useRef(false)
  const typingTimeoutRef = useRef(null)

  // Helper to push pre-mutation state
  const pushHistoryState = useCallback(() => {
    pushState({ nodes: state.nodes, edges: state.edges })
  }, [pushState, state.nodes, state.edges])

  // Helper to clean up history if current state is identical to pre-mutation
  const checkAndCleanRedundantHistory = useCallback(() => {
    cleanLastHistoryIfIdentical({ nodes: state.nodes, edges: state.edges })
  }, [cleanLastHistoryIfIdentical, state.nodes, state.edges])

  // Clear typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  // Carga inicial del proyecto
  useEffect(() => {
    if (projectId) {
      const project = getProject(projectId)
      if (project) {
        const pNodes = project.currentSnapshot?.nodes || []
        const pEdges = project.currentSnapshot?.edges || []
        const pLayoutMode = project.currentSnapshot?.layoutMode || 'horizontal'

        dispatch({
          type: 'INITIALIZE',
          payload: {
            nodes: pNodes,
            edges: pEdges,
            name: project.name,
            layoutMode: pLayoutMode
          }
        })
        clearHistory()
        // Reset typing tracking
        isTypingRef.current = false
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
      }
    }
  }, [projectId, clearHistory])

  const setNodes = useCallback((nodes) => {
    dispatch({ type: 'SET_NODES', payload: typeof nodes === 'function' ? nodes(state.nodes) : nodes })
  }, [state.nodes])

  const setEdges = useCallback((edges) => {
    dispatch({ type: 'SET_EDGES', payload: typeof edges === 'function' ? edges(state.edges) : edges })
  }, [state.edges])

  const selectNode = useCallback((id) => {
    dispatch({ type: 'SELECT_NODE', payload: id })
  }, [])

  const updateProjectName = useCallback((name) => {
    dispatch({ type: 'UPDATE_PROJECT_NAME', payload: name })
  }, [])

  const performUndo = useCallback(() => {
    const prevState = undo({ nodes: state.nodes, edges: state.edges })
    if (prevState) {
      dispatch({ type: 'SET_NODES', payload: prevState.nodes })
      dispatch({ type: 'SET_EDGES', payload: prevState.edges })
    }
  }, [undo, state.nodes, state.edges])

  const performRedo = useCallback(() => {
    const nextState = redo({ nodes: state.nodes, edges: state.edges })
    if (nextState) {
      dispatch({ type: 'SET_NODES', payload: nextState.nodes })
      dispatch({ type: 'SET_EDGES', payload: nextState.edges })
    }
  }, [redo, state.nodes, state.edges])

  /**
   * Añade un nodo raíz suelto al canvas
   */
  const addRootNode = useCallback(() => {
    pushHistoryState()
    const id = uuidv4()
    const newNode = {
      id,
      type: 'orgNode',
      position: { x: 100, y: 100 },
      data: {
        label: 'Nuevo Nodo Raíz',
        sublabel: 'Cargo / Departamento',
        style: { ...DEFAULT_NODE_STYLE },
        badges: [],
        isCollapsed: false,
        childLayout: 'horizontal'
      }
    }
    dispatch({
      type: 'ADD_NODE_AND_EDGE',
      payload: { node: newNode, edge: null }
    })
  }, [pushHistoryState])

  /**
   * Añade un nodo hijo y lo conecta con su padre
   */
  const addChildNode = useCallback((parentId) => {
    const parentNode = state.nodes.find(n => n.id === parentId)
    if (!parentNode) return

    pushHistoryState()
    const childId = uuidv4()
    
    // Posición inicial ligeramente abajo del padre para mejor visualización previa al layout
    const newPosition = {
      x: parentNode.position.x,
      y: parentNode.position.y + 120
    }

    const childNode = {
      id: childId,
      type: 'orgNode',
      position: newPosition,
      data: {
        label: 'Nuevo Colaborador',
        sublabel: 'Cargo / Departamento',
        style: { ...DEFAULT_NODE_STYLE },
        badges: [],
        isCollapsed: false,
        childLayout: 'horizontal'
      }
    }

    const newEdge = {
      id: `e-${parentId}-${childId}`,
      source: parentId,
      target: childId,
      type: 'orgEdge',
      data: {
        style: {
          stroke: '#94a3b8',
          strokeWidth: 2
        }
      }
    }

    dispatch({
      type: 'ADD_NODE_AND_EDGE',
      payload: { node: childNode, edge: newEdge }
    })
  }, [state.nodes, pushHistoryState])

  /**
   * Elimina un nodo del canvas (de forma recursiva si se especifica)
   */
  const deleteNode = useCallback((id, recursive = false) => {
    pushHistoryState()
    if (recursive) {
      const descendants = getDescendants(id, state.edges)
      const idsToDelete = [id, ...descendants]
      dispatch({ type: 'DELETE_NODE', payload: idsToDelete })
    } else {
      dispatch({ type: 'DELETE_NODE', payload: id })
    }
  }, [state.edges, pushHistoryState])

  /**
   * Actualiza los datos de un nodo
   */
  const updateNode = useCallback((id, data) => {
    const isTextEdit = data && ('label' in data || 'sublabel' in data || 'department' in data)

    if (isTextEdit) {
      if (!isTypingRef.current) {
        pushHistoryState()
        isTypingRef.current = true
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false
        checkAndCleanRedundantHistory()
      }, 1000)
    } else {
      pushHistoryState()
      isTypingRef.current = false
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }

    dispatch({ type: 'UPDATE_NODE', payload: { id, data } })

    // Si cambia childLayout, forzar reorganización del layout de inmediato
    if (data && 'childLayout' in data) {
      setNodes(prevNodes => {
        const updatedNodes = prevNodes.map(n => {
          if (n.id === id) {
            return {
              ...n,
              data: {
                ...n.data,
                ...data
              }
            }
          }
          return n
        })

        const nodeHeights = {}
        updatedNodes.forEach(node => {
          const domNode = document.querySelector(`.react-flow__node[data-id="${node.id}"]`)
          if (domNode) {
            const rect = domNode.getBoundingClientRect()
            if (rect && rect.height > 0) {
              nodeHeights[node.id] = rect.height
            }
          }
        })

        return applyDagreLayout(updatedNodes, state.edges, { 
          layoutMode: state.layoutMode,
          nodeHeights
        })
      })
    }
  }, [state.edges, state.layoutMode, setNodes, pushHistoryState, checkAndCleanRedundantHistory])

  /**
   * Aplica un estilo a todos los nodos del canvas
   */
  const applyStyleToAll = useCallback((style) => {
    pushHistoryState()
    dispatch({ type: 'APPLY_STYLE_TO_ALL', payload: style })
  }, [pushHistoryState])

  /**
   * Reorganiza los nodos usando el algoritmo de Dagre
   */
  const reorganizeNodes = useCallback(() => {
    if (state.nodes.length === 0) return
    pushHistoryState()

    // Medir la altura de los nodos desde el DOM si ya están renderizados
    const nodeHeights = {}
    state.nodes.forEach(node => {
      const domNode = document.querySelector(`.react-flow__node[data-id="${node.id}"]`)
      if (domNode) {
        const rect = domNode.getBoundingClientRect()
        if (rect && rect.height > 0) {
          nodeHeights[node.id] = rect.height
        }
      }
    })

    const laidOutNodes = applyDagreLayout(state.nodes, state.edges, { 
      layoutMode: state.layoutMode,
      nodeHeights
    })
    dispatch({ type: 'SET_NODES', payload: laidOutNodes })
  }, [state.nodes, state.edges, state.layoutMode, pushHistoryState])

  /**
   * Persiste el estado actual del canvas en localStorage
   */
  const saveCurrentProject = useCallback((newName) => {
    if (!projectId) return false

    const projectToSave = getProject(projectId)
    if (!projectToSave) return false

    const updatedProject = {
      ...projectToSave,
      name: newName || state.projectName || projectToSave.name,
      currentSnapshot: {
        nodes: state.nodes,
        edges: state.edges,
        layoutMode: state.layoutMode,
        viewport: { x: 0, y: 0, zoom: 1 } // Ajustable con React Flow instance
      }
    }

    const success = saveProject(updatedProject)
    if (success) {
      dispatch({ type: 'MARK_SAVED' })
    }
    return success
  }, [projectId, state.nodes, state.edges, state.projectName, state.layoutMode])

  const toggleCollapse = useCallback((nodeId) => {
    pushHistoryState()
    
    // 1. Toggle the collapsed state of the target node
    const updatedNodes = state.nodes.map(n => {
      if (n.id === nodeId) {
        return {
          ...n,
          data: {
            ...n.data,
            isCollapsed: !n.data.isCollapsed
          }
        }
      }
      return n
    })

    // 2. Measure actual DOM node heights for currently visible nodes
    const nodeHeights = {}
    updatedNodes.forEach(node => {
      const domNode = document.querySelector(`.react-flow__node[data-id="${node.id}"]`)
      if (domNode) {
        const rect = domNode.getBoundingClientRect()
        if (rect && rect.height > 0) {
          nodeHeights[node.id] = rect.height
        }
      }
    })

    // 3. Recalculate layout with visibleOnly: true
    const laidOutNodes = applyDagreLayout(updatedNodes, state.edges, {
      layoutMode: state.layoutMode,
      nodeHeights,
      visibleOnly: true
    })

    // 4. Dispatch the updated nodes list
    dispatch({ type: 'TOGGLE_COLLAPSE', payload: laidOutNodes })

    // 5. If change is significant (> 3 descendants), trigger a smooth fitView
    const descendants = getDescendants(nodeId, state.edges)
    if (descendants.length > 3) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('ocs-fit-view'))
      }, 100)
    }
  }, [state.nodes, state.edges, state.layoutMode, dispatch, pushHistoryState])

  const setLayoutMode = useCallback((mode) => {
    pushHistoryState()
    dispatch({ type: 'SET_LAYOUT_MODE', payload: mode })
    
    // Medir la altura de los nodos desde el DOM si ya están renderizados
    const nodeHeights = {}
    state.nodes.forEach(node => {
      const domNode = document.querySelector(`.react-flow__node[data-id="${node.id}"]`)
      if (domNode) {
        const rect = domNode.getBoundingClientRect()
        if (rect && rect.height > 0) {
          nodeHeights[node.id] = rect.height
        }
      }
    })

    // Recalcular el layout de inmediato usando el nuevo modo
    setNodes(prevNodes => {
      if (prevNodes.length === 0) return prevNodes
      return applyDagreLayout(prevNodes, state.edges, { layoutMode: mode, nodeHeights })
    })
  }, [state.edges, state.nodes, setNodes, pushHistoryState])

  const setSelectedNodes = useCallback((selected) => {
    dispatch({ type: 'SET_SELECTED_NODES', payload: selected })
  }, [])

  return {
    nodes: state.nodes,
    edges: state.edges,
    selectedNodeId: state.selectedNodeId,
    projectName: state.projectName,
    loading: state.loading,
    isDirty: state.isDirty,
    layoutMode: state.layoutMode,
    selectedNodes: state.selectedNodes || [],
    setLayoutMode,
    setSelectedNodes,
    setNodes,
    setEdges,
    selectNode,
    addRootNode,
    addChildNode,
    deleteNode,
    updateNode,
    applyStyleToAll,
    reorganizeNodes,
    updateProjectName,
    saveCurrentProject,
    toggleCollapse,
    undo: performUndo,
    redo: performRedo,
    canUndo,
    canRedo,
    pushHistoryState,
    checkAndCleanRedundantHistory
  }
}
