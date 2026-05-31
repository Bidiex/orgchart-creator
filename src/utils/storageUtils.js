const PROJECTS_KEY = 'ocs_projects'

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
    
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
    return true
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
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(filtered))
    
    // También limpiamos el historial asociado al proyecto
    localStorage.removeItem(`ocs_history_${id}`)
    return true
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
