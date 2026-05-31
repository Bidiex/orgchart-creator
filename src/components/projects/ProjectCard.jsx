import React from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Folder, Trash2, ArrowRight, Copy } from 'lucide-react'

export default function ProjectCard({ project, onOpen, onDelete, onDuplicate }) {
  const formattedDate = () => {
    try {
      return format(new Date(project.updatedAt), "d 'de' MMMM, yyyy - HH:mm", { locale: es })
    } catch (e) {
      return 'Fecha inválida'
    }
  }

  // Obtener conteo de versiones en el historial (ocs_history_{projectId})
  const getHistoryCount = () => {
    try {
      const history = localStorage.getItem(`ocs_history_${project.id}`)
      if (history) {
        const parsed = JSON.parse(history)
        if (Array.isArray(parsed)) return parsed.length
      }
    } catch (e) {
      // Ignorar
    }
    return 1 // Mínimo inicial
  }

  const handleDeleteClick = (e) => {
    e.stopPropagation() // Detener navegación del card click
    if (window.confirm(`¿Estás seguro de que deseas eliminar el organigrama "${project.name}"?`)) {
      onDelete(project.id)
    }
  }

  const handleDuplicateClick = (e) => {
    e.stopPropagation() // Detener navegación del card click
    if (onDuplicate) {
      onDuplicate(project.id)
    }
  }

  return (
    <div
      onClick={() => onOpen(project.id)}
      className="group relative bg-surface border border-border-custom hover:border-primary/40 rounded-custom-xl p-6 shadow-custom-default hover:shadow-custom-hover transition-all duration-300 cursor-pointer hover:-translate-y-1 flex flex-col justify-between min-h-[180px]"
    >
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-custom-xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-bg-app border border-border-custom group-hover:border-primary/20 rounded-custom-sm text-text-secondary group-hover:text-primary transition-colors">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-text-primary text-base line-clamp-1 group-hover:text-white transition-colors">
              {project.name}
            </h4>
            <p className="text-xs text-text-muted mt-1">
              Última edición: {formattedDate()}
            </p>
          </div>
        </div>
      </div>

      {/* Footer / Stats & Actions */}
      <div className="flex items-center justify-between border-t border-border-soft/60 pt-4 mt-6">
        <div className="flex items-center gap-2">
          <span className="text-xs bg-bg-muted text-text-secondary px-2.5 py-1 rounded-custom-pill border border-border-custom font-medium">
            v{getHistoryCount()}
          </span>
          <span className="text-xs text-text-muted">
            {project.currentSnapshot?.nodes?.length || 0} nodos
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDuplicateClick}
            className="p-2 text-text-secondary hover:text-primary rounded-custom-pill hover:bg-primary/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="Duplicar proyecto"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            onClick={handleDeleteClick}
            className="p-2 text-text-secondary hover:text-danger rounded-custom-pill hover:bg-danger/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="Eliminar proyecto"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
          
          <button
            onClick={() => onOpen(project.id)}
            className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:text-primary-hover group-hover:translate-x-0.5 transition-all"
          >
            Abrir
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
