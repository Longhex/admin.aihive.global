"use client";

import { DailyUserRegistrationChart } from "@/components/dashboard/DailyUserRegistrationChart";
import { ExpiredAccountsModule } from "@/components/dashboard/ExpiredAccountsModule";
import {
  ExpiringAccountsTable,
  getTotalExpiringAccounts,
} from "@/components/dashboard/ExpiringAccountsTable";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TodaysNewUsers } from "@/components/dashboard/TodaysNewUsers";
import { UserCreationYearlyChart } from "@/components/dashboard/UserCreationYearlyChart";
import { UserGrowthLineChart } from "@/components/dashboard/UserGrowthLineChart";
import { UserStatusDonutChart } from "@/components/dashboard/UserStatusDonutChart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isBefore, parseISO } from "date-fns";
import { AlertCircle, ArrowUpRight, UserCheck, UserX } from "lucide-react";
import { useEffect, useState } from "react";

// Register the loading animation
// Remove this import: import { bouncy } from "ldrs"

export default function HomePage() {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  const [expiredAccounts, setExpiredAccounts] = useState<number>(0);
  const [totalExpiringAccounts, setTotalExpiringAccounts] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/users");

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `API request failed with status ${res.status}: ${errorText}`
          );
        }

        const data = await res.json();

        if (!data || !Array.isArray(data.data)) {
          throw new Error("Invalid data format received from API");
        }

        // Check if we're using fallback data
        if (data.message && data.message.includes("fallback")) {
          setUsingFallbackData(true);
        }

        const users = data.data;
        setTotalUsers(users.length);

        // Calculate expired accounts (users with end_date < current date)
        const currentDate = new Date();
        const expiredAccountsCount = users.filter((user: any) => {
          if (!user.end_date) return false;
          try {
            const endDate = parseISO(user.end_date);
            return isBefore(endDate, currentDate);
          } catch (err) {
            console.warn("Error parsing end date:", err);
            return false;
          }
        }).length;

        setExpiredAccounts(expiredAccountsCount);

        // Calculate active users as total users minus expired accounts
        setActiveUsers(users.length - expiredAccountsCount);

        // Calculate expiring accounts this month
        const total = getTotalExpiringAccounts(users);
        setTotalExpiringAccounts(total);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );

        // Set fallback values
        setTotalUsers(3);
        setActiveUsers(2);
        setExpiredAccounts(1);
        setTotalExpiringAccounts(1);
        setUsingFallbackData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <>
      {" "}
      {usingFallbackData && (
        <Alert variant="warning" className="mb-6">
          <AlertTitle>Using Demo Data</AlertTitle>
          <AlertDescription>
            Unable to connect to the live API. Showing demo data for preview
            purposes.
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-800 rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-800 p-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-normal text-white">
                  Users
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <div className="flex items-baseline space-x-3">
                  <div className="text-4xl font-bold text-white">
                    {totalUsers || 0}
                  </div>
                  <div className="flex items-center text-xs font-medium rounded-full px-2 py-1 bg-green-900/50 text-green-400">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +2.4%
                  </div>
                </div>
                <div className="text-sm text-gray-400 mt-1">Total users</div>
              </div>
            </CardContent>
          </Card>

          <MetricCard
            title="Active Users"
            value={activeUsers !== null ? activeUsers.toString() : "Loading..."}
            icon={<UserCheck className="h-4 w-4" />}
            description="Total active users"
            change="+1.1%"
            isLoading={loading}
          />

          <MetricCard
            title="Expired Accounts"
            value={
              expiredAccounts !== null
                ? expiredAccounts.toString()
                : "Loading..."
            }
            icon={<UserX className="h-4 w-4" />}
            description="Users with end date in the past"
            change="-0.8%"
            isLoading={loading}
          />

          <MetricCard
            title="Expiring This Month"
            value={
              totalExpiringAccounts !== null
                ? totalExpiringAccounts.toString()
                : "Loading..."
            }
            icon={<AlertCircle className="h-4 w-4" />}
            description="Accounts expiring soon"
            change="+0.5%"
            isLoading={loading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserCreationYearlyChart />
          <UserGrowthLineChart />
        </div>

        <UserStatusDonutChart />

        <DailyUserRegistrationChart />
        <TodaysNewUsers />
        <ExpiringAccountsTable />
        <ExpiredAccountsModule />
      </div>
    </>
  );
}
