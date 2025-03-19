import Link from "next/link";
import { Button } from "@aha-monitoring/ui/components/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-7xl text-center">
        <h1 className="text-4xl font-bold mb-6">ECS Cluster Monitoring</h1>
        <p className="text-xl mb-8">
          Monitor your AWS ECS clusters with daily reports and metrics
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg">View Dashboard</Button>
          </Link>
          <Link href="/reports">
            <Button size="lg" variant="outline">
              View Reports
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
