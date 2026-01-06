import { NextResponse } from "next/server";
import { createSonarRouteHandler } from "@/lib/sonar-route-handler";

type EntitiesRequest = {
  saleUUID: string;
};

/**
 * Proxy request to Sonar ReadEntities endpoint
 * Returns all entities for the authenticated user
 */
export const POST = createSonarRouteHandler<EntitiesRequest>(
  async ({ client }, body) => {
    const { saleUUID } = body;

    if (!saleUUID) {
      return NextResponse.json({ error: "Missing saleUUID" }, { status: 400 });
    }

    const result = await client.listAvailableEntities({ saleUUID });
    return NextResponse.json(result);
  }
);
