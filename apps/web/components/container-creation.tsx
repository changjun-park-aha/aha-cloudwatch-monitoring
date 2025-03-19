"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aha-monitoring/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@aha-monitoring/ui/components/table";
import { Badge } from "@aha-monitoring/ui/components/badge";
import { Skeleton } from "@aha-monitoring/ui/components/skeleton";
import { format } from "date-fns";

interface Container {
  containerArn: string;
  name: string;
  lastStatus: string;
  exitCode?: number;
  reason?: string;
}

interface Task {
  taskArn: string;
  taskDefinitionArn: string;
  lastStatus: string;
  desiredStatus: string;
  createdAt: string;
  startedAt?: string;
  containers: Container[];
}

interface ContainerCreationProps {
  clusterName: string;
  apiUrl: string;
}

export default function ContainerCreation({
  clusterName,
  apiUrl,
}: ContainerCreationProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clusterName) {
      fetchTasks();
    }
  }, [clusterName]);

  async function fetchTasks() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${apiUrl}/api/clusters/${clusterName}/tasks`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to fetch tasks. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  function getStatusVariant(status: string) {
    switch (status) {
      case "RUNNING":
        return "success";
      case "PENDING":
        return "secondary";
      case "STOPPED":
        return "destructive";
      default:
        return "outline";
    }
  }

  if (loading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-[200px] flex items-center justify-center text-gray-500">
            No tasks found for this cluster
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Container Creation</CardTitle>
        <CardDescription>
          Recently created containers in this cluster
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Created</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Containers</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.taskArn}>
                <TableCell className="whitespace-nowrap">
                  {task.createdAt
                    ? format(new Date(task.createdAt), "yyyy-MM-dd HH:mm:ss")
                    : "N/A"}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {task.startedAt
                    ? format(new Date(task.startedAt), "yyyy-MM-dd HH:mm:ss")
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(task.lastStatus)}>
                    {task.lastStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {task.containers?.map((container) => (
                      <Badge key={container.containerArn} variant="outline">
                        {container.name} ({container.lastStatus})
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
