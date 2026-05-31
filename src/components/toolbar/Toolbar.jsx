import React, { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Map, Edit2, Check, History } from 'lucide-react'
import SaveButton from './SaveButton'
import ExportMenu from './ExportMenu'

export default function Toolbar({
  projectId,
  projectName,
  nodes,
  edges,
  history,
  project,
  currentVersion,
  canvasRef,
  historyExportRef,
  onBack,
  onSaveVersion,
  onSaveProject,
  onAddRootNode,
  onUpdateProjectName,
  showMiniMap,
  onToggleMiniMap,
  isHistoryOpen,
  onToggleHistory
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [localName, setLocalName] = useState(projectName)

  useEffect(() => {
    setLocalName(projectName)
  }, [projectName])

  const handleSaveName = () => {
    if (localName.trim() && localName !== projectName) {
      onUpdateProjectName(localName.trim())
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveName()
    } else if (e.key === 'Escape') {
      setLocalName(projectName)
      setIsEditing(false)
    }
  }

  return (
    <div className="bg-surface border-b border-border-custom px-6 py-4 flex items-center justify-between shadow-custom-default z-30 select-none">
      {/* Zona Izquierda: Volver & Título */}
      <div className="flex items-center gap-4 flex-1 max-w-[50%]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-custom-pill hover:bg-bg-muted transition-colors text-sm font-medium border border-border-custom"
          title="Volver a la lista de proyectos"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Mis Proyectos</span>
        </button>

        <div className="h-6 w-px bg-border-custom hidden sm:block" />

        <div className="flex items-center gap-2 group flex-1">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={handleKeyDown}
                className="bg-bg-app border border-primary text-text-primary text-sm font-semibold rounded-custom-pill px-3 py-1 focus:outline-none focus:ring-1 focus:ring-primary w-[160px] sm:w-[240px]"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                className="p-1 text-success hover:bg-success/15 rounded-custom-pill transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsEditing(true)}>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight line-clamp-1">
                {projectName || 'Proyecto sin título'}
              </h2>
              <button
                className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-text-primary transition-opacity rounded-custom-pill hover:bg-bg-muted"
                title="Editar nombre"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Zona Derecha: Acciones */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Toggle del Historial */}
        <button
          onClick={onToggleHistory}
          className={`p-2 rounded-custom-pill border transition-colors ${
            isHistoryOpen
              ? 'bg-primary/10 border-primary text-primary'
              : 'border-border-custom text-text-secondary hover:text-text-primary hover:bg-bg-muted'
          }`}
          title={isHistoryOpen ? 'Ocultar Historial' : 'Mostrar Historial de Versiones'}
        >
          <History className="w-4.5 h-4.5" />
        </button>

        {/* Toggle del MiniMap */}
        <button
          onClick={onToggleMiniMap}
          className={`p-2 rounded-custom-pill border transition-colors ${
            showMiniMap
              ? 'bg-primary/10 border-primary text-primary'
              : 'border-border-custom text-text-secondary hover:text-text-primary hover:bg-bg-muted'
          }`}
          title={showMiniMap ? 'Ocultar MiniMap' : 'Mostrar MiniMap'}
        >
          <Map className="w-4.5 h-4.5" />
        </button>

        {/* Añadir Nodo Raíz */}
        <button
          onClick={onAddRootNode}
          className="flex items-center gap-1.5 bg-bg-muted hover:bg-border-custom border border-border-custom text-text-primary px-4 py-2 rounded-custom-pill text-xs font-semibold transition-all hover:scale-102 active:scale-98"
          title="Agregar un nuevo nodo raíz"
        >
          <Plus className="w-4 h-4 text-primary" />
          <span>Nodo Raíz</span>
        </button>

        {/* Menú de Exportación */}
        <ExportMenu
          canvasRef={canvasRef}
          historyRef={historyExportRef}
          projectName={projectName}
          project={project}
          history={history}
          currentVersion={currentVersion}
        />

        {/* Botón de Guardado Reactivo */}
        <SaveButton
          projectId={projectId}
          projectName={projectName}
          nodes={nodes}
          edges={edges}
          history={history}
          onSaveVersion={onSaveVersion}
          onSaveProject={onSaveProject}
        />
      </div>
    </div>
  )
}
