"use client";
import CustomModal from "@/components/custom-modal";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import { ArrowUpDown, LoaderIcon, MoreHorizontal, Receipt } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface Expense {
  _id: string;
  expenses_title: string;
  expenses_price: string;
  expenses_description: string;
  expenses_date: Date;
}

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expenseId, setExpensesId] = useState<string | null>(null);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);

  useEffect(() => {
    const getExpenses = async () => {
      setIsLoading(true);
      try {
        const resp = await axios.get<{ expenses: Expense[], totalExpensesPrice: number }>("/api/expense");
        const expenses = resp.data.expenses;
        const total = resp.data.totalExpensesPrice;
        setExpenses(expenses);
        setTotalExpenses(total);
      } catch (err) {
        console.error("Error fetching expenses:", err);
        toast.error("Something went wrong. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    getExpenses();
  }, []);

  const deleteExpense = async () => {
    try {
      setIsDeleteLoading(true);
      if (expenseId) {
        await axios.delete(`/api/expense/${expenseId}`);
        const newExpenses = expenses.filter(
          (expense) => expense._id !== expenseId
        );
        setExpenses(newExpenses);
        toast.success("Expense deleted successfully.");
      } else {
        toast.error("Something went wrong. Please try again later.");
      }
    } catch (err) {
      console.error("Error deleting expense:", err);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsDeleteLoading(false);
      setOpen(false);
    }
  };

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
      accessorKey: "expenses_title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      header: "Description",
      accessorKey: "expenses_description",
    },
    {
      header: "Price",
      accessorKey: "expenses_price",
      cell: ({ row }: { row: any }) => //eslint-disable-line
        `₱${row.original.expenses_price.toLocaleString()}`,
    },
    {
      header: "Date",
      accessorKey: "expenses_date",
      cell: ({ row }: { row: any }) => //eslint-disable-line
        new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(new Date(row.original.expenses_date)),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }: { row: any }) => ( //eslint-disable-line
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size={"icon"} variant={"ghost"} className="outline-none">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/store/expenses/${row.original._id}`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleOpenModal(row.original._id)}>
              Delete
              <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleOpenModal = async (id: string) => {
    if (id) {
      setOpen(true);
      setExpensesId(id);
    } else {
      toast.error("Something went wrong. Please try again later.");
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col lg:flex-row gap-2 items-center lg:items-center justify-between">
          <div>
          <CardTitle>Expenses</CardTitle>
          <CardDescription>
            Below is a comprehensive list of all the expenses. You can view,
            edit, and manage expenses details from this table.
          </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xl text-red-500">
            <Receipt />
            <p>- {`₱${totalExpenses.toLocaleString()}`}</p>
          </div>
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
              data={expenses}
              link={"/store/expenses/create"}
              AddName="Add Expense"
              searchBy={"expenses_title"}
            />
          )}
        </CardContent>
      </Card>
      <CustomModal
        open={open}
        onClose={() => setOpen(false)}
        title="Delete Expense"
        description="Are you sure you want to delete this expense?"
        color="red"
        onConfirm={() => deleteExpense()}
        loading={isDeleteLoading}
      />
    </>
  );
};

export default ExpensesPage;
