"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@aha-monitoring/ui/components/table";
import { Badge } from "@aha-monitoring/ui/components/badge";
import { format } from "date-fns";

interface Service {
  serviceArn: string;
  serviceName: string;
  runningCount: number;
  desiredCount: number;
  status: string;
  createdAt: string;
}

interface ClusterServicesProps {
  services: Service[];
}

export default function ClusterServices({ services }: ClusterServicesProps) {
  if (!services || services.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-gray-500">
        No services found in this cluster
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Running</TableHead>
            <TableHead>Desired</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.serviceArn}>
              <TableCell className="font-medium">
                {service.serviceName}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    service.status === "ACTIVE" ? "success" : "secondary"
                  }
                >
                  {service.status}
                </Badge>
              </TableCell>
              <TableCell>{service.runningCount}</TableCell>
              <TableCell>{service.desiredCount}</TableCell>
              <TableCell>
                {service.createdAt
                  ? format(new Date(service.createdAt), "yyyy-MM-dd HH:mm")
                  : "N/A"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
