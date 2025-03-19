"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format } from "date-fns"

interface MetricsChartProps {
  data: {
    id: string
    label: string
    timestamps: string[]
    values: number[]
  } | null
  color: string
  unit: string
}

export default function MetricsChart({ data, color, unit }: MetricsChartProps) {
  if (!data || !data.timestamps || !data.values || data.timestamps.length === 0) {
    return <div className="h-[200px] flex items-center justify-center text-gray-500">No data available</div>
  }

  // Format the data for Recharts
  const chartData = data.timestamps.map((timestamp, index) => ({
    time: new Date(timestamp),
    value: data.values[index],
  }))

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tickFormatter={(time) => format(new Date(time), "HH:mm")} />
          <YAxis tickFormatter={(value) => `${value}${unit}`} />
          <Tooltip
            labelFormatter={(time) => format(new Date(time), "yyyy-MM-dd HH:mm:ss")}
            formatter={(value) => [`${value}${unit}`, data.label]}
          />
          <Line type="monotone" dataKey="value" stroke={color} activeDot={{ r: 8 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

