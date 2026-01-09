import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getTokenStore } from "@/lib/token-store";

/**
 * Get current session status.
 * Returns session info and Sonar connection status.
 */
export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({
      authenticated: false,
      sonarConnected: false,
    });
  }

  const tokens = getTokenStore().getTokens(session.userId);

  return NextResponse.json({
    authenticated: true,
    sonarConnected: !!tokens,
  });
}
