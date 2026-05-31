import * as XLSX from 'xlsx'
import { v4 as uuid } from 'uuid'

/**
 * Valida la estructura de filas JSON de un archivo Excel de organigrama.
 * @param {Array} rows - Filas parseadas desde el Excel.
 * @returns {Object} { valid: boolean, error?: string, missing?: Array }
 */
export function validateXLSXStructure(rows) {
  if (!rows || rows.length === 0) {
    return { valid: false, error: 'El archivo Excel no contiene filas de datos.' }
  }

  // Columnas requeridas en la cabecera
  const requiredCols = ['id', 'label', 'parentId']
  const firstRow = rows[0]
  const cols = Object.keys(firstRow)
  const missing = requiredCols.filter(c => !cols.includes(c))
  
  if (missing.length > 0) {
    return {
      valid: false,
      error: `Faltan columnas requeridas: ${missing.join(', ')}`,
      missing
    }
  }

  // Validar exactamente un nodo raíz (el que no tiene parentId)
  const roots = rows.filter(row => {
    const parentIdStr = String(row.parentId || '').trim()
    return parentIdStr === '' || parentIdStr === 'undefined' || parentIdStr === 'null'
  })

  if (roots.length === 0) {
    return {
      valid: false,
      error: 'No se detectó ningún nodo raíz. Debe haber exactamente una fila con la columna "parentId" vacía.'
    }
  }

  if (roots.length > 1) {
    return {
      valid: false,
      error: `Se detectaron múltiples nodos raíz (${roots.length}): [${roots.map(r => r.label).join(', ')}]. Solo se permite un nodo raíz por organigrama.`
    }
  }

  // Validar que no haya IDs duplicados
  const ids = rows.map(r => String(r.id || '').trim()).filter(Boolean)
  const uniqueIds = new Set(ids)
  if (ids.length !== uniqueIds.size) {
    const duplicates = ids.filter((item, index) => ids.indexOf(item) !== index)
    const uniqueDuplicates = [...new Set(duplicates)]
    return {
      valid: false,
      error: `Se detectaron IDs de colaboradores duplicados: ${uniqueDuplicates.join(', ')}`
    }
  }

  // Validar reportes a IDs inexistentes (huérfanos)
  const idSet = new Set(ids)
  for (const row of rows) {
    const parentIdStr = String(row.parentId || '').trim()
    if (parentIdStr !== '' && parentIdStr !== 'undefined' && parentIdStr !== 'null') {
      if (!idSet.has(parentIdStr)) {
        return {
          valid: false,
          error: `El colaborador "${row.label}" reporta a un ID inexistente: "${row.parentId}"`
        }
      }
    }
  }

  return { valid: true }
}

/**
 * Lee un archivo XLSX, valida su estructura y devuelve nodos y conectores listos para renderizar.
 * @param {File} file - El archivo cargado desde el navegador.
 * @returns {Promise} Devuelve { nodes, edges } en una promesa.
 */
export function parseXLSXToNodes(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json(sheet)

        const validation = validateXLSXStructure(rows)
        if (!validation.valid) {
          reject(new Error(validation.error))
          return
        }

        // Mapeo ID original (Excel) -> UUID interno
        const idMap = {}
        rows.forEach(row => {
          const originalId = String(row.id).trim()
          idMap[originalId] = uuid()
        })

        // Crear Nodos
        const nodes = rows.map(row => {
          const originalId = String(row.id).trim()
          const internalId = idMap[originalId]

          return {
            id: internalId,
            type: 'orgNode',
            position: { x: 0, y: 0 }, // Dagre calculará la posición final
            data: {
              label: String(row.label || '').trim(),
              sublabel: row.sublabel ? String(row.sublabel).trim() : '',
              department: row.department ? String(row.department).trim() : '',
              style: {
                backgroundColor: row.backgroundColor || '#1E2538',
                textColor: '#FFFFFF',
                borderColor: '#334155',
                borderWidth: 1,
                borderRadius: 12,
                borderStyle: 'solid',
                fontSize: 13,
                fontWeight: '600',
                width: 180,
                minHeight: 54,
              },
              badges: row.badgeText ? [{
                id: uuid(),
                text: String(row.badgeText).trim().slice(0, 15),
                backgroundColor: row.badgeColor || '#22c55e',
                textColor: '#ffffff',
                position: 'top-right',
              }] : [],
              isCollapsed: false,
            }
          }
        })

        // Crear Edges
        const edges = rows
          .filter(row => {
            const parentIdStr = String(row.parentId || '').trim()
            return parentIdStr !== '' && parentIdStr !== 'undefined' && parentIdStr !== 'null'
          })
          .map(row => {
            const originalId = String(row.id).trim()
            const originalParentId = String(row.parentId).trim()
            const internalId = idMap[originalId]
            const internalParentId = idMap[originalParentId]

            return {
              id: `e-${internalParentId}-${internalId}`,
              source: internalParentId,
              target: internalId,
              type: 'orgEdge',
              data: {
                style: {
                  stroke: '#94a3b8',
                  strokeWidth: 2
                }
              }
            }
          })

        resolve({ nodes, edges, rawRows: rows, totalNodes: rows.length })
      } catch (err) {
        reject(new Error(`Fallo al parsear el contenido de las celdas: ${err.message}`))
      }
    }

    reader.onerror = () => {
      reject(new Error('Fallo de lectura del archivo en el sistema local.'))
    }

    reader.readAsArrayBuffer(file)
  })
}
