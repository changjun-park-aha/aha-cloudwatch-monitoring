import cron from "node-cron";
import { format } from "date-fns";
import { getEcsClusters } from "./services/ecs";
import { getClusterMetrics } from "./services/cloudwatch";
import { generateReport } from "./scripts/generate-report";

// Schedule data collection every 5 minutes
export function scheduleDataCollection() {
  console.log("Scheduling data collection every 5 minutes");

  cron.schedule("*/5 * * * *", async () => {
    try {
      console.log(
        `[${format(new Date(), "yyyy-MM-dd HH:mm:ss")}] Collecting ECS data...`
      );

      // Get all clusters
      const clusters = await getEcsClusters();

      // For each cluster, collect metrics
      for (const cluster of clusters) {
        const clusterName = cluster.clusterName;
        console.log(`Collecting metrics for cluster: ${clusterName}`);

        await getClusterMetrics(clusterName!);
      }

      console.log("Data collection completed");
    } catch (error) {
      console.error("Error in scheduled data collection:", error);
    }
  });
}

// Schedule daily report generation at midnight
export function scheduleDailyReports() {
  console.log("Scheduling daily report generation at midnight");

  cron.schedule("0 0 * * *", async () => {
    try {
      console.log(
        `[${format(
          new Date(),
          "yyyy-MM-dd HH:mm:ss"
        )}] Generating daily reports...`
      );

      // Get all clusters
      const clusters = await getEcsClusters(false);

      // For each cluster, generate a report
      for (const cluster of clusters) {
        const clusterName = cluster.clusterName;
        console.log(`Generating report for cluster: ${clusterName}`);

        await generateReport(clusterName!);
      }

      console.log("Daily report generation completed");
    } catch (error) {
      console.error("Error in scheduled report generation:", error);
    }
  });
}
