"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, parseISO } from "date-fns"

interface UserData {
  id: string
  created_at: string
  // ... other fields
}

interface ChartData {
  month: string
  count: number
  timestamps: string[]
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function UserCreationChart() {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState(2024)
  const [availableYears, setAvailableYears] = useState<number[]>([])

  useEffect(() => {
    console.log("Fetching user data...")
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

        const years = new Set<number>()
        users.forEach((user) => {
          const year = parseISO(user.created_at).getFullYear()
          years.add(year)
        })

        setAvailableYears(Array.from(years).sort((a, b) => b - a))

        // Update chart data for the selected year
        updateChartData(users, selectedYear)
      } catch (err) {
        console.error("Error fetching user data:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedYear])

  const updateChartData = (users: UserData[], year: number) => {
    const yearData = monthNames.map((month, index) => ({
      month,
      count: 0,
      timestamps: [],
    }))

    users.forEach((user) => {
      const date = parseISO(user.created_at)
      if (date.getFullYear() === year) {
        const monthIndex = date.getMonth()
        yearData[monthIndex].count++
        yearData[monthIndex].timestamps.push(user.created_at)
      }
    })

    setChartData(yearData)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return (
      <Card className="bg-[#1a1c1e] text-gray-100 border-0">
        <CardHeader>
          <CardTitle className="text-base font-normal text-gray-300">User Creation by Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 p-4 bg-red-100 bg-opacity-10 rounded-md">
            <h3 className="font-bold">Error:</h3>
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#1a1c1e] text-gray-100 border-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-normal text-gray-300">User Creation by Month</CardTitle>
        <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
          <SelectTrigger className="w-[120px] bg-[#2a2c2e] text-gray-100 border-gray-700">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent className="bg-[#2a2c2e] text-gray-100 border-gray-700">
            {availableYears.map((year) => (
              <SelectItem key={year} value={year.toString()} className="hover:bg-[#3a3c3e]">
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: {
              label: "Users Created",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ChartData
                    return (
                      <div className="bg-[#2a2c2e] p-4 rounded shadow-lg border border-gray-700">
                        <p className="font-bold text-white">{`${data.month} ${selectedYear}`}</p>
                        <p className="text-gray-300">{`Total Users: ${data.count}`}</p>
                        <div className="mt-2 max-h-40 overflow-y-auto">
                          {data.timestamps.map((timestamp, index) => (
                            <p key={index} className="text-sm text-gray-400">
                              {format(parseISO(timestamp), "dd MMM yyyy HH:mm:ss")}
                            </p>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
