import { toPng } from 'html-to-image'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Genera un nombre de archivo con fecha formateada
 */
function getTimestamp() {
  return format(new Date(), 'yyyy-MM-dd')
}

/**
 * Dispara la descarga de un blob o data URL
 */
function triggerDownload(dataUrl, filename) {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}

/**
 * Filtro de exportación para omitir elementos de interfaz de usuario
 */
function exportFilter(node) {
  let current = node
  while (current) {
    if (
      current.classList &&
      (current.classList.contains('no-export') ||
        current.classList.contains('react-flow__handle') ||
        current.classList.contains('react-flow__controls') ||
        current.classList.contains('react-flow__minimap'))
    ) {
      return false
    }
    current = current.parentElement
  }
  return true
}

/**
 * Lee el color actual del canvas desde las variables CSS
 */
function getCanvasBackgroundColor() {
  try {
    const computedBg = window.getComputedStyle(document.documentElement).getPropertyValue('--color-bg-soft').trim()
    if (computedBg) return computedBg
  } catch (e) {
    console.warn('Error reading --color-bg-soft CSS variable:', e)
  }
  const isDarkTheme = document.documentElement.classList.contains('dark')
  return isDarkTheme ? '#0B0F19' : '#f1f5f9'
}

/**
 * Hook principal de exportación. No necesita estado propio — todos los métodos
 * son funciones puras que reciben los refs/datos necesarios.
 */
export function useExport() {
  /**
   * Exporta el canvas como PNG de alta resolución.
   * @param {React.RefObject} canvasRef - Ref del div contenedor del canvas
   * @param {string} projectName
   * @param {number} version - Último número de versión
   */
  async function exportChartAsPNG(canvasRef, projectName, version) {
    if (!canvasRef?.current) {
      alert('No se pudo acceder al canvas para exportar.')
      return
    }
    try {
      const bgColor = getCanvasBackgroundColor()
      const dataUrl = await toPng(canvasRef.current, {
        pixelRatio: 2,
        backgroundColor: bgColor,
        filter: exportFilter
      })
      const name = `${projectName || 'organigrama'}-v${version ?? 1}-${getTimestamp()}.png`
      triggerDownload(dataUrl, name)
    } catch (err) {
      console.error('Error exportando PNG:', err)
      alert('No se pudo exportar como PNG. Intenta de nuevo.')
    }
  }

  /**
   * Exporta el canvas como WebP.
   */
  async function exportChartAsWebP(canvasRef, projectName, version) {
    if (!canvasRef?.current) {
      alert('No se pudo acceder al canvas para exportar.')
      return
    }
    try {
      const bgColor = getCanvasBackgroundColor()
      const pngUrl = await toPng(canvasRef.current, {
        pixelRatio: 2,
        backgroundColor: bgColor,
        filter: exportFilter
      })

      // Convertir a WebP via canvas
      const img = new Image()
      img.src = pngUrl
      await new Promise((res) => { img.onload = res })

      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const webpUrl = canvas.toDataURL('image/webp', 0.92)

      const name = `${projectName || 'organigrama'}-v${version ?? 1}-${getTimestamp()}.webp`
      triggerDownload(webpUrl, name)
    } catch (err) {
      console.error('Error exportando WebP:', err)
      alert('No se pudo exportar como WebP. Intenta de nuevo.')
    }
  }

  /**
   * Exporta el panel de historial como PNG.
   * @param {React.RefObject} historyRef - Ref del componente HistoryExportView
   * @param {string} projectName
   */
  async function exportHistoryAsPNG(historyRef, projectName) {
    if (!historyRef?.current) {
      alert('No se pudo acceder al historial para exportar.')
      return
    }
    try {
      // Garantizar que el componente esté completamente pintado antes de la captura (un frame + 100ms)
      await new Promise((r) => requestAnimationFrame(r))
      await new Promise((r) => setTimeout(r, 100))

      const dataUrl = await toPng(historyRef.current, {
        pixelRatio: 2,
        backgroundColor: '#FFFFFF',
        filter: exportFilter
      })
      const name = `${projectName || 'organigrama'}-historial-${getTimestamp()}.png`
      triggerDownload(dataUrl, name)
    } catch (err) {
      console.error('Error exportando historial PNG:', err)
      alert('No se pudo exportar el historial. Intenta de nuevo.')
    }
  }

  /**
   * Exporta el historial de cambios en formato Markdown (.md).
   * @param {object} project - Objeto del proyecto
   * @param {Array} history - Historial de versiones del proyecto
   */
  function exportHistoryAsMarkdown(project, history) {
    if (!project) {
      alert('Proyecto no encontrado para exportar.')
      return
    }

    try {
      const projectName = project.name || 'Proyecto sin título'
      const formattedDate = format(new Date(), "d 'de' MMMM, yyyy - h:mm a", { locale: es })
      
      let markdown = `# Historial de cambios — ${projectName}\n`
      markdown += `Exportado el ${formattedDate} | ${history.length} versiones registradas\n\n`
      markdown += `---\n\n`

      if (history.length === 0) {
        markdown += `*No hay versiones registradas en este historial.*\n`
      } else {
        history.forEach((entry) => {
          const entryDate = format(new Date(entry.timestamp), "d MMM yyyy, h:mm a", { locale: es }).replace(/\./g, '')
          markdown += `## v${entry.version} — ${entryDate}\n\n`
          
          if (entry.description) {
            const lines = entry.description.split('\n').filter(Boolean)
            lines.forEach((line) => {
              const cleanLine = line.startsWith('•') ? line.substring(1).trim() : line
              markdown += `- ${cleanLine}\n`
            })
          } else {
            markdown += `- Sin descripción de cambios.\n`
          }
          markdown += `\n---\n\n`
        })
      }

      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const name = `${projectName}-historial-${getTimestamp()}.md`
      triggerDownload(url, name)
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch (err) {
      console.error('Error al exportar historial como Markdown:', err)
      alert('No se pudo exportar el historial como Markdown.')
    }
  }

  /**
   * Exporta el proyecto completo + historial como JSON descargable.
   * @param {object} project - Objeto proyecto completo
   * @param {Array} history - Array de entradas del historial
   */
  function exportProjectAsJSON(project, history) {
    try {
      const payload = {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        project,
        history
      }
      const json = JSON.stringify(payload, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const name = `${project?.name || 'organigrama'}-backup-${getTimestamp()}.json`
      triggerDownload(url, name)
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch (err) {
      console.error('Error exportando JSON:', err)
      alert('No se pudo exportar el backup JSON. Intenta de nuevo.')
    }
  }

  return {
    exportChartAsPNG,
    exportChartAsWebP,
    exportHistoryAsPNG,
    exportHistoryAsMarkdown,
    exportProjectAsJSON
  }
}
