"use client"
import CustomModal from "@/components/custom-modal";
import { DataTable } from "@/components/custom/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import { ArrowUpDown, LoaderIcon, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Store {
  Store_name: string;
  phone_number: string;
  address: string;
  owner_name: string;
  createdAt: string;
  _id: string;
}

const StorePage = () => {
    const [stores, setStores] = useState<Store[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [storeId, setStoreId] = useState<string | null>(null);
    const [open, setOpen] = useState<boolean>(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);


    useEffect(() => {
      const getStores = async () => {
        setIsLoading(true);
        try {
          const resp = await axios.get<Store[]>('/api/store');
          setStores(resp.data);
        } catch (err) {
          console.error('Error fetching stores:', err);
          toast.error('Something went wrong. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      };
      getStores();
    }, []);

    const deleteStore = async () => {
      try{
        setIsDeleteLoading(true);
        if(storeId){
          await axios.delete(`/api/store/${storeId}`);
          const newStores = stores.filter((store) => store._id !== storeId);
          setStores(newStores);
          toast.success('Store deleted successfully.');
        } else {
          toast.error('Something went wrong. Please try again later.');
        }
      }catch(err){
        console.error('Error deleting user:', err);
        toast.error('Something went wrong. Please try again later.');
      } finally {
        setIsDeleteLoading(false);
        setOpen(false);
      }
    }

    const columns: ColumnDef<Store>[] = [
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
        accessorKey: "store_name",
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
        header: "Store Owner",
        accessorKey: "owner_name",
      },
      {
        header: "Phone Number",
        accessorKey: "phone_number",
      },
      {
        header: "Address",
        accessorKey: "address",
      },
      {
        header: "Date",
        accessorKey: "createdAt",
        cell: ({ row }: { row: { original: { createdAt: string } } }) =>
          new Intl.DateTimeFormat("en-US").format(
            new Date(row.original.createdAt)
          ),
      },
      {
        header: "Actions",
        accessorKey: "actions",
        cell: ({ row }: { row: { original: { _id: string } } }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size={"icon"} variant={"ghost"} className="outline-none">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/stores/${row.original._id}`}>Edit</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {handleOpenModal(row.original._id)}}>
                Delete
                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ];

    const handleOpenModal = async (id: string) => {
      if(id){
        setOpen(true);
        setStoreId(id);
      } else {
        toast.error('Something went wrong. Please try again later.');
      }
    }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Stores</CardTitle>
          <CardDescription>Below is a comprehensive list of all the stores. You can view, edit, and manage store details from this table.</CardDescription>
        </CardHeader>
        <CardContent>
        {isLoading ? (
            <div className="flex items-center justify-center gap-3 mt-32 mb-32">
              <LoaderIcon className="h-5 w-5 animate-spin" /> <span className="text-muted-foreground">Loading data</span>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={stores}
              link={"/admin/stores/create"}
              AddName="Add Store"
              searchBy={"store_name"}
              showAddButton={true}
            />
          )}
        </CardContent>
      </Card>
      <CustomModal
        open={open}
        onClose={() => setOpen(false)}
        title="Delete Store"
        description="Are you sure you want to delete this store?"
        color="red"
        onConfirm={() => deleteStore()}
        loading={isDeleteLoading}
      />
    </>
  )
}

export default StorePage;