"use client"
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Links = [
  {
    name: "Dashboard",
    href: "/admin",
  },
  {
    name: "Users",
    href: "/admin/users",
  },
  {
    name: "Stores",
    href: "/admin/stores",
  },
  {
    name: "Settings",
    href: "/admin/settings",
  },
];

const AdminNavigation = () => {
  const pathname = usePathname();
  return (
    <>
      {Links.map((link) => {
        return (
          <Link
            href={link.href}
            key={link.name}
            className={cn(
              link.href === pathname
                ? "text-primary-500"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {link.name}
          </Link>
        );
      })}
    </>
  );
};

export default AdminNavigation;
