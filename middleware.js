import NextAuth from "next-auth";
import authConfig from "./src/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

import { NextResponse } from "next/server";

export default middleware((req) => {
    const isLoggedIn = !!req.auth;
    const isAuthRoute = req.nextUrl.pathname.startsWith("/login");

    // Strictly enforce login: if not logged in and not on login page, redirect to /login
    if (!isLoggedIn && !isAuthRoute) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // Redirect to dashboard if logged in and trying to access login page
    if (isLoggedIn && isAuthRoute) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }
});

export const config = {
    // Enforce authentication on all routes except APIs, Next.js static files, images, and favicon
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};