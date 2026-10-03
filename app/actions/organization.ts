"use server";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { cache } from "react";

export const getOrganization = cache(async () => {
    const token = await convexAuthNextjsToken();
    return await fetchQuery(api.organization.getOrganization, {}, { token });
});
