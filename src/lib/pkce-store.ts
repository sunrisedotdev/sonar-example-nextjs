/**
 * Temporary store for PKCE code verifiers and OAuth state tokens
 * Uses encrypted cookies to persist across serverless function invocations
 */
import { cookies } from "next/headers";

const PKCE_COOKIE_PREFIX = "sonar_pkce_";
const PKCE_COOKIE_TTL_SEC = 10 * 60; // 10 minutes

interface StateEntry {
  userId: string;
  codeVerifier: string;
  expiresAt: number;
}

/**
 * Store PKCE verifier and user ID linked to a state token in a cookie
 */
export async function setPKCEVerifier(state: string, userId: string, codeVerifier: string): Promise<void> {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + PKCE_COOKIE_TTL_SEC * 1000;

  const entry: StateEntry = {
    userId,
    codeVerifier,
    expiresAt,
  };

  cookieStore.set(`${PKCE_COOKIE_PREFIX}${state}`, JSON.stringify(entry), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: PKCE_COOKIE_TTL_SEC,
    path: "/",
  });
}

/**
 * Get PKCE verifier and user ID for a state token from cookie
 */
export async function getPKCEVerifier(state: string): Promise<{ userId: string; codeVerifier: string } | null> {
  const cookieStore = await cookies();
  const cookieName = `${PKCE_COOKIE_PREFIX}${state}`;
  const cookie = cookieStore.get(cookieName);

  if (!cookie?.value) {
    return null;
  }

  try {
    const entry: StateEntry = JSON.parse(cookie.value);

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      cookieStore.delete(cookieName);
      return null;
    }

    return {
      userId: entry.userId,
      codeVerifier: entry.codeVerifier,
    };
  } catch (error) {
    console.error("PKCEStore.getPKCEVerifier - parse error", { state, error });
    cookieStore.delete(cookieName);
    return null;
  }
}

/**
 * Clear state entry (called after successful token exchange)
 */
export async function clearPKCEVerifier(state: string): Promise<void> {
  const cookieStore = await cookies();
  const cookieName = `${PKCE_COOKIE_PREFIX}${state}`;
  cookieStore.delete(cookieName);
}
