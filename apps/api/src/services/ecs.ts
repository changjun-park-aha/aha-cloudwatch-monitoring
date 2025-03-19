import {
  ECSClient,
  ListClustersCommand,
  ListServicesCommand,
  DescribeServicesCommand,
  DescribeClustersCommand,
  ListTasksCommand,
  DescribeTasksCommand,
} from "@aws-sdk/client-ecs";
import { format } from "date-fns";
import { saveService } from "../database/services-repository";
import { saveTask, saveContainer } from "../database/tasks-repository";

const ecsClient = new ECSClient({
  region: process.env.AWS_REGION || "us-east-1",
});

export async function getEcsClusters(saveToDb = true) {
  try {
    // Get all cluster ARNs
    const listClustersResponse = await ecsClient.send(
      new ListClustersCommand({})
    );
    const clusterArns = listClustersResponse.clusterArns || [];

    if (clusterArns.length === 0) {
      return [];
    }

    // Get detailed information about each cluster
    const describeClustersResponse = await ecsClient.send(
      new DescribeClustersCommand({ clusters: clusterArns })
    );

    const clusters = describeClustersResponse.clusters || [];

    // For each cluster, get its services
    const clustersWithServices = await Promise.all(
      clusters.map(async (cluster) => {
        const clusterName = cluster.clusterName;
        const listServicesResponse = await ecsClient.send(
          new ListServicesCommand({ cluster: clusterName })
        );

        const serviceArns = listServicesResponse.serviceArns || [];
        let services: any[] = [];

        if (serviceArns.length > 0) {
          const describeServicesResponse = await ecsClient.send(
            new DescribeServicesCommand({
              cluster: clusterName,
              services: serviceArns,
            })
          );

          services = describeServicesResponse.services || [];

          // Save services to database if requested
          if (saveToDb) {
            const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss");

            for (const service of services) {
              if (service.serviceName && service.serviceArn) {
                saveService(
                  clusterName!,
                  service.serviceName,
                  service.serviceArn,
                  service.runningCount || 0,
                  service.desiredCount || 0,
                  service.status || "UNKNOWN",
                  timestamp
                );
              }
            }
          }
        }

        return {
          ...cluster,
          services: services.map((service) => ({
            serviceArn: service.serviceArn,
            serviceName: service.serviceName,
            runningCount: service.runningCount,
            desiredCount: service.desiredCount,
            status: service.status,
            createdAt: service.createdAt,
          })),
        };
      })
    );

    return clustersWithServices;
  } catch (error) {
    console.error("Error fetching ECS clusters:", error);
    throw error;
  }
}

export async function getRecentTasks(clusterName: string, saveToDb = true) {
  try {
    // List tasks in the cluster
    const listTasksResponse = await ecsClient.send(
      new ListTasksCommand({ cluster: clusterName })
    );

    const taskArns = listTasksResponse.taskArns || [];

    if (taskArns.length === 0) {
      return [];
    }

    // Get task details
    const describeTasks = await ecsClient.send(
      new DescribeTasksCommand({
        cluster: clusterName,
        tasks: taskArns,
      })
    );

    const tasks = describeTasks.tasks || [];
    const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss");

    // Extract relevant task information
    const taskDetails = tasks.map((task) => {
      const taskDetail = {
        taskArn: task.taskArn,
        taskDefinitionArn: task.taskDefinitionArn,
        lastStatus: task.lastStatus,
        desiredStatus: task.desiredStatus,
        createdAt: task.createdAt
          ? format(new Date(task.createdAt), "yyyy-MM-dd HH:mm:ss")
          : null,
        startedAt: task.startedAt
          ? format(new Date(task.startedAt), "yyyy-MM-dd HH:mm:ss")
          : null,
        containers: task.containers?.map((container) => ({
          containerArn: container.containerArn,
          name: container.name,
          lastStatus: container.lastStatus,
          exitCode: container.exitCode,
          reason: container.reason,
        })),
      };

      // Save task and containers to database if requested
      if (saveToDb && task.taskArn) {
        const result = saveTask(
          clusterName,
          task.taskArn,
          task.lastStatus || "UNKNOWN",
          task.desiredStatus || "UNKNOWN",
          taskDetail.createdAt!,
          taskDetail.startedAt,
          timestamp
        );

        const taskId = result.lastInsertRowid;

        if (task.containers) {
          for (const container of task.containers) {
            if (container.containerArn && container.name) {
              saveContainer(
                Number(taskId),
                container.containerArn,
                container.name,
                container.lastStatus || "UNKNOWN",
                container.exitCode || null,
                container.reason || null,
                timestamp
              );
            }
          }
        }
      }

      return taskDetail;
    });

    // Sort by creation time (newest first)
    taskDetails.sort((a, b) =>
      b.createdAt && a.createdAt
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : 0
    );

    return taskDetails;
  } catch (error) {
    console.error("Error fetching recent tasks:", error);
    throw error;
  }
}
