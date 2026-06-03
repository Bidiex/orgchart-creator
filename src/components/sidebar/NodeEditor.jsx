import React, { useState } from 'react'
import { Trash2, AlertTriangle, LayoutGrid, List } from 'lucide-react'
import Modal from '../shared/Modal'

export default function NodeEditor({ node, edges, onUpdateNode, onDeleteNode }) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const { label = '', sublabel = '', department = '', headcount = null } = node.data || {}

  // Verificar si el nodo tiene hijos (es origen de alguna arista)
  const hasChildren = edges.some(e => e.source === node.id)

  const handleTextChange = (field, value) => {
    onUpdateNode(node.id, { [field]: value })
  }

  const handleHeadcountChange = (value) => {
    if (value === '' || value === null || value === undefined) {
      onUpdateNode(node.id, { headcount: null })
      return
    }
    const num = parseInt(value, 10)
    if (isNaN(num)) {
      onUpdateNode(node.id, { headcount: null })
    } else {
      onUpdateNode(node.id, { headcount: Math.max(1, num) })
    }
  }

  const handleDeleteClick = () => {
    if (hasChildren) {
      setIsDeleteModalOpen(true)
    } else {
      if (window.confirm('¿Estás seguro de que deseas eliminar este colaborador?')) {
        onDeleteNode(node.id, false)
      }
    }
  }

  const handleConfirmDelete = () => {
    onDeleteNode(node.id, true)
    setIsDeleteModalOpen(false)
  }

  return (
    <div className="flex flex-col h-full justify-between space-y-6">
      <div className="space-y-4">
        {/* Input Label (Nombre) */}
        <div>
          <label htmlFor="nodeLabel" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Nombre / Identificador
          </label>
          <input
            type="text"
            id="nodeLabel"
            value={label}
            onChange={(e) => handleTextChange('label', e.target.value)}
            placeholder="Ej. Juan Pérez"
            className="w-full bg-bg-app border border-border-custom text-text-primary text-sm rounded-custom-pill px-4 py-2.5 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Input Sublabel (Cargo) */}
        <div>
          <label htmlFor="nodeSublabel" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Cargo / Rol (Opcional)
          </label>
          <input
            type="text"
            id="nodeSublabel"
            value={sublabel}
            onChange={(e) => handleTextChange('sublabel', e.target.value)}
            placeholder="Ej. Gerente de TI"
            className="w-full bg-bg-app border border-border-custom text-text-primary text-sm rounded-custom-pill px-4 py-2.5 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Input Departamento */}
        <div>
          <label htmlFor="nodeDept" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Área / Departamento (Opcional)
          </label>
          <input
            type="text"
            id="nodeDept"
            value={department}
            onChange={(e) => handleTextChange('department', e.target.value)}
            placeholder="Ej. Tecnología"
            className="w-full bg-bg-app border border-border-custom text-text-primary text-sm rounded-custom-pill px-4 py-2.5 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Input Headcount */}
        <div>
          <label htmlFor="nodeHeadcount" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Número de personas (Headcount)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              id="nodeHeadcount"
              min="1"
              value={headcount === null || headcount === undefined ? '' : headcount}
              onChange={(e) => handleHeadcountChange(e.target.value)}
              placeholder="Ej. 1"
              className="flex-1 bg-bg-app border border-border-custom text-text-primary text-sm rounded-custom-pill px-4 py-2.5 focus:outline-none focus:border-primary transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            {headcount !== null && headcount !== undefined && headcount !== '' && (
              <button
                type="button"
                onClick={() => handleHeadcountChange(null)}
                className="px-4 py-2.5 text-xs font-semibold bg-bg-app hover:bg-bg-muted text-text-secondary hover:text-text-primary border border-border-custom hover:border-text-secondary rounded-custom-pill transition-colors cursor-pointer"
                title="Limpiar valor"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Toggle Distribución de hijos */}
        {hasChildren && (
          <div>
            <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Distribución de hijos
            </span>
            <div className="flex bg-bg-app p-1 rounded-custom-pill border border-border-custom max-w-[220px]">
              <button
                type="button"
                onClick={() => onUpdateNode(node.id, { childLayout: 'horizontal' })}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-custom-pill transition-all cursor-pointer ${
                  (node.data?.childLayout || 'horizontal') === 'horizontal'
                    ? 'bg-surface text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                title="Distribución Horizontal"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Horizontal</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateNode(node.id, { childLayout: 'vertical' })}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-custom-pill transition-all cursor-pointer ${
                  node.data?.childLayout === 'vertical'
                    ? 'bg-surface text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                title="Distribución Vertical"
              >
                <List className="w-3.5 h-3.5" />
                <span>Vertical</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Botón de Eliminación al Fondo */}
      <div className="pt-6 border-t border-border-custom">
        <button
          onClick={handleDeleteClick}
          className="w-full bg-danger/10 hover:bg-danger text-danger hover:text-white border border-danger/25 hover:border-transparent px-4 py-3 rounded-custom-pill text-xs font-semibold flex items-center justify-center gap-2 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          Eliminar Colaborador
        </button>
      </div>

      {/* Modal de confirmación para borrado recursivo */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Eliminación"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-warning">
            <AlertTriangle className="w-8 h-8 shrink-0" />
            <h4 className="font-semibold text-text-primary text-base">Este nodo tiene colaboradores a cargo</h4>
          </div>
          
          <p className="text-xs text-text-secondary leading-relaxed">
            El colaborador <strong className="text-text-primary">"{label}"</strong> tiene una estructura descendiente en el organigrama. Si lo eliminas, todos sus subordinados directos e indirectos también serán eliminados del lienzo de trabajo.
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
              onClick={handleConfirmDelete}
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
