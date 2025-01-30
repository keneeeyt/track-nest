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


interface User {
  first_name: string;
  email: string;
  createdAt: string;
  _id: string;
}


const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);

  useEffect(() => {
    const getUsers = async () => {
      setIsLoading(true);
      try {
        const resp = await axios.get<User[]>('/api/users');
        setUsers(resp.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        toast.error('Something went wrong. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    getUsers();
  }, []);

  const deleteUser = async () => {
    try{
      setIsDeleteLoading(true);
      if(userId){
        await axios.delete(`/api/users/${userId}`);
        const newUsers = users.filter((user) => user._id !== userId);
        setUsers(newUsers);
        toast.success('User deleted successfully.');
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

  const handleOpenModal = async (id: string) => {
    if(id){
      setOpen(true);
      setUserId(id);
    } else {
      toast.error('Something went wrong. Please try again later.');
    }
  }

  const columns: ColumnDef<User>[] = [
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
      accessorKey: "first_name",
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
      header: "Email",
      accessorKey: "email",
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
              <Link href={`/admin/users/${row.original._id}`}>Edit</Link>
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

  return (
    <>
      <Card>
        <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>Efficiently manage your users and access detailed information about their activities and profiles.</CardDescription>
        </CardHeader>
        <CardContent>
        {isLoading ? (
            <div className="flex items-center justify-center gap-3 mt-32 mb-32">
              <LoaderIcon className="h-5 w-5 animate-spin" /> <span className="text-muted-foreground">Loading data</span>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={users}
              link={"/admin/users/create"}
              AddName="Add User"
              searchBy={"first_name"}
              showAddButton={true}
            />
          )}
        </CardContent>
      </Card>
      <CustomModal
        open={open}
        onClose={() => setOpen(false)}
        title="Delete User"
        description="Are you sure you want to delete this user?"
        color="red"
        onConfirm={() => deleteUser()}
        loading={isDeleteLoading}
      />
    </>
  )
}

export default UsersPage;