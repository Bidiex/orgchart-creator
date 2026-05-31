import React, { useState, useRef, useEffect } from 'react'
import { Download, ImageIcon, FileJson, FileImage, History, ChevronDown, Loader2, FileText } from 'lucide-react'
import { useExport } from '../../hooks/useExport'

export default function ExportMenu({
  canvasRef,
  historyRef,
  projectName,
  project,
  history,
  currentVersion
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(null) // 'png' | 'webp' | 'history-png' | 'history-md' | 'json'
  const menuRef = useRef(null)

  const {
    exportChartAsPNG,
    exportChartAsWebP,
    exportHistoryAsPNG,
    exportHistoryAsMarkdown,
    exportProjectAsJSON
  } = useExport()

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const withLoading = async (key, fn) => {
    setLoading(key)
    setIsOpen(false)
    try {
      await fn()
    } finally {
      setLoading(null)
    }
  }

  const sections = [
    {
      title: 'Organigrama',
      items: [
        {
          key: 'png',
          label: 'Exportar PNG',
          sublabel: 'Alta resolución (2×)',
          icon: <ImageIcon className="w-4 h-4" />,
          onClick: () =>
            withLoading('png', () => exportChartAsPNG(canvasRef, projectName, currentVersion))
        },
        {
          key: 'webp',
          label: 'Exportar WebP',
          sublabel: 'Formato web optimizado',
          icon: <FileImage className="w-4 h-4" />,
          onClick: () =>
            withLoading('webp', () => exportChartAsWebP(canvasRef, projectName, currentVersion))
        }
      ]
    },
    {
      title: 'Historial',
      items: [
        {
          key: 'history-png',
          label: 'Exportar historial PNG',
          sublabel: 'Imagen PNG del changelog',
          icon: <History className="w-4 h-4" />,
          onClick: () =>
            withLoading('history-png', () => exportHistoryAsPNG(historyRef, projectName))
        },
        {
          key: 'history-md',
          label: 'Exportar historial Markdown',
          sublabel: 'Archivo .md estructurado',
          icon: <FileText className="w-4 h-4" />,
          onClick: () =>
            withLoading('history-md', () =>
              Promise.resolve(exportHistoryAsMarkdown(project, history))
            )
        }
      ]
    },
    {
      title: 'Datos',
      items: [
        {
          key: 'json',
          label: 'Exportar backup JSON',
          sublabel: 'Proyecto + historial completo',
          icon: <FileJson className="w-4 h-4" />,
          onClick: () =>
            withLoading('json', () =>
              Promise.resolve(exportProjectAsJSON(project, history))
            )
        }
      ]
    }
  ]

  const isAnyLoading = loading !== null

  return (
    <div ref={menuRef} className="relative no-export">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isAnyLoading}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-custom-pill border text-xs font-semibold transition-all ${
          isOpen
            ? 'bg-primary/10 border-primary text-primary'
            : 'bg-bg-muted border-border-custom text-text-primary hover:border-primary/50 hover:text-primary'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Opciones de exportación"
      >
        {isAnyLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">
          {isAnyLoading ? 'Exportando...' : 'Exportar'}
        </span>
        {!isAnyLoading && (
          <ChevronDown
            className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-60 bg-surface border border-border-custom rounded-custom-lg shadow-custom-hover z-50 overflow-hidden animate-fade-in"
          style={{ animation: 'fadeInDown 0.15s ease' }}
        >
          <div className="px-3 py-2 border-b border-border-custom bg-bg-app/30">
            <p className="text-[10px] font-bold text-text-primary uppercase tracking-wider">
              Opciones de exportación
            </p>
          </div>

          <div className="divide-y divide-border-custom">
            {sections.map((section, sIdx) => (
              <div key={sIdx} className="py-1">
                <div className="px-3 py-1 text-[9px] font-bold text-text-muted uppercase tracking-wider">
                  {section.title}
                </div>
                {section.items.map((action) => (
                  <button
                    key={action.key}
                    onClick={action.onClick}
                    disabled={isAnyLoading}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-bg-muted transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed group"
                  >
                    <span className="text-text-muted group-hover:text-primary transition-colors">
                      {action.icon}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-text-primary leading-tight">
                        {action.label}
                      </span>
                      <span className="text-[9px] text-text-muted leading-tight mt-0.5">
                        {action.sublabel}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Footer hint */}
          <div className="px-3 py-2 border-t border-border-custom bg-bg-app/10">
            <p className="text-[9px] text-text-muted">
              📁 Guardado en tu carpeta de Descargas
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
