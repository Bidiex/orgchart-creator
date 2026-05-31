import React from 'react'
import HistoryEntry from './HistoryEntry'
import { History, X } from 'lucide-react'

export default function HistoryPanel({ history, isOpen, onClose, onRestore }) {
  return (
    <div
      className={`h-full flex flex-col bg-surface border-r border-border-custom transition-all duration-300 z-30 select-none ${
        isOpen ? 'w-[280px] opacity-100' : 'w-0 opacity-0 pointer-events-none'
      }`}
    >
      {/* Header del Panel */}
      <div className="px-5 py-4 border-b border-border-custom flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-white text-xs tracking-wider uppercase">
            Historial de Versiones
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-text-secondary hover:text-text-primary rounded-custom-pill hover:bg-bg-muted transition-colors"
          title="Ocultar historial"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Listado de Versiones */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <History className="w-8 h-8 text-text-muted mb-4" />
            <h4 className="font-semibold text-text-secondary text-sm">Sin historial</h4>
            <p className="text-xs text-text-muted mt-2 leading-relaxed max-w-[180px] mx-auto">
              Aún no hay versiones guardadas. Usa <strong className="text-white">Ctrl + S</strong> o haz clic en Guardar para registrar una versión.
            </p>
          </div>
        ) : (
          history.map((entry) => (
            <HistoryEntry
              key={entry.id}
              entry={entry}
              onRestore={onRestore}
            />
          ))
        )}
      </div>
    </div>
  )
}
