import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getTokenStore } from "@/lib/token-store";

/**
 * Disconnect Sonar account (remove stored tokens)
 */
export async function POST() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  getTokenStore().clearTokens(session.id);

  return NextResponse.json({ success: true });
}
