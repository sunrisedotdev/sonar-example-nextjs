import { NextResponse } from "next/server";
import { getAuth } from "../../[...nextauth]/route";
import { generatePKCEParams } from "@echoxyz/sonar-core";
import { buildAuthorizationUrl } from "@echoxyz/sonar-core";
import { setPKCEVerifier } from "@/lib/pkce-store";

/**
 * Generate Sonar OAuth authorization URL with PKCE and redirect user
 */
export async function GET() {
    const session = await getAuth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate PKCE parameters (includes state token from sonar-core)
    const { codeVerifier, codeChallenge, state } = await generatePKCEParams();

    // Store code verifier and user ID linked to state token (will be retrieved in callback)
    await setPKCEVerifier(state, session.user.id, codeVerifier);

    // Build authorization URL with PKCE
    const authorizationUrl = buildAuthorizationUrl({
        clientUUID: process.env.NEXT_PUBLIC_OAUTH_CLIENT_UUID ?? "",
        redirectURI: process.env.NEXT_PUBLIC_OAUTH_CLIENT_REDIRECT_URI ?? "",
        state,
        codeChallenge,
        frontendURL: process.env.NEXT_PUBLIC_ECHO_FRONTEND_URL ?? "https://app.echo.xyz",
    });

    return NextResponse.redirect(authorizationUrl.toString());
}

