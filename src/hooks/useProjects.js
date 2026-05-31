import { useReducer, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { getProjects, saveProject, deleteProject as dbDeleteProject, safeLocalStorageSetItem, getProject } from '../utils/storageUtils'

const initialState = {
  projects: [],
  loading: true
}

function sortProjectsByDate(projects) {
  return [...projects].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
}

function projectsReducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return {
        ...state,
        projects: sortProjectsByDate(action.payload),
        loading: false
      }
    case 'ADD':
      return {
        ...state,
        projects: sortProjectsByDate([action.payload, ...state.projects])
      }
    case 'DELETE':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload)
      }
    case 'UPDATE':
      return {
        ...state,
        projects: sortProjectsByDate(
          state.projects.map(p => p.id === action.payload.id ? action.payload : p)
        )
      }
    default:
      return state
  }
}

export function useProjects() {
  const [state, dispatch] = useReducer(projectsReducer, initialState)

  // Carga inicial de proyectos
  useEffect(() => {
    const list = getProjects()
    dispatch({ type: 'LOAD', payload: list })
  }, [])

  /**
   * Crea un nuevo proyecto y lo persiste.
   * @param {string} name - Nombre del proyecto
   * @param {Object} [initialSnapshot=null] - Snapshot inicial opcional (para importaciones)
   * @returns {Object|null} El proyecto creado o null si falló
   */
  const createProject = (name, initialSnapshot = null) => {
    const newProject = {
      id: uuidv4(),
      name: name || 'Sin título',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      thumbnail: null,
      currentSnapshot: initialSnapshot || {
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 }
      }
    }

    const success = saveProject(newProject)
    if (success) {
      dispatch({ type: 'ADD', payload: newProject })
      return newProject
    }
    return null
  }

  /**
   * Elimina un proyecto por ID y actualiza el estado.
   * @param {string} id - ID del proyecto
   */
  const deleteProject = (id) => {
    const success = dbDeleteProject(id)
    if (success) {
      dispatch({ type: 'DELETE', payload: id })
    }
  }

  /**
   * Actualiza los datos de un proyecto.
   * @param {Object} project - Objeto de proyecto modificado
   */
  const updateProject = (project) => {
    const success = saveProject(project)
    if (success) {
      dispatch({ type: 'UPDATE', payload: project })
    }
  }

  /**
   * Crea una copia del proyecto con su historial completo.
   * @param {string} id - ID del proyecto a duplicar
   * @returns {Object|null} El proyecto duplicado o null si falló
   */
  const duplicateProject = (id) => {
    const project = state.projects.find(p => p.id === id) || getProject(id)
    if (!project) return null

    const newId = uuidv4()
    const duplicatedProject = {
      ...project,
      id: newId,
      name: `${project.name} — copia`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const success = saveProject(duplicatedProject)
    if (success) {
      // Duplicar también todo el historial
      try {
        const oldHistoryKey = `ocs_history_${id}`
        const newHistoryKey = `ocs_history_${newId}`
        const oldHistoryRaw = localStorage.getItem(oldHistoryKey)
        if (oldHistoryRaw) {
          const parsedHistory = JSON.parse(oldHistoryRaw)
          if (Array.isArray(parsedHistory)) {
            const newHistory = parsedHistory.map(entry => ({
              ...entry,
              projectId: newId
            }))
            safeLocalStorageSetItem(newHistoryKey, JSON.stringify(newHistory))
          }
        }
      } catch (err) {
        console.error('Error al duplicar el historial del proyecto:', err)
      }

      dispatch({ type: 'ADD', payload: duplicatedProject })
      return duplicatedProject
    }
    return null
  }

  return {
    projects: state.projects,
    loading: state.loading,
    createProject,
    deleteProject,
    updateProject,
    duplicateProject
  }
}
