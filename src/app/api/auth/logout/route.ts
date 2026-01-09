import { NextResponse } from "next/server";
import { destroySession } from "@/lib/session";

/**
 * Destroy the current session (logout).
 * Clears session cookie and any associated Sonar tokens.
 */
export async function POST() {
  await destroySession();

  return NextResponse.json({ success: true });
}
