"use client";

import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
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
import { Role } from "@/app/schemas/user";

export type UserRow = {
    _id: string;
    name?: string;
    email?: string;
    role?: Role;
    _creationTime: number;
};

const ROLE_COLORS: Record<string, string> = {
    superadmin: "bg-red-100 text-red-700",
    admin: "bg-blue-100 text-blue-700",
    staff: "bg-yellow-100 text-yellow-700",
    customer: "bg-green-100 text-green-700",
    user: "bg-gray-100 text-gray-700",
};

const ADMIN_ROLES = ["superadmin", "admin"];

interface ColumnsProps {
    currentUserRole?: string;
    onEditRole: (user: UserRow) => void;
    onDelete: (user: UserRow) => void;
}

export function getColumns({
    currentUserRole,
    onEditRole,
    onDelete,
}: ColumnsProps): LegacyColumnDef<UserRow, any>[] {
    const canManage = currentUserRole && ADMIN_ROLES.includes(currentUserRole);

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
                <span className="font-medium">{row.getValue("name") ?? "—"}</span>
            ),
        },
        // Email
        {
            accessorKey: "email",
            header: ({ column }: { column: any }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Email
                    <ArrowUpDown className="ml-2 size-4" />
                </Button>
            ),
            cell: ({ row }: { row: any }) => (
                <span className="text-muted-foreground">
                    {row.getValue("email") ?? "—"}
                </span>
            ),
        },
        // Role
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }: { row: any }) => {
                const role = row.getValue("role") as string | undefined;
                return (
                    <Badge
                        className={ROLE_COLORS[role ?? "user"] ?? ROLE_COLORS.user}
                        variant="outline"
                    >
                        {role ?? "user"}
                    </Badge>
                );
            },
            filterFn: (row: any, id: any, value: any) => value.includes(row.getValue(id)),
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
                const user = row.original;
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
                                            onClick={() => onEditRole(user)}
                                            className="cursor-pointer"
                                        >
                                            Edit Role
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => onDelete(user)}
                                            className="cursor-pointer text-red-500 focus:text-red-500"
                                        >
                                            Delete User
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