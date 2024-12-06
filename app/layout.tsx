import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const outfit = Outfit({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "Track Nest",
  description: "Centralize all your financial and inventory data.",
};

import { ReactNode } from "react";

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    <html lang="en">
      <body className={outfit.className}>
            <div className="2xl:px-20">{children}</div>
            <Toaster richColors />
      </body>
    </html>
  );
}