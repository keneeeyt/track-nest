import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { NextSSRPlugin} from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import NextTopLoader from "nextjs-toploader";
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
        <NextTopLoader
            color="#0C7DFE"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #2299DD,0 0 5px #2299DD"
          />
        <div className="2xl:px-20">{children}</div>
        <Toaster richColors />
      </body>
    </html>
  );
}
