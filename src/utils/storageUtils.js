const PROJECTS_KEY = 'ocs_projects'

/**
 * Guarda de forma segura un valor en localStorage verificando espacio y capturando errores de cuota.
 */
export function safeLocalStorageSetItem(key, value) {
  // Antes de escribir, verificar espacio disponible con navigator.storage.estimate si está disponible
  if (navigator.storage && navigator.storage.estimate) {
    navigator.storage.estimate().then((estimate) => {
      const usage = estimate.usage || 0
      const quota = estimate.quota || 0
      if (quota > 0 && usage > quota * 0.9) {
        console.warn('Almacenamiento local casi lleno (más del 90% ocupado)')
      }
    }).catch((e) => {
      console.warn('Error al verificar espacio de almacenamiento estimado:', e)
    })
  }

  try {
    localStorage.setItem(key, value)
    return true
  } catch (error) {
    if (
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22 ||
      error.code === 1014
    ) {
      alert('Almacenamiento lleno. Elimina versiones antiguas del historial para continuar.')
    } else {
      alert(`Error al escribir en el almacenamiento: ${error.message}`)
    }
    console.error('Error al escribir en localStorage:', error)
    return false
  }
}

/**
 * Obtiene todos los proyectos almacenados en localStorage.
 * @returns {Array} Lista de proyectos o array vacío en caso de error o si no existen.
 */
export function getProjects() {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (error) {
    console.error('Error al obtener proyectos de localStorage:', error)
    return []
  }
}

/**
 * Guarda o actualiza un proyecto en localStorage.
 * @param {Object} project - El objeto de proyecto a guardar.
 * @returns {boolean} True si se guardó con éxito, False de lo contrario.
 */
export function saveProject(project) {
  try {
    const projects = getProjects()
    const index = projects.findIndex(p => p.id === project.id)
    
    if (index !== -1) {
      projects[index] = {
        ...projects[index],
        ...project,
        updatedAt: new Date().toISOString()
      }
    } else {
      projects.push({
        ...project,
        createdAt: project.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }
    
    return safeLocalStorageSetItem(PROJECTS_KEY, JSON.stringify(projects))
  } catch (error) {
    console.error('Error al guardar el proyecto en localStorage:', error)
    return false
  }
}

/**
 * Elimina un proyecto por su ID en localStorage.
 * @param {string} id - ID del proyecto a eliminar.
 * @returns {boolean} True si se eliminó con éxito, False de lo contrario.
 */
export function deleteProject(id) {
  try {
    const projects = getProjects()
    const filtered = projects.filter(p => p.id !== id)
    const success = safeLocalStorageSetItem(PROJECTS_KEY, JSON.stringify(filtered))
    
    if (success) {
      // También limpiamos el historial asociado al proyecto
      localStorage.removeItem(`ocs_history_${id}`)
    }
    return success
  } catch (error) {
    console.error('Error al eliminar el proyecto de localStorage:', error)
    return false
  }
}

/**
 * Obtiene un proyecto específico por su ID.
 * @param {string} id - ID del proyecto.
 * @returns {Object|null} El proyecto encontrado o null.
 */
export function getProject(id) {
  try {
    const projects = getProjects()
    return projects.find(p => p.id === id) || null
  } catch (error) {
    console.error(`Error al obtener el proyecto ${id} de localStorage:`, error)
    return null
  }
}

