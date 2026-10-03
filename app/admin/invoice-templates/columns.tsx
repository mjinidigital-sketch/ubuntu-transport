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

export type TemplateRow = {
    _id: string;
    name: string;
    description?: string;
    style: "modern" | "classic" | "minimal";
    primaryColor?: string;
    secondaryColor?: string;
    logoPosition: "left" | "center" | "right";
    showLogo: boolean;
    showStamps: boolean;
    showCompanyDetails: boolean;
    showPaymentDetails: boolean;
    showTerms: boolean;
    defaultTerms?: string;
    active: boolean;
    _creationTime: number;
};

const STYLE_COLORS: Record<string, string> = {
    modern: "bg-blue-100 text-blue-700",
    classic: "bg-amber-100 text-amber-700",
    minimal: "bg-gray-100 text-gray-700",
};

interface ColumnsProps {
    currentUserRole?: string;
    onEdit: (template: TemplateRow) => void;
    onDelete: (template: TemplateRow) => void;
}

export function getColumns({
    currentUserRole,
    onEdit,
    onDelete,
}: ColumnsProps): LegacyColumnDef<TemplateRow, any>[] {
    const canManage = currentUserRole && ["superadmin", "admin"].includes(currentUserRole);

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
        // Style
        {
            accessorKey: "style",
            header: "Style",
            cell: ({ row }: { row: any }) => {
                const style = row.getValue("style") as string;
                return (
                    <Badge
                        className={STYLE_COLORS[style] ?? STYLE_COLORS.modern}
                        variant="outline"
                    >
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                    </Badge>
                );
            },
            filterFn: (row: any, id: any, value: any) => value.includes(row.getValue(id)),
        },
        // Primary Color
        {
            accessorKey: "primaryColor",
            header: "Primary Color",
            cell: ({ row }: { row: any }) => {
                const color = row.getValue("primaryColor");
                return color ? (
                    <div className="flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: color }}
                        />
                        <span className="text-muted-foreground">{color}</span>
                    </div>
                ) : (
                    <span className="text-muted-foreground">—</span>
                );
            },
        },
        // Logo Position
        {
            accessorKey: "logoPosition",
            header: "Logo Position",
            cell: ({ row }: { row: any }) => {
                const position = row.getValue("logoPosition") as string;
                return (
                    <span className="text-muted-foreground capitalize">{position}</span>
                );
            },
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
                const template = row.original;
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
                                            onClick={() => onEdit(template)}
                                            className="cursor-pointer"
                                        >
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => onDelete(template)}
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
