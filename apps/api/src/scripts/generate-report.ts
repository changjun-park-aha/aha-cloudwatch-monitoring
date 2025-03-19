import fs from "fs-extra";
import path from "path";
import puppeteer from "puppeteer";
import { format, subDays } from "date-fns";
import { getMetrics, getDailyAverages } from "../database/metrics-repository";
import { getLatestServices } from "../database/services-repository";
import { getTasksCreatedBetween } from "../database/tasks-repository";
import { saveReport } from "../database/reports-repository";
import { initializeDatabase } from "../database/db";

// Initialize the database
initializeDatabase();

// Configuration
const REPORT_DIR = path.join(__dirname, "../../../data/reports");
fs.ensureDirSync(REPORT_DIR);

async function generateReport(clusterName: string, reportDate = new Date()) {
  try {
    const dateStr = format(reportDate, "yyyy-MM-dd");
    const reportDir = path.join(REPORT_DIR, dateStr);
    fs.ensureDirSync(reportDir);

    console.log(`Generating report for ${clusterName} on ${dateStr}`);

    // Get time range for the report (last 24 hours)
    const endTime = format(reportDate, "yyyy-MM-dd HH:mm:ss");
    const startTime = format(subDays(reportDate, 1), "yyyy-MM-dd HH:mm:ss");

    // Collect metrics data
    const cpuData = getMetrics(
      clusterName,
      "cpuUtilization",
      startTime,
      endTime
    );
    const memoryData = getMetrics(
      clusterName,
      "memoryUtilization",
      startTime,
      endTime
    );
    const cpuReservationData = getMetrics(
      clusterName,
      "cpuReservation",
      startTime,
      endTime
    );
    const memoryReservationData = getMetrics(
      clusterName,
      "memoryReservation",
      startTime,
      endTime
    );

    // Get daily averages for the last 7 days
    const cpuDailyAvg = getDailyAverages(clusterName, "cpuUtilization", 7);
    const memoryDailyAvg = getDailyAverages(
      clusterName,
      "memoryUtilization",
      7
    );

    // Get services data
    const services = getLatestServices(clusterName);

    // Get tasks created in the last 24 hours
    const tasks = getTasksCreatedBetween(clusterName, startTime, endTime);

    // Prepare report data
    const reportData = {
      clusterName,
      reportDate: dateStr,
      metrics: {
        cpu: cpuData,
        memory: memoryData,
        cpuReservation: cpuReservationData,
        memoryReservation: memoryReservationData,
        dailyAverages: {
          cpu: cpuDailyAvg,
          memory: memoryDailyAvg,
        },
      },
      services,
      tasks,
    };

    // Save report data as JSON
    const jsonPath = path.join(reportDir, "report-data.json");
    fs.writeJsonSync(jsonPath, reportData, { spaces: 2 });

    // Generate HTML report
    const htmlPath = path.join(reportDir, "report.html");
    generateHtmlReport(reportData, htmlPath);

    // Generate chart images using Puppeteer
    await generateChartImages(reportData, reportDir);

    // Save report to database
    saveReport(dateStr, reportDir, JSON.stringify(reportData));

    console.log(`Report generated successfully at ${reportDir}`);
    return reportDir;
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
}

function generateHtmlReport(reportData: any, outputPath: string) {
  // Create a simple HTML report with chart placeholders
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>ECS Monitoring Report - ${reportData.clusterName} - ${
    reportData.reportDate
  }</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1, h2, h3 { color: #333; }
        .chart-container { margin-bottom: 30px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        tr:nth-child(even) { background-color: #f9f9f9; }
      </style>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    </head>
    <body>
      <h1>ECS Monitoring Report</h1>
      <p><strong>Cluster:</strong> ${reportData.clusterName}</p>
      <p><strong>Date:</strong> ${reportData.reportDate}</p>
      
      <h2>CPU Utilization</h2>
      <div class="chart-container">
        <canvas id="cpuChart" width="800" height="400"></canvas>
      </div>
      
      <h2>Memory Utilization</h2>
      <div class="chart-container">
        <canvas id="memoryChart" width="800" height="400"></canvas>
      </div>
      
      <h2>Daily Averages (Last 7 Days)</h2>
      <div class="chart-container">
        <canvas id="dailyAvgChart" width="800" height="400"></canvas>
      </div>
      
      <h2>Services</h2>
      <table>
        <tr>
          <th>Service Name</th>
          <th>Running Count</th>
          <th>Desired Count</th>
          <th>Status</th>
        </tr>
        ${reportData.services
          .map(
            (service: any) => `
          <tr>
            <td>${service.service_name}</td>
            <td>${service.running_count}</td>
            <td>${service.desired_count}</td>
            <td>${service.status}</td>
          </tr>
        `
          )
          .join("")}
      </table>
      
      <h2>Recent Tasks (Last 24 Hours)</h2>
      <table>
        <tr>
          <th>Created At</th>
          <th>Status</th>
          <th>Desired Status</th>
        </tr>
        ${reportData.tasks
          .map(
            (task: any) => `
          <tr>
            <td>${task.created_at || "N/A"}</td>
            <td>${task.last_status}</td>
            <td>${task.desired_status}</td>
          </tr>
        `
          )
          .join("")}
      </table>
      
      <script>
        // CPU Chart
        const cpuCtx = document.getElementById('cpuChart').getContext('2d');
        new Chart(cpuCtx, {
          type: 'line',
          data: {
            labels: ${JSON.stringify(
              reportData.metrics.cpu.map((m: any) =>
                format(new Date(m.timestamp), "HH:mm")
              )
            )},
            datasets: [{
              label: 'CPU Utilization (%)',
              data: ${JSON.stringify(
                reportData.metrics.cpu.map((m: any) => m.value)
              )},
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                max: 100
              }
            }
          }
        });
        
        // Memory Chart
        const memoryCtx = document.getElementById('memoryChart').getContext('2d');
        new Chart(memoryCtx, {
          type: 'line',
          data: {
            labels: ${JSON.stringify(
              reportData.metrics.memory.map((m: any) =>
                format(new Date(m.timestamp), "HH:mm")
              )
            )},
            datasets: [{
              label: 'Memory Utilization (%)',
              data: ${JSON.stringify(
                reportData.metrics.memory.map((m: any) => m.value)
              )},
              borderColor: 'rgb(153, 102, 255)',
              tension: 0.1
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                max: 100
              }
            }
          }
        });
        
        // Daily Averages Chart
        const dailyAvgCtx = document.getElementById('dailyAvgChart').getContext('2d');
        new Chart(dailyAvgCtx, {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(
              reportData.metrics.dailyAverages.cpu.map((d: any) => d.day)
            )},
            datasets: [
              {
                label: 'CPU Avg (%)',
                data: ${JSON.stringify(
                  reportData.metrics.dailyAverages.cpu.map(
                    (d: any) => d.average_value
                  )
                )},
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 1
              },
              {
                label: 'Memory Avg (%)',
                data: ${JSON.stringify(
                  reportData.metrics.dailyAverages.memory.map(
                    (d: any) => d.average_value
                  )
                )},
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                borderColor: 'rgb(153, 102, 255)',
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                max: 100
              }
            }
          }
        });
      </script>
    </body>
    </html>
  `;

  fs.writeFileSync(outputPath, html);
}

async function generateChartImages(reportData: any, reportDir: string) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // Load the HTML report
    await page.goto(`file://${path.join(reportDir, "report.html")}`, {
      waitUntil: "networkidle0",
    });

    // Wait for charts to render
    await page.waitForSelector("#cpuChart");
    await page.waitForSelector("#memoryChart");
    await page.waitForSelector("#dailyAvgChart");

    // Take screenshots of each chart
    await page.evaluate(() => {
      const cpuChart = document.getElementById("cpuChart");
      cpuChart?.scrollIntoView();
    });
    await page.screenshot({
      path: path.join(reportDir, "cpu-chart.png"),
      clip: { x: 0, y: 0, width: 800, height: 400 },
    });

    await page.evaluate(() => {
      const memoryChart = document.getElementById("memoryChart");
      memoryChart?.scrollIntoView();
    });
    await page.screenshot({
      path: path.join(reportDir, "memory-chart.png"),
      clip: { x: 0, y: 0, width: 800, height: 400 },
    });

    await page.evaluate(() => {
      const dailyAvgChart = document.getElementById("dailyAvgChart");
      dailyAvgChart?.scrollIntoView();
    });
    await page.screenshot({
      path: path.join(reportDir, "daily-avg-chart.png"),
      clip: { x: 0, y: 0, width: 800, height: 400 },
    });

    // Take a screenshot of the full report
    await page.pdf({
      path: path.join(reportDir, "full-report.pdf"),
      format: "A4",
    });

    await browser.close();
  } catch (error) {
    console.error("Error generating chart images:", error);
    throw error;
  }
}

// If this script is run directly, generate a report for the specified cluster
if (require.main === module) {
  const args = process.argv.slice(2);
  const clusterName = args[0] || "default";

  generateReport(clusterName)
    .then(() => {
      console.log("Report generation completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Report generation failed:", error);
      process.exit(1);
    });
}

export { generateReport };
