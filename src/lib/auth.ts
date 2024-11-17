import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./db";

export const NEXTAUTH_CONFIG = {
  providers: [
    CredentialsProvider({
      name: "Credential",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@gmail.com" },
        password: { label: "Password", type: "password" },
        username: { label: "Username", type: "text" },
        age: { label: "Age", type: "number" },
        gender: { label: "Gender", type: "text" },
      },

      async authorize(credentials) {
        if (!credentials) return null;
        const { email, password, username, age, gender } = credentials;
        console.log("credentials: ", credentials);

        // Check if the user exists
        const user = await prisma.user.findFirst({
          where: { email },
        });

        // If user exists, verify password
        if (user) {
          if (user.password !== password) {
            throw new Error("Invalid credentials.");
          }
          return {
            id: user.id,
            email: user.email,
            username: user.username,
          };
        }
        if (!username || !gender) {
          throw new Error("User not found. Please sign up.");
        }

        const newUser = await prisma.user.create({
          data: {
            email,
            password, // Hash in production
            username,
            age: parseInt(age, 10),
            gender,
          },
        });

        return {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
        };
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({ user }: { user: any }) {
      return !!user;
    },

    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.userId = user.id;
        token.username = user.username;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      session.userId = token.userId;
      session.username = token.username;
      session.email = token.email;
      return session;
    },
  },
};
