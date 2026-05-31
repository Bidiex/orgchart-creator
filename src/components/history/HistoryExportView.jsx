import React from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default React.forwardRef(function HistoryExportView({ projectName, history }, ref) {
  const formattedExportDate = () => {
    try {
      return format(new Date(), "d 'de' MMMM, yyyy - h:mm a", { locale: es })
    } catch (e) {
      return ''
    }
  }

  // Ordenar de más antiguo a más reciente (orden cronológico)
  const chronologicalHistory = [...history].reverse()

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        width: '800px',
        backgroundColor: '#FFFFFF',
        color: '#111111',
        fontFamily: "'Inter', sans-serif"
      }}
      className="p-10 border border-gray-200"
    >
      {/* Header */}
      <div className="border-b-2 border-blue-600 pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Historial de Versiones</h1>
          <h2 className="text-lg font-semibold text-blue-600 mt-1">{projectName || 'Proyecto sin título'}</h2>
        </div>
        <div className="text-right text-xs text-gray-500">
          <p>Exportado: {formattedExportDate()}</p>
          <p className="mt-1 font-medium">{history.length} versiones registradas</p>
        </div>
      </div>

      {/* Changelog List */}
      <div className="space-y-6">
        {chronologicalHistory.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No hay versiones registradas en este historial.
          </div>
        ) : (
          chronologicalHistory.map((entry) => {
            const lines = entry.description ? entry.description.split('\n').filter(Boolean) : []
            const formattedDate = () => {
              try {
                return format(new Date(entry.timestamp), "d MMM yyyy, h:mm a", { locale: es }).replace(/\./g, '')
              } catch (e) {
                return ''
              }
            }

            return (
              <div key={entry.id} className="border border-gray-150 p-5 rounded-xl bg-gray-50 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    Versión v{entry.version}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {formattedDate()}
                  </span>
                </div>

                <div className="space-y-1.5 pl-1">
                  {lines.map((line, idx) => {
                    const cleanLine = line.startsWith('•') ? line.substring(1).trim() : line
                    return (
                      <div key={idx} className="text-sm text-gray-700 leading-relaxed flex items-start gap-2">
                        <span className="text-blue-500 mt-1 select-none font-bold text-xs">•</span>
                        <span>{cleanLine}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 mt-10 pt-4 text-center text-xs text-gray-400">
        <p>Generado automáticamente por OrgChart Studio — Herramienta de Auditoría Organizacional</p>
      </div>
    </div>
  )
})
