import React from 'react'
import {
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignHorizontalSpaceAround,
  AlignVerticalSpaceAround
} from 'lucide-react'
import * as alignmentUtils from '../../utils/alignmentUtils'

export default function AlignmentToolbar({ selectedNodes, onAlign }) {
  if (!selectedNodes || selectedNodes.length < 2) return null

  const count = selectedNodes.length
  const canDistribute = count >= 3

  const handleAction = (alignFn) => {
    const aligned = alignFn(selectedNodes)
    if (onAlign) {
      onAlign(aligned)
    }
  }

  return (
    <div
      className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 bg-surface/90 backdrop-blur-md border border-border-custom p-1.5 rounded-custom-pill shadow-custom-hover animate-fade-in no-export select-none"
      style={{ animation: 'fadeInDown 0.15s ease' }}
    >
      <div className="px-2 text-[10px] font-bold text-text-muted border-r border-border-custom uppercase mr-1">
        {count} seleccionados
      </div>

      {/* Grupo Alineación */}
      <button
        onClick={() => handleAction(alignmentUtils.alignLeft)}
        className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-muted rounded-custom-pill transition-colors"
        title="Alinear a la izquierda (alignLeft)"
      >
        <AlignStartVertical className="w-4 h-4" />
      </button>

      <button
        onClick={() => handleAction(alignmentUtils.alignCenterH)}
        className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-muted rounded-custom-pill transition-colors"
        title="Alinear centro horizontal (alignCenterH)"
      >
        <AlignCenterVertical className="w-4 h-4" />
      </button>

      <button
        onClick={() => handleAction(alignmentUtils.alignRight)}
        className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-muted rounded-custom-pill transition-colors"
        title="Alinear a la derecha (alignRight)"
      >
        <AlignEndVertical className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-border-custom mx-1" />

      <button
        onClick={() => handleAction(alignmentUtils.alignTop)}
        className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-muted rounded-custom-pill transition-colors"
        title="Alinear arriba (alignTop)"
      >
        <AlignStartHorizontal className="w-4 h-4" />
      </button>

      <button
        onClick={() => handleAction(alignmentUtils.alignCenterV)}
        className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-muted rounded-custom-pill transition-colors"
        title="Alinear centro vertical (alignCenterV)"
      >
        <AlignCenterHorizontal className="w-4 h-4" />
      </button>

      <button
        onClick={() => handleAction(alignmentUtils.alignBottom)}
        className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-muted rounded-custom-pill transition-colors"
        title="Alinear abajo (alignBottom)"
      >
        <AlignEndHorizontal className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-border-custom mx-1" />

      {/* Grupo Distribución */}
      <button
        onClick={() => handleAction(alignmentUtils.distributeH)}
        disabled={!canDistribute}
        className={`p-2 rounded-custom-pill transition-colors ${
          canDistribute
            ? 'text-text-secondary hover:text-text-primary hover:bg-bg-muted cursor-pointer'
            : 'text-text-muted/30 cursor-not-allowed'
        }`}
        title={
          canDistribute
            ? 'Distribuir horizontalmente'
            : 'Selecciona al menos 3 nodos para distribuir'
        }
      >
        <AlignHorizontalSpaceAround className="w-4 h-4" />
      </button>

      <button
        onClick={() => handleAction(alignmentUtils.distributeV)}
        disabled={!canDistribute}
        className={`p-2 rounded-custom-pill transition-colors ${
          canDistribute
            ? 'text-text-secondary hover:text-text-primary hover:bg-bg-muted cursor-pointer'
            : 'text-text-muted/30 cursor-not-allowed'
        }`}
        title={
          canDistribute
            ? 'Distribuir verticalmente'
            : 'Selecciona al menos 3 nodos para distribuir'
        }
      >
        <AlignVerticalSpaceAround className="w-4 h-4" />
      </button>
    </div>
  )
}
