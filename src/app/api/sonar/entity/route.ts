import { NextRequest, NextResponse } from "next/server";
import { getAuth, refreshSonarToken } from "../../auth/[...nextauth]/route";
import { getTokenStore } from "@/lib/token-store";
import { createSonarClient } from "@/lib/sonar-client";
import { APIError } from "@echoxyz/sonar-core";

/**
 * Proxy request to Sonar ReadEntity endpoint
 */
export async function POST(request: NextRequest) {
    const session = await getAuth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { saleUUID, walletAddress } = body;

    if (!saleUUID || !walletAddress) {
        return NextResponse.json({ error: "Missing saleUUID or walletAddress" }, { status: 400 });
    }

    try {
        // Get tokens from store
        let tokens = getTokenStore().getTokens(session.user.id);
        if (!tokens) {
            return NextResponse.json({ error: "Sonar account not connected" }, { status: 401 });
        }

        // Check if token needs refresh
        const now = Math.floor(Date.now() / 1000);
        if (tokens.expiresAt - now < 300) {
            try {
                tokens = await refreshSonarToken(tokens.refreshToken);
                getTokenStore().setTokens(session.user.id, tokens);
            } catch (error) {
                return NextResponse.json({ error: "Failed to refresh token" }, { status: 401 });
            }
        }

        // Create Sonar client and make the request
        // The client will pick up the token from the store (including if it was just refreshed)
        const client = createSonarClient(session.user.id);
        const result = await client.readEntity({ saleUUID, walletAddress });

        return NextResponse.json(result);
    } catch (error) {
        if (error instanceof APIError && error.status === 404) {
            return NextResponse.json({ Entity: null }, { status: 200 });
        }

        if (error instanceof APIError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }

        console.error("Error calling Sonar API");
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

