"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
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
import { ArrowUpRight } from "lucide-react";
import axios from "axios";
import { monthNames } from "@/constants/date";

interface ChartData {
  month: string;
  count: number;
}

export function UserCreationYearlyChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("2025");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null); // Added: Reset error on each fetch
        const res = await axios.get(
          "/api/users/stats/creation-yearly?year=" + selectedYear
        );
        const data = res.data;
        if (!data || !Array.isArray(data.data)) {
          // Updated: Check for null data
          throw new Error("Invalid data format received from API");
        }
        setChartData(data?.data || []);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );

        // Create fallback data
        const fallbackData: ChartData[] = monthNames.map((month, index) => ({
          month,
          count: Math.floor(Math.random() * 10) + 1,
        }));
        setChartData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  return (
    <Card className="bg-gray-900 border-gray-800 rounded-xl overflow-hidden">
      <CardHeader className="border-b border-gray-800 p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <CardTitle className="text-base font-normal text-white">
              User Creation by Month
            </CardTitle>
            {/* <div className="ml-3 flex items-center text-xs font-medium rounded-full px-2 py-1 bg-green-900/50 text-green-400">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +4.7%
            </div> */}
          </div>
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
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-gray-400 text-lg">Loading chart data...</p>
          </div>
        ) : error ? (
          <div className="text-red-400 p-4 bg-red-900/20 rounded-md mb-4">
            <h3 className="font-bold">Error:</h3>
            <p>{error}</p>
            <p className="mt-2 text-sm">Showing demo data as fallback.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="month" stroke="#6b7280" />
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
              />
              <Legend />
              <Bar
                dataKey="count"
                fill="#a78bfa"
                name={`${selectedYear} Users`}
                radius={[4, 4, 0, 0]}
              >
                <LabelList dataKey="count" position="top" fill="#a78bfa" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
