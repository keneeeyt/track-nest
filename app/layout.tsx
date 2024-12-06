import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { NextSSRPlugin} from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
const outfit = Outfit({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "Track Nest",
  description: "Centralize all your financial and inventory data.",
};

import { ReactNode } from "react";
import { ourFileRouter } from "./api/uploadthing/core";

export default function RootLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <div className="2xl:px-20">{children}</div>
        <Toaster richColors />
      </body>
    </html>
  );
}
