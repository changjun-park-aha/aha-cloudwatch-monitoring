import {
  CloudWatchClient,
  PutMetricAlarmCommand,
} from "@aws-sdk/client-cloudwatch";

const cloudWatchClient = new CloudWatchClient([
  {
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  },
]);

export async function createCpuUtilizationAlarm(
  clusterName: string,
  threshold = 80,
  evaluationPeriods = 3,
  period = 300
) {
  try {
    const command = new PutMetricAlarmCommand({
      AlarmName: `${clusterName}-CPUUtilization-High`,
      AlarmDescription: `Alarm when CPU utilization exceeds ${threshold}% for ${evaluationPeriods} consecutive periods of ${period} seconds`,
      MetricName: "CPUUtilization",
      Namespace: "AWS/ECS",
      Dimensions: [
        {
          Name: "ClusterName",
          Value: clusterName,
        },
      ],
      Statistic: "Average",
      Period: period,
      EvaluationPeriods: evaluationPeriods,
      Threshold: threshold,
      ComparisonOperator: "GreaterThanThreshold",
      TreatMissingData: "missing",
      // If you want to add an SNS topic for notifications, uncomment and add your SNS topic ARN
      // AlarmActions: ['arn:aws:sns:region:account-id:topic-name'],
    });

    const response = await cloudWatchClient.send(command);
    return {
      success: true,
      message: `CPU utilization alarm created for cluster ${clusterName}`,
      data: response,
    };
  } catch (error) {
    console.error("Error creating CPU utilization alarm:", error);
    throw error;
  }
}

export async function createMemoryUtilizationAlarm(
  clusterName: string,
  threshold = 80,
  evaluationPeriods = 3,
  period = 300
) {
  try {
    const command = new PutMetricAlarmCommand({
      AlarmName: `${clusterName}-MemoryUtilization-High`,
      AlarmDescription: `Alarm when memory utilization exceeds ${threshold}% for ${evaluationPeriods} consecutive periods of ${period} seconds`,
      MetricName: "MemoryUtilization",
      Namespace: "AWS/ECS",
      Dimensions: [
        {
          Name: "ClusterName",
          Value: clusterName,
        },
      ],
      Statistic: "Average",
      Period: period,
      EvaluationPeriods: evaluationPeriods,
      Threshold: threshold,
      ComparisonOperator: "GreaterThanThreshold",
      TreatMissingData: "missing",
      // If you want to add an SNS topic for notifications, uncomment and add your SNS topic ARN
      // AlarmActions: ['arn:aws:sns:region:account-id:topic-name'],
    });

    const response = await cloudWatchClient.send(command);
    return {
      success: true,
      message: `Memory utilization alarm created for cluster ${clusterName}`,
      data: response,
    };
  } catch (error) {
    console.error("Error creating memory utilization alarm:", error);
    throw error;
  }
}
