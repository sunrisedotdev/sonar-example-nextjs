"use server";

import { createSession, destroySession, getSession } from "@/lib/session";
import { getTokenStore } from "@/lib/token-store";
import { sonarConfig } from "@/lib/config";
import { generatePKCEParams, buildAuthorizationUrl } from "@echoxyz/sonar-core";
import { setPKCEVerifier, getPKCEVerifier, clearPKCEVerifier } from "@/lib/pkce-store";
import { createSonarClient } from "@/lib/sonar";
import { SonarTokens } from "@/lib/token-store";

/**
 * Create a new session (login).
 * Given this is an example app - no authentication is required.
 */
export async function login() {
  const session = await createSession();
  return {
    success: true,
    userId: session.userId,
  };
}

/**
 * Destroy the current session (logout).
 * Clears session cookie and any associated Sonar tokens.
 */
export async function logout() {
  await destroySession();
  return { success: true };
}

/**
 * Get current session status.
 * Returns session info and Sonar connection status.
 */
export async function getSessionStatus() {
  const session = await getSession();

  if (!session) {
    return {
      authenticated: false,
      sonarConnected: false,
    };
  }

  const tokens = getTokenStore().getTokens(session.userId);

  return {
    authenticated: true,
    sonarConnected: !!tokens,
  };
}

/**
 * Generate Sonar OAuth authorization URL with PKCE
 */
export async function getSonarAuthorizationUrl() {
  const session = await getSession();

  if (!session) {
    return { error: "Unauthorized" };
  }

  // Generate PKCE parameters (includes state token from sonar-core)
  const { codeVerifier, codeChallenge, state } = await generatePKCEParams();

  // Store code verifier and user ID linked to state token (will be retrieved in callback)
  setPKCEVerifier(state, session.userId, codeVerifier);

  // Build authorization URL with PKCE
  const authorizationUrl = buildAuthorizationUrl({
    clientUUID: sonarConfig.clientUUID,
    redirectURI: sonarConfig.redirectURI,
    state,
    codeChallenge,
    frontendURL: sonarConfig.frontendURL,
  });

  return { url: authorizationUrl.toString() };
}

/**
 * Handle OAuth callback from Sonar
 * Exchange authorization code for access/refresh tokens using PKCE
 */
export async function handleSonarCallback(code: string, state: string) {
  // Verify session exists
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized", details: "No active session" };
  }

  try {
    // Retrieve code verifier and session ID from cookie store using state token
    const stateData = getPKCEVerifier(state);
    if (!stateData) {
      return { error: "Invalid state", details: "OAuth state token not found or expired" };
    }

    // Verify the state token belongs to the current session
    if (stateData.userId !== session.userId) {
      return { error: "Invalid session", details: "State token does not match current session" };
    }

    const { codeVerifier } = stateData;

    // Create a temporary client to exchange the authorization code
    const client = createSonarClient(session.userId);
    const tokenData = await client.exchangeAuthorizationCode({
      code,
      codeVerifier,
      redirectURI: sonarConfig.redirectURI,
    });

    const expiresAt = Math.floor(Date.now() / 1000) + tokenData.expires_in;

    const sonarTokens: SonarTokens = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt,
    };

    // Store tokens in token store
    getTokenStore().setTokens(session.userId, sonarTokens);

    // Clear the code verifier (no longer needed)
    clearPKCEVerifier(state);

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: "OAuth callback failed", details: error.message };
    }
    return { error: "OAuth callback failed" };
  }
}

/**
 * Disconnect Sonar account (remove stored tokens)
 */
export async function disconnectSonar() {
  const session = await getSession();

  if (!session) {
    return { error: "Unauthorized" };
  }

  getTokenStore().clearTokens(session.userId);

  return { success: true };
}
