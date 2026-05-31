import React, { useState, useRef } from 'react'
import Modal from '../shared/Modal'
import { FileSpreadsheet, PlusCircle, UploadCloud, CheckCircle, AlertCircle, Download, ArrowRight } from 'lucide-react'
import { parseXLSXToNodes } from '../../utils/xlsxParser'
import { applyDagreLayout } from '../../utils/layoutUtils'

export default function NewProjectModal({ isOpen, onClose, onCreateProject }) {
  const [activeTab, setActiveTab] = useState('scratch') // 'scratch' | 'xlsx'
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  // Estados específicos para XLSX
  const [xlsxProjectName, setXlsxProjectName] = useState('')
  const [xlsxFile, setXlsxFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [xlsxError, setXlsxError] = useState('')
  const [parsedData, setParsedData] = useState(null) // { nodes, edges, rawRows, totalNodes }
  const fileInputRef = useRef(null)

  // Manejo de formulario "Desde cero"
  const handleSubmitScratch = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('El nombre del proyecto es requerido')
      return
    }
    setError('')
    onCreateProject(name.trim())
    setName('')
    onClose()
  }

  // Cierre y reset de estados
  const handleClose = () => {
    setName('')
    setError('')
    setXlsxProjectName('')
    setXlsxFile(null)
    setXlsxError('')
    setParsedData(null)
    onClose()
  }

  // Procesar archivo Excel
  const processFile = async (file) => {
    if (!file) return
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setXlsxError('Formato inválido. Debe subir un archivo de Excel (.xlsx)')
      setXlsxFile(null)
      setParsedData(null)
      return
    }

    setXlsxError('')
    setXlsxFile(file)

    try {
      const data = await parseXLSXToNodes(file)
      setParsedData(data)
      // Sugerir nombre de proyecto si está vacío
      if (!xlsxProjectName.trim()) {
        const baseName = file.name.substring(0, file.name.lastIndexOf('.'))
        setXlsxProjectName(`Organigrama ${baseName}`)
      }
    } catch (err) {
      setXlsxError(err.message || 'Error al procesar el archivo Excel')
      setXlsxFile(null)
      setParsedData(null)
    }
  }

  // Manejadores Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  // Confirmar creación desde XLSX
  const handleSubmitXLSX = (e) => {
    e.preventDefault()
    if (!xlsxProjectName.trim()) {
      setXlsxError('El nombre del proyecto es requerido')
      return
    }
    if (!parsedData) {
      setXlsxError('Por favor, cargue una plantilla de Excel válida')
      return
    }

    // Aplicar Dagre layout antes de crear el proyecto
    const laidOutNodes = applyDagreLayout(parsedData.nodes, parsedData.edges)
    
    const initialSnapshot = {
      nodes: laidOutNodes,
      edges: parsedData.edges,
      viewport: { x: 0, y: 0, zoom: 1 }
    }

    onCreateProject(xlsxProjectName.trim(), initialSnapshot)
    handleClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo Organigrama">
      {/* Selector de Pestañas */}
      <div className="flex bg-bg-app border border-border-custom p-1 rounded-custom-pill mb-6">
        <button
          onClick={() => setActiveTab('scratch')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-custom-pill transition-all ${
            activeTab === 'scratch'
              ? 'bg-surface text-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          Desde cero
        </button>
        <button
          onClick={() => setActiveTab('xlsx')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-custom-pill transition-all ${
            activeTab === 'xlsx'
              ? 'bg-surface text-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Desde XLSX
        </button>
      </div>

      {/* Contenido según Pestaña */}
      {activeTab === 'scratch' ? (
        <form onSubmit={handleSubmitScratch} className="space-y-4">
          <div>
            <label htmlFor="projectName" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Nombre del Organigrama
            </label>
            <input
              type="text"
              id="projectName"
              placeholder="Ej. Estructura Organizacional 2026"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (e.target.value.trim()) setError('')
              }}
              className="w-full bg-bg-app border border-border-custom text-text-primary placeholder:text-text-muted text-sm rounded-custom-pill px-5 py-3.5 focus:outline-none focus:border-primary transition-colors"
              autoFocus
            />
            {error && <p className="text-xs text-danger mt-2 px-1">{error}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-custom">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-custom-pill text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="bg-primary hover:bg-primary-hover disabled:bg-primary/40 disabled:text-white/50 text-white px-6 py-2.5 rounded-custom-pill text-sm font-medium shadow-custom-default transition-colors"
            >
              Crear proyecto
            </button>
          </div>
        </form>
      ) : (
        /* PESTAÑA XLSX */
        <form onSubmit={handleSubmitXLSX} className="space-y-5">
          {/* Nombre del Proyecto XLSX */}
          <div>
            <label htmlFor="xlsxProjectName" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Nombre del Organigrama
            </label>
            <input
              type="text"
              id="xlsxProjectName"
              placeholder="Ej. Estructura Importada"
              value={xlsxProjectName}
              onChange={(e) => {
                setXlsxProjectName(e.target.value)
                if (e.target.value.trim() && !xlsxFile) setXlsxError('')
              }}
              className="w-full bg-bg-app border border-border-custom text-text-primary placeholder:text-text-muted text-sm rounded-custom-pill px-5 py-3 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Zona de Dropzone para subir archivos */}
          {!parsedData ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-custom-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                dragOver
                  ? 'border-primary bg-primary/5 scale-102'
                  : 'border-border-custom hover:border-primary/40 bg-bg-app/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <UploadCloud className="w-10 h-10 text-text-muted group-hover:text-primary mb-3" />
              <p className="text-xs font-semibold text-text-primary">
                Arrastra tu plantilla de Excel aquí o <span className="text-primary font-bold">búscala</span>
              </p>
              <p className="text-[10px] text-text-muted mt-1">Soporta formatos .xlsx y .xls</p>
            </div>
          ) : (
            /* Confirmación de archivo cargado y Preview */
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-success/10 border border-success/20 text-success rounded-custom-md text-xs">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <div className="min-w-0">
                  <span className="font-semibold block text-white">Estructura validada con éxito</span>
                  <span className="block truncate text-text-secondary">{xlsxFile?.name} ({parsedData.totalNodes} colaboradores detectados)</span>
                </div>
              </div>

              {/* Preview de las primeras 5 filas del Excel */}
              <div className="border border-border-custom rounded-custom-md overflow-hidden bg-bg-app/40">
                <div className="bg-bg-app px-4 py-2 border-b border-border-custom text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                  Vista Previa (Primeros 5 registros)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border-custom bg-bg-app/20 text-text-muted">
                        <th className="px-4 py-2 font-medium">ID</th>
                        <th className="px-4 py-2 font-medium">Nombre</th>
                        <th className="px-4 py-2 font-medium">Cargo</th>
                        <th className="px-4 py-2 font-medium">Reporta A (Parent)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-soft/60">
                      {parsedData.rawRows.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="hover:bg-bg-muted/30">
                          <td className="px-4 py-2 font-semibold text-text-secondary font-mono">{row.id}</td>
                          <td className="px-4 py-2 text-white font-medium">{row.label}</td>
                          <td className="px-4 py-2 text-text-secondary">{row.sublabel || '-'}</td>
                          <td className="px-4 py-2 text-text-muted font-mono">{row.parentId || '(Raíz)'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setXlsxFile(null)
                    setParsedData(null)
                    setXlsxError('')
                  }}
                  className="text-xs text-primary hover:text-primary-hover font-semibold underline"
                >
                  Subir otro archivo
                </button>
              </div>
            </div>
          )}

          {/* Mostrar Errores Inline */}
          {xlsxError && (
            <div className="p-3 bg-danger/10 border border-danger/25 text-danger rounded-custom-md flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold block text-white">Error de Validación</span>
                {xlsxError}
              </div>
            </div>
          )}

          {/* Botones de acción y descarga */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border-custom">
            <a
              href="/template.xlsx"
              download="template.xlsx"
              className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary transition-colors"
            >
              <Download className="w-4 h-4" />
              Descargar plantilla de ejemplo
            </a>

            <div className="flex gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2 rounded-custom-pill text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!parsedData || !xlsxProjectName.trim()}
                className="bg-primary hover:bg-primary-hover disabled:bg-primary/40 disabled:text-white/50 text-white px-5 py-2 rounded-custom-pill text-xs font-semibold shadow-custom-default flex items-center gap-1.5 transition-all"
              >
                Crear proyecto
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  )
}
