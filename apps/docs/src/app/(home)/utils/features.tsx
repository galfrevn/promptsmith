import { PromptsmithIcons } from "@/components/icons";

export const features = [
  {
    id: 1,
    icon: <PromptsmithIcons.Puzzle aria-hidden="true" className="size-6" />,
    title: "Modular prompt system",
    description:
      "Structure and reuse prompts effortlessly across your projects.",
  },
  {
    id: 2,
    icon: (
      <PromptsmithIcons.Flashlight
        aria-hidden="true"
        className="size-6 text-primary"
      />
    ),
    title: "Fast & Type-Safe",
    description:
      "Enjoy high performance and confidence with full TypeScript support.",
  },
  {
    id: 3,
    icon: (
      <PromptsmithIcons.GitBranch
        aria-hidden="true"
        className="size-6 text-primary"
      />
    ),
    title: "Start faster with 7 templates.",
    description: "Customize them or build your own — no boilerplate needed.",
  },
];
