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

interface ClusterEvent {
  serviceArn: string;
  serviceName: string;
  eventId: string;
  message: string;
  createdAt: string;
}

interface ClusterEventsProps {
  clusterName: string;
  apiUrl: string;
}

export default function ClusterEvents({
  clusterName,
  apiUrl,
}: ClusterEventsProps) {
  const [events, setEvents] = useState<ClusterEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clusterName) {
      fetchEvents();
    }
  }, [clusterName]);

  async function fetchEvents() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${apiUrl}/api/clusters/${clusterName}/events`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();
      setEvents(data);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to fetch events. Please try again later.");
    } finally {
      setLoading(false);
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

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-[200px] flex items-center justify-center text-gray-500">
            No events found for this cluster
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cluster Events</CardTitle>
        <CardDescription>
          Recent events from services in this cluster
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.eventId}>
                <TableCell className="whitespace-nowrap">
                  {event.createdAt
                    ? format(new Date(event.createdAt), "yyyy-MM-dd HH:mm:ss")
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{event.serviceName}</Badge>
                </TableCell>
                <TableCell className="max-w-md truncate">
                  {event.message}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
