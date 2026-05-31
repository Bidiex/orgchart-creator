import React, { useState } from 'react'
import { Sliders, CheckSquare } from 'lucide-react'
import Modal from '../shared/Modal'

export default function StylePanel({ node, onUpdateNode, onApplyStyleToAll }) {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)

  const style = node.data?.style || {}
  
  // Extraer propiedades de estilo con fallbacks de seguridad
  const backgroundColor = style.backgroundColor || '#1E2538'
  const textColor = style.textColor || '#FFFFFF'
  const borderColor = style.borderColor || '#334155'
  const borderWidth = style.borderWidth !== undefined ? style.borderWidth : 1
  const borderStyle = style.borderStyle || 'solid'
  const borderRadius = style.borderRadius !== undefined ? style.borderRadius : 12
  const fontSize = style.fontSize !== undefined ? style.fontSize : 13
  const nodeWidth = style.width !== undefined ? style.width : 180

  const handleStyleChange = (key, value) => {
    onUpdateNode(node.id, {
      style: {
        [key]: value
      }
    })
  }

  const handleApplyToAll = () => {
    const currentStyle = {
      backgroundColor,
      textColor,
      borderColor,
      borderWidth,
      borderStyle,
      borderRadius,
      fontSize,
      width: nodeWidth,
      minHeight: style.minHeight || 54
    }
    onApplyStyleToAll(currentStyle)
    setIsApplyModalOpen(false)
  }

  return (
    <div className="flex flex-col h-full justify-between space-y-6">
      <div className="space-y-5 overflow-y-auto pr-1 max-h-[60vh]">
        {/* Color de Fondo */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Color de Fondo
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
              className="w-10 h-10 bg-transparent border-0 rounded-custom-sm cursor-pointer"
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
              className="flex-1 bg-bg-app border border-border-custom text-text-primary text-sm rounded-custom-pill px-4 py-2 focus:outline-none focus:border-primary transition-colors text-center uppercase font-mono"
            />
          </div>
        </div>

        {/* Color de Texto */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Color de Texto
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={textColor}
              onChange={(e) => handleStyleChange('textColor', e.target.value)}
              className="w-10 h-10 bg-transparent border-0 rounded-custom-sm cursor-pointer"
            />
            <input
              type="text"
              value={textColor}
              onChange={(e) => handleStyleChange('textColor', e.target.value)}
              className="flex-1 bg-bg-app border border-border-custom text-text-primary text-sm rounded-custom-pill px-4 py-2 focus:outline-none focus:border-primary transition-colors text-center uppercase font-mono"
            />
          </div>
        </div>

        {/* Borde: Color, Grosor, Estilo, Radio */}
        <div className="space-y-4 pt-3 border-t border-border-soft">
          <div className="text-xs font-bold text-white uppercase tracking-wider">Configuración de Borde</div>
          
          {/* Color del Borde */}
          <div>
            <label className="block text-[11px] text-text-secondary mb-1.5">Color del Borde</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={borderColor}
                onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                className="w-8 h-8 bg-transparent border-0 rounded-custom-sm cursor-pointer"
              />
              <input
                type="text"
                value={borderColor}
                onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                className="flex-1 bg-bg-app border border-border-custom text-text-primary text-xs rounded-custom-pill px-4 py-1.5 focus:outline-none focus:border-primary transition-colors text-center uppercase font-mono"
              />
            </div>
          </div>

          {/* Grosor del Borde */}
          <div>
            <div className="flex justify-between text-[11px] text-text-secondary mb-1">
              <span>Grosor del Borde</span>
              <span className="font-semibold text-white">{borderWidth}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              value={borderWidth}
              onChange={(e) => handleStyleChange('borderWidth', parseInt(e.target.value))}
              className="w-full h-1.5 bg-bg-app rounded-custom-pill appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Estilo del Borde */}
          <div>
            <label className="block text-[11px] text-text-secondary mb-2">Estilo de Línea</label>
            <div className="flex bg-bg-app border border-border-custom p-1 rounded-custom-pill">
              {['solid', 'dashed', 'dotted'].map((styleName) => (
                <button
                  key={styleName}
                  onClick={() => handleStyleChange('borderStyle', styleName)}
                  className={`flex-1 py-1 text-xs font-semibold rounded-custom-pill capitalize transition-all ${
                    borderStyle === styleName
                      ? 'bg-surface text-text-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {styleName === 'solid' ? 'Continuo' : styleName === 'dashed' ? 'Guiones' : 'Puntos'}
                </button>
              ))}
            </div>
          </div>

          {/* Radio de Borde */}
          <div>
            <div className="flex justify-between text-[11px] text-text-secondary mb-1">
              <span>Redondeado (Radio)</span>
              <span className="font-semibold text-white">{borderRadius}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="16"
              value={borderRadius}
              onChange={(e) => handleStyleChange('borderRadius', parseInt(e.target.value))}
              className="w-full h-1.5 bg-bg-app rounded-custom-pill appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>

        {/* Tamaño de Fuente & Ancho del Nodo */}
        <div className="space-y-4 pt-3 border-t border-border-soft">
          <div className="text-xs font-bold text-white uppercase tracking-wider">Dimensiones y Texto</div>
          
          {/* Tamaño de Fuente */}
          <div>
            <div className="flex justify-between text-[11px] text-text-secondary mb-1">
              <span>Tamaño de Letra</span>
              <span className="font-semibold text-white">{fontSize}px</span>
            </div>
            <input
              type="range"
              min="12"
              max="18"
              value={fontSize}
              onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value))}
              className="w-full h-1.5 bg-bg-app rounded-custom-pill appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Ancho del Nodo */}
          <div>
            <div className="flex justify-between text-[11px] text-text-secondary mb-1">
              <span>Ancho del Nodo</span>
              <span className="font-semibold text-white">{nodeWidth}px</span>
            </div>
            <input
              type="range"
              min="120"
              max="300"
              value={nodeWidth}
              onChange={(e) => handleStyleChange('width', parseInt(e.target.value))}
              className="w-full h-1.5 bg-bg-app rounded-custom-pill appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>
      </div>

      {/* Botón Aplicar a Todos */}
      <div className="pt-6 border-t border-border-custom">
        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/25 hover:border-transparent px-4 py-3 rounded-custom-pill text-xs font-semibold flex items-center justify-center gap-2 transition-all"
        >
          <CheckSquare className="w-4 h-4" />
          Aplicar a Todos los Nodos
        </button>
      </div>

      {/* Modal de Confirmación Global de Estilos */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Aplicar Estilo Globalmente"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <Sliders className="w-8 h-8 shrink-0" />
            <h4 className="font-semibold text-white text-base">¿Deseas homologar el estilo de tu organigrama?</h4>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed">
            Se aplicarán los colores, bordes, radio, tamaño de letra y ancho de este colaborador a <strong className="text-white">todos los nodos</strong> del proyecto actual.
          </p>

          <p className="text-xs text-text-muted">
            Los nombres, cargos y badges de los colaboradores permanecerán intactos.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-custom">
            <button
              onClick={() => setIsApplyModalOpen(false)}
              className="px-5 py-2.5 rounded-custom-pill text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleApplyToAll}
              className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-custom-pill text-xs font-medium transition-colors"
            >
              Confirmar y aplicar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
