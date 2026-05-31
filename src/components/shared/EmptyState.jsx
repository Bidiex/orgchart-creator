import React from 'react'
import { FolderPlus, Layers } from 'lucide-react'

export default function EmptyState({ onCreateClick }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-surface/30 border border-dashed border-border-custom rounded-custom-xl max-w-lg mx-auto">
      <div className="bg-primary-soft p-4 rounded-custom-pill mb-6">
        <Layers className="w-8 h-8 text-primary" />
      </div>
      
      <h3 className="text-xl font-semibold text-text-primary mb-2">No hay organigramas creados</h3>
      
      <p className="text-text-secondary text-sm max-w-sm mb-8 leading-relaxed">
        Empieza creando un organigrama corporativo desde cero o subiendo un archivo Excel con la estructura de tu empresa.
      </p>
      
      <button
        onClick={onCreateClick}
        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-custom-pill text-sm font-medium shadow-custom-default transition-all hover:-translate-y-0.5 active:translate-y-0"
      >
        <FolderPlus className="w-4 h-4" />
        Crear nuevo proyecto
      </button>
    </div>
  )
}
