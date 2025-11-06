import { geistMono, geistSans } from "@/styles/font";
import "@/styles/globals.css";

import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
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
      <head>
        <link
          href="/promptsmith-white.svg"
          media="(prefers-color-scheme: light)"
          rel="icon"
          type="image/svg+xml"
        />
        <link
          href="/promptsmith-black.svg"
          media="(prefers-color-scheme: dark)"
          rel="icon"
          type="image/svg+xml"
        />
        <link href="/promptsmith-white.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
