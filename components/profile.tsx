import { getUser } from "@/lib/auth";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import UserApi from "./user-api";
import { UserIcon } from "lucide-react";

export default async function Profile() {
  // const session = await getUser();
  // if (!session?.user) return null;
  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="link" size="sm">
            <UserIcon className="flex h-5 w-5 sm:hidden" />
            <span className="hidden sm:flex">My API key</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>My account</DialogTitle>
            {/* <div className="flex flex-col gap-6 pb-4 pt-8">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" disabled value={session.user.email ?? ""} />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="username">Username</Label>
                <Input disabled id="username" value={session.user.name ?? ""} />
              </div>
            </div> */}
            <div className="flex flex-col gap-6 pb-4 pt-8">
              <UserApi />
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
