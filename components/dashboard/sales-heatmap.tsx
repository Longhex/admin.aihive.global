import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SalesHeatmap() {
  return (
    <Card className="bg-[#1a1c1e] text-gray-100 border-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-normal text-gray-300">Sales heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] text-gray-400">
          {/* Heatmap will be implemented here */}
          Heatmap placeholder
        </div>
      </CardContent>
    </Card>
  )
}
