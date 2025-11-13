import Image from "next/image";
import Link from "next/link";
import { BlurFade } from "./components/ui/blur-fade";
import { Button } from "./components/ui/button";

const NotFound = () => (
  <section className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
    <BlurFade delay={0.2}>
      <Image
        alt="MrBean waiting 404 error Gif"
        className="rounded-lg"
        height={480}
        src="/404.gif"
        width={480}
      />
    </BlurFade>

    <BlurFade delay={0.4}>
      <h1 className="font-semibold text-5xl text-white">404 Error</h1>
    </BlurFade>

    <BlurFade delay={0.6} inView>
      <p className="max-w-lg text-lg text-muted-foreground">
        The link might be broken or the route may have been removed. Try going
        back to the homepage.
      </p>
    </BlurFade>

    <BlurFade delay={0.8}>
      <Link href={"/"}>
        <Button className="rounded-sm bg-foreground/90 text-black backdrop-blur-2xl">
          Go Home
        </Button>
      </Link>
    </BlurFade>
  </section>
);

export default NotFound;
