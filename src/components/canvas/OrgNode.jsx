import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { Plus } from 'lucide-react'

export default function OrgNode({ id, data, selected }) {
  const { label, sublabel, style, badges, onAddChild } = data

  // Reconstruir estilos dinámicos del nodo
  const nodeStyle = {
    backgroundColor: style?.backgroundColor || '#1E2538',
    color: style?.textColor || '#FFFFFF',
    borderRadius: style?.borderRadius ? `${style.borderRadius}px` : '12px',
    borderStyle: style?.borderStyle || 'solid',
    borderWidth: style?.borderWidth !== undefined ? `${style.borderWidth}px` : '1px',
    borderColor: selected ? '#2155FF' : (style?.borderColor || '#334155'),
    fontSize: style?.fontSize ? `${style.fontSize}px` : '13px',
    fontWeight: style?.fontWeight || '600',
    width: style?.width ? `${style.width}px` : '180px',
    minHeight: style?.minHeight ? `${style.minHeight}px` : '54px',
  }

  // Estilos de sombra para nodos seleccionados
  const selectionClass = selected 
    ? 'shadow-[0_0_0_2px_rgba(33,85,255,0.4)] ring-2 ring-primary' 
    : 'shadow-custom-default'

  return (
    <div
      style={nodeStyle}
      className={`group relative p-3 flex flex-col justify-center items-center text-center transition-all ${selectionClass}`}
    >
      {/* Handles para orientación vertical */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2.5 h-2.5 !bg-primary border border-surface rounded-full !opacity-30 group-hover:!opacity-100 transition-opacity"
        style={{ top: '-5px' }}
      />
      
      {/* Contenido del Nodo */}
      <div className="w-full truncate px-1">
        <div className="font-semibold truncate text-white">{label || 'Sin etiqueta'}</div>
        {sublabel && (
          <div className="text-[11px] opacity-75 mt-0.5 truncate text-text-secondary font-medium">
            {sublabel}
          </div>
        )}
      </div>

      {/* Renderizado de Badges */}
      {badges && badges.map((badge) => {
        let positionStyle = 'absolute '
        switch (badge.position) {
          case 'top-left':
            positionStyle += '-top-2.5 -left-2.5'
            break
          case 'bottom-left':
            positionStyle += '-bottom-2.5 -left-2.5'
            break
          case 'bottom-right':
            positionStyle += '-bottom-2.5 -right-2.5'
            break
          case 'top-right':
          default:
            positionStyle += '-top-2.5 -right-2.5'
            break
        }

        return (
          <span
            key={badge.id || Math.random()}
            style={{
              backgroundColor: badge.backgroundColor || '#22c55e',
              color: badge.textColor || '#ffffff'
            }}
            className={`${positionStyle} px-2 py-0.5 text-[9px] font-bold rounded-custom-pill shadow-sm border border-black/10 z-10 max-w-[100px] truncate`}
          >
            {badge.text}
          </span>
        )
      })}

      {/* Botón flotante "+" para añadir nodo hijo */}
      {onAddChild && (
        <button
          onClick={(e) => {
            e.stopPropagation() // Evitar seleccionar el nodo al presionar el botón
            onAddChild(id)
          }}
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-primary hover:bg-primary-hover text-white rounded-custom-pill flex items-center justify-center shadow-custom-hover opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all hover:scale-110 active:scale-95 z-20 border border-border-custom"
          title="Añadir nodo hijo"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2.5 h-2.5 !bg-primary border border-surface rounded-full !opacity-30 group-hover:!opacity-100 transition-opacity"
        style={{ bottom: '-5px' }}
      />
    </div>
  )
}
