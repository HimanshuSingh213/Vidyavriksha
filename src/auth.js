import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongoClient";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: MongoDBAdapter(clientPromise)
})