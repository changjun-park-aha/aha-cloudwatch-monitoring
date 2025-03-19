import ClusterDashboard from "../../components/cluster-dashboard"

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-6 bg-gray-50">
      <div className="w-full max-w-7xl">
        <h1 className="text-3xl font-bold mb-8">ECS Cluster Monitoring</h1>
        <ClusterDashboard />
      </div>
    </main>
  )
}

