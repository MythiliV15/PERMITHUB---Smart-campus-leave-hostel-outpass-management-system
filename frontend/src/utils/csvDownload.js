/** Download a CSV file with UTF-8 BOM for Excel compatibility. */
export function downloadCsv(filename, headers, rows) {
  const escape = (v) => {
    if (v == null || v === undefined) return ''
    const s = String(v)
    if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const lines = [headers, ...rows].map((cols) => cols.map(escape).join(','))
  const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * One file with multiple titled tables (blank line between sections).
 * @param {Array<{ title: string, headers: string[], rows: Array<Array> }>} sections
 */
export function downloadReportSections(filename, sections) {
  const escape = (v) => {
    if (v == null || v === undefined) return ''
    const s = String(v)
    if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const lines = []
  for (const { title, headers, rows } of sections) {
    lines.push(escape(`--- ${title} ---`))
    lines.push(headers.map(escape).join(','))
    for (const row of rows) lines.push(row.map(escape).join(','))
    lines.push('')
  }
  const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
