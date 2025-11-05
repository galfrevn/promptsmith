"use client";

import Image from "next/image";
import Link from "next/link";

import { PrompsmithIcons } from "@/components/icons";

const menuItems = [
  { id: 1, name: "Features", href: "#features" },
  { id: 2, name: "Quick Start", href: "#quick-start" },
  { id: 3, name: "Docs", href: "/docs" },
];

export const Navbar = () => (
  <header className="border-muted border-b bg-black">
    <nav className="flex w-full items-center justify-between px-12 py-4">
      <Link
        className="flex items-center gap-4 transition-transform duration-300 hover:rotate-6 hover:scale-105"
        href={"/"}
      >
        <Image
          alt="Promptsmith application logo: stylized icon representing AI-powered prompt creation"
          height={36}
          src="/promptsmith.svg"
          width={36}
        />
      </Link>

      <div className="hidden md:flex">
        <ul className="flex gap-8 text-sm">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                className="block text-md text-muted-foreground duration-200 hover:text-accent-foreground"
                href={item.href}
              >
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <a
        className="flex items-center gap-2 text-md text-primary transition-colors duration-200 hover:text-primary/80"
        href="https://github.com/galfrevn/promptsmith"
        rel="noopener"
        target="_blank"
      >
        <PrompsmithIcons.Github size={18} />
        Github
      </a>
    </nav>
  </header>
);
