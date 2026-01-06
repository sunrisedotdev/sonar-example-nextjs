import NextAuth, { Account, User, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { getTokenStore, SonarTokens } from "@/lib/token-store";
import { siwe } from "@/lib/siwe";

// Validate required environment variables
if (process.env.NODE_ENV === "production" && !process.env.NEXTAUTH_SECRET) {
    throw new Error("NEXTAUTH_SECRET is required in production");
}

/**
 * Custom Sonar OAuth provider configuration
 * Note: NextAuth v5 uses a different provider structure
 * We'll handle OAuth manually via API routes and use NextAuth for session management
 */
const sonarOAuthConfig = {
    authorizationUrl: `${process.env.NEXT_PUBLIC_ECHO_FRONTEND_URL ?? "https://app.echo.xyz"}/oauth/authorize`,
    tokenUrl: `${process.env.NEXT_PUBLIC_ECHO_API_URL ?? "https://api.echo.xyz"}/oauth/token`,
    clientId: process.env.NEXT_PUBLIC_OAUTH_CLIENT_UUID ?? "",
    clientSecret: process.env.OAUTH_CLIENT_SECRET ?? "",
    redirectUri: process.env.NEXT_PUBLIC_OAUTH_CLIENT_REDIRECT_URI ?? "",
};

/**
 * Refresh Sonar access token using refresh token
 */
export async function refreshSonarToken(refreshToken: string): Promise<SonarTokens> {
    const tokenEndpoint = sonarOAuthConfig.tokenUrl;
    const response = await fetch(tokenEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            client_id: sonarOAuthConfig.clientId,
            client_secret: sonarOAuthConfig.clientSecret,
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    const expiresAt = Math.floor(Date.now() / 1000) + (data.expires_in || 3600);

    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresAt,
    };
}

const authOptions = {
    providers: [
        // SIWE provider for wallet-based authentication
        CredentialsProvider({
            id: "siwe",
            name: "Sign in with Ethereum",
            credentials: {
                message: { label: "Message", type: "text" },
                signature: { label: "Signature", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.message || !credentials?.signature) {
                    return null;
                }

                try {
                    const address = await siwe.verify(
                        credentials.message as string,
                        credentials.signature as string
                    );
                    if (!address) {
                        return null;
                    }

                    return {
                        id: address.toLowerCase(),
                        name: address,
                    };
                } catch {
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: "jwt" as const,
    },
    callbacks: {
        async jwt({ token, account, user }: { token: JWT; account?: Account | null; user?: User }) {
            // Initial sign in
            if (account && user) {
                if (account.provider === "siwe") {
                    // SIWE sign in - set the user ID (wallet address)
                    token.sub = user.id;
                }
            }

            // Check if Sonar token needs refresh (tokens are stored separately, but we check expiry here)
            if (token.sub) {
                const storedTokens = getTokenStore().getTokens(token.sub);
                if (storedTokens) {
                    const now = Math.floor(Date.now() / 1000);
                    // Refresh if token expires in less than 5 minutes
                    if (storedTokens.expiresAt - now < 300) {
                        try {
                            const newTokens = await refreshSonarToken(storedTokens.refreshToken);
                            getTokenStore().setTokens(token.sub, newTokens);
                        } catch {
                            // Refresh failed - clear tokens and force re-auth
                            getTokenStore().clearTokens(token.sub);
                        }
                    }
                }
            }

            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            // Add Sonar connection status to session
            if (token.sub) {
                const storedTokens = getTokenStore().getTokens(token.sub);
                session.user = {
                    ...session.user,
                    id: token.sub,
                    sonarConnected: !!storedTokens,
                };
            }
            return session;
        },
    },
    pages: {
        signIn: "/",
    },
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax" as const,
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

// NextAuth v5 beta returns an object with handlers and auth function
const auth = NextAuth(authOptions);

export const { GET, POST } = auth.handlers;
export const { auth: getAuth } = auth;
export { authOptions };


