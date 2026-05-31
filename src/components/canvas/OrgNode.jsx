import React, { useState, useRef, useEffect } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Plus, ChevronDown, ChevronUp } from 'lucide-react'

export default function OrgNode({ id, data, selected }) {
  const {
    label,
    sublabel,
    style,
    badges,
    onAddChild,
    onUpdateNode,
    onToggleCollapse,
    hasChildren,
    descendantsCount
  } = data

  const [isEditingLabel, setIsEditingLabel] = useState(false)
  const [editValue, setEditValue] = useState(label || '')
  const isEditingRef = useRef(false)

  // Sincronizar el valor editado con la etiqueta externa
  useEffect(() => {
    setEditValue(label || '')
  }, [label])

  const startEditing = () => {
    isEditingRef.current = true
    setIsEditingLabel(true)
    setEditValue(label || '')
  }

  const confirmEdit = () => {
    if (!isEditingRef.current) return
    isEditingRef.current = false
    setIsEditingLabel(false)
    if (onUpdateNode) {
      onUpdateNode(id, { label: editValue })
    }
  }

  const cancelEdit = () => {
    isEditingRef.current = false
    setIsEditingLabel(false)
    setEditValue(label || '')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.stopPropagation()
      confirmEdit()
    } else if (e.key === 'Escape') {
      e.stopPropagation()
      cancelEdit()
    }
  }

  const handleBlur = () => {
    if (isEditingRef.current) {
      confirmEdit()
    }
  }

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
      <div className="w-full truncate px-1" onDoubleClick={startEditing}>
        {isEditingLabel ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            autoFocus
            className="bg-transparent border-none text-center outline-none focus:outline-none focus:ring-0 w-full p-0 m-0"
            style={{
              color: nodeStyle.color || '#FFFFFF',
              fontSize: nodeStyle.fontSize || '13px',
              fontWeight: nodeStyle.fontWeight || '600',
              fontFamily: 'inherit'
            }}
          />
        ) : (
          <div className="font-semibold truncate text-white">{label || 'Sin etiqueta'}</div>
        )}
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

      {/* Badge automático para nodos colapsados con descendientes ocultos */}
      {data.isCollapsed && descendantsCount > 0 && (
        <span
          className="absolute -top-2.5 -right-2.5 px-2 py-0.5 text-[9px] font-bold rounded-custom-pill shadow-sm border border-black/10 z-10 bg-warning text-white animate-pulse"
          title={`${descendantsCount} descendientes ocultos`}
        >
          +{descendantsCount}
        </span>
      )}

      {/* Botones flotantes en el borde inferior (visibles en hover del grupo) */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity no-export">
        {onAddChild && (
          <button
            onClick={(e) => {
              e.stopPropagation() // Evitar seleccionar el nodo al presionar el botón
              onAddChild(id)
            }}
            className="w-6 h-6 bg-primary hover:bg-primary-hover text-white rounded-custom-pill flex items-center justify-center shadow-custom-hover transition-all hover:scale-110 active:scale-95 border border-border-custom"
            title="Añadir nodo hijo"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}

        {hasChildren && onToggleCollapse && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleCollapse(id)
            }}
            className="w-6 h-6 bg-surface hover:bg-bg-muted text-text-secondary hover:text-text-primary rounded-custom-pill flex items-center justify-center shadow-custom-hover transition-all hover:scale-110 active:scale-95 border border-border-custom"
            title={data.isCollapsed ? 'Expandir rama' : 'Colapsar rama'}
          >
            {data.isCollapsed ? (
              <ChevronDown className="w-3.5 h-3.5 text-primary" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2.5 h-2.5 !bg-primary border border-surface rounded-full !opacity-30 group-hover:!opacity-100 transition-opacity"
        style={{ bottom: '-5px' }}
      />
    </div>
  )
}
