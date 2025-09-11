"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpRight } from "lucide-react"

interface UserData {
  id: string
  created_at: string
  // ... other fields
}

interface ChartData {
  date: string
  totalUsers: number
}

export function UserGrowthLineChart() {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState("2025")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/users")
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }
        const data = await response.json()
        if (!Array.isArray(data.data)) {
          throw new Error("Invalid data format received from API")
        }
        const users: UserData[] = data.data

        // Sort users by creation date
        users.sort((a, b) => Number.parseInt(a.created_at) - Number.parseInt(b.created_at))

        const userGrowth: { [key: string]: number } = {}
        let totalUsers = 0

        users.forEach((user) => {
          const date = new Date(Number.parseInt(user.created_at) * 1000)
          const year = date.getFullYear().toString()
          const month = (date.getMonth() + 1).toString().padStart(2, "0")
          const key = `${year}-${month}`

          totalUsers++
          userGrowth[key] = totalUsers
        })

        const chartData: ChartData[] = Object.entries(userGrowth)
          .filter(([date]) => date.startsWith(selectedYear))
          .map(([date, totalUsers]) => ({ date, totalUsers }))

        setChartData(chartData)
      } catch (err) {
        console.error("Error fetching user data:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")

        // Create fallback data
        const fallbackData: ChartData[] = Array.from({ length: 12 }, (_, i) => {
          const month = (i + 1).toString().padStart(2, "0")
          return {
            date: `${selectedYear}-${month}`,
            totalUsers: 10 + Math.floor(Math.random() * 5) * (i + 1),
          }
        })
        setChartData(fallbackData)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedYear])

  return (
    <Card className="bg-gray-900 border-gray-800 rounded-xl overflow-hidden">
      <CardHeader className="border-b border-gray-800 p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <CardTitle className="text-base font-normal text-white">User Growth Trend</CardTitle>
            <div className="ml-3 flex items-center text-xs font-medium rounded-full px-2 py-1 bg-green-900/50 text-green-400">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +3.2%
            </div>
          </div>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px] bg-gray-800 text-white border-gray-700">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 text-white border-gray-700">
              {["2024", "2025", "2026"].map((year) => (
                <SelectItem key={year} value={year} className="hover:bg-gray-700">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-gray-400 text-lg">Loading growth data...</p>
          </div>
        ) : error ? (
          <div className="text-red-400 p-4 bg-red-900/20 rounded-md mb-4">
            <h3 className="font-bold">Error:</h3>
            <p>{error}</p>
            <p className="mt-2 text-sm">Showing demo data as fallback.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                tickFormatter={(value) => value.split("-")[1]} // Show only month
              />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "white",
                }}
                labelStyle={{ color: "white" }}
                itemStyle={{ color: "white" }}
                formatter={(value, name) => [`${value} users`, "Total Users"]}
                labelFormatter={(label) => `Month: ${label.split("-")[1]}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalUsers"
                stroke="#fcd34d"
                name="Total Users"
                strokeWidth={2}
                dot={{ r: 4, fill: "#fcd34d" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
