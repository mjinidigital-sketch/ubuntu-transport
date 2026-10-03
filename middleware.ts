import {
    convexAuthNextjsMiddleware,
    createRouteMatcher,
    nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

// const isSignInPage = createRouteMatcher(["/login"]);
const isProtectedRoute = createRouteMatcher(["/admin(.*)"]);

export default convexAuthNextjsMiddleware(
    async (request, { convexAuth }) => {
        // Redirect authenticated users away from sign-in page
        // if (isSignInPage(request) && (await convexAuth.isAuthenticated())) {
        //     return nextjsMiddlewareRedirect(request, "/");
        // }
        // Redirect unauthenticated users away from protected routes
        if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
            return nextjsMiddlewareRedirect(request, "/");
        }
    },
    // Optional: configure cookie expiration (e.g. 30 days)
    { cookieConfig: { maxAge: 60 * 60 * 24 * 30 } },
);

export const config = {
    // The following matcher runs middleware on all routes
    // except static assets.
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};