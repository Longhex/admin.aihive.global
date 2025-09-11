"use client"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function RealTimeSales() {
  return (
    <Card className="bg-[#1a1c1e] text-gray-100 border-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-normal text-gray-300">Real-Time Sale</CardTitle>
        <Tabs defaultValue="day" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-3 bg-[#2a2c2e]">
            <TabsTrigger value="day" className="text-gray-300 data-[state=active]:bg-[#3a3c3e]">
              Day
            </TabsTrigger>
            <TabsTrigger value="week" className="text-gray-300 data-[state=active]:bg-[#3a3c3e]">
              Week
            </TabsTrigger>
            <TabsTrigger value="month" className="text-gray-300 data-[state=active]:bg-[#3a3c3e]">
              Month
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
    </Card>
  )
}
