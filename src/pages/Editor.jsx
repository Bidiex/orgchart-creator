import React, { useState, useRef, useEffect } from 'react'
import { useEditor } from '../hooks/useEditor'
import { useHistory } from '../hooks/useHistory'
import OrgCanvas from '../components/canvas/OrgCanvas'
import Toolbar from '../components/toolbar/Toolbar'
import Sidebar from '../components/sidebar/Sidebar'
import HistoryPanel from '../components/history/HistoryPanel'
import HistoryExportView from '../components/history/HistoryExportView'
import { PanelRightClose, PanelRightOpen, AlertTriangle } from 'lucide-react'
import { getProject, saveProject } from '../utils/storageUtils'
import Modal from '../components/shared/Modal'

export default function Editor({ projectId, onBack }) {
  const {
    nodes,
    edges,
    selectedNodeId,
    projectName,
    loading,
    isDirty,
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
    toggleCollapse
  } = useEditor(projectId)

  const { history, saveVersion, restoreVersion } = useHistory(projectId)

  const [showMiniMap, setShowMiniMap] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Soporte para atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignorar si el foco está en inputs o textareas o contenteditable
      const active = document.activeElement
      if (
        active &&
        (active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.isContentEditable)
      ) {
        return
      }

      // Ctrl+S - guardar versión
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('ocs-trigger-save'))
        return
      }

      // Ctrl+Shift+H - toggle historia
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault()
        setIsHistoryOpen((prev) => !prev)
        return
      }

      // Escape - deseleccionar y cerrar sidebar
      if (e.key === 'Escape') {
        e.preventDefault()
        selectNode(null)
        setIsSidebarOpen(false)
        return
      }

      // Delete o Backspace - eliminar nodo activo
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          e.preventDefault()
          const node = nodes.find((n) => n.id === selectedNodeId)
          if (!node) return
          
          const hasChildren = edges.some((edge) => edge.source === selectedNodeId)
          if (hasChildren) {
            setIsDeleteModalOpen(true)
          } else {
            if (window.confirm(`¿Estás seguro de que deseas eliminar el colaborador "${node.data?.label || 'Sin etiqueta'}"?`)) {
              deleteNode(selectedNodeId, false)
            }
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedNodeId, nodes, edges, deleteNode, selectNode])

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
        isDirty={isDirty}
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
            onUpdateNode={updateNode}
            toggleCollapse={toggleCollapse}
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

      {/* Modal de confirmación para borrado recursivo de nodo iniciado por atajo de teclado */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Eliminación"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-warning">
            <AlertTriangle className="w-8 h-8 shrink-0" />
            <h4 className="font-semibold text-white text-base">Este nodo tiene colaboradores a cargo</h4>
          </div>
          
          <p className="text-xs text-text-secondary leading-relaxed">
            El colaborador <strong className="text-white">"{nodes.find(n => n.id === selectedNodeId)?.data?.label || 'Sin etiqueta'}"</strong> tiene una estructura descendiente en el organigrama. Si lo eliminas, todos sus subordinados directos e indirectos también serán eliminados del lienzo de trabajo.
          </p>

          <p className="text-xs text-text-muted">
            Esta acción es irreversible y afectará el organigrama actual.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-custom">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-5 py-2.5 rounded-custom-pill text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                deleteNode(selectedNodeId, true)
                setIsDeleteModalOpen(false)
              }}
              className="bg-danger hover:bg-danger-hover text-white px-5 py-2.5 rounded-custom-pill text-xs font-medium transition-colors"
            >
              Eliminar todo
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
