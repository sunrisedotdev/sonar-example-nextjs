import { NextResponse } from "next/server";
import { createSession } from "@/lib/session";

/**
 * Create a new session (login).
 * Given this is an example app - no authentication is required.
 */
export async function POST() {
  const session = await createSession();

  return NextResponse.json({
    success: true,
    sessionId: session.id,
  });
}
