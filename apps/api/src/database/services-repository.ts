import db from "./db"

export function saveService(
  clusterName: string,
  serviceName: string,
  serviceArn: string,
  runningCount: number,
  desiredCount: number,
  status: string,
  timestamp: string,
) {
  const stmt = db.prepare(`
    INSERT INTO services (
      cluster_name, service_name, service_arn, 
      running_count, desired_count, status, timestamp
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  return stmt.run(clusterName, serviceName, serviceArn, runningCount, desiredCount, status, timestamp)
}

export function getServices(clusterName: string, startTime: string, endTime: string) {
  const stmt = db.prepare(`
    SELECT * FROM services
    WHERE cluster_name = ?
    AND timestamp BETWEEN ? AND ?
    ORDER BY timestamp DESC
  `)

  return stmt.all(clusterName, startTime, endTime)
}

export function getLatestServices(clusterName: string) {
  const stmt = db.prepare(`
    SELECT s1.*
    FROM services s1
    JOIN (
      SELECT service_name, MAX(timestamp) as max_timestamp
      FROM services
      WHERE cluster_name = ?
      GROUP BY service_name
    ) s2
    ON s1.service_name = s2.service_name AND s1.timestamp = s2.max_timestamp
    WHERE s1.cluster_name = ?
    ORDER BY s1.service_name
  `)

  return stmt.all(clusterName, clusterName)
}

