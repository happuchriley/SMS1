import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export type ExportColumn = { id: string; label: string }

const SKIP_EXPORT_IDS = new Set(['action', 'image'])

function getExportColumns(
  columns: ExportColumn[],
  visibility?: Record<string, boolean>
): ExportColumn[] {
  return columns.filter(
    (c) => !SKIP_EXPORT_IDS.has(c.id) && (visibility == null || visibility[c.id] !== false)
  )
}

function rowToCells(row: Record<string, unknown>, cols: ExportColumn[]): string[] {
  return cols.map((c) => {
    const v = row[c.id]
    if (v == null) return ''
    if (typeof v === 'object') return ''
    return String(v)
  })
}

export function exportToCSV(
  columns: ExportColumn[],
  rows: Record<string, unknown>[],
  filename: string,
  visibility?: Record<string, boolean>
): void {
  const cols = getExportColumns(columns, visibility)
  const headers = cols.map((c) => c.label)
  const escape = (s: string) => {
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const lines = [headers.map(escape).join(',')]
  for (const row of rows) {
    lines.push(rowToCells(row, cols).map(escape).join(','))
  }
  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
  downloadBlob(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`)
}

export function exportToExcel(
  columns: ExportColumn[],
  rows: Record<string, unknown>[],
  filename: string,
  sheetName = 'Sheet1',
  visibility?: Record<string, boolean>
): void {
  const cols = getExportColumns(columns, visibility)
  const headers = cols.map((c) => c.label)
  const data = rows.map((row) => rowToCells(row, cols))
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`)
}

export function exportToPDF(
  columns: ExportColumn[],
  rows: Record<string, unknown>[],
  filename: string,
  title?: string,
  visibility?: Record<string, boolean>
): void {
  const cols = getExportColumns(columns, visibility)
  const headers = cols.map((c) => c.label)
  const body = rows.map((row) => rowToCells(row, cols))
  const doc = new jsPDF({ orientation: 'landscape' })
  if (title) {
    doc.setFontSize(14)
    doc.text(title, 14, 12)
  }
  autoTable(doc, {
    head: [headers],
    body,
    startY: title ? 18 : 10,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
  })
  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function copyTableToClipboard(
  columns: ExportColumn[],
  rows: Record<string, unknown>[],
  visibility?: Record<string, boolean>
): string {
  const cols = getExportColumns(columns, visibility)
  const headers = cols.map((c) => c.label)
  const lines = [headers.join('\t')]
  for (const row of rows) {
    lines.push(rowToCells(row, cols).join('\t'))
  }
  return lines.join('\r\n')
}

export function printPage(): void {
  window.print()
}
