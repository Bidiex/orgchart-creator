import React, { useState, useRef } from 'react'
import { useEditor } from '../hooks/useEditor'
import { useHistory } from '../hooks/useHistory'
import OrgCanvas from '../components/canvas/OrgCanvas'
import Toolbar from '../components/toolbar/Toolbar'
import Sidebar from '../components/sidebar/Sidebar'
import HistoryPanel from '../components/history/HistoryPanel'
import HistoryExportView from '../components/history/HistoryExportView'
import { PanelRightClose, PanelRightOpen } from 'lucide-react'
import { getProject, saveProject } from '../utils/storageUtils'

export default function Editor({ projectId, onBack }) {
  const {
    nodes,
    edges,
    selectedNodeId,
    projectName,
    loading,
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
  } = useEditor(projectId)

  const { history, saveVersion, restoreVersion } = useHistory(projectId)

  const [showMiniMap, setShowMiniMap] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  // Refs para exportación
  const canvasRef = useRef(null)
  const historyExportRef = useRef(null)

  // Proyecto completo para backup JSON
  const fullProject = getProject(projectId)

  // Lógica de restauración de versión
  const handleRestore = (entry) => {
    const snapshot = restoreVersion(entry)
    if (snapshot) {
      const preRestoreSnapshot = { nodes, edges }
      setNodes(snapshot.nodes || [])
      setEdges(snapshot.edges || [])
      selectNode(null)

      const project = getProject(projectId)
      if (project) {
        saveProject({
          ...project,
          currentSnapshot: snapshot
        })
      }

      saveVersion(projectId, snapshot, preRestoreSnapshot, `Restaurado desde v${entry.version}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-app flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-text-secondary">Cargando lienzo de trabajo...</p>
      </div>
    )
  }

  const selectedNode = nodes.find(n => n.id === selectedNodeId)

  const handleSelectNode = (id) => {
    selectNode(id)
    if (id) {
      setIsSidebarOpen(true)
    }
  }

  // Versión actual del historial
  const currentVersion = history.length > 0 ? history[0].version : 1

  return (
    <div className="h-screen bg-bg-app flex flex-col overflow-hidden text-text-primary">
      {/* Barra de herramientas superior */}
      <Toolbar
        projectId={projectId}
        projectName={projectName}
        nodes={nodes}
        edges={edges}
        history={history}
        project={fullProject}
        currentVersion={currentVersion}
        canvasRef={canvasRef}
        historyExportRef={historyExportRef}
        onBack={onBack}
        onSaveVersion={saveVersion}
        onSaveProject={saveCurrentProject}
        onAddRootNode={addRootNode}
        onUpdateProjectName={updateProjectName}
        showMiniMap={showMiniMap}
        onToggleMiniMap={() => setShowMiniMap(!showMiniMap)}
        isHistoryOpen={isHistoryOpen}
        onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
      />

      {/* Zona Inferior: Historial + Canvas + Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Historial Panel Izquierdo Deslizable */}
        <HistoryPanel
          history={history}
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onRestore={handleRestore}
        />

        {/* Canvas central */}
        <div ref={canvasRef} className="flex-1 h-full bg-bg-soft relative">
          <OrgCanvas
            nodes={nodes}
            edges={edges}
            setNodes={setNodes}
            setEdges={setEdges}
            selectNode={handleSelectNode}
            addChildNode={addChildNode}
            reorganizeNodes={reorganizeNodes}
            showMiniMap={showMiniMap}
          />
        </div>

        {/* Botón flotante para abrir/cerrar sidebar derecho */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`no-export absolute top-4 right-4 z-40 p-2 bg-surface hover:bg-bg-muted border border-border-custom text-text-secondary hover:text-text-primary rounded-custom-pill shadow-custom-hover transition-all ${
            isSidebarOpen ? 'mr-[280px]' : 'mr-0'
          }`}
          title={isSidebarOpen ? 'Ocultar Sidebar' : 'Mostrar Sidebar'}
        >
          {isSidebarOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
        </button>

        {/* Sidebar Derecho Colapsable */}
        <div
          className={`h-full flex transition-all duration-300 z-30 ${
            isSidebarOpen ? 'w-[280px] opacity-100' : 'w-0 opacity-0 pointer-events-none'
          }`}
        >
          <Sidebar
            selectedNode={selectedNode}
            edges={edges}
            onClose={() => selectNode(null)}
            onUpdateNode={updateNode}
            onDeleteNode={deleteNode}
            onApplyStyleToAll={applyStyleToAll}
          />
        </div>
      </div>

      {/* Vista oculta para exportar historial como imagen */}
      <HistoryExportView
        ref={historyExportRef}
        projectName={projectName}
        history={history}
      />
    </div>
  )
}
