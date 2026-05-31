import React, { useState, useEffect, useCallback } from 'react'
import { Save, Check, AlertCircle } from 'lucide-react'

export default function SaveButton({
  projectId,
  projectName,
  nodes,
  edges,
  history,
  onSaveVersion,
  onSaveProject
}) {
  const [status, setStatus] = useState('idle') // 'idle' | 'saved' | 'no-changes'
  const [savedVersion, setSavedVersion] = useState(null)

  const handleSave = useCallback(() => {
    const currentSnapshot = { nodes, edges }
    
    // Recuperar el snapshot de la última versión en el historial
    const lastEntry = history && history[0]
    const prevSnapshot = lastEntry ? lastEntry.snapshot : null

    // Guardar versión en el historial
    const result = onSaveVersion(projectId, currentSnapshot, prevSnapshot)
    
    if (result.success) {
      // Guardar el estado general del proyecto en storageUtils
      onSaveProject(projectName)
      setSavedVersion(result.version)
      setStatus('saved')
    } else if (result.reason === 'NO_CHANGES') {
      setStatus('no-changes')
    } else {
      console.error('Error al guardar versión en el historial:', result.reason)
    }
  }, [projectId, projectName, nodes, edges, history, onSaveVersion, onSaveProject])

  // Temporizador para restablecer el estado del botón a 'idle'
  useEffect(() => {
    if (status !== 'idle') {
      const timer = setTimeout(() => {
        setStatus('idle')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [status])

  // Soporte para atajo de teclado Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSave])

  return (
    <button
      onClick={handleSave}
      className={`flex items-center gap-1.5 px-4.5 py-2 rounded-custom-pill text-xs font-semibold shadow-custom-default transition-all duration-300 hover:scale-102 active:scale-98 ${
        status === 'saved'
          ? 'bg-success text-white border border-transparent'
          : status === 'no-changes'
          ? 'bg-bg-muted border border-border-custom text-text-secondary hover:text-text-primary'
          : 'bg-primary hover:bg-primary-hover text-white border border-transparent'
      }`}
      title="Guardar cambios (Ctrl+S)"
    >
      {status === 'saved' ? (
        <>
          <Check className="w-4 h-4 animate-bounce" />
          <span>Guardado — v{savedVersion}</span>
        </>
      ) : status === 'no-changes' ? (
        <>
          <AlertCircle className="w-4 h-4 text-warning" />
          <span>Sin cambios nuevos</span>
        </>
      ) : (
        <>
          <Save className="w-4 h-4" />
          <span>Guardar</span>
        </>
      )}
    </button>
  )
}
