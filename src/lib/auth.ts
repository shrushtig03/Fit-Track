import CredentialsProvider from "next-auth/providers/credentials"

export const NEXTAUTH_CONFIG = {
    providers: [    
        CredentialsProvider({
            name: "Credential",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {

                console.log("Credentials Provider", credentials);
                if (!credentials) return null;
                const { username, password } = credentials;


                return {
                    username,
                    password
                };

            },
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,

    callbacks: {
        async signIn({ user, account, profile }: any) {
            return true;
        },

        async jwt({ token, account, user }: any) {
            // console.log("JWT", token, account);
            if (account) {
                token.accessToken = account.access_token;

                if (user) {
                    token.userId = user.id;
                    token.web3Address = user.web3Address;
                }
            }
            // console.log("jwt", token, account);

            return token;
        },

        async session({ session, token }: any) {
            session.userId = token.userId;
            session.web3Address = token.web3Address;
            // console.log("session", session, token);

            return session;
        },

        async redirect({ url, baseUrl }: any) {
            // console.log("redirect", url, baseUrl);
            return baseUrl;
        },

    }
}