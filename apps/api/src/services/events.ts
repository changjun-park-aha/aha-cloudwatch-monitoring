import { ECSClient, DescribeServicesCommand, ListTasksCommand, DescribeTasksCommand } from "@aws-sdk/client-ecs"
import { CloudWatchLogsClient } from "@aws-sdk/client-cloudwatch-logs"

const ecsClient = new ECSClient({
  region: process.env.AWS_REGION || "us-east-1",
})

const logsClient = new CloudWatchLogsClient({
  region: process.env.AWS_REGION || "us-east-1",
})

export async function getClusterEvents(clusterName: string, limit = 100) {
  try {
    // Get all services in the cluster
    const listServicesResponse = await ecsClient.send(new ListTasksCommand({ cluster: clusterName }))

    const serviceArns = listServicesResponse.serviceArns || []

    if (serviceArns.length === 0) {
      return []
    }

    // Get service details
    const describeServicesResponse = await ecsClient.send(
      new DescribeServicesCommand({
        cluster: clusterName,
        services: serviceArns,
      }),
    )

    const services = describeServicesResponse.services || []

    // Extract events from all services
    const events = services.flatMap((service) =>
      (service.events || []).map((event) => ({
        serviceArn: service.serviceArn,
        serviceName: service.serviceName,
        eventId: event.id,
        message: event.message,
        createdAt: event.createdAt,
      })),
    )

    // Sort by creation time (newest first)
    events.sort((a, b) => (b.createdAt && a.createdAt ? b.createdAt.getTime() - a.createdAt.getTime() : 0))

    return events.slice(0, limit)
  } catch (error) {
    console.error("Error fetching cluster events:", error)
    throw error
  }
}

export async function getRecentTasks(clusterName: string, limit = 20) {
  try {
    // List tasks in the cluster
    const listTasksResponse = await ecsClient.send(new ListTasksCommand({ cluster: clusterName }))

    const taskArns = listTasksResponse.taskArns || []

    if (taskArns.length === 0) {
      return []
    }

    // Get task details
    const describeTasks = await ecsClient.send(
      new DescribeTasksCommand({
        cluster: clusterName,
        tasks: taskArns,
      }),
    )

    const tasks = describeTasks.tasks || []

    // Extract relevant task information
    const taskDetails = tasks.map((task) => ({
      taskArn: task.taskArn,
      taskDefinitionArn: task.taskDefinitionArn,
      lastStatus: task.lastStatus,
      desiredStatus: task.desiredStatus,
      createdAt: task.createdAt,
      startedAt: task.startedAt,
      containers: task.containers?.map((container) => ({
        containerArn: container.containerArn,
        name: container.name,
        lastStatus: container.lastStatus,
        exitCode: container.exitCode,
        reason: container.reason,
      })),
    }))

    // Sort by creation time (newest first)
    taskDetails.sort((a, b) => (b.createdAt && a.createdAt ? b.createdAt.getTime() - a.createdAt.getTime() : 0))

    return taskDetails.slice(0, limit)
  } catch (error) {
    console.error("Error fetching recent tasks:", error)
    throw error
  }
}

