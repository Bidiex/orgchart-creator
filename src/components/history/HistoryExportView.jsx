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
        opacity: 0,
        pointerEvents: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '800px',
        zIndex: -1,
        backgroundColor: '#FFFFFF',
        color: '#111111',
        fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        padding: '40px',
        border: '1px solid #E2E8F0',
        boxSizing: 'border-box'
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: '2px solid #2155FF',
          paddingBottom: '24px',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          boxSizing: 'border-box'
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: '800',
              color: '#0F172A',
              letterSpacing: '-0.025em',
              lineHeight: '1.2'
            }}
          >
            Historial de Versiones
          </h1>
          <h2
            style={{
              margin: '6px 0 0 0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#2155FF',
              lineHeight: '1.2'
            }}
          >
            {projectName || 'Proyecto sin título'}
          </h2>
        </div>
        <div
          style={{
            textAlign: 'right',
            fontSize: '12px',
            color: '#64748B',
            lineHeight: '1.4'
          }}
        >
          <p style={{ margin: 0 }}>Exportado: {formattedExportDate()}</p>
          <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: '#0F172A' }}>
            {history.length} {history.length === 1 ? 'versión registrada' : 'versiones registradas'}
          </p>
        </div>
      </div>

      {/* Changelog List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxSizing: 'border-box'
        }}
      >
        {chronologicalHistory.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 0',
              color: '#94A3B8',
              fontSize: '14px'
            }}
          >
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
              <div
                key={entry.id}
                style={{
                  border: '1px solid #E2E8F0',
                  padding: '20px',
                  borderRadius: '12px',
                  backgroundColor: '#F8FAFC',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxSizing: 'border-box'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxSizing: 'border-box'
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      backgroundColor: '#EFF6FF',
                      color: '#1E40AF',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      display: 'inline-block'
                    }}
                  >
                    Versión v{entry.version}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#64748B',
                      fontWeight: '500'
                    }}
                  >
                    {formattedDate()}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    paddingLeft: '4px',
                    boxSizing: 'border-box'
                  }}
                >
                  {lines.map((line, idx) => {
                    const cleanLine = line.startsWith('•') ? line.substring(1).trim() : line
                    return (
                      <div
                        key={idx}
                        style={{
                          fontSize: '14px',
                          color: '#334155',
                          lineHeight: '1.5',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          margin: 0,
                          boxSizing: 'border-box'
                        }}
                      >
                        <span
                          style={{
                            color: '#2155FF',
                            marginTop: '2px',
                            userSelect: 'none',
                            fontWeight: 'bold',
                            fontSize: '12px'
                          }}
                        >
                          •
                        </span>
                        <span style={{ margin: 0, flex: 1 }}>{cleanLine}</span>
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
      <div
        style={{
          borderTop: '1px solid #E2E8F0',
          marginTop: '40px',
          paddingTop: '16px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#94A3B8'
        }}
      >
        <p style={{ margin: 0 }}>
          Generado automáticamente por OrgChart Studio — Herramienta de Auditoría Organizacional
        </p>
      </div>
    </div>
  )
})
