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
import { ArrowUpDown, LoaderIcon, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface Product {
  _id: string;
  product_name: string;
  price: number;
  quantity: number;
  product_image: string;
}
const ProductPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);

  useEffect(() => {
    const getProducts = async () => {
      setIsLoading(true);
      try {
        const resp = await axios.get<Product[]>("/api/product");
        setProducts(resp.data);
      } catch (err) {
        console.error("Error fetching products:", err);
        toast.error("Something went wrong. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    getProducts();
  }, []);

  const deleteProduct = async () => {
    try {
      setIsDeleteLoading(true);
      if (productId) {
        await axios.delete(`/api/product/${productId}`);
        const newProducts = products.filter(
          (product) => product._id !== productId
        );
        setProducts(newProducts);
        toast.success("Product deleted successfully.");
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
      header: "Image",
      accessorKey: "product_image",
      cell: ({ row }: { row: any }) => ( //eslint-disable-line
        <Image
          src={row.original.product_image}
          alt="product image"
          height={64}
          width={64}
          className="rounded-md object-cover h-16 w-16"
        />
      ),
    },
    {
      accessorKey: "product_name",
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
      header: "Quantity",
      accessorKey: "quantity",
    },
    {
      header: "Price",
      accessorKey: "price",
      cell: ({ row }: { row: any }) => //eslint-disable-line
        `₱${row.original.price.toLocaleString()}`,
    },
    {
      header: "Date",
      accessorKey: "createdAt",
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
              <Link href={`/store/products/${row.original._id}`}>Edit</Link>
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
      setProductId(id);
    } else {
      toast.error("Something went wrong. Please try again later.");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Below is a comprehensive list of all the products. You can view,
            edit, and manage product details from this table.
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
              data={products}
              link={"/store/products/create"}
              AddName="Add Product"
              searchBy={"product_name"}
            />
          )}
        </CardContent>
      </Card>
      <CustomModal
        open={open}
        onClose={() => setOpen(false)}
        title="Delete Product"
        description="Are you sure you want to delete this product?"
        color="red"
        onConfirm={() => deleteProduct()}
        loading={isDeleteLoading}
      />
    </>
  );
};

export default ProductPage;
