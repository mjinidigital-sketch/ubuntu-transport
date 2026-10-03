"use client";

import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { ArrowUpDown, MoreHorizontal, Eye } from "lucide-react";
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

export type ReceiptRow = {
    _id: string;
    receiptNumber: string;
    invoiceId: string;
    clientId: string;
    receiptDate: number;
    amount: string;
    paymentMethod: "cash" | "bank_transfer" | "credit_card" | "debit_card" | "check" | "other";
    paymentReference?: string;
    notes?: string;
    invoice?: any;
    client?: any;
    _creationTime: number;
};

const PAYMENT_METHOD_COLORS: Record<string, string> = {
    cash: "bg-green-100 text-green-700",
    bank_transfer: "bg-blue-100 text-blue-700",
    credit_card: "bg-purple-100 text-purple-700",
    debit_card: "bg-indigo-100 text-indigo-700",
    check: "bg-yellow-100 text-yellow-700",
    other: "bg-gray-100 text-gray-700",
};

interface ColumnsProps {
    currentUserRole?: string;
    onEdit: (receipt: ReceiptRow) => void;
    onDelete: (receipt: ReceiptRow) => void;
    onPreview?: (receipt: ReceiptRow) => void;
}

export function getColumns({
    currentUserRole,
    onEdit,
    onDelete,
    onPreview,
}: ColumnsProps): LegacyColumnDef<ReceiptRow, any>[] {
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
        // Receipt Number
        {
            accessorKey: "receiptNumber",
            header: ({ column }: { column: any }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Receipt #
                    <ArrowUpDown className="ml-2 size-4" />
                </Button>
            ),
            cell: ({ row }: { row: any }) => (
                <span className="font-medium">{row.getValue("receiptNumber")}</span>
            ),
        },
        // Invoice
        {
            accessorKey: "invoice",
            header: "Invoice",
            cell: ({ row }: { row: any }) => {
                const invoice = row.original.invoice;
                return <span className="text-muted-foreground">{invoice?.invoiceNumber || "—"}</span>;
            },
        },
        // Client
        {
            accessorKey: "client",
            header: "Client",
            cell: ({ row }: { row: any }) => {
                const client = row.original.client;
                return <span className="text-muted-foreground">{client?.name || "—"}</span>;
            },
        },
        // Date
        {
            accessorKey: "receiptDate",
            header: ({ column }: { column: any }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date
                    <ArrowUpDown className="ml-2 size-4" />
                </Button>
            ),
            cell: ({ row }: { row: any }) =>
                new Date(row.getValue("receiptDate")).toLocaleDateString(),
        },
        // Amount
        {
            accessorKey: "amount",
            header: ({ column }: { column: any }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Amount
                    <ArrowUpDown className="ml-2 size-4" />
                </Button>
            ),
            cell: ({ row }: { row: any }) => (
                <span className="font-medium text-green-600">${row.getValue("amount")}</span>
            ),
        },
        // Payment Method
        {
            accessorKey: "paymentMethod",
            header: "Payment Method",
            cell: ({ row }: { row: any }) => {
                const method = row.getValue("paymentMethod") as string;
                return (
                    <Badge
                        className={PAYMENT_METHOD_COLORS[method] ?? PAYMENT_METHOD_COLORS.other}
                        variant="outline"
                    >
                        {method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                );
            },
            filterFn: (row: any, id: any, value: any) => value.includes(row.getValue(id)),
        },
        // Payment Reference
        {
            accessorKey: "paymentReference",
            header: "Reference",
            cell: ({ row }: { row: any }) => (
                <span className="text-muted-foreground">
                    {row.getValue("paymentReference") ?? "—"}
                </span>
            ),
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
                const receipt = row.original;
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
                                {onPreview && (
                                    <DropdownMenuItem
                                        onClick={() => onPreview(receipt)}
                                        className="cursor-pointer"
                                    >
                                        <Eye className="size-4 mr-2" />
                                        Preview & Print
                                    </DropdownMenuItem>
                                )}
                                {canManage && (
                                    <>
                                        <DropdownMenuItem
                                            onClick={() => onEdit(receipt)}
                                            className="cursor-pointer"
                                        >
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => onDelete(receipt)}
                                            className="cursor-pointer text-red-500 focus:text-red-500"
                                        >
                                            Delete
                                        </DropdownMenuItem>
                                    </>
                                )}
                                {!canManage && !onPreview && (
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
