"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteUserAction } from "@/app/actions/users";
import { UserRow } from "./columns";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface DeleteUserDialogProps {
    user: UserRow | null;
    open: boolean;
    onClose: () => void;
}

export function DeleteUserDialog({ user, open, onClose }: DeleteUserDialogProps) {
    const [isPending, startTransition] = useTransition();

    const onSubmit = () => {
        if (!user?._id) return;

        startTransition(async () => {
            const result = await deleteUserAction({ targetUserId: user._id });
            if (result?.error) {
                toast.error("Failed to delete user");
                return;
            }
            toast.success("User deleted successfully");
            onClose();
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete User</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold">{user?.name ?? user?.email}</span>
                        ? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        type="button"
                        onClick={onSubmit}
                        disabled={isPending}
                    >
                        {isPending ? "Deleting..." : "Delete"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
