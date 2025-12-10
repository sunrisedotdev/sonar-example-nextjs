import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "../../[...nextauth]/route";
import { getTokenStore } from "@/lib/token-store";

/**
 * Disconnect Sonar account (remove stored tokens)
 */
export async function POST(request: NextRequest) {
    const session = await getAuth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    getTokenStore().clearTokens(session.user.id);

    return NextResponse.json({ success: true });
}

