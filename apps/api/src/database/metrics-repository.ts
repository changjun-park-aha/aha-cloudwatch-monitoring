import db from "./db"

export function saveMetric(clusterName: string, metricName: string, timestamp: string, value: number) {
  const stmt = db.prepare(`
    INSERT INTO metrics (cluster_name, metric_name, timestamp, value)
    VALUES (?, ?, ?, ?)
  `)

  return stmt.run(clusterName, metricName, timestamp, value)
}

export function getMetrics(clusterName: string, metricName: string, startTime: string, endTime: string) {
  const stmt = db.prepare(`
    SELECT * FROM metrics
    WHERE cluster_name = ? 
    AND metric_name = ?
    AND timestamp BETWEEN ? AND ?
    ORDER BY timestamp ASC
  `)

  return stmt.all(clusterName, metricName, startTime, endTime)
}

export function getLatestMetrics(clusterName: string, limit = 100) {
  const stmt = db.prepare(`
    SELECT * FROM metrics
    WHERE cluster_name = ?
    ORDER BY timestamp DESC
    LIMIT ?
  `)

  return stmt.all(clusterName, limit)
}

export function getDailyAverages(clusterName: string, metricName: string, days = 7) {
  const stmt = db.prepare(`
    SELECT 
      date(timestamp) as day,
      AVG(value) as average_value,
      MIN(value) as min_value,
      MAX(value) as max_value
    FROM metrics
    WHERE cluster_name = ?
    AND metric_name = ?
    AND timestamp >= date('now', '-' || ? || ' days')
    GROUP BY date(timestamp)
    ORDER BY day ASC
  `)

  return stmt.all(clusterName, metricName, days)
}

