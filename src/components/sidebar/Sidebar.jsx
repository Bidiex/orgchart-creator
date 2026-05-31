import React, { useState, useEffect } from 'react'
import NodeEditor from './NodeEditor'
import StylePanel from './StylePanel'
import BadgeEditor from './BadgeEditor'
import { FileText, Palette, Tag, X, Layers } from 'lucide-react'

export default function Sidebar({
  selectedNode,
  edges,
  onClose,
  onUpdateNode,
  onDeleteNode,
  onApplyStyleToAll
}) {
  const [activeTab, setActiveTab] = useState('content') // 'content' | 'style' | 'badges'

  // Resetear pestaña activa al cambiar de nodo seleccionado
  useEffect(() => {
    if (selectedNode) {
      setActiveTab('content')
    }
  }, [selectedNode?.id])

  return (
    <div className="h-full flex flex-col bg-surface border-l border-border-custom w-[280px] overflow-hidden select-none">
      {/* Header del Sidebar */}
      <div className="px-5 py-4 border-b border-border-custom flex items-center justify-between">
        <h3 className="font-semibold text-text-primary text-xs tracking-wider uppercase">
          Propiedades
        </h3>
        {selectedNode && (
          <button
            onClick={onClose}
            className="p-1 text-text-secondary hover:text-text-primary rounded-custom-pill hover:bg-bg-muted transition-colors"
            title="Deseleccionar colaborador"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Contenido condicional */}
      {selectedNode ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Switcher */}
          <div className="flex border-b border-border-custom bg-bg-app p-1 m-3 rounded-custom-pill">
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-semibold rounded-custom-pill transition-all ${
                activeTab === 'content'
                  ? 'bg-surface text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Contenido"
            >
              <FileText className="w-4 h-4 mb-0.5" />
              <span>Contenido</span>
            </button>
            <button
              onClick={() => setActiveTab('style')}
              className={`flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-semibold rounded-custom-pill transition-all ${
                activeTab === 'style'
                  ? 'bg-surface text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Estilo"
            >
              <Palette className="w-4 h-4 mb-0.5" />
              <span>Estilo</span>
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-semibold rounded-custom-pill transition-all ${
                activeTab === 'badges'
                  ? 'bg-surface text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Etiquetas"
            >
              <Tag className="w-4 h-4 mb-0.5" />
              <span>Etiquetas</span>
            </button>
          </div>

          {/* Contenido de la pestaña */}
          <div className="flex-1 p-5 overflow-y-auto">
            {activeTab === 'content' && (
              <NodeEditor
                node={selectedNode}
                edges={edges}
                onUpdateNode={onUpdateNode}
                onDeleteNode={onDeleteNode}
              />
            )}
            {activeTab === 'style' && (
              <StylePanel
                node={selectedNode}
                onUpdateNode={onUpdateNode}
                onApplyStyleToAll={onApplyStyleToAll}
              />
            )}
            {activeTab === 'badges' && (
              <BadgeEditor
                node={selectedNode}
                onUpdateNode={onUpdateNode}
              />
            )}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-surface">
          <div className="bg-bg-app border border-border-custom p-3.5 rounded-custom-pill mb-4 text-text-muted">
            <Layers className="w-6 h-6" />
          </div>
          <h4 className="font-semibold text-text-secondary text-sm">Sin selección</h4>
          <p className="text-xs text-text-muted mt-2 leading-relaxed max-w-[180px] mx-auto">
            Selecciona un colaborador en el organigrama para comenzar a editarlo.
          </p>
        </div>
      )}
    </div>
  )
}
