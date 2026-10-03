"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { checkAdminAuth } from "@/app/actions/users";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Loader2Icon } from "lucide-react";

function AdminLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        async function checkAuth() {
            try {
                const result = await checkAdminAuth();
                if (result.authorized) {
                    setIsAuthorized(true);
                } else {
                    router.push("/unauthorized");
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                router.push("/unauthorized");
            } finally {
                setIsLoading(false);
            }
        }

        checkAuth();
    }, [router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-muted-foreground"> <Loader2Icon className="size-12 animate-spin mr-2" /> Loading...</div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null; // Router will redirect
    }

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-muted-foreground"> <Loader2Icon className="size-12 animate-spin mr-2" /> Loading...</div>
            </div>
        }>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </Suspense>
    );
}
