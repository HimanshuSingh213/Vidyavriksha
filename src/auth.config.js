import GoogleProvider from "next-auth/providers/google";

export default {
    providers: [
        // We only accept Google IDs at this door
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: "select_account",
                },
            },
        }),
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        // Log details on sign-in to help identify providerAccountIds in the database
        async signIn({ user, account }) {
            console.log("=== NEXTAUTH SIGN-IN DETAILS ===");
            console.log("User Email:", user.email);
            console.log("Google ID (providerAccountId):", account?.providerAccountId);
            console.log("================================");
            return true;
        },
        // When someone logs in, writing their Database ID onto their session badge
        async session({ session, token }) {
            if (session?.user && token?.sub) {
                session.user.id = token.sub;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
}