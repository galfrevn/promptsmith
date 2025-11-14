"use client";

import { DropdownMenuRadioGroup } from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PromptsmithIcons } from "../icons";
import { menuItems } from "./navbar";

export const MobileNavbarMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
      <DropdownMenuTrigger asChild>
        <button type="button">
          <PromptsmithIcons.Menu aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mt-2 ml-10 w-40 bg-background px-4 py-4">
        <DropdownMenuRadioGroup>
          <ul className="flex w-full flex-col gap-4 text-sm">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  className="block w-full rounded-lg border border-muted px-4 py-2 text-md text-muted-foreground duration-200 hover:text-accent-foreground"
                  href={item.href}
                >
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
