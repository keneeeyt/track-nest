"use client"
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Links = [
  {
    name: "Dashboard",
    href: "/store",
  },
  {
    name: "Transactions",
    href: "/store/transactions",
  },
  {
    name: "Orders",
    href: "/store/orders",
  },
  {
    name: "Expenses",
    href: "/store/expenses",
  },
  {
    name: "Products",
    href: "/store/products",
  },
  {
    name: "Inventories",
    href: "/store/inventories",
  },
  {
    name: "Settings",
    href: "/store/settings",
  }
];

const StoreNavigation = () => {
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

export default StoreNavigation;
