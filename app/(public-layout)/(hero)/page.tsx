import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center gap-5">
      <h3 className="text-center text-4xl font-bold">
        Welcome !
      </h3>
      {/* <p className="mx-auto text-center text-muted-foreground sm:w-[75%]">
        built by hitesh labs
      </p> */}
      <Link href="/qoutes" className={buttonVariants({ size: "lg" })}>
        Get started
      </Link>
    </div>
  );
}
