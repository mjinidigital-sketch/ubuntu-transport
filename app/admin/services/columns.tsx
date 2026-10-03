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

export type ServiceRow = {
    _id: string;
    name: string;
    description?: string;
    price: string;
    pricingType: "hourly" | "project" | "per_item" | "subscription";
    category?: string;
    duration?: string;
    features?: string[];
    imageUrl?: string;
    icon?: string;
    active: boolean;
    order?: number;
    _creationTime: number;
};

const PRICING_TYPE_COLORS: Record<string, string> = {
    hourly: "bg-blue-100 text-blue-700",
    project: "bg-purple-100 text-purple-700",
    per_item: "bg-green-100 text-green-700",
    subscription: "bg-orange-100 text-orange-700",
};

interface ColumnsProps {
    currentUserRole?: string;
    onEdit: (service: ServiceRow) => void;
    onDelete: (service: ServiceRow) => void;
}

export function getColumns({
    currentUserRole,
    onEdit,
    onDelete,
}: ColumnsProps): LegacyColumnDef<ServiceRow, any>[] {
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
                <span className="font-medium">{row.getValue("name")}</span>
            ),
        },
        // Description
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }: { row: any }) => (
                <span className="text-muted-foreground max-w-xs truncate">
                    {row.getValue("description") ?? "—"}
                </span>
            ),
        },
        // Price
        {
            accessorKey: "price",
            header: ({ column }: { column: any }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Price
                    <ArrowUpDown className="ml-2 size-4" />
                </Button>
            ),
            cell: ({ row }: { row: any }) => (
                <span className="font-medium">{row.getValue("price")}</span>
            ),
        },
        // Pricing Type
        {
            accessorKey: "pricingType",
            header: "Pricing Type",
            cell: ({ row }: { row: any }) => {
                const pricingType = row.getValue("pricingType") as string;
                return (
                    <Badge
                        className={PRICING_TYPE_COLORS[pricingType] ?? PRICING_TYPE_COLORS.hourly}
                        variant="outline"
                    >
                        {pricingType}
                    </Badge>
                );
            },
            filterFn: (row: any, id: any, value: any) => value.includes(row.getValue(id)),
        },
        // Category
        {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }: { row: any }) => (
                <span className="text-muted-foreground">
                    {row.getValue("category") ?? "—"}
                </span>
            ),
        },
        // Duration
        {
            accessorKey: "duration",
            header: "Duration",
            cell: ({ row }: { row: any }) => (
                <span className="text-muted-foreground">
                    {row.getValue("duration") ?? "—"}
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
                const service = row.original;
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
                                            onClick={() => onEdit(service)}
                                            className="cursor-pointer"
                                        >
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => onDelete(service)}
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
