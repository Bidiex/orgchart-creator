import React, { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { RotateCcw, AlertTriangle, Calendar } from 'lucide-react'
import Modal from '../shared/Modal'

export default function HistoryEntry({ entry, onRestore }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const formattedDate = () => {
    try {
      // Formatea la fecha al estilo "15 dic 2025, 2:30 PM"
      const rawDateStr = format(new Date(entry.timestamp), "d MMM yyyy, h:mm a", { locale: es })
      // Remover cualquier punto de abreviación de meses que agregue date-fns (ej. "dic.")
      return rawDateStr.replace(/\./g, '')
    } catch (e) {
      return 'Fecha inválida'
    }
  }

  const lines = entry.description ? entry.description.split('\n').filter(Boolean) : []

  const handleConfirmRestore = () => {
    onRestore(entry)
    setIsModalOpen(false)
  }

  return (
    <div className="bg-bg-app border border-border-custom hover:border-primary/20 p-4 rounded-custom-md flex flex-col justify-between space-y-3 transition-colors">
      {/* Cabecera de la versión */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold bg-primary-soft text-primary px-2.5 py-0.5 rounded-custom-pill">
          v{entry.version}
        </span>
        <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formattedDate()}</span>
        </div>
      </div>

      {/* Listado de Cambios Detectados */}
      <div className="space-y-1">
        {lines.map((line, idx) => {
          // Si la línea ya tiene viñeta del buildDescription, la limpiamos para no duplicar
          const cleanLine = line.startsWith('•') ? line.substring(1).trim() : line
          return (
            <div key={idx} className="text-xs text-text-secondary leading-relaxed flex items-start gap-1.5">
              <span className="text-primary mt-1 select-none font-bold text-[9px]">•</span>
              <span className="text-text-secondary">{cleanLine}</span>
            </div>
          )
        })}
      </div>

      {/* Botón de Restaurar al final */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 text-[11px] text-primary hover:text-primary-hover font-semibold transition-colors"
          title="Restaurar el organigrama a esta versión"
        >
          <RotateCcw className="w-3 h-3" />
          Restaurar
        </button>
      </div>

      {/* Modal de confirmación para Restaurar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirmar Restauración"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-warning">
            <AlertTriangle className="w-8 h-8 shrink-0" />
            <h4 className="font-semibold text-text-primary text-base">¿Deseas restaurar a la versión v{entry.version}?</h4>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed">
            Se recargará el estado completo del organigrama en esta versión. <strong className="text-text-primary">Los cambios que no hayas guardado en la versión actual se perderán definitivamente.</strong>
          </p>

          <p className="text-xs text-text-muted">
            Al restaurar, se creará automáticamente una nueva versión en el historial que registra este cambio.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-custom">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 rounded-custom-pill text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmRestore}
              className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-custom-pill text-xs font-medium transition-colors"
            >
              Sí, restaurar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
