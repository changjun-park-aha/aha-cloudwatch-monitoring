import express from "express";
import cors from "cors";
import path from "path";
import { getEcsClusters, getRecentTasks } from "./services/ecs";
import { getClusterMetrics } from "./services/cloudwatch";
import { initializeDatabase } from "./database/db";
import { getMetrics, getDailyAverages } from "./database/metrics-repository";
import { getLatestServices } from "./database/services-repository";
import { getRecentReports } from "./database/reports-repository";
import { scheduleDataCollection, scheduleDailyReports } from "./scheduler";
import dotenv from "dotenv";

dotenv.config();

// Initialize the database
initializeDatabase();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use("/reports", express.static(path.join(__dirname, "../data/reports")));

app.get("/", (req, res) => {
  res.json({ message: "AWS CloudWatch Monitoring API is running" });
});

// Get all ECS clusters
app.get("/api/clusters", async (req, res) => {
  try {
    const clusters = await getEcsClusters();
    res.json(clusters);
  } catch (error) {
    console.error("Error fetching clusters:", error);
    res.status(500).json({ error: "Failed to fetch ECS clusters" });
  }
});

// Get metrics for a specific cluster
app.get("/api/clusters/:clusterName/metrics", async (req, res) => {
  try {
    const { clusterName } = req.params;
    const {
      period = "300",
      startTime,
      endTime,
      source = "cloudwatch",
    } = req.query;

    if (source === "db") {
      // Get metrics from database
      const start = startTime ? startTime.toString() : undefined;
      const end = endTime ? endTime.toString() : undefined;

      if (!start || !end) {
        return res.status(400).json({
          error: "startTime and endTime are required for database queries",
        });
      }

      const cpuData = getMetrics(clusterName, "cpuUtilization", start, end);
      const memoryData = getMetrics(
        clusterName,
        "memoryUtilization",
        start,
        end
      );
      const cpuReservationData = getMetrics(
        clusterName,
        "cpuReservation",
        start,
        end
      );
      const memoryReservationData = getMetrics(
        clusterName,
        "memoryReservation",
        start,
        end
      );

      res.json({
        clusterName,
        source: "database",
        metrics: [
          {
            id: "cpuUtilization",
            label: "CPU Utilization",
            data: cpuData,
          },
          {
            id: "memoryUtilization",
            label: "Memory Utilization",
            data: memoryData,
          },
          {
            id: "cpuReservation",
            label: "CPU Reservation",
            data: cpuReservationData,
          },
          {
            id: "memoryReservation",
            label: "Memory Reservation",
            data: memoryReservationData,
          },
        ],
      });
    } else {
      // Get metrics from CloudWatch
      const metrics = await getClusterMetrics(
        clusterName,
        Number(period),
        startTime ? new Date(startTime.toString()) : undefined,
        endTime ? new Date(endTime.toString()) : undefined
      );

      res.json(metrics);
    }
  } catch (error) {
    console.error("Error fetching metrics:", error);
    res.status(500).json({ error: "Failed to fetch cluster metrics" });
  }
});

// Get daily averages for a specific cluster
app.get("/api/clusters/:clusterName/daily-averages", async (req, res) => {
  try {
    const { clusterName } = req.params;
    const { days = "7", metric = "cpuUtilization" } = req.query;

    const dailyAverages = getDailyAverages(
      clusterName,
      metric.toString(),
      Number(days)
    );

    res.json({
      clusterName,
      metric,
      days: Number(days),
      data: dailyAverages,
    });
  } catch (error) {
    console.error("Error fetching daily averages:", error);
    res.status(500).json({ error: "Failed to fetch daily averages" });
  }
});

// Get services for a specific cluster
app.get("/api/clusters/:clusterName/services", async (req, res) => {
  try {
    const { clusterName } = req.params;

    const services = getLatestServices(clusterName);

    res.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// Get recent tasks for a specific cluster
app.get("/api/clusters/:clusterName/tasks", async (req, res) => {
  try {
    const { clusterName } = req.params;
    const { limit = "20" } = req.query;

    const tasks = await getRecentTasks(clusterName);

    res.json(tasks.slice(0, Number(limit)));
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Get recent reports
app.get("/api/reports", async (req, res) => {
  try {
    const { limit = "10" } = req.query;

    const reports = getRecentReports(Number(limit));

    res.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);

  // Start the schedulers
  scheduleDataCollection();
  scheduleDailyReports();
});
