"use client";

import { useEffect, useTransition } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { editRoleFormSchema, EditRoleFormValues, Role } from "@/app/schemas/user";
import { setUserRoleAction } from "@/app/actions/users";
import { UserRow } from "./columns";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface EditRoleDialogProps {
    user: UserRow | null;
    open: boolean;
    onClose: () => void;
}

const ROLES = ["superadmin", "admin", "staff", "customer", "user"] as const;

export function EditRoleDialog({ user, open, onClose }: EditRoleDialogProps) {
    const [isPending, startTransition] = useTransition();

    const {
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<EditRoleFormValues>({
        resolver: zodResolver(editRoleFormSchema),
        defaultValues: {
            newRole: "user",
        },
    });

    const selectedRole = watch("newRole");

    useEffect(() => {
        if (user) {
            reset({
                newRole: user.role ?? "user",
            });
        }
    }, [user, reset]);

    const onSubmit: SubmitHandler<EditRoleFormValues> = (values) => {
        if (!user?._id) return;

        startTransition(async () => {
            const result = await setUserRoleAction({
                targetUserId: user._id,
                newRole: values.newRole,
            });
            if (result?.error) {
                toast.error("Failed to update role");
                return;
            }
            toast.success(`Role updated to "${values.newRole}"`);
            onClose();
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Role</DialogTitle>
                    <DialogDescription>
                        Change role for{" "}
                        <span className="font-semibold">{user?.name ?? user?.email}</span>
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={selectedRole}
                            onValueChange={(val) =>
                                setValue("newRole", val as Role)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {ROLES.map((role) => (
                                    <SelectItem key={role} value={role}>
                                        {role}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.newRole && (
                            <p className="text-sm text-red-500">
                                {errors.newRole.message}
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" type="button" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}