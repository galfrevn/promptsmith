import { geistMono, geistSans } from "@/styles/font";
import "@/styles/globals.css";

import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import Footer from "./components/layout/footer";
import { baseMetadata } from "./lib/metadata";

export const metadata: Metadata = {
  ...baseMetadata,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} dark bg-black antialiased`}
      >
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
