import { NextRequest, NextResponse } from "next/server";
import { getAuth, refreshSonarToken } from "@/app/api/auth/[...nextauth]/route";
import { getTokenStore, SonarTokens } from "@/lib/token-store";
import { createSonarClient } from "@/lib/sonar-client";
import { APIError, SonarClient } from "@echoxyz/sonar-core";

export type AuthenticatedContext = {
  userId: string;
  tokens: SonarTokens;
  client: SonarClient;
};

type RouteHandler<T> = (
  context: AuthenticatedContext,
  body: T
) => Promise<NextResponse>;

/**
 * Creates a Sonar API route handler with authentication, token refresh, and error handling.
 */
export function createSonarRouteHandler<T>(
  handler: RouteHandler<T>
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    // Check session authentication
    const session = await getAuth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get tokens from store
    let tokens = getTokenStore().getTokens(userId);
    if (!tokens) {
      return NextResponse.json(
        { error: "Sonar account not connected" },
        { status: 401 }
      );
    }

    // Check if token needs refresh
    const now = Math.floor(Date.now() / 1000);
    if (tokens.expiresAt - now < 300) {
      try {
        tokens = await refreshSonarToken(tokens.refreshToken);
        getTokenStore().setTokens(userId, tokens);
      } catch {
        return NextResponse.json(
          { error: "Failed to refresh token" },
          { status: 401 }
        );
      }
    }

    try {
      const body = (await request.json()) as T;
      const client = createSonarClient(userId);

      return await handler({ userId, tokens, client }, body);
    } catch (error) {
      if (error instanceof APIError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.status }
        );
      }

      console.error("Error calling Sonar API");
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

