import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "../../[...nextauth]/route";
import { getTokenStore, SonarTokens } from "@/lib/token-store";
import { getPKCEVerifier, clearPKCEVerifier } from "@/lib/pkce-store";
import { createSonarClient } from "@/lib/sonar-client";

/**
 * Handle OAuth callback from Sonar
 * Exchange authorization code for access/refresh tokens using PKCE
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Handle OAuth provider errors
  if (error) {
    return NextResponse.json({ error: "OAuth authorization failed", details: error }, { status: 400 });
  }

  // Validate required parameters
  if (!code || !state) {
    return NextResponse.json(
      { error: "Missing required parameters", details: "code and state are required" },
      { status: 400 }
    );
  }

  // Verify session exists
  const session = await getAuth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", details: "No active session" }, { status: 401 });
  }

  try {
    // Retrieve code verifier and user ID from cookie store using state token
    const stateData = await getPKCEVerifier(state);
    if (!stateData) {
      return NextResponse.json(
        { error: "Invalid state", details: "OAuth state token not found or expired" },
        { status: 400 }
      );
    }

    // Verify the state token belongs to the current session
    if (stateData.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Invalid session", details: "State token does not match current session" },
        { status: 401 }
      );
    }

    const { codeVerifier } = stateData;

    // Create a temporary client to exchange the authorization code
    const client = createSonarClient(session.user.id);
    const tokenData = await client.exchangeAuthorizationCode({
      code,
      codeVerifier,
      redirectURI: process.env.NEXT_PUBLIC_OAUTH_CLIENT_REDIRECT_URI ?? "",
    });

    const expiresAt = Math.floor(Date.now() / 1000) + (tokenData.expires_in || 3600);

    const sonarTokens: SonarTokens = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt,
    };

    // Store tokens in token store
    getTokenStore().setTokens(session.user.id, sonarTokens);

    // Clear the code verifier (no longer needed)
    await clearPKCEVerifier(state);

    // Return success - frontend will navigate to home
    // The page load will naturally trigger session refresh via NextAuth
    // The session callback checks the token store on every request
    return NextResponse.json({ success: true });
  } catch (error) {
    // Return proper error response with status code
    if (error instanceof Error) {
      return NextResponse.json({ error: "OAuth callback failed", details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "OAuth callback failed" }, { status: 500 });
  }
}
