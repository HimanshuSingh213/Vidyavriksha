import NextAuth from "next-auth";
import authConfig from "./auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export default middleware((req) => {
    const isLoggedIn = !!req.auth;
    const isAuthRoute = req.nextUrl.pathname.startsWith("/login");
    const isDashboardRoute = req.nextUrl.pathname.startsWith("/dashboard");

    // if anyone trying to enter the dashboard without login(without badge), redirecting them to loginPage
    if(isDashboardRoute && !isLoggedIn){
        return Response.redirect(new URL("/login", req.nextUrl));
    }

    // if they already have a badge, redirecting to the dashboard 
    if(isAuthRoute && isLoggedIn){
        return Response.redirect(new URL("/dashboard", req.nextUrl))
    }
});

export const config = {
    matcher: ["/dashboard/:path*", "/login"],
};