import db from "./db"

export function saveTask(
  clusterName: string,
  taskArn: string,
  lastStatus: string,
  desiredStatus: string,
  createdAt: string,
  startedAt: string | null,
  timestamp: string,
) {
  const stmt = db.prepare(`
    INSERT INTO tasks (
      cluster_name, task_arn, last_status, 
      desired_status, created_at, started_at, timestamp
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  return stmt.run(clusterName, taskArn, lastStatus, desiredStatus, createdAt, startedAt, timestamp)
}

export function saveContainer(
  taskId: number,
  containerArn: string,
  name: string,
  lastStatus: string,
  exitCode: number | null,
  reason: string | null,
  timestamp: string,
) {
  const stmt = db.prepare(`
    INSERT INTO containers (
      task_id, container_arn, name, 
      last_status, exit_code, reason, timestamp
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  return stmt.run(taskId, containerArn, name, lastStatus, exitCode, reason, timestamp)
}

export function getRecentTasks(clusterName: string, limit = 20) {
  const stmt = db.prepare(`
    SELECT * FROM tasks
    WHERE cluster_name = ?
    ORDER BY created_at DESC
    LIMIT ?
  `)

  return stmt.all(clusterName, limit)
}

export function getTaskWithContainers(taskId: number) {
  const taskStmt = db.prepare(`
    SELECT * FROM tasks
    WHERE id = ?
  `)

  const containerStmt = db.prepare(`
    SELECT * FROM containers
    WHERE task_id = ?
  `)

  const task = taskStmt.get(taskId)
  if (!task) return null

  const containers = containerStmt.all(taskId)
  return { ...task, containers }
}

export function getTasksCreatedBetween(clusterName: string, startTime: string, endTime: string) {
  const stmt = db.prepare(`
    SELECT * FROM tasks
    WHERE cluster_name = ?
    AND created_at BETWEEN ? AND ?
    ORDER BY created_at DESC
  `)

  return stmt.all(clusterName, startTime, endTime)
}

