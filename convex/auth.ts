import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { z } from "zod";

const ParamsSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/\d/),
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const { error, data } = ParamsSchema.safeParse(params);
        if (error) {
          throw new ConvexError(error.format());
        }
        return {
          email: data.email,
          name: params.name as string,
          role: "user", // ✅ set default role here
        };
      },
      validatePasswordRequirements: (password: string) => {
        if (
          password.length < 8 ||
          !/\d/.test(password) ||
          !/[a-z]/.test(password) ||
          !/[A-Z]/.test(password)
        ) {
          throw new ConvexError("Invalid password.");
        }
      },
    }),
  ],
});