import { NEXTAUTH_CONFIG } from "@/lib/auth";
import NextAuth from "next-auth/next";

const handler =  NextAuth(NEXTAUTH_CONFIG)

export { handler as GET, handler as POST };