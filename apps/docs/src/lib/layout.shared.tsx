import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <Image
            alt="Promptsmith"
            className="rounded-full"
            height={20}
            src="/promptsmith.svg"
            width={20}
          />
          <span>Promptsmith</span>
        </>
      ),
    },
  };
}
