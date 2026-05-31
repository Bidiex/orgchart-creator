import { useReducer, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { getProject, saveProject } from '../utils/storageUtils'
import { applyDagreLayout } from '../utils/layoutUtils'

const DEFAULT_NODE_STYLE = {
  backgroundColor: '#1E2538',
  textColor: '#FFFFFF',
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
  loading: true
}

function editorReducer(state, action) {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        nodes: action.payload.nodes || [],
        edges: action.payload.edges || [],
        projectName: action.payload.name || '',
        selectedNodeId: null,
        loading: false
      }
    case 'SET_NODES':
      return { ...state, nodes: action.payload }
    case 'SET_EDGES':
      return { ...state, edges: action.payload }
    case 'SELECT_NODE':
      return { ...state, selectedNodeId: action.payload }
    case 'ADD_NODE_AND_EDGE': {
      const { node, edge } = action.payload
      const newNodes = [...state.nodes, node]
      const newEdges = edge ? [...state.edges, edge] : state.edges
      return {
        ...state,
        nodes: newNodes,
        edges: newEdges
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
        selectedNodeId: idsToDelete.includes(state.selectedNodeId) ? null : state.selectedNodeId
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
      return { ...state, nodes: newNodes }
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
      return { ...state, nodes: newNodes }
    }
    case 'UPDATE_PROJECT_NAME':
      return { ...state, projectName: action.payload }
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

  // Carga inicial del proyecto
  useEffect(() => {
    if (projectId) {
      const project = getProject(projectId)
      if (project) {
        dispatch({
          type: 'INITIALIZE',
          payload: {
            nodes: project.currentSnapshot?.nodes || [],
            edges: project.currentSnapshot?.edges || [],
            name: project.name
          }
        })
      }
    }
  }, [projectId])

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

  /**
   * Añade un nodo raíz suelto al canvas
   */
  const addRootNode = useCallback(() => {
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
        isCollapsed: false
      }
    }
    dispatch({
      type: 'ADD_NODE_AND_EDGE',
      payload: { node: newNode, edge: null }
    })
  }, [])

  /**
   * Añade un nodo hijo y lo conecta con su padre
   */
  const addChildNode = useCallback((parentId) => {
    const parentNode = state.nodes.find(n => n.id === parentId)
    if (!parentNode) return

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
        isCollapsed: false
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
  }, [state.nodes])

  /**
   * Elimina un nodo del canvas (de forma recursiva si se especifica)
   */
  const deleteNode = useCallback((id, recursive = false) => {
    if (recursive) {
      const descendants = getDescendants(id, state.edges)
      const idsToDelete = [id, ...descendants]
      dispatch({ type: 'DELETE_NODE', payload: idsToDelete })
    } else {
      dispatch({ type: 'DELETE_NODE', payload: id })
    }
  }, [state.edges])

  /**
   * Actualiza los datos de un nodo
   */
  const updateNode = useCallback((id, data) => {
    dispatch({ type: 'UPDATE_NODE', payload: { id, data } })
  }, [])

  /**
   * Aplica un estilo a todos los nodos del canvas
   */
  const applyStyleToAll = useCallback((style) => {
    dispatch({ type: 'APPLY_STYLE_TO_ALL', payload: style })
  }, [])

  /**
   * Reorganiza los nodos usando el algoritmo de Dagre
   */
  const reorganizeNodes = useCallback(() => {
    if (state.nodes.length === 0) return
    const laidOutNodes = applyDagreLayout(state.nodes, state.edges)
    dispatch({ type: 'SET_NODES', payload: laidOutNodes })
  }, [state.nodes, state.edges])

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
        viewport: { x: 0, y: 0, zoom: 1 } // Ajustable con React Flow instance
      }
    }

    return saveProject(updatedProject)
  }, [projectId, state.nodes, state.edges, state.projectName])

  return {
    nodes: state.nodes,
    edges: state.edges,
    selectedNodeId: state.selectedNodeId,
    projectName: state.projectName,
    loading: state.loading,
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
    saveCurrentProject
  }
}
