import { generateReport } from "./generate-report"
import { getEcsClusters } from "../services/ecs"
import { format, subDays } from "date-fns"

async function triggerReportForAllClusters(date?: Date) {
  try {
    const reportDate = date || new Date()
    console.log(`Generating reports for ${format(reportDate, "yyyy-MM-dd")}`)

    // Get all clusters
    const clusters = await getEcsClusters(false)

    // For each cluster, generate a report
    for (const cluster of clusters) {
      const clusterName = cluster.clusterName
      console.log(`Generating report for cluster: ${clusterName}`)

      await generateReport(clusterName, reportDate)
    }

    console.log("Report generation completed")
  } catch (error) {
    console.error("Error generating reports:", error)
  }
}

// If this script is run directly, generate reports
if (require.main === module) {
  const args = process.argv.slice(2)
  let date: Date | undefined

  if (args[0] === "yesterday") {
    date = subDays(new Date(), 1)
  } else if (args[0]) {
    date = new Date(args[0])
  }

  triggerReportForAllClusters(date)
    .then(() => {
      console.log("Report trigger completed")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Report trigger failed:", error)
      process.exit(1)
    })
}

export { triggerReportForAllClusters }

