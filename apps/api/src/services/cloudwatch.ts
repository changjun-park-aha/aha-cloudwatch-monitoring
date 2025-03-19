import {
  CloudWatchClient,
  GetMetricDataCommand,
} from "@aws-sdk/client-cloudwatch";
import { subHours, format } from "date-fns";
import { saveMetric } from "../database/metrics-repository";

const cloudWatchClient = new CloudWatchClient({
  region: process.env.AWS_REGION || "us-east-1",
});

export async function getClusterMetrics(
  clusterName: string,
  periodInSeconds = 300,
  startTime = subHours(new Date(), 3),
  endTime = new Date(),
  saveToDb = true
) {
  try {
    const metricDataQueries = [
      {
        Id: "cpuUtilization",
        MetricStat: {
          Metric: {
            Namespace: "AWS/ECS",
            MetricName: "CPUUtilization",
            Dimensions: [
              {
                Name: "ClusterName",
                Value: clusterName,
              },
            ],
          },
          Period: periodInSeconds,
          Stat: "Average",
        },
        ReturnData: true,
      },
      {
        Id: "memoryUtilization",
        MetricStat: {
          Metric: {
            Namespace: "AWS/ECS",
            MetricName: "MemoryUtilization",
            Dimensions: [
              {
                Name: "ClusterName",
                Value: clusterName,
              },
            ],
          },
          Period: periodInSeconds,
          Stat: "Average",
        },
        ReturnData: true,
      },
      {
        Id: "cpuReservation",
        MetricStat: {
          Metric: {
            Namespace: "AWS/ECS",
            MetricName: "CPUReservation",
            Dimensions: [
              {
                Name: "ClusterName",
                Value: clusterName,
              },
            ],
          },
          Period: periodInSeconds,
          Stat: "Average",
        },
        ReturnData: true,
      },
      {
        Id: "memoryReservation",
        MetricStat: {
          Metric: {
            Namespace: "AWS/ECS",
            MetricName: "MemoryReservation",
            Dimensions: [
              {
                Name: "ClusterName",
                Value: clusterName,
              },
            ],
          },
          Period: periodInSeconds,
          Stat: "Average",
        },
        ReturnData: true,
      },
      // Add container insights metrics if you have Container Insights enabled
      {
        Id: "containerInstanceCount",
        MetricStat: {
          Metric: {
            Namespace: "AWS/ECS",
            MetricName: "ContainerInstanceCount",
            Dimensions: [
              {
                Name: "ClusterName",
                Value: clusterName,
              },
            ],
          },
          Period: periodInSeconds,
          Stat: "Average",
        },
        ReturnData: true,
      },
    ];

    const command = new GetMetricDataCommand({
      MetricDataQueries: metricDataQueries,
      StartTime: startTime,
      EndTime: endTime,
    });

    const response = await cloudWatchClient.send(command);

    // Process and format the response
    const results = response.MetricDataResults?.map((result) => {
      // Save metrics to database if requested
      if (saveToDb && result.Timestamps && result.Values) {
        for (let i = 0; i < result.Timestamps.length; i++) {
          if (result.Timestamps[i] && result.Values[i] !== undefined) {
            const timestamp = format(
              new Date(result.Timestamps[i]!),
              "yyyy-MM-dd HH:mm:ss"
            );
            saveMetric(
              clusterName,
              result.Id || "",
              timestamp,
              result.Values[i]!
            );
          }
        }
      }

      return {
        id: result.Id,
        label: result.Label,
        timestamps: result.Timestamps,
        values: result.Values,
      };
    });

    return {
      clusterName,
      period: periodInSeconds,
      startTime,
      endTime,
      metrics: results,
    };
  } catch (error) {
    console.error("Error fetching CloudWatch metrics:", error);
    throw error;
  }
}
