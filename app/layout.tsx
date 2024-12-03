import { Outfit } from "next/font/google";
import "./globals.css";


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
            <div className="md:px-20">{children}</div>
      </body>
    </html>
  );
}