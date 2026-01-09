import { getSession } from "@/lib/session";
import { getTokenStore, SonarTokens } from "@/lib/token-store";
import { sonarConfig } from "@/lib/config";
import { APIError, SonarClient } from "@echoxyz/sonar-core";

/**
 * Create a SonarClient instance for a specific user
 * Sets the access token from our server-side token store
 */
export function createSonarClient(userId: string): SonarClient {
  // Create a new client instance
  const client = new SonarClient({
    apiURL: sonarConfig.apiURL,
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
    const client = new SonarClient({ apiURL: sonarConfig.apiURL });

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

export type ServerActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; unauthorized?: boolean };

type ServerActionHandler<I, O> = (client: SonarClient, input: I) => Promise<O>;

/**
 * Creates a Sonar server action with authentication, token refresh, and error handling.
 */
export function createSonarServerAction<I, O>(
  handler: ServerActionHandler<I, O>
): (input: I) => Promise<ServerActionResult<O>> {
  return async (input: I) => {
    // Check session authentication
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized", unauthorized: true };
    }

    // Get tokens from store
    let tokens = getTokenStore().getTokens(session.userId);
    if (!tokens) {
      return { success: false, error: "Sonar account not connected", unauthorized: true };
    }

    // Check if token needs refresh (within 5 minutes of expiry)
    const now = Math.floor(Date.now() / 1000);
    if (tokens.expiresAt - now < 300) {
      try {
        tokens = await refreshSonarToken(session.userId, tokens.refreshToken);
        getTokenStore().setTokens(session.userId, tokens);
      } catch {
        return { success: false, error: "Failed to refresh token", unauthorized: true };
      }
    }

    try {
      const client = createSonarClient(session.userId);
      const data = await handler(client, input);
      return { success: true, data };
    } catch (error) {
      if (error instanceof APIError) {
        return { success: false, error: error.message };
      }

      console.error("Error calling Sonar API");
      return { success: false, error: "Internal server error" };
    }
  };
}
