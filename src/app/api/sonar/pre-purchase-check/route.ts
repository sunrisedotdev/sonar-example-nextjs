import { NextResponse } from "next/server";
import { createSonarRouteHandler } from "@/lib/sonar-route-handler";

type PrePurchaseCheckRequest = {
  saleUUID: string;
  entityID: string;
  walletAddress: string;
};

/**
 * Proxy request to Sonar PrePurchaseCheck endpoint
 */
export const POST = createSonarRouteHandler<PrePurchaseCheckRequest>(
  async ({ client }, body) => {
    const { saleUUID, entityID, walletAddress } = body;

    if (!saleUUID || !entityID || !walletAddress) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const result = await client.prePurchaseCheck({
      saleUUID,
      entityID,
      walletAddress,
    });
    return NextResponse.json(result);
  }
);
