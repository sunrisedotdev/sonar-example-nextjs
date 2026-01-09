import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getTokenStore, SonarTokens } from "@/lib/token-store";
import { APIError, SonarClient } from "@echoxyz/sonar-core";

/**
 * Create a SonarClient instance for a specific user
 * Sets the access token from our server-side token store
 */
export function createSonarClient(userId: string): SonarClient {
  const apiURL = process.env.NEXT_PUBLIC_ECHO_API_URL ?? "https://api.echo.xyz";

  // Create a new client instance
  const client = new SonarClient({
    apiURL,
    opts: {
      onUnauthorized: () => {
        // Clear tokens on unauthorized
        getTokenStore().clearTokens(userId);
      },
    },
  });

  // Set the token from our server-side store
  const tokens = getTokenStore().getTokens(userId);
  if (tokens?.accessToken) {
    client.setToken(tokens.accessToken);
  }

  return client;
}


// In-flight refresh promises by session ID - prevents concurrent refresh attempts
const refreshPromises = new Map<string, Promise<SonarTokens>>();

/**
 * Refresh Sonar access token using refresh token.
 * Uses promise coalescing to prevent concurrent refresh attempts for the same session.
 */
async function refreshSonarToken(sessionId: string, refreshToken: string): Promise<SonarTokens> {
  // If a refresh is already in-flight for this session, reuse it
  const existing = refreshPromises.get(sessionId);
  if (existing) {
    return existing;
  }

  const doRefresh = async (): Promise<SonarTokens> => {
    const apiURL = process.env.NEXT_PUBLIC_ECHO_API_URL ?? "https://api.echo.xyz";
    const client = new SonarClient({ apiURL });

    const tokenData = await client.refreshToken({ refreshToken });
    const expiresAt = Math.floor(Date.now() / 1000) + tokenData.expires_in;

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || refreshToken,
      expiresAt,
    };
  };

  const promise = doRefresh();
  refreshPromises.set(sessionId, promise);

  try {
    const result = await promise;
    return result;
  } finally {
    refreshPromises.delete(sessionId);
  }
}

export type AuthenticatedContext = {
  sessionId: string;
  tokens: SonarTokens;
  client: SonarClient;
};

type RouteHandler<T> = (context: AuthenticatedContext, body: T) => Promise<NextResponse>;

/**
 * Creates a Sonar API route handler with authentication, token refresh, and error handling.
 */
export function createSonarRouteHandler<T>(handler: RouteHandler<T>): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    // Check session authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get tokens from store
    let tokens = getTokenStore().getTokens(session.userId);
    if (!tokens) {
      return NextResponse.json({ error: "Sonar account not connected" }, { status: 401 });
    }

    // Check if token needs refresh (within 5 minutes of expiry)
    const now = Math.floor(Date.now() / 1000);
    if (tokens.expiresAt - now < 300) {
      try {
        tokens = await refreshSonarToken(session.userId, tokens.refreshToken);
        getTokenStore().setTokens(session.userId, tokens);
      } catch {
        return NextResponse.json({ error: "Failed to refresh token" }, { status: 401 });
      }
    }

    try {
      const body = (await request.json()) as T;
      const client = createSonarClient(session.userId);

      return await handler({ sessionId: session.userId, tokens, client }, body);
    } catch (error) {
      if (error instanceof APIError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }

      console.error("Error calling Sonar API");
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}
