import React, { useState, useRef, useEffect } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Plus, ChevronDown, ChevronUp, User, Loader2 } from 'lucide-react'
import { useLayout } from './LayoutContext'

export default function OrgNode({ id, data, selected }) {
  const { layoutMode } = useLayout()
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
  const [isCollapsing, setIsCollapsing] = useState(false)
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
    height: 'auto',
    transition: 'all 0.25s ease',
  }

  // Estilos de sombra para nodos seleccionados
  const selectionClass = selected 
    ? 'shadow-[0_0_0_2px_rgba(33,85,255,0.4)] ring-2 ring-primary' 
    : 'shadow-custom-default'

  const isVertical = layoutMode === 'vertical'

  const hasHeadcount = data.headcount !== undefined && data.headcount !== null && Number(data.headcount) > 0
  const paddingClass = hasHeadcount ? 'pt-3 px-3 pb-5.5' : 'p-3'

  return (
    <div
      style={nodeStyle}
      className={`group relative ${paddingClass} flex flex-col justify-center items-center text-center transition-all ${selectionClass}`}
    >
      {/* Handles para orientación vertical */}
      <Handle
        type="target"
        position={isVertical ? Position.Left : Position.Top}
        className="w-2.5 h-2.5 !bg-primary border border-surface rounded-full !opacity-30 group-hover:!opacity-100 transition-opacity"
        style={isVertical ? { left: '-5px' } : { top: '-5px' }}
      />
      
      {/* Contenido del Nodo */}
      <div className="w-full px-1 break-words whitespace-normal" onDoubleClick={startEditing}>
        {isEditingLabel ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            autoFocus
            className="bg-transparent border-none text-center outline-none focus:outline-none focus:ring-0 w-full p-0 m-0 break-words whitespace-normal"
            style={{
              color: nodeStyle.color || '#FFFFFF',
              fontSize: nodeStyle.fontSize || '13px',
              fontWeight: nodeStyle.fontWeight || '600',
              fontFamily: 'inherit'
            }}
          />
        ) : (
          <div className="font-semibold break-words whitespace-normal" style={{ color: nodeStyle.color }}>{label || 'Sin etiqueta'}</div>
        )}
        {sublabel && (
          <div
            className="text-[11px] mt-0.5 font-medium break-words whitespace-normal"
            style={{
              color: style?.sublabelColor || nodeStyle.color,
              opacity: style?.sublabelColor ? 1 : 0.75
            }}
          >
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
          className="absolute -top-2.5 -right-2.5 px-2 py-0.5 text-[9px] font-bold rounded-custom-pill shadow-sm border border-black/10 z-10 bg-warning text-white animate-pulse flex items-center gap-1"
          title={`${descendantsCount} descendientes ocultos${data.descendantsHeadcount > 0 ? ` (Headcount total: ${data.descendantsHeadcount})` : ''}`}
        >
          <span>+{descendantsCount}</span>
          {data.descendantsHeadcount > 0 && (
            <span className="flex items-center gap-0.5 border-l border-white/30 pl-1 ml-0.5">
              <User className="w-2.5 h-2.5" />
              <span>{data.descendantsHeadcount}</span>
            </span>
          )}
        </span>
      )}

      {/* Indicador de headcount del nodo */}
      {data.headcount !== undefined && data.headcount !== null && Number(data.headcount) > 0 && (
        <div
          className="absolute bottom-1 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-custom-pill text-[9px] font-semibold bg-black/5 dark:bg-white/10 text-text-secondary dark:text-text-secondary border border-black/5 dark:border-white/5 backdrop-blur-xs select-none"
          title={`Número de personas: ${data.headcount}`}
        >
          <User className="w-2.5 h-2.5" />
          <span>{data.headcount}</span>
        </div>
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
              setIsCollapsing(true)
              setTimeout(() => {
                onToggleCollapse(id)
                setIsCollapsing(false)
              }, 100)
            }}
            disabled={isCollapsing}
            className="w-6 h-6 bg-surface hover:bg-bg-muted text-text-secondary hover:text-text-primary rounded-custom-pill flex items-center justify-center shadow-custom-hover transition-all hover:scale-110 active:scale-95 border border-border-custom disabled:opacity-75 cursor-pointer"
            title={data.isCollapsed ? 'Expandir rama' : 'Colapsar rama'}
          >
            {isCollapsing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            ) : data.isCollapsed ? (
              <ChevronDown className="w-3.5 h-3.5 text-primary" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      <Handle
        type="source"
        position={isVertical ? Position.Right : Position.Bottom}
        className="w-2.5 h-2.5 !bg-primary border border-surface rounded-full !opacity-30 group-hover:!opacity-100 transition-opacity"
        style={isVertical ? { right: '-5px' } : { bottom: '-5px' }}
      />
    </div>
  )
}
