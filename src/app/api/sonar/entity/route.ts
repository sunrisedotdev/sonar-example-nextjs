import { NextResponse } from "next/server";
import { createSonarRouteHandler } from "@/lib/sonar";
import { APIError } from "@echoxyz/sonar-core";

type EntityRequest = {
  saleUUID: string;
  walletAddress: string;
};

/**
 * Proxy request to Sonar ReadEntity endpoint
 */
export const POST = createSonarRouteHandler<EntityRequest>(
  async (client, body) => {
    const { saleUUID, walletAddress } = body;

    if (!saleUUID || !walletAddress) {
      return NextResponse.json(
        { error: "Missing saleUUID or walletAddress" },
        { status: 400 }
      );
    }

    try {
      const result = await client.readEntity({ saleUUID, walletAddress });
      return NextResponse.json(result);
    } catch (error) {
      // Special handling: 404 returns null entity instead of error
      if (error instanceof APIError && error.status === 404) {
        return NextResponse.json({ Entity: null }, { status: 200 });
      }
      throw error;
    }
  }
);
