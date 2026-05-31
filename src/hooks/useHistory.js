import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { generateDiff } from '../utils/diffUtils'

export function useHistory(projectId) {
  const [history, setHistory] = useState([])

  const getHistoryKey = useCallback((id) => `ocs_history_${id}`, [])

  /**
   * Carga el historial desde localStorage.
   */
  const loadHistory = useCallback((id) => {
    if (!id) return []
    try {
      const raw = localStorage.getItem(getHistoryKey(id))
      const list = raw ? JSON.parse(raw) : []
      setHistory(list)
      return list
    } catch (e) {
      console.error('Error al cargar historial desde localStorage:', e)
      return []
    }
  }, [getHistoryKey])

  // Carga reactiva al cambiar de proyecto
  useEffect(() => {
    if (projectId) {
      loadHistory(projectId)
    } else {
      setHistory([])
    }
  }, [projectId, loadHistory])

  /**
   * Genera y guarda una nueva versión del historial si hay cambios significativos.
   * @param {string} projId - ID del proyecto.
   * @param {Object} currentSnapshot - Snapshot actual del lienzo.
   * @param {Object|null} prevSnapshot - Snapshot de la versión guardada anterior.
   * @param {string} [customDescription=''] - Descripción personalizada opcional.
   * @returns {Object} { success: boolean, version?: number, reason?: string, entry?: Object }
   */
  const saveVersion = useCallback((projId, currentSnapshot, prevSnapshot, customDescription = '') => {
    if (!projId) return { success: false, reason: 'MISSING_PROJECT_ID' }

    try {
      const list = loadHistory(projId)
      
      let hasChanges = false
      let description = ''
      let changes = {}

      // Si no hay versión previa en el historial
      if (!prevSnapshot || !prevSnapshot.nodes || prevSnapshot.nodes.length === 0) {
        hasChanges = true
        description = customDescription || 'Importación inicial de organigrama'
      } else {
        // Generar diff estructural y de estilo
        const diff = generateDiff(prevSnapshot, currentSnapshot)
        hasChanges = diff.hasChanges
        description = customDescription || diff.description
        changes = diff.changes
      }

      // Si se fuerza una descripción (como al restaurar), se considera que hay cambios
      if (customDescription) {
        hasChanges = true
        description = customDescription
      }

      if (!hasChanges) {
        return { success: false, reason: 'NO_CHANGES' }
      }

      const nextVersion = list.length > 0 ? list[0].version + 1 : 1

      const newEntry = {
        id: uuidv4(),
        projectId: projId,
        version: nextVersion,
        timestamp: new Date().toISOString(),
        author: 'Usuario',
        description,
        changes,
        snapshot: currentSnapshot
      }

      // Añadir al inicio (más reciente primero)
      let updatedHistory = [newEntry, ...list]
      
      // Aplicar política FIFO: Límite de 100 versiones por proyecto
      if (updatedHistory.length > 100) {
        updatedHistory = updatedHistory.slice(0, 100)
      }

      localStorage.setItem(getHistoryKey(projId), JSON.stringify(updatedHistory))
      setHistory(updatedHistory)
      
      return { success: true, version: nextVersion, entry: newEntry }
    } catch (e) {
      console.error('Error al guardar versión en localStorage:', e)
      return { success: false, reason: 'ERROR', error: e }
    }
  }, [getHistoryKey, loadHistory])

  /**
   * Obtiene la versión en un snapshot.
   */
  const restoreVersion = useCallback((entry) => {
    return entry?.snapshot || null
  }, [])

  /**
   * Devuelve la lista ordenada (más reciente primero).
   */
  const getHistory = useCallback((projId) => {
    return loadHistory(projId)
  }, [loadHistory])

  return {
    history,
    loadHistory,
    saveVersion,
    restoreVersion,
    getHistory
  }
}
