"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { isBefore, parseISO } from "date-fns"
import { ArrowUpRight } from "lucide-react"

interface UserData {
  id: string
  end_date?: string
}

interface ChartData {
  name: string
  value: number
  color: string
}

export function UserStatusDonutChart() {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`API request failed with status ${response.status}: ${errorText}`)
        }

        const data = await response.json()

        if (!data || !Array.isArray(data.data)) {
          throw new Error("Invalid data format received from API")
        }

        const users: UserData[] = data.data

        // Calculate active and expired users
        const currentDate = new Date()
        const expiredUsers = users.filter((user) => {
          if (!user.end_date) return false
          try {
            const endDate = parseISO(user.end_date)
            return isBefore(endDate, currentDate)
          } catch (err) {
            console.warn("Error parsing end date:", err)
            return false
          }
        }).length

        const activeUsers = users.length - expiredUsers

        // Prepare chart data
        const chartData: ChartData[] = [
          { name: "Active Users", value: activeUsers, color: "#a78bfa" }, // Purple
          { name: "Expired Accounts", value: expiredUsers, color: "#fcd34d" }, // Yellow
        ]

        setChartData(chartData)
      } catch (err) {
        console.error("Error fetching user data:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")

        // Set fallback data
        setChartData([
          { name: "Active Users", value: 5, color: "#a78bfa" },
          { name: "Expired Accounts", value: 2, color: "#fcd34d" },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={14}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <Card className="bg-gray-900 border-gray-800 rounded-xl overflow-hidden">
      <CardHeader className="border-b border-gray-800 p-6">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-normal text-white">User Status Distribution</CardTitle>
          <div className="flex items-center text-xs font-medium rounded-full px-2 py-1 bg-purple-900/50 text-purple-400">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            +12.5%
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[400px] p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-gray-400 text-lg">Loading user status data...</p>
          </div>
        ) : error ? (
          <div className="text-red-400 p-4 bg-red-900/20 rounded-md mb-4">
            <h3 className="font-bold">Error:</h3>
            <p>{error}</p>
            <p className="mt-2 text-sm">Showing demo data as fallback.</p>
          </div>
        ) : null}

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={150}
              innerRadius={80}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={5}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "white",
              }}
              formatter={(value, name) => [`${value} users`, name]}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              formatter={(value, entry, index) => <span style={{ color: "white" }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
