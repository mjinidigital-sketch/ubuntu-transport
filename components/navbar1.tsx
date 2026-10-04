"use client";

import { Book, Menu, Sunset, Trees, Zap, ChevronDown, Package } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTransition, useMemo, memo, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { getNavbarPages, getOrganizationSettings } from "@/app/actions/navbar";
import { TopBar } from "@/components/TopBar";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useStableQuery } from "@/hooks/useStableQuery";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

interface Navbar1Props {
  className?: string;
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
    className?: string;
  };
  menu?: MenuItem[];
  auth?: {
    login: { title: string; url: string };
    signup: { title: string; url: string };
  };
}

// Roles considered as staff/admin
const ADMIN_ROLES = ["admin", "super_admin", "staff"];

// Account menu for authenticated users
function AccountMenu() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const user = useQuery(api.users.viewer);

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

  return (
    <DropdownMenu>
      {/* Fix 1: Use a plain div as trigger, not Button, to avoid nested button */}
      <DropdownMenuTrigger>
        <div
          role="button"
          className="bg-primary dark:bg-card text-primary-foreground dark:text-white/80 flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium hover:bg-primary/80 dark:hover:bg-primary/30 cursor-pointer"
        >
          <Avatar className="size-6">
            <AvatarImage src={user?.image ?? ""} alt={user?.name ?? "User"} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden md:block">{user?.name ?? "Account"}</span>
          <ChevronDown className="size-3" />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 p-4 rounded-2xl">

        {/* Fix 2: Wrap label inside DropdownMenuGroup */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="font-semibold text-sm">{user?.name ?? "User"}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {user?.email ?? ""}
            </span>
            {isAdminRole && (
              <span className="text-sm font-medium text-blue-600 capitalize mt-0.5">
                {user?.role?.replace("_", " ")}
              </span>
            )}
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Admin-only link */}
        {isAdminRole && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push("/admin")}
                className="cursor-pointer bg-card "
              >
                Admin Dashboard
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Common links */}
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => router.push("/blog")}
            className="cursor-pointer border-border hover:text-primary hover:bg-primary/20 focus:text-primary focus:bg-primary/10"
          >
            Blog
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/collections")}
            className="cursor-pointer border-border hover:text-primary hover:bg-primary/20 focus:text-primary focus:bg-primary/10"
          >
            Collections
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/admin")}
            className="cursor-pointer border-border hover:text-primary hover:bg-primary/20 focus:text-primary focus:bg-primary/10"
          >
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/chat")}
            className="cursor-pointer border-border hover:text-primary hover:bg-primary/20 focus:text-primary focus:bg-primary/10"
          >
            Chat
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/forms")}
            className="cursor-pointer border-border hover:text-primary hover:bg-primary/20 focus:text-primary focus:bg-primary/10"
          >
            Forms
          </DropdownMenuItem>

        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup className="flex items-center">
          <DropdownMenuItem
            onClick={handleSignOut}
            disabled={isPending}
            className="cursor-pointer bg-primary text-white  w-fit px-8 rounded-full text-sm"
          >
            {isPending ? "Signing out..." : "Sign out"}
          </DropdownMenuItem>
        </DropdownMenuGroup>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Mobile account menu
function MobileAccountMenu() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const user = useQuery(api.users.viewer);

  const isAdminRole = user?.role && ADMIN_ROLES.includes(user.role);

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

  return (
    <div className="flex flex-col gap-3 border-t pt-4">
      {/* User info */}
      <div className="flex items-center gap-3 px-1">
        <Avatar className="size-9">
          <AvatarImage src={user?.image ?? ""} alt={user?.name ?? "User"} />
          <AvatarFallback>
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{user?.name ?? "User"}</span>
          <span className="text-xs text-muted-foreground">
            {user?.email ?? ""}
          </span>
          {isAdminRole && (
            <span className="text-xs font-medium text-blue-600 capitalize">
              {user?.role?.replace("_", " ")}
            </span>
          )}
        </div>
      </div>

      {/* Admin link */}
      {isAdminRole && (
        <Button
          variant="outline"
          onClick={() => router.push("/admin")}
          className="w-full justify-start"
        >
          Admin Dashboard
        </Button>
      )}

      <Button
        variant="outline"
        onClick={() => router.push("/blog")}
        className="w-full justify-start"
      >
        Blog
      </Button>

      <Button
        variant="outline"
        onClick={() => router.push("/collections")}
        className="w-full justify-start"
      >
        Collections
      </Button>

      <Button
        variant="outline"
        onClick={() => router.push("/chat")}
        className="w-full justify-start"
      >
        Chat
      </Button>

      <Button
        variant="outline"
        onClick={() => router.push("/forms")}
        className="w-full justify-start"
      >
        Forms
      </Button>



      <Button
        variant="outline"
        onClick={handleSignOut}
        disabled={isPending}
        className="w-full justify-start text-red-500 border-red-200"
      >
        {isPending ? "Signing out..." : "Sign out"}
      </Button>
    </div>
  );
}

