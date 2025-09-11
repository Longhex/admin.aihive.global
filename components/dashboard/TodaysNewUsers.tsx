"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format, parseISO } from "date-fns"
import { Users, Clock, Download, CalendarIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import saveAs from "file-saver"

interface User {
  id: string
  name: string
  email: string
  created_at: string
  end_date?: string
}

export function TodaysNewUsers() {
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [filteredNewUsers, setFilteredNewUsers] = useState<User[]>([])
  const [filteredExpiringUsers, setFilteredExpiringUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("new-users")

  // Date filter states
  const currentDate = new Date()
  const [selectedDay, setSelectedDay] = useState<string>("all")
  const [selectedMonth, setSelectedMonth] = useState<string>(currentDate.getMonth().toString())
  const [selectedYear, setSelectedYear] = useState<string>(currentDate.getFullYear().toString())

  // Generate days for the selected month/year
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const daysInSelectedMonth =
    selectedMonth !== "all" && selectedYear !== "all"
      ? getDaysInMonth(Number.parseInt(selectedYear), Number.parseInt(selectedMonth))
      : 31

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
          throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()
        if (!Array.isArray(data.data)) {
          throw new Error("Invalid data format received from API")
        }

        setAllUsers(data.data)
        applyDateFilters(data.data)
      } catch (err) {
        console.error("Error fetching user data:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")

        // Set empty data as fallback
        setAllUsers([])
        setFilteredNewUsers([])
        setFilteredExpiringUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Apply filters whenever filter values change
  useEffect(() => {
    applyDateFilters(allUsers)
  }, [selectedDay, selectedMonth, selectedYear])

  const applyDateFilters = (users: User[]) => {
    if (!users || users.length === 0) return

    // Filter users based on creation date
    const newUsers = users.filter((user: User) => {
      try {
        const createdDate = new Date(Number.parseInt(user.created_at) * 1000)

        // Apply year filter
        if (selectedYear !== "all" && createdDate.getFullYear() !== Number.parseInt(selectedYear)) {
          return false
        }

        // Apply month filter
        if (selectedMonth !== "all" && createdDate.getMonth() !== Number.parseInt(selectedMonth)) {
          return false
        }

        // Apply day filter
        if (selectedDay !== "all" && createdDate.getDate() !== Number.parseInt(selectedDay)) {
          return false
        }

        return true
      } catch (err) {
        console.warn("Error parsing created date:", err)
        return false
      }
    })

    setFilteredNewUsers(newUsers)

    // Filter users based on expiration date
    const expiringUsers = users.filter((user: User) => {
      if (!user.end_date) return false
      try {
        const endDate = parseISO(user.end_date)

        // Apply year filter
        if (selectedYear !== "all" && endDate.getFullYear() !== Number.parseInt(selectedYear)) {
          return false
        }

        // Apply month filter
        if (selectedMonth !== "all" && endDate.getMonth() !== Number.parseInt(selectedMonth)) {
          return false
        }

        // Apply day filter
        if (selectedDay !== "all" && endDate.getDate() !== Number.parseInt(selectedDay)) {
          return false
        }

        return true
      } catch (err) {
        console.warn("Error parsing end date:", err)
        return false
      }
    })

    setFilteredExpiringUsers(expiringUsers)
  }

  const formatDate = (dateString: string | undefined, isTimestamp = false) => {
    if (!dateString) return "N/A"
    try {
      if (isTimestamp) {
        const date = new Date(Number.parseInt(dateString) * 1000)
        return format(date, "dd MMM yyyy HH:mm:ss")
      } else {
        return format(parseISO(dateString), "dd MMM yyyy HH:mm:ss")
      }
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateString
    }
  }

  const getFilterDescription = () => {
    if (selectedDay === "all" && selectedMonth === "all" && selectedYear === "all") {
      return "All Time"
    }

    let description = ""

    if (selectedDay !== "all") {
      description += `Day ${selectedDay}`
    }

    if (selectedMonth !== "all") {
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
      ]
      description += description
        ? `, ${monthNames[Number.parseInt(selectedMonth)]}`
        : monthNames[Number.parseInt(selectedMonth)]
    }

    if (selectedYear !== "all") {
      description += description ? ` ${selectedYear}` : selectedYear
    }

    return description
  }

  const exportToCSV = () => {
    const users = activeTab === "new-users" ? filteredNewUsers : filteredExpiringUsers
    const dateDescription = getFilterDescription()
    const fileName =
      activeTab === "new-users"
        ? `new_users_${dateDescription.replace(/\s+/g, "_").toLowerCase()}.csv`
        : `expiring_users_${dateDescription.replace(/\s+/g, "_").toLowerCase()}.csv`

    const headers = ["Name", "Email", "Created At", "End Date"]
    const csvContent = [
      headers.join(","),
      ...users.map((user) => {
        const createdAt = formatDate(user.created_at, true)
        const endDate = user.end_date ? formatDate(user.end_date) : "No end date"
        return `${user.name},${user.email},${createdAt},${endDate}`
      }),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    saveAs(blob, fileName)
  }

  return (
    <Card className="bg-gray-900 border-gray-800 rounded-xl overflow-hidden">
      <CardHeader className="border-b border-gray-800 p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-normal text-white">
              User Activity {getFilterDescription() !== "All Time" ? `- ${getFilterDescription()}` : ""}
            </CardTitle>
            {!loading &&
              !error &&
              (activeTab === "new-users" ? filteredNewUsers.length > 0 : filteredExpiringUsers.length > 0) && (
                <Button
                  onClick={exportToCSV}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 border-0"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export to CSV
                </Button>
              )}
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Filter:</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px] h-8 bg-gray-800 text-white border-gray-700">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white border-gray-700">
                  <SelectItem value="all" className="hover:bg-gray-700">
                    All Years
                  </SelectItem>
                  {[2023, 2024, 2025, 2026].map((year) => (
                    <SelectItem key={year} value={year.toString()} className="hover:bg-gray-700">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[120px] h-8 bg-gray-800 text-white border-gray-700">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white border-gray-700">
                  <SelectItem value="all" className="hover:bg-gray-700">
                    All Months
                  </SelectItem>
                  {[
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
                  ].map((month, index) => (
                    <SelectItem key={month} value={index.toString()} className="hover:bg-gray-700">
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="w-[100px] h-8 bg-gray-800 text-white border-gray-700">
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white border-gray-700">
                  <SelectItem value="all" className="hover:bg-gray-700">
                    All Days
                  </SelectItem>
                  {Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={day.toString()} className="hover:bg-gray-700">
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-gray-400 text-lg">Loading user data...</p>
          </div>
        ) : error ? (
          <div className="text-red-400 p-4 bg-red-900/20 rounded-md">
            <h3 className="font-bold">Error:</h3>
            <p>{error}</p>
          </div>
        ) : (
          <Tabs defaultValue="new-users" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-gray-800 mb-6">
              <TabsTrigger value="new-users" className="text-gray-300 data-[state=active]:bg-indigo-600">
                <Users className="h-4 w-4 mr-2" />
                New Users ({filteredNewUsers.length})
              </TabsTrigger>
              <TabsTrigger value="expiring-users" className="text-gray-300 data-[state=active]:bg-indigo-600">
                <Clock className="h-4 w-4 mr-2" />
                Expiring Users ({filteredExpiringUsers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new-users">
              {filteredNewUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table className="border-collapse">
                    <TableHeader>
                      <TableRow className="border-b border-gray-800">
                        <TableHead className="text-gray-300 py-3 px-4">Name</TableHead>
                        <TableHead className="text-gray-300 py-3 px-4">Email</TableHead>
                        <TableHead className="text-gray-300 py-3 px-4">Created At</TableHead>
                        <TableHead className="text-gray-300 py-3 px-4">End Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredNewUsers.map((user, index) => (
                        <TableRow key={index} className="border-b border-gray-800">
                          <TableCell className="font-medium py-3 px-4 text-white">{user.name}</TableCell>
                          <TableCell className="py-3 px-4 text-gray-300">{user.email}</TableCell>
                          <TableCell className="py-3 px-4 text-gray-300">{formatDate(user.created_at, true)}</TableCell>
                          <TableCell className="py-3 px-4 text-gray-300">
                            {user.end_date ? formatDate(user.end_date) : "No end date"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No new users found for the selected period</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="expiring-users">
              {filteredExpiringUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table className="border-collapse">
                    <TableHeader>
                      <TableRow className="border-b border-gray-800">
                        <TableHead className="text-gray-300 py-3 px-4">Name</TableHead>
                        <TableHead className="text-gray-300 py-3 px-4">Email</TableHead>
                        <TableHead className="text-gray-300 py-3 px-4">Created At</TableHead>
                        <TableHead className="text-gray-300 py-3 px-4">End Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpiringUsers.map((user, index) => (
                        <TableRow key={index} className="border-b border-gray-800">
                          <TableCell className="font-medium py-3 px-4 text-white">{user.name}</TableCell>
                          <TableCell className="py-3 px-4 text-gray-300">{user.email}</TableCell>
                          <TableCell className="py-3 px-4 text-gray-300">{formatDate(user.created_at, true)}</TableCell>
                          <TableCell className="py-3 px-4 text-gray-300">
                            {user.end_date ? formatDate(user.end_date) : "No end date"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No expiring users found for the selected period</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
