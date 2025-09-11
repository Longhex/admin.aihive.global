import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ArrowUpRight } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string
  change?: string
  icon: React.ReactNode
  stats?: Array<{ label: string; value: string }>
  description?: string
  totalUsers?: number
  monthlyRevenuePerUser?: number
  isUserCount?: boolean
  isLoading?: boolean
}

export function MetricCard({
  title,
  value,
  change,
  icon,
  stats,
  description,
  totalUsers,
  monthlyRevenuePerUser,
  isUserCount = false,
  isLoading = false,
}: MetricCardProps) {
  return (
    <Card className="bg-gray-900 border-gray-800 rounded-xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-400">{title}</h3>
          <div className="text-gray-400">{icon}</div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            <div className="flex items-baseline space-x-3">
              <div className="text-3xl font-bold text-white">{totalUsers !== undefined ? totalUsers : value}</div>
              {change && (
                <div
                  className={cn(
                    "flex items-center text-xs font-medium rounded-full px-2 py-1",
                    change.startsWith("+") ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400",
                  )}
                >
                  {change.startsWith("+") && <ArrowUpRight className="h-3 w-3 mr-1" />}
                  {change}
                </div>
              )}
            </div>
            {description && <div className="text-sm text-gray-400">{description}</div>}
            {stats && (
              <div className="mt-2 flex items-center space-x-4">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center space-x-1">
                    <span className="text-sm text-white">{stat.value}</span>
                    <span className="text-xs text-gray-400">{stat.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
