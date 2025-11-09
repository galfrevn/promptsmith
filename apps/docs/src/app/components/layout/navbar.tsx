"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { PromptsmithIcons } from "@/components/icons";
import { MobileNavbarMenu } from "./mobile-navbar-menu";

export const menuItems = [
  { id: 1, name: "Features", href: "#features" },
  { id: 2, name: "Quick Start", href: "#quick-start" },
  { id: 3, name: "Docs", href: "https://github.com/galfrevn/promptsmith" },
];

export const Navbar = () => (
  <motion.header
    className="fixed top-0 left-0 z-50 w-full border-muted border-b bg-black"
    initial={{ opacity: 0, backdropFilter: "blur(20px)" }}
    transition={{ duration: 1.5, type: "spring", delay: 0.25 }}
    whileInView={{ opacity: 1.5, backdropFilter: "blur(0px)" }}
  >
    <nav className="flex w-full items-center justify-between px-12 py-4">
      <div className="flex md:hidden">
        <MobileNavbarMenu />
      </div>
      <Link
        className="flex items-center gap-4 transition-transform duration-300 hover:rotate-6 hover:scale-105 hover:opacity-95"
        href={"/"}
      >
        <Image
          alt="Promptsmith application logo: stylized icon representing AI-powered prompt creation"
          height={48}
          src="/promptsmith-icon.svg"
          width={48}
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
        <PromptsmithIcons.Github
          aria-hidden="true"
          className="size-6 md:size-5"
        />
        <span className="hidden md:flex">Github</span>
      </a>
    </nav>
  </motion.header>
);
