"use client";
import { ReactNode, useEffect, useState } from "react";
import AdminNavigation from "./_components/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LogOut, MenuIcon, UserRoundPen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Image from "next/image";
import Link from "next/link";

function AdminLayout({ children }: { readonly children: ReactNode }) {
  interface User {
    profile_image: string;
    // add other properties as needed
  }

  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const profile_pic = Cookies.get("profile_image") || "";
    if (profile_pic) {
      setUser({
        profile_image: String(profile_pic) || "", // provide a default value if necessary
        // add other properties as needed
      });
    }
  }, []);

  const Signout = async () => {
    try {
      const resp = await axios.post("/api/auth/signout");
      toast.success(resp.data.message);
      router.push("/");
    } catch (err) {
      toast.error("Something went wrong. Please try again later.");
    }
  };
  return (
    <div className="flex w-full flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-white">
        <nav className="hidden font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <AdminNavigation />
        </nav>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant={"outline"}
              className="shrink-0 md:hidden"
              size={"icon"}
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side={"left"}>
            <nav className="grid gap-6 text-lg font-medium mt-5">
              <AdminNavigation />
            </nav>
          </SheetContent>
        </Sheet>

        <DropdownMenu>
          <DropdownMenuTrigger className="border-none focus:outline-none">
            <Avatar>
              <Image
                src={`${
                  user?.profile_image ??
                  "https://res.cloudinary.com/dzosecp8f/image/upload/v1677940151/blank-profile-picture-g2b8faf720_1280_eks7er.png"
                }`}
                alt="user-profile"
                width={50}
                height={50}
                className="object-cover"
              />
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/admin/settings/profile">
              {" "}
              <DropdownMenuItem>
                <UserRoundPen className="mr-2 h-4 w-4" />
                <span>Profile</span>
                <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>{" "}
            </Link>
            <DropdownMenuItem onClick={Signout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <main className="my-5">{children}</main>
    </div>
  );
}

export default AdminLayout;
