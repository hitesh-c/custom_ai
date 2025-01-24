import Link from "next/link";
import { buttonVariants } from "./ui/button";
import ToggleTheme from "./toggle";
import { NamedLogoWithLink } from "./logo";
import Profile from "./profile";
import { SquarePen } from "lucide-react";

const btnVariant = buttonVariants({
  variant: "link",
  className: "text-base flex flex-row item-center",
  size: "sm",
});

export default function Navbar() {
  return (
    <nav className="mmb-2 sticky top-0 flex h-24 w-full flex-row items-center justify-between bg-background sm:mb-7">
      <NamedLogoWithLink />
      {/* <h6>www.hiteshlabs.com</h6> */}
      <div className="flex flex-row items-center">
        <div className="flex flex-row items-center sm:ml-3">
          {/* <Link href="/chat" className={btnVariant}>
            <SquarePen className="flex h-5 w-5 sm:hidden" />
            <span className="hidden sm:flex">New chat</span>
          </Link> */}
          {/* <Profile /> */}
        </div>
      </div>
      <ToggleTheme />
    </nav>
  );
}
