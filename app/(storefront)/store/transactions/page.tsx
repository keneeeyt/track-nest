"use client";
import { DataTable } from "@/components/custom/data-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, LoaderIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";
import axios from "axios";
import { cn } from "@/lib/utils";

interface Transaction {
  _id: string;
  transaction_total: number;
  status: string;
  transaction_type: string;
  transaction_date: string;
}

const TransactionPage = () => {
  const [transactionData, setTransactionData] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));

  const handleDateChange = (date: any) => { //eslint-disable-line
    setStartDate(date?.from || startOfMonth(new Date()));
    setEndDate(date?.to || endOfMonth(new Date()));
  };

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      try {
        const resp = await axios.get<{ transactions: Transaction[] }>(
          `/api/transactions?startDate=${startDate}&endDate=${endDate}`
        );
        const transactions = resp.data.transactions;
        setTransactionData(transactions);
      } catch (Err) {
        console.error("Error fetching transactions:", Err);
        toast.error("Something went wrong. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, [endDate]); // eslint-disable-line

  const columns: ColumnDef<any>[] = [ //eslint-disable-line
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "_id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Transaction ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      header: "Transaction Type",
      accessorKey: "transaction_type",
    },
    {
      header: "Total Price",
      accessorKey: "transaction_total",
      cell: ({ row }: { row: any }) => { // eslint-disable-line
        return (
          <div
            className={cn(
              row.original.transaction_type === "expenses"
                ? "bg-red-200"
                : "bg-green-200",
              "text-center rounded-lg p-1"
            )}
          >
            {row.original.transaction_type === "expenses" ? "-" : "+"} ₱
            {row.original.transaction_total.toLocaleString()}
          </div>
        );
      },
    },
    {
      header: "Date",
      accessorKey: "transaction_date",
      cell: (
        { row }: { row: any } //eslint-disable-line
      ) =>
        new Intl.DateTimeFormat("en-US").format(
          new Date(row.original.createdAt)
        ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
        <CardDescription>
          This page provides a comprehensive view of all transactions made in
          the store. It includes detailed information about each transaction,
          such as the items purchased, total amount, transaction date, and type
          of transaction. This allows store owners to effectively manage and
          review customer transactions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center gap-3 mt-32 mb-32">
            <LoaderIcon className="h-5 w-5 animate-spin" />{" "}
            <span className="text-muted-foreground">Loading data</span>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={transactionData}
            AddName="Add Order"
            searchBy={"transaction_type"}
            showDateRange={true}
            startDate={startDate}
            endDate={endDate}
            handleDateChange={handleDateChange}
            searchTitle="Search by transaction type..."
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionPage;
