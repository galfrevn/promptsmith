import type React from "react";
import { CodeBlock } from "@/components/ui/code-block";

type ComparisonCardProps = {
  title: string;
  icon: React.ReactNode;
  code: string;
  items: { id: number; text: string }[];
};

const ComparisonCard = ({ title, icon, code, items }: ComparisonCardProps) => (
  <div className="w-full space-y-6">
    <h3 className="flex items-center gap-2 text-xl">
      <span className="rounded-sm border border-muted p-2">{icon}</span>
      {title}
    </h3>
    <CodeBlock className="bg-background" code={code} language="tsx" />
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          className="flex items-center gap-2 text-md text-muted-foreground"
          key={item.id}
        >
          <span className="text-sm">{icon}</span>
          {item.text}
        </li>
      ))}
    </ul>
  </div>
);

export default ComparisonCard;
