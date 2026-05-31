import { toPng, toJpeg } from 'html-to-image'
import { format } from 'date-fns'

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
      const dataUrl = await toPng(canvasRef.current, {
        pixelRatio: 2,
        backgroundColor: '#07080C',
        filter: (node) => {
          if (node?.classList?.contains('no-export')) return false
          return true
        }
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
      // html-to-image no tiene toWebp nativo, usamos toJpeg con calidad alta
      // o podemos convertir el PNG a WebP con un canvas intermedio
      const pngUrl = await toPng(canvasRef.current, {
        pixelRatio: 2,
        backgroundColor: '#07080C',
        filter: (node) => {
          if (node?.classList?.contains('no-export')) return false
          return true
        }
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
      const dataUrl = await toPng(historyRef.current, {
        pixelRatio: 2,
        backgroundColor: '#FFFFFF',
        filter: (node) => {
          if (node?.classList?.contains('no-export')) return false
          return true
        }
      })
      const name = `${projectName || 'organigrama'}-historial-${getTimestamp()}.png`
      triggerDownload(dataUrl, name)
    } catch (err) {
      console.error('Error exportando historial PNG:', err)
      alert('No se pudo exportar el historial. Intenta de nuevo.')
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
    exportProjectAsJSON
  }
}
