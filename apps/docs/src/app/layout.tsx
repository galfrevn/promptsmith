import { geistMono, geistSans } from "@/styles/font";
import "@/styles/globals.css";

export { metadata } from "@/lib/metadata";

import { Navbar } from "@/components/layout/navbar";
import Footer from "./components/layout/footer";

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
