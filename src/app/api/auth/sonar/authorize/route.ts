import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { sonarConfig } from "@/lib/config";
import { generatePKCEParams, buildAuthorizationUrl } from "@echoxyz/sonar-core";
import { setPKCEVerifier } from "@/lib/pkce-store";

/**
 * Generate Sonar OAuth authorization URL with PKCE and redirect user
 */
export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Generate PKCE parameters (includes state token from sonar-core)
  const { codeVerifier, codeChallenge, state } = await generatePKCEParams();

  // Store code verifier and user ID linked to state token (will be retrieved in callback)
  await setPKCEVerifier(state, session.userId, codeVerifier);

  // Build authorization URL with PKCE
  const authorizationUrl = buildAuthorizationUrl({
    clientUUID: sonarConfig.clientUUID,
    redirectURI: sonarConfig.redirectURI,
    state,
    codeChallenge,
    frontendURL: sonarConfig.frontendURL,
  });

  return NextResponse.json({ url: authorizationUrl.toString() });
}
