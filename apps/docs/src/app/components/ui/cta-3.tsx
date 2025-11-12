import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PromptsmithIcons } from "../icons";

type CallToActionBannerProps = {
  title: string;
  text: string;
};

export function CallToActionBanner({ title, text }: CallToActionBannerProps) {
  return (
    <div className="relative mx-auto flex w-full flex-col justify-between gap-y-6 border-y bg-[radial-gradient(35%_80%_at_25%_0%,--theme(--color-foreground/.08),transparent)] px-6 py-12">
      <PlusIcon
        className="absolute top-[-12.5px] left-[-11.5px] z-1 size-6"
        strokeWidth={1}
      />
      <PlusIcon
        className="absolute top-[-12.5px] right-[-11.5px] z-1 size-6"
        strokeWidth={1}
      />
      <PlusIcon
        className="absolute bottom-[-12.5px] left-[-11.5px] z-1 size-6"
        strokeWidth={1}
      />
      <PlusIcon
        className="absolute right-[-11.5px] bottom-[-12.5px] z-1 size-6"
        strokeWidth={1}
      />

      <div className="-inset-y-6 pointer-events-none absolute left-0 w-px border-l" />
      <div className="-inset-y-6 pointer-events-none absolute right-0 w-px border-r" />

      <div className="-z-10 absolute top-0 left-1/2 h-full border-l border-dashed" />

      <div className="space-y-2">
        <h2 className="mx-auto text-center font-normal text-2xl tracking-normal lg:text-4xl">
          {title}
        </h2>
        <p className="text-center text-md text-muted-foreground">{text}</p>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button
          asChild
          className="w-full rounded-sm bg-foreground/90 text-black backdrop-blur-2xl sm:w-auto"
        >
          <a href="https://www.npmjs.com/package/promptsmith-ts">Get started</a>
        </Button>
        <Button
          asChild
          className="flex items-center gap-2 rounded-sm border border-primary bg-transparent transition-colors duration-300 hover:bg-foreground/10"
        >
          <Link href="https://github.com/galfrevn/promptsmith">
            View docs{" "}
            <PromptsmithIcons.ArrowRight
              aria-hidden="true"
              className="size-4"
            />
          </Link>
        </Button>
      </div>
    </div>
  );
}
