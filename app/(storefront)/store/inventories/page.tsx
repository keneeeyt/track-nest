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
import { toast } from "sonner";
import axios from "axios";
import { cn } from "@/lib/utils";
import { exportToExcel } from "@/lib/export-excel";

interface Inventory {
  product: string; // get all the products in the owner store
  price: number; // gett all the prices in the owner store
  quantity_onhand: number; // i dont have a original quantity onhand can you get this by comparing the quantity sold in orders.order_items and the current quantity in the product module
  quantity_sold: number; // get all the quantity sold in the orders using the product _id in the order module under orders there is a order_items property its an array of products
  inventory_value: number; // if you get the original quantity on hand you can add the quantity on hand to product price and get the total value
  sales_value: number; // add the quantity sold in the product price and get the total value
  available_stock: number; // get the product_quantity in the product module since its dynamic
  status: string; // if the product_quantity in the product module is 0 then use out of stock if its less than 10 use low stock else in stock
}

const InventoryPage = () => {
  const [inventoryData, setInventoryData] = useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      try {
        const resp = await axios.get<Inventory[]>(
          `/api/inventories`
        );
        const inventories = resp.data;
        setInventoryData(inventories);
      } catch (Err) {
        console.error("Error fetching transactions:", Err);
        toast.error("Something went wrong. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, []); // eslint-disable-line


  const handleExport = () => {
    exportToExcel(inventoryData, "inventory_report");
  };

  const columns: ColumnDef<any>[] = [ // eslint-disable-line
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
      accessorKey: "product",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Product
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      header: "Product Price",
      accessorKey: "price",
      cell: ({ row }: { row: any }) => { // eslint-disable-line
        const price = row.original.price;
        return `₱${price.toLocaleString()}`; // Add peso sign and format with commas
      },
    },
    {
      header: "Quantity in Hand",
      accessorKey: "quantity_onhand",
    },
    {
      header: "Quantity Sold",
      accessorKey: "quantity_sold",
    },
    {
      header: "Inventory Value",
      accessorKey: "inventory_value",
      cell: ({ row }: { row: any }) => { // eslint-disable-line
        const inventoryValue = row.original.inventory_value;
        return `₱${inventoryValue.toLocaleString()}`; // Add peso sign and format with commas
      },
    },
    {
      header: "Sales Value",
      accessorKey: "sales_value",
      cell: ({ row }: { row: any }) => { // eslint-disable-line
        const salesValue = row.original.sales_value;
        return `₱${salesValue.toLocaleString()}`; // Add peso sign and format with commas
      },
    },
    {
      header: "Available Stock",
      accessorKey: "available_stock",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }: { row: any }) => { // eslint-disable-line
        let statusClass = "bg-green-200";
        if (row.original.status === "Out of Stock") {
          statusClass = "bg-red-200";
        } else if (row.original.status === "Low Stock") {
          statusClass = "bg-yellow-200";
        }
  
        return (
          <div className={cn(statusClass, "text-center text-xs rounded-lg p-1")}>
            {row.original.status}
          </div>
        );
      },
    },
  ];

  return (
    <Card>
      <CardHeader className="flex lg:flex-row items-center justify-between gap-5">
        <div>
        <CardTitle>Inventories</CardTitle>
        <CardDescription>
          A complete solution for tracking products, product prices, stock levels,
          sales, inventory value, and availability, providing real-time insights
          for better management.
        </CardDescription>
        </div>
        <Button className="w-full lg:w-auto" onClick={handleExport} variant={"outline"}>
          Export to Excel
        </Button>
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
            data={inventoryData}
            searchBy={"product"}
            showDateRange={false}
            searchTitle="Search by product name..."
          />
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryPage;
