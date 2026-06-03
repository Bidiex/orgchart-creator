import * as XLSX from 'xlsx'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Cabeceras y filas de ejemplo para la estructura jerárquica
const headers = [
  ['id', 'label', 'sublabel', 'parentId', 'backgroundColor', 'badgeText', 'badgeColor', 'headcount', 'childLayout']
]

const data = [
  [1, 'Presidencia', 'Director General', '', '#1E2538', '', '', 1, 'vertical'],
  [2, 'Secretaría General', 'Administración', 1, '#1E2538', '', '', 3, 'horizontal'],
  [3, 'Dirección Jurídica', 'Asuntos Legales', 1, '#1E2538', '', '', 1, 'horizontal'],
  [4, 'VP Comercial', 'División Ventas', 1, '#2155FF', '', '', '', 'horizontal'],
  [5, 'Director Pyme', 'Canal Digital', 4, '#2155FF', 'Nuevo', '#16A34A', 2, 'horizontal']
]

const rows = headers.concat(data)

// Crear hoja de trabajo (worksheet)
const ws = XLSX.utils.aoa_to_sheet(rows)

// Configurar anchos de columna por defecto para mejor lectura
ws['!cols'] = [
  { wch: 6 },  // id
  { wch: 22 }, // label
  { wch: 18 }, // sublabel
  { wch: 10 }, // parentId
  { wch: 18 }, // backgroundColor
  { wch: 12 }, // badgeText
  { wch: 12 }, // badgeColor
  { wch: 10 }, // headcount
  { wch: 12 }  // childLayout
]

// Crear libro de trabajo (workbook)
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Organigrama')

// Validar carpeta destino
const targetDir = path.resolve(__dirname, '../public')
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true })
}

const targetPath = path.join(targetDir, 'template.xlsx')

// Escribir archivo
XLSX.writeFile(wb, targetPath)

console.log('Plantilla generada exitosamente en:', targetPath)
