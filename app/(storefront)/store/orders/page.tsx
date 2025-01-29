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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuShortcut,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import { ArrowUpDown, LoaderIcon, MoreHorizontal, ReceiptText } from "lucide-react"; //eslint-disable-line
import Link from "next/link";
// import Link from "next/link"; 
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { startOfMonth, endOfMonth } from 'date-fns'

interface Order {
  _id: string;
  order_total: number;
  order_type: number;
  order_date: string;
}
const OrderPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string | null>(null); //eslint-disable-line
  const [open, setOpen] = useState<boolean>(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));

  useEffect(() => {
    const getOrders = async () => {
      setIsLoading(true);
      try {
        const resp = await axios.get<{orders: Order[], totalOrderPrice: number}>(`/api/order?startDate=${startDate}&endDate=${endDate}`);
        const orders = resp.data.orders;
        const total = resp.data.totalOrderPrice;
        setOrders(orders);
        setTotalIncome(total);
      } catch (err) {
        console.error("Error fetching orders:", err);
        toast.error("Something went wrong. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    getOrders();
  }, [endDate]); //eslint-disable-line

  const deleteOrder = async () => {
    try {
      setIsDeleteLoading(true);
      if (orderId) {
        await axios.delete(`/api/order/${orderId}`);
        const newOrders = orders.filter(
          (order) => order._id !== orderId
        );
        setOrders(newOrders);
        toast.success("Order deleted successfully.");
      } else {
        toast.error("Something went wrong. Please try again later.");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsDeleteLoading(false);
      setOpen(false);
    }
  };


  const handleDateChange = (date: any) => { //eslint-disable-line
    setStartDate(date?.from || startOfMonth(new Date()))
    setEndDate(date?.to || endOfMonth(new Date()))
  }


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
            Order ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      header: "Order Type",
      accessorKey: "order_type",
    },
    {
      header: "Total Price",
      accessorKey: "order_total",
      cell: ({ row }: { row: any }) => //eslint-disable-line
        `₱${row.original.order_total.toLocaleString()}`,
    },
    {
      header: "Date",
      accessorKey: "order_date",
      cell: ({ row }: { row: any }) => //eslint-disable-line
        new Intl.DateTimeFormat("en-US").format(
          new Date(row.original.createdAt)
        ),
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
              <Link href={`/store/orders/${row.original._id}`}>View</Link>
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
      setOrderId(id);
    } else {
      toast.error("Something went wrong. Please try again later.");
    }
  };

  return (
    <>
      <Card>
      <CardHeader className="flex flex-col lg:flex-row gap-2 items-center lg:items-center justify-between">
          <div>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            Below is a comprehensive list of all the orders. You can view,
            edit, and manage order details from this table.
          </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xl text-green-500">
            <ReceiptText />
            <p>+ {`₱${totalIncome.toLocaleString()}`}</p>
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
              data={orders}
              link={"/store/orders/create"}
              AddName="Add Order"
              searchBy={"_id"}
              showDateRange={true}
              startDate={startDate}
              endDate={endDate}
              handleDateChange={handleDateChange}
            />
          )}
        </CardContent>
      </Card>
      <CustomModal
        open={open}
        onClose={() => setOpen(false)}
        title="Delete Order"
        description="Are you sure you want to delete this order?"
        color="red"
        onConfirm={() => deleteOrder()}
        loading={isDeleteLoading}
      />
    </>
  );
};

export default OrderPage;
