"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, parseISO, isThisMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import saveAs from "file-saver";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  end_date?: string;
}

export function ExpiringAccountsTable() {
  const [expiringAccounts, setExpiringAccounts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalExpiringAccounts, setTotalExpiringAccounts] = useState<number>(0);
  const itemsPerPage = 10;
  const [pageSize, setPageSize] = useState(itemsPerPage);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await axios.get("/api/users", {
          params: {
            expiring: true,
            page: currentPage,
            isThisMonthFilter: true,
            pageSize: showAll ? 10000000 : pageSize,
          },
        });
        const data = res.data;
        if (!Array.isArray(data.data)) {
          throw new Error("Invalid data format received from API");
        }

        setExpiringAccounts(data?.data || []);
        setTotalExpiringAccounts(data?.total || 0);
        setError(null);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showAll, currentPage]);

  const exportToCSV = async () => {
    setIsDownloading(true);
    const headers = ["Name", "Email", "End Date"];
    try {
      const res = await axios.get("/api/users", {
        params: {
          expiring: true,
          page: 1,
          isThisMonthFilter: true,
          pageSize: 1000000, // Large number to fetch all
        },
      });
      const data = res.data;
      if (!Array.isArray(data.data)) {
        throw new Error("Invalid data format received from API");
      }
      const expiringAccounts: User[] = data?.data || [];
      const csvContent = [
        headers.join(","),
        ...expiringAccounts.map(
          (account) =>
            `${account.name},${account.email},${
              account.end_date || "No end date"
            }`
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "expiring_accounts.csv");
      setIsDownloading(false);
    } catch (error) {
      setIsDownloading(false);
      throw error;
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800 rounded-xl overflow-hidden">
      <CardHeader className="border-b border-gray-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-normal text-white">
              Accounts Expiring This Month
            </CardTitle>
            <p className="text-sm text-gray-400 mt-1">
              Total expiring accounts: {totalExpiringAccounts}
            </p>
          </div>
          {totalExpiringAccounts > 0 && (
            <Button
              isLoading={isDownloading}
              onClick={exportToCSV}
              className="bg-indigo-600 text-white hover:bg-indigo-700 border-0"
            >
              Export to CSV
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-gray-400 text-lg">
              Loading expiring accounts...
            </p>
          </div>
        ) : error ? (
          <div className="text-red-400 p-4 bg-red-900/20 rounded-md">
            <h3 className="font-bold">Error:</h3>
            <p>{error}</p>
          </div>
        ) : totalExpiringAccounts > 0 ? (
          <>
            <div className="overflow-x-auto">
              <Table className="border-collapse">
                <TableHeader>
                  <TableRow className="border-b border-gray-800">
                    <TableHead className="text-gray-300 py-3 px-4">
                      Name
                    </TableHead>
                    <TableHead className="text-gray-300 py-3 px-4">
                      Email
                    </TableHead>
                    <TableHead className="text-gray-300 py-3 px-4">
                      End Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expiringAccounts.map((account, index) => (
                    <TableRow
                      key={`${account.id}-${account.email}-${index}`}
                      className="border-b border-gray-800"
                    >
                      <TableCell className="font-medium py-3 px-4 text-white">
                        {account.name}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-gray-300">
                        {account.email}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-gray-300">
                        {account.end_date
                          ? format(parseISO(account.end_date), "dd MMM yyyy")
                          : "No end date"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* {!showAll && totalExpiringAccounts > 5 && (
              <div className="mt-4 flex justify-center">
                <Button
                  onClick={() => setShowAll(true)}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 border-0"
                >
                  View All
                </Button>
              </div>
            )} */}
            {/* {showAll && ( */}
            <div className="mt-4 flex justify-between items-center">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-indigo-600 text-white hover:bg-indigo-700 border-0 disabled:bg-gray-700"
              >
                Previous
              </Button>
              <span className="text-gray-300">
                Page {currentPage} of{" "}
                {Math.ceil(totalExpiringAccounts / pageSize)}
              </span>
              <Button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      Math.ceil(totalExpiringAccounts / pageSize)
                    )
                  )
                }
                disabled={
                  currentPage === Math.ceil(totalExpiringAccounts / pageSize)
                }
                className="bg-indigo-600 text-white hover:bg-indigo-700 border-0 disabled:bg-gray-700"
              >
                Next
              </Button>
            </div>
            {/* )} */}
          </>
        ) : (
          <p className="text-center text-gray-400 mt-4">
            No accounts expiring this month.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
