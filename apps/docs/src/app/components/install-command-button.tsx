"use client";

import { useState } from "react";

import {
  Snippet,
  SnippetCopyButton,
  SnippetHeader,
  SnippetTabsContent,
  SnippetTabsList,
  SnippetTabsTrigger,
} from "@/components/ui/shadcn-io/snippet";
import { BlurFade } from "./ui/blur-fade";

const commands = [
  {
    label: "npm",
    code: "npm install promptsmith-ts",
  },
  {
    label: "yarn",
    code: "yarn add promptsmith-ts",
  },
  {
    label: "pnpm",
    code: "pnpm add promptsmith-ts",
  },
  {
    label: "bun",
    code: "bun add promptsmith-ts",
  },
];

export const InstallCommand = () => {
  const [value, setValue] = useState(commands[0].label);
  const activeCommand = commands.find((command) => command.label === value);

  return (
    <BlurFade delay={1} inView>
      <Snippet className="bg-background" onValueChange={setValue} value={value}>
        <SnippetHeader className="bg-background p-2">
          <SnippetTabsList className="bg-border">
            {commands.map((command) => (
              <SnippetTabsTrigger
                className="mx-1 text-muted-foreground shadow-none"
                key={command.label}
                value={command.label}
              >
                <span>{command.label}</span>
              </SnippetTabsTrigger>
            ))}
          </SnippetTabsList>
          {activeCommand && <SnippetCopyButton value={activeCommand.code} />}
        </SnippetHeader>
        {commands.map((command) => (
          <SnippetTabsContent key={command.label} value={command.label}>
            {command.code}
          </SnippetTabsContent>
        ))}
      </Snippet>
    </BlurFade>
  );
};
