"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import axios from "axios";

interface UserData {
  id: string;
  created_at: string;
}

interface ChartData {
  day: string;
  count: number;
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function DailyUserRegistrationChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().getMonth().toString()
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get("/api/users/stats/daily-registration", {
          params: { year: selectedYear, month: selectedMonth },
        });
        const data = res.data;
        if (!data || !Array.isArray(data.data)) {
          throw new Error("Invalid data format received from API");
        }

        setChartData(data?.data || []);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );

        // Create empty chart data as fallback
        const daysInMonth = new Date(
          Number.parseInt(selectedYear),
          Number.parseInt(selectedMonth) + 1,
          0
        ).getDate();
        const emptyChartData: ChartData[] = Array.from(
          { length: daysInMonth },
          (_, i) => {
            const day = (i + 1).toString().padStart(2, "0");
            return { day, count: 0 };
          }
        );
        setChartData(emptyChartData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear]);

  return (
    <Card className="bg-gray-900 border-gray-800 rounded-xl overflow-hidden">
      <CardHeader className="border-b border-gray-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-base font-normal text-white">
            Daily User Registration
          </CardTitle>
          <div className="flex space-x-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[120px] bg-gray-800 text-white border-gray-700">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white border-gray-700">
                {monthNames.map((month, index) => (
                  <SelectItem
                    key={index}
                    value={index.toString()}
                    className="hover:bg-gray-700"
                  >
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px] bg-gray-800 text-white border-gray-700">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white border-gray-700">
                {["2024", "2025", "2026"].map((year) => (
                  <SelectItem
                    key={year}
                    value={year}
                    className="hover:bg-gray-700"
                  >
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-gray-400 text-lg">
              Loading daily registration data...
            </p>
          </div>
        ) : error ? (
          <div className="text-red-400 p-4 bg-red-900/20 rounded-md">
            <h3 className="font-bold">Error:</h3>
            <p>{error}</p>
            <p className="mt-2 text-sm">Showing empty chart as fallback.</p>
          </div>
        ) : (
          <ChartContainer
            config={{
              count: {
                label: "New Users",
                color: "#a78bfa",
              },
            }}
            className="w-full h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-gray-800 p-2 rounded shadow-lg border border-gray-700">
                          <p className="text-white">{`Day: ${payload[0].payload.day}`}</p>
                          <p className="text-white">{`New Users: ${payload[0].value}`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#a78bfa" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="count" position="top" fill="#a78bfa" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
