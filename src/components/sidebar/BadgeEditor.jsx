import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Trash2, Plus, AlertCircle } from 'lucide-react'

export default function BadgeEditor({ node, onUpdateNode }) {
  const [text, setText] = useState('')
  const [backgroundColor, setBackgroundColor] = useState('#22c55e')
  const [textColor, setTextColor] = useState('#ffffff')
  const [position, setPosition] = useState('top-right')
  const [error, setError] = useState('')

  const badges = node.data?.badges || []
  const hasReachedLimit = badges.length >= 4

  const handleAddBadge = (e) => {
    e.preventDefault()
    if (!text.trim()) {
      setError('El texto de la etiqueta es requerido')
      return
    }
    if (text.length > 15) {
      setError('Máximo 15 caracteres')
      return
    }
    setError('')

    const newBadge = {
      id: uuidv4(),
      text: text.trim(),
      backgroundColor,
      textColor,
      position
    }

    const updatedBadges = [...badges, newBadge]
    onUpdateNode(node.id, { badges: updatedBadges })

    // Resetear formulario
    setText('')
    setBackgroundColor('#22c55e')
    setTextColor('#ffffff')
    setPosition('top-right')
  }

  const handleDeleteBadge = (badgeId) => {
    const updatedBadges = badges.filter(b => b.id !== badgeId)
    onUpdateNode(node.id, { badges: updatedBadges })
  }

  return (
    <div className="flex flex-col h-full justify-between space-y-6">
      <div className="space-y-6 overflow-y-auto pr-1 max-h-[60vh]">
        {/* Listado de Badges actuales */}
        <div>
          <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Etiquetas asignadas ({badges.length}/4)
          </div>
          
          {badges.length === 0 ? (
            <div className="p-4 bg-bg-app border border-dashed border-border-custom rounded-custom-md text-center text-xs text-text-muted">
              No hay etiquetas asignadas a este colaborador.
            </div>
          ) : (
            <div className="space-y-2">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center justify-between p-2.5 bg-bg-app border border-border-custom rounded-custom-md"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Preview visual */}
                    <span
                      style={{ backgroundColor: badge.backgroundColor, color: badge.textColor }}
                      className="px-2 py-0.5 text-[9px] font-bold rounded-custom-pill shadow-sm border border-black/10 truncate max-w-[100px]"
                    >
                      {badge.text}
                    </span>
                    <span className="text-[10px] text-text-muted capitalize">
                      {badge.position.replace('-', ' ')}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteBadge(badge.id)}
                    className="p-1 text-text-muted hover:text-danger hover:bg-danger/10 rounded-custom-pill transition-all"
                    title="Eliminar etiqueta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulario de adición */}
        <div className="pt-4 border-t border-border-soft">
          {hasReachedLimit ? (
            <div className="p-4 bg-warning/10 border border-warning/20 text-warning rounded-custom-md flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-white">Límite alcanzado</span>
                Se permiten como máximo 4 etiquetas (badges) simultáneas por colaborador en el organigrama.
              </div>
            </div>
          ) : (
            <form onSubmit={handleAddBadge} className="space-y-4">
              <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                Añadir Nueva Etiqueta
              </div>

              {/* Input texto */}
              <div>
                <label className="block text-[11px] text-text-secondary mb-1">Texto (Máx 15 chars)</label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value)
                    if (e.target.value.trim()) setError('')
                  }}
                  placeholder="Ej. Vacante, Nuevo, KPI"
                  maxLength={15}
                  className="w-full bg-bg-app border border-border-custom text-text-primary text-xs rounded-custom-pill px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                />
                {error && <p className="text-[10px] text-danger mt-1 px-1">{error}</p>}
              </div>

              {/* Selector de posición */}
              <div>
                <label className="block text-[11px] text-text-secondary mb-1">Posición en el Nodo</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full bg-bg-app border border-border-custom text-text-primary text-xs rounded-custom-pill px-4 py-2 focus:outline-none focus:border-primary transition-colors cursor-pointer"
                >
                  <option value="top-right">Arriba Derecha</option>
                  <option value="top-left">Arriba Izquierda</option>
                  <option value="bottom-right">Abajo Derecha</option>
                  <option value="bottom-left">Abajo Izquierda</option>
                </select>
              </div>

              {/* Selector Color Fondo */}
              <div>
                <label className="block text-[11px] text-text-secondary mb-1">Color de Fondo</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-7 h-7 bg-transparent border-0 rounded-custom-sm cursor-pointer"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 bg-bg-app border border-border-custom text-text-primary text-xs rounded-custom-pill px-3 py-1.5 focus:outline-none focus:border-primary transition-colors text-center uppercase font-mono"
                  />
                </div>
              </div>

              {/* Selector Color Texto */}
              <div>
                <label className="block text-[11px] text-text-secondary mb-1">Color de Texto</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-7 h-7 bg-transparent border-0 rounded-custom-sm cursor-pointer"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="flex-1 bg-bg-app border border-border-custom text-text-primary text-xs rounded-custom-pill px-3 py-1.5 focus:outline-none focus:border-primary transition-colors text-center uppercase font-mono"
                  />
                </div>
              </div>

              {/* Botón de envío */}
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded-custom-pill text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar Etiqueta
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
