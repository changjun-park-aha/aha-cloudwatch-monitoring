"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aha-monitoring/ui/components/card";
import { Button } from "@aha-monitoring/ui/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@aha-monitoring/ui/components/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aha-monitoring/ui/components/select";
import { Skeleton } from "@aha-monitoring/ui/components/skeleton";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@aha-monitoring/ui/components/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import MetricsChart from "./metrics-chart";
import ClusterServices from "./cluster-services";
import { subHours } from "date-fns";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ClusterDashboard() {
  const [clusters, setClusters] = useState<any[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<any | null>(null);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [timeRange, setTimeRange] = useState("3h");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch clusters on component mount
  useEffect(() => {
    fetchClusters();
  }, []);

  // Fetch metrics when cluster or time range changes
  useEffect(() => {
    if (selectedCluster) {
      fetchMetrics(selectedCluster, timeRange);
    }
  }, [selectedCluster, timeRange]);

  async function fetchClusters() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/clusters`);

      if (!response.ok) {
        throw new Error("Failed to fetch clusters");
      }

      const data = await response.json();
      setClusters(data);

      if (data.length > 0 && !selectedCluster) {
        setSelectedCluster(data[0].clusterName);
      }
    } catch (err) {
      console.error("Error fetching clusters:", err);
      setError(
        "Failed to fetch clusters. Please check your AWS credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function fetchMetrics(clusterName: string, timeRange: string) {
    try {
      setLoading(true);
      setError(null);

      // Calculate time range
      const endTime = new Date();
      let startTime;

      switch (timeRange) {
        case "1h":
          startTime = subHours(endTime, 1);
          break;
        case "6h":
          startTime = subHours(endTime, 6);
          break;
        case "12h":
          startTime = subHours(endTime, 12);
          break;
        case "24h":
          startTime = subHours(endTime, 24);
          break;
        default:
          startTime = subHours(endTime, 3); // Default to 3 hours
      }

      const formattedStartTime = startTime.toISOString();
      const formattedEndTime = endTime.toISOString();

      const response = await fetch(
        `${API_URL}/api/clusters/${clusterName}/metrics?startTime=${formattedStartTime}&endTime=${formattedEndTime}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch metrics");
      }

      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      console.error("Error fetching metrics:", err);
      setError("Failed to fetch metrics. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  function handleRefresh() {
    if (selectedCluster) {
      fetchMetrics(selectedCluster, timeRange);
    } else {
      fetchClusters();
    }
  }

  const selectedClusterData = clusters.find(
    (cluster) => cluster.clusterName === selectedCluster
  );

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            value={selectedCluster || ""}
            onValueChange={setSelectedCluster}
            disabled={loading || clusters.length === 0}
          >
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Select a cluster" />
            </SelectTrigger>
            <SelectContent>
              {clusters.map((cluster) => (
                <SelectItem
                  key={cluster.clusterName}
                  value={cluster.clusterName}
                >
                  {cluster.clusterName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={timeRange}
            onValueChange={setTimeRange}
            disabled={loading || !selectedCluster}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 hour</SelectItem>
              <SelectItem value="3h">3 hours</SelectItem>
              <SelectItem value="6h">6 hours</SelectItem>
              <SelectItem value="12h">12 hours</SelectItem>
              <SelectItem value="24h">24 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleRefresh} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {selectedCluster ? (
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>CPU Utilization</CardTitle>
                  <CardDescription>
                    Average CPU usage across the cluster
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[200px] w-full" />
                  ) : metrics ? (
                    <MetricsChart
                      data={metrics.metrics.find(
                        (m: any) => m.id === "cpuUtilization"
                      )}
                      color="#3b82f6"
                      unit="%"
                    />
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-gray-500">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Memory Utilization</CardTitle>
                  <CardDescription>
                    Average memory usage across the cluster
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[200px] w-full" />
                  ) : metrics ? (
                    <MetricsChart
                      data={metrics.metrics.find(
                        (m: any) => m.id === "memoryUtilization"
                      )}
                      color="#10b981"
                      unit="%"
                    />
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-gray-500">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>CPU Reservation</CardTitle>
                  <CardDescription>Reserved CPU capacity</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[200px] w-full" />
                  ) : metrics ? (
                    <MetricsChart
                      data={metrics.metrics.find(
                        (m: any) => m.id === "cpuReservation"
                      )}
                      color="#6366f1"
                      unit="%"
                    />
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-gray-500">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Memory Reservation</CardTitle>
                  <CardDescription>Reserved memory capacity</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[200px] w-full" />
                  ) : metrics ? (
                    <MetricsChart
                      data={metrics.metrics.find(
                        (m: any) => m.id === "memoryReservation"
                      )}
                      color="#ec4899"
                      unit="%"
                    />
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-gray-500">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Container Instance Count</CardTitle>
                  <CardDescription>
                    Number of container instances
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[200px] w-full" />
                  ) : metrics ? (
                    <MetricsChart
                      data={metrics.metrics.find(
                        (m: any) => m.id === "containerInstanceCount"
                      )}
                      color="#f59e0b"
                      unit=""
                    />
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-gray-500">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services">
            {loading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : selectedClusterData ? (
              <ClusterServices services={selectedClusterData.services} />
            ) : (
              <div className="h-[400px] flex items-center justify-center text-gray-500">
                No services data available
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-500">
                {clusters.length === 0
                  ? "No ECS clusters found. Please check your AWS credentials and region settings."
                  : "Select a cluster to view metrics"}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
