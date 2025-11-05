import type { Metadata } from "next";

import { geistMono, geistSans } from "@/styles/font";
import "@/styles/globals.css";

import { Navbar } from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: "Prompsmith",
  description: "Craft, organize, and share AI prompts easily with Promptsmith.",
  icons: {
    icon: "/promptsmith.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
