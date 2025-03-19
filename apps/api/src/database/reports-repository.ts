import db from "./db"

export function saveReport(reportDate: string, reportPath: string, jsonData: string) {
  const stmt = db.prepare(`
    INSERT INTO reports (report_date, report_path, json_data)
    VALUES (?, ?, ?)
  `)

  return stmt.run(reportDate, reportPath, jsonData)
}

export function getReportByDate(reportDate: string) {
  const stmt = db.prepare(`
    SELECT * FROM reports
    WHERE report_date = ?
  `)

  return stmt.get(reportDate)
}

export function getRecentReports(limit = 10) {
  const stmt = db.prepare(`
    SELECT * FROM reports
    ORDER BY report_date DESC
    LIMIT ?
  `)

  return stmt.all(limit)
}

