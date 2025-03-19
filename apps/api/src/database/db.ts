import Database from "better-sqlite3"
import fs from "fs-extra"
import path from "path"

// Ensure the data directory exists
const dataDir = path.join(__dirname, "../../data")
fs.ensureDirSync(dataDir)

const dbPath = path.join(dataDir, "ecs-monitoring.db")
const db = new Database(dbPath)

// Initialize database schema
export function initializeDatabase() {
  // Create metrics table
  db.exec(`
    CREATE TABLE IF NOT EXISTS metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cluster_name TEXT NOT NULL,
      metric_name TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      value REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create services table
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cluster_name TEXT NOT NULL,
      service_name TEXT NOT NULL,
      service_arn TEXT NOT NULL,
      running_count INTEGER,
      desired_count INTEGER,
      status TEXT,
      timestamp TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cluster_name TEXT NOT NULL,
      task_arn TEXT NOT NULL,
      last_status TEXT,
      desired_status TEXT,
      created_at TEXT,
      started_at TEXT,
      timestamp TEXT NOT NULL
    )
  `)

  // Create containers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS containers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER,
      container_arn TEXT NOT NULL,
      name TEXT NOT NULL,
      last_status TEXT,
      exit_code INTEGER,
      reason TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (task_id) REFERENCES tasks (id)
    )
  `)

  // Create reports table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_date TEXT NOT NULL,
      report_path TEXT NOT NULL,
      json_data TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  console.log("Database initialized successfully")
}

export default db

