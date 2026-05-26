import NextAuth from "next-auth";
import authConfig from "./src/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

import { NextResponse } from "next/server";

export default middleware((req) => {
    const isLoggedIn = !!req.auth;
    const isAuthRoute = req.nextUrl.pathname.startsWith("/login");
    const isDashboardRoute = req.nextUrl.pathname.startsWith("/dashboard");

    // if anyone trying to enter the dashboard without login(without badge), redirecting them to loginPage
    if(isDashboardRoute && !isLoggedIn){
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // if they already have a badge, redirecting to the dashboard 
    if(isAuthRoute && isLoggedIn){
        return NextResponse.redirect(new URL("/dashboard", req.url))
    }
});

export const config = {
    matcher: ["/dashboard/:path*", "/login"],
};