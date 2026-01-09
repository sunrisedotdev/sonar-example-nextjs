import { NextResponse } from "next/server";
import { createSonarRouteHandler } from "@/lib/sonar";

type GeneratePurchasePermitRequest = {
  saleUUID: string;
  entityID: string;
  walletAddress: string;
};

/**
 * Proxy request to Sonar GenerateSalePurchasePermit endpoint
 */
export const POST = createSonarRouteHandler<GeneratePurchasePermitRequest>(
  async ({ client }, body) => {
    const { saleUUID, entityID, walletAddress } = body;

    if (!saleUUID || !entityID || !walletAddress) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const result = await client.generatePurchasePermit({
      saleUUID,
      entityID,
      walletAddress,
    });
    return NextResponse.json(result);
  }
);
