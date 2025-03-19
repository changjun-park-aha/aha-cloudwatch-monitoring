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
import { Button } from "@aha-monitoring/ui/components/button";
import { Skeleton } from "@aha-monitoring/ui/components/skeleton";
import { format, parseISO } from "date-fns";
import Link from "next/link";

interface Report {
  id: number;
  report_date: string;
  report_path: string;
  created_at: string;
}

export default function ReportsList() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/reports`);

      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }

      const data = await response.json();
      setReports(data);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to fetch reports. Please try again later.");
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

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-[200px] flex items-center justify-center text-gray-500">
            No reports found. Reports are generated daily at midnight.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ECS Monitoring Reports</CardTitle>
        <CardDescription>Daily reports of your ECS clusters</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>
                  {format(parseISO(report.report_date), "yyyy-MM-dd")}
                </TableCell>
                <TableCell>
                  {format(parseISO(report.created_at), "yyyy-MM-dd HH:mm:ss")}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Link
                      href={`${API_URL}/reports/${report.report_date}/report.html`}
                      target="_blank"
                    >
                      <Button variant="outline" size="sm">
                        View Report
                      </Button>
                    </Link>
                    <Link
                      href={`${API_URL}/reports/${report.report_date}/report-data.json`}
                      target="_blank"
                    >
                      <Button variant="outline" size="sm">
                        Download JSON
                      </Button>
                    </Link>
                    <Link
                      href={`${API_URL}/reports/${report.report_date}/full-report.pdf`}
                      target="_blank"
                    >
                      <Button variant="outline" size="sm">
                        Download PDF
                      </Button>
                    </Link>
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
