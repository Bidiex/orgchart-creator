import React from 'react'
import { useReactFlow, Panel } from '@xyflow/react'
import { ZoomIn, ZoomOut, Maximize, RefreshCw, LayoutGrid, List } from 'lucide-react'

export default function CanvasControls({ onReorganize, layoutMode, onLayoutModeChange }) {
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  const handleLayoutModeChange = (mode) => {
    if (onLayoutModeChange && layoutMode !== mode) {
      onLayoutModeChange(mode)
      // Ajustar la vista tras un delay para dar tiempo a React Flow a renderizar las nuevas posiciones
      setTimeout(() => {
        fitView({ duration: 400 })
      }, 80)
    }
  }

  return (
    <Panel
      position="bottom-left"
      className="flex items-center gap-1 bg-surface/90 backdrop-blur-md border border-border-custom p-1.5 rounded-custom-pill shadow-custom-hover z-40 no-export"
    >
      <button
        onClick={() => zoomIn()}
        className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-muted rounded-custom-pill transition-colors"
        title="Acercar"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <button
        onClick={() => zoomOut()}
        className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-muted rounded-custom-pill transition-colors"
        title="Alejar"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <button
        onClick={() => fitView({ duration: 400 })}
        className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-muted rounded-custom-pill transition-colors"
        title="Ajustar vista"
      >
        <Maximize className="w-4 h-4" />
      </button>
      
      <div className="w-px h-5 bg-border-custom mx-1" />

      {/* Selector de modo de distribución */}
      <button
        onClick={() => handleLayoutModeChange('horizontal')}
        className={`p-2 rounded-custom-pill transition-all ${
          layoutMode === 'horizontal'
            ? 'bg-primary/10 text-primary border border-primary/20'
            : 'text-text-secondary hover:text-text-primary hover:bg-bg-muted border border-transparent'
        }`}
        title="Distribución Horizontal (Fila)"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleLayoutModeChange('vertical')}
        className={`p-2 rounded-custom-pill transition-all ${
          layoutMode === 'vertical'
            ? 'bg-primary/10 text-primary border border-primary/20'
            : 'text-text-secondary hover:text-text-primary hover:bg-bg-muted border border-transparent'
        }`}
        title="Distribución Vertical (Columna)"
      >
        <List className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-border-custom mx-1" />
      
      <button
        onClick={onReorganize}
        className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3 py-1.5 rounded-custom-pill shadow-custom-default transition-all hover:scale-105 active:scale-95"
        title="Organizar nodos con algoritmo Dagre"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Reorganizar
      </button>
    </Panel>
  )
}