const Navbar1Component = ({
  logo = {
    url: "/",
    src: "/ubuntu-logo.webp",
    alt: "logo",
    title: "",
  },
  menu = [],
  auth = {
    login: { title: "Login", url: "/login" },
    signup: { title: "Sign up", url: "/signup" },
  },
  className,
}: Navbar1Props) => {
  const [pages, setPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orgSettings, setOrgSettings] = useState<any>(null);
  const pathname = usePathname();

  // Fetch pages from server action on mount
  useEffect(() => {
    async function loadPages() {
      try {
        const data = await getNavbarPages();
        setPages(data);
      } catch (error) {
        console.error("Failed to load navbar pages:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadPages();
  }, []);

  // Fetch organization settings on mount
  useEffect(() => {
    async function loadOrgSettings() {
      try {
        const org = await getOrganizationSettings();
        setOrgSettings(org);
      } catch (error) {
        console.error("Failed to load organization settings:", error);
      }
    }
    loadOrgSettings();
  }, []);

  // Use organization settings for contact info
  const email = orgSettings?.emailEnabled ? orgSettings?.email || "support@example.com" : "support@example.com";
  const phone = orgSettings?.phoneEnabled ? orgSettings?.phone || "+1 (555) 123-4567" : "+1 (555) 123-4567";
  const address = orgSettings?.addressEnabled ? orgSettings?.address || "123 Main St, City, State 12345" : "123 Main St, City, State 12345";
  const socials = {
    facebook: orgSettings?.facebookEnabled ? orgSettings?.facebook : undefined,
    twitter: orgSettings?.twitterEnabled ? orgSettings?.twitter : undefined,
    instagram: orgSettings?.instagramEnabled ? orgSettings?.instagram : undefined,
    linkedin: orgSettings?.linkedinEnabled ? orgSettings?.linkedin : undefined,
    youtube: orgSettings?.youtubeEnabled ? orgSettings?.youtube : undefined,
  };

  // Convert pages to menu format (simplified - no icons for main links)
  const dynamicMenu = useMemo(() => {
    return pages?.map((page) => {
      const menuItem: MenuItem = {
        title: page.title,
        url: `/${page.slug}`,
      };

      // Only add dropdown items if needed (collections or similar)
      // For now, keeping it simple with flat structure
      return menuItem;
    }) || [];
  }, [pages]);

  // Check if a menu item is active
  const isActive = (url: string) => {
    if (url === "/" && pathname === "/") return true;
    if (url !== "/" && pathname.startsWith(url)) return true;
    return false;
  };

  // Render functions that need access to pathname
  const renderMenuItem = useMemo(() => (item: MenuItem) => {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuLink
          href={item.url}
          className={cn(
            "text-sm font-medium hover:text-secondary cursor-pointer transition-colors",
            isActive(item.url)
              ? "text-primary font-semibold"
              : "text-foreground hover:text-primary"
          )}
        >
          {item.title}
        </NavigationMenuLink>
      </NavigationMenuItem>
    );
  }, [pathname]);

  const renderMobileMenuItem = useMemo(() => (item: MenuItem) => {
    if (item.items) {
      return (
        <AccordionItem
          key={item.title}
          value={item.title}
          className="border-b-0"
        >
          <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
            {item.title}
          </AccordionTrigger>
          <AccordionContent className="mt-2">
            {item.items.map((subItem) => (
              <Link
                key={subItem.title}
                href={subItem.url}
                className={cn(
                  "flex min-w-80 flex-row gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-muted hover:text-accent-foreground",
                  isActive(subItem.url) ? "bg-primary/10 text-primary font-semibold" : ""
                )}
              >
                <div className="text-foreground">{subItem.icon}</div>
                <div>
                  <div className="text-sm font-semibold">{subItem.title}</div>
                  {subItem.description && (
                    <p className="text-sm leading-snug text-muted-foreground">
                      {subItem.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </AccordionContent>
        </AccordionItem>
      );
    }

    return (
      <Link
        key={item.title}
        href={item.url}
        className={cn(
          "text-md font-semibold transition-colors",
          isActive(item.url) ? "text-primary" : "text-foreground"
        )}
      >
        {item.title}
      </Link>
    );
  }, [pathname]);
  return (
    <>

      <TopBar email={email} phone={phone} address={address} socials={socials} />

      <section className={cn("py-1 border-b dark:border-primary/20", className)}>
        <div className="px-4 md:px-8 lg:px-12 mx-auto">

          {/* Desktop Menu */}
          {/* Desktop Menu */}
          <nav className="hidden lg:flex lg:items-center lg:justify-between lg:gap-6 w-full">
            {/* Left — Logo */}
            <div className="flex items-center justify-start p-1 rounded-full bg-white/80 w-fit">
              <Link
                href={logo.url}
                className="flex items-center gap-2"
              >
                <img
                  src={logo.src}
                  className="max-h-16 w-auto object-contain "
                  alt={logo.alt}
                />

                {logo.title && (
                  <span className="text-lg font-semibold tracking-tight">
                    {logo.title}
                  </span>
                )}
              </Link>
            </div>

            {/* Center — Navigation */}
            <div className="flex items-center justify-center flex-1">
              <NavigationMenu className="">
                <NavigationMenuList className="gap-1">
                  {dynamicMenu.map((item) => (
                    <NavigationMenuItem key={item.title}>
                      <NavigationMenuLink
                        href={item.url}
                        className={cn(
                          "text-sm font-medium hover:text-secondary cursor-pointer transition-colors",
                          isActive(item.url)
                            ? "text-primary dark:text-secondary underline underline-offset-8 font-semibold"
                            : "text-foreground hover:text-secondary"
                        )}
                      >
                        {item.title}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Right — Auth + Theme */}
            <div className="flex items-center justify-end gap-3">
              <Unauthenticated>
                <Link href={auth.login.url} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                  {auth.login.title}
                </Link>

                <Link href={auth.signup.url} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                  {auth.signup.title}
                </Link>
              </Unauthenticated>

              <Authenticated>
                <AccountMenu />
              </Authenticated>

              <ModeToggle />
            </div>
          </nav>


          {/* Mobile Menu */}
          <div className="block lg:hidden">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href={logo.url} className="flex items-center gap-2">
                <img
                  src={logo.src}
                  className="max-h-8 dark:invert"
                  alt={logo.alt}
                />
              </Link>
              <Sheet>
                <SheetTrigger
                  render={<Button variant="outline" size="icon" />}
                >
                  <Menu className="size-4" />
                </SheetTrigger>
                <SheetContent className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>
                      <Link href={logo.url} className="flex items-center gap-2">
                        <img
                          src={logo.src}
                          className="max-h-8 dark:invert"
                          alt={logo.alt}
                        />
                      </Link>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-6 p-4 rounded-xl">
                    <Accordion className="flex w-full flex-col gap-4 rounded-none p-4">
                      {dynamicMenu.map((item) => {
                        if (item.items) {
                          return (
                            <AccordionItem
                              key={item.title}
                              value={item.title}
                              className="border-b-0"
                            >
                              <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
                                {item.title}
                              </AccordionTrigger>
                              <AccordionContent className="mt-2">
                                {item.items.map((subItem) => (
                                  <Link
                                    key={subItem.title}
                                    href={subItem.url}
                                    className={cn(
                                      "flex min-w-80 flex-row gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-muted hover:text-accent-foreground",
                                      isActive(subItem.url) ? "bg-primary/10 text-primary font-semibold" : ""
                                    )}
                                  >
                                    <div className="text-foreground">{subItem.icon}</div>
                                    <div>
                                      <div className="text-sm font-semibold">{subItem.title}</div>
                                      {subItem.description && (
                                        <p className="text-sm leading-snug text-muted-foreground">
                                          {subItem.description}
                                        </p>
                                      )}
                                    </div>
                                  </Link>
                                ))}
                              </AccordionContent>
                            </AccordionItem>
                          );
                        }

                        return (
                          <Link
                            key={item.title}
                            href={item.url}
                            className={cn(
                              "text-md font-semibold transition-colors",
                              isActive(item.url) ? "text-primary" : "text-foreground"
                            )}
                          >
                            {item.title}
                          </Link>
                        );
                      })}
                    </Accordion>

                    {/* Mobile Auth */}
                    <Unauthenticated>
                      <div className="flex flex-col gap-3">
                        <Link href={auth.login.url} className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                          {auth.login.title}
                        </Link>
                        <Link href={auth.signup.url} className={cn(buttonVariants({}), "w-full")}>
                          {auth.signup.title}
                        </Link>
                      </div>
                    </Unauthenticated>
                    <Authenticated>
                      <MobileAccountMenu />
                    </Authenticated>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

        </div>
      </section>
    </>
  );
};

export const Navbar1 = memo(Navbar1Component);