import { z } from "zod";

export const roleSchema = z.union([
    z.literal("superadmin"),
    z.literal("admin"),
    z.literal("staff"),
    z.literal("customer"),
    z.literal("user"),
]);

export const editRoleFormSchema = z.object({
    newRole: roleSchema,
});

export const setRoleSchema = z.object({
    targetUserId: z.string().min(1, "User ID is required"),
    newRole: roleSchema,
});

export const deleteUserSchema = z.object({
    targetUserId: z.string().min(1, "User ID is required"),
});

export type SetRoleValues = z.infer<typeof setRoleSchema>;
export type DeleteUserValues = z.infer<typeof deleteUserSchema>;
export type Role = z.infer<typeof roleSchema>;
export type EditRoleFormValues = z.infer<typeof editRoleFormSchema>;