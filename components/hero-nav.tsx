import Link from "next/link";
import { NamedLogoWithLink } from "./logo";
import { buttonVariants } from "./ui/button";
import ToggleTheme from "./toggle";

export default function HeroNav() {
  return (
    <nav className="sticky top-0 mb-7 flex h-24 w-full flex-row items-center justify-between bg-background">
      <NamedLogoWithLink />
      {/* <h6>Custom AI Application</h6> */}
      <div className="flex flex-row items-end">
        {/* <Link
          href="/login"
          className={buttonVariants({
            variant: "link",
            className: "text-base sm:ml-3",
            size: "sm",
          })}
        >
          Login
        </Link>
        <Link
          href="/register"
          className={buttonVariants({
            variant: "link",
            className: "text-base",
            size: "sm",
          })}
        >
          Register
        </Link> */}
        {/* <Link
          href="/chat"
          className={buttonVariants({
            variant: "link",
            className: "text-base sm:ml-3",
            size: "sm",
          })}
        >
          General Chat
        </Link> */}
        <Link
          href="/qoutes"
          className={buttonVariants({
            variant: "link",
            className: "text-base",
            size: "sm",
          })}
        >
          Qoutes Generator
        </Link>
        <ToggleTheme />

      </div>
    </nav>
  );
}
