import { SonarClient } from "@echoxyz/sonar-core";
import { getTokenStore } from "./token-store";

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
