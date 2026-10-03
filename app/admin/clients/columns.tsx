"use client";

import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { ArrowUpDown, MoreHorizontal, User, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ClientRow = {
    _id: string;
    name: string;
    userId?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    companyName?: string;
    taxId?: string;
    notes?: string;
    active: boolean;
    user?: any;
    _creationTime: number;
};

interface ColumnsProps {
    currentUserRole?: string;
    users: any[];
    onEdit: (client: ClientRow) => void;
    onDelete: (client: ClientRow) => void;
}

export function getColumns({
    currentUserRole,
    users,
    onEdit,
    onDelete,
}: ColumnsProps): LegacyColumnDef<ClientRow, any>[] {
    const canManage = currentUserRole && ["superadmin", "admin", "staff"].includes(currentUserRole);

    return [
        // Select column
        {
            id: "select",
            header: ({ table }: any) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }: any) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(v) => row.toggleSelected(!!v)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        // Name
        {
            accessorKey: "name",
            header: ({ column }: { column: any }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 size-4" />
                </Button>
            ),
            cell: ({ row }: { row: any }) => (
                <div className="flex items-center gap-2">
                    <span className="font-medium">{row.getValue("name")}</span>
                    {row.original.userId && (
                        <User className="size-4 text-muted-foreground" aria-label="Linked to user" />
                    )}
                </div>
            ),
        },
        // Company Name
        {
            accessorKey: "companyName",
            header: "Company",
            cell: ({ row }: { row: any }) => (
                <span className="text-muted-foreground">
                    {row.getValue("companyName") ?? "—"}
                </span>
            ),
        },
        // Email
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }: { row: any }) => (
                <span className="text-muted-foreground">
                    {row.getValue("email") ?? "—"}
                </span>
            ),
        },
        // Phone
        {
            accessorKey: "phone",
            header: "Phone",
            cell: ({ row }: { row: any }) => (
                <span className="text-muted-foreground">
                    {row.getValue("phone") ?? "—"}
                </span>
            ),
        },
        // Location
        {
            accessorKey: "city",
            header: "Location",
            cell: ({ row }: { row: any }) => {
                const city = row.getValue("city");
                const state = row.original.state;
                const country = row.original.country;
                const location = [city, state, country].filter(Boolean).join(", ");
                return <span className="text-muted-foreground">{location || "—"}</span>;
            },
        },
        // Tax ID
        {
            accessorKey: "taxId",
            header: "Tax ID",
            cell: ({ row }: { row: any }) => (
                <span className="text-muted-foreground">
                    {row.getValue("taxId") ?? "—"}
                </span>
            ),
        },
        // Active Status
        {
            accessorKey: "active",
            header: "Status",
            cell: ({ row }: { row: any }) => {
                const active = row.getValue("active") as boolean;
                return (
                    <Badge
                        className={active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
                        variant="outline"
                    >
                        {active ? "Active" : "Inactive"}
                    </Badge>
                );
            },
        },
        // Created
        {
            accessorKey: "_creationTime",
            header: ({ column }: { column: any }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Created
                    <ArrowUpDown className="ml-2 size-4" />
                </Button>
            ),
            cell: ({ row }: { row: any }) =>
                new Date(row.getValue("_creationTime")).toLocaleDateString(),
        },
        // Actions
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }: { row: any }) => {
                const client = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <div
                                role="button"
                                className="flex size-8 items-center justify-center rounded-md hover:bg-muted cursor-pointer"
                            >
                                <MoreHorizontal className="size-4" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                {canManage && (
                                    <>
                                        <DropdownMenuItem
                                            onClick={() => onEdit(client)}
                                            className="cursor-pointer"
                                        >
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => onDelete(client)}
                                            className="cursor-pointer text-red-500 focus:text-red-500"
                                        >
                                            Delete
                                        </DropdownMenuItem>
                                    </>
                                )}
                                {!canManage && (
                                    <DropdownMenuItem disabled>No actions</DropdownMenuItem>
                                )}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
}
