import GoogleProvider from "next-auth/providers/google";

export default {
    providers: [
        // We only accept Google IDs at this door
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        // When someone logs in, writing their Database ID onto their session badge
        async session({ session, token }) {
            if (session?.user && token?.sub) {
                session.user.id = token.sub;
            }
            return session;
        },
    },
}