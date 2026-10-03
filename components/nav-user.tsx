"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DotsThreeVerticalIcon,
  UserCircleIcon,
  CreditCardIcon,
  BellIcon,
  SignOutIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useStableQuery } from "@/hooks/useStableQuery";


const ADMIN_ROLES = ["admin", "super_admin", "staff"];

export function NavUser() {
  const { isMobile } = useSidebar();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Fix: removed static user prop — use live Convex query instead
  const user = useStableQuery(api.users.viewer);

  const isAdminRole = user?.role && ADMIN_ROLES.includes(user.role);

  const initials = user?.name
    ? user.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
    : "U";

  const handleSignOut = () => {
    startTransition(async () => {
      try {
        await signOut();
        toast.success("Signed out successfully");
        router.push("/");
      } catch {
        toast.error("Failed to sign out. Please try again.");
      }
    });
  };

  // Show skeleton while loading
  if (user === undefined) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <Avatar className="size-8 rounded-lg grayscale">
              <AvatarFallback className="rounded-lg">...</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium text-muted-foreground">
                Loading...
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="aria-expanded:bg-muted cursor-pointer"
                disabled={isPending}
              />
            }
          >
            <Avatar className="size-8 rounded-lg grayscale">
              <AvatarImage
                src={user?.image ?? ""}
                alt={user?.name ?? "User"}
              />
              <AvatarFallback className="rounded-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {user?.name ?? "User"}
              </span>
              <span className="truncate text-xs text-foreground/70">
                {user?.email ?? ""}
              </span>
            </div>
            <DotsThreeVerticalIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            {/* User info header */}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage
                      src={user?.image ?? ""}
                      alt={user?.name ?? "User"}
                    />
                    <AvatarFallback className="rounded-lg">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {user?.name ?? "User"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email ?? ""}
                    </span>
                    {/* Role badge for admin/staff */}
                    {isAdminRole && (
                      <span className="truncate text-xs font-medium text-blue-600 capitalize">
                        {user?.role?.replace("_", " ")}
                      </span>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Admin-only link */}
            {isAdminRole && (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => router.push("/admin")}
                    className="cursor-pointer"
                  >
                    <ShieldCheckIcon />
                    Admin Dashboard
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </>
            )}



            <DropdownMenuSeparator />

            {/* Sign out */}
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={handleSignOut}
                disabled={isPending}
                className="cursor-pointer text-red-500 focus:text-red-500"
              >
                <SignOutIcon />
                {isPending ? "Signing out..." : "Log out"}
              </DropdownMenuItem>
            </DropdownMenuGroup>

          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}