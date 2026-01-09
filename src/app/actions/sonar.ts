"use server";

import { createSonarServerAction } from "@/lib/sonar";
import {
  ListAvailableEntitiesResponse,
  ReadEntityResponse,
  PrePurchaseCheckResponse,
  GeneratePurchasePermitResponse,
  APIError,
} from "@echoxyz/sonar-core";

type ListAvailableEntitiesInput = { saleUUID: string };

/**
 * Fetch all entities for the authenticated user
 */
export const getEntities = createSonarServerAction<ListAvailableEntitiesInput, ListAvailableEntitiesResponse>(
  async (client, { saleUUID }) => {
    if (!saleUUID) {
      throw new Error("Missing saleUUID");
    }
    return client.listAvailableEntities({ saleUUID });
  }
);

type ReadEntityInput = { saleUUID: string; walletAddress: string };

/**
 * Fetch a specific entity by wallet address
 */
export const getEntity = createSonarServerAction<ReadEntityInput, ReadEntityResponse>(
  async (client, { saleUUID, walletAddress }) => {
    if (!saleUUID || !walletAddress) {
      throw new Error("Missing saleUUID or walletAddress");
    }

    try {
      return await client.readEntity({ saleUUID, walletAddress });
    } catch (error) {
      // Special handling: 404 returns null entity instead of error
      if (error instanceof APIError && error.status === 404) {
        return { Entity: null } as unknown as ReadEntityResponse;
      }
      throw error;
    }
  }
);

type PrePurchaseCheckInput = { saleUUID: string; entityID: string; walletAddress: string };

/**
 * Perform pre-purchase check for an entity
 */
export const prePurchaseCheck = createSonarServerAction<PrePurchaseCheckInput, PrePurchaseCheckResponse>(
  async (client, { saleUUID, entityID, walletAddress }) => {
    if (!saleUUID || !entityID || !walletAddress) {
      throw new Error("Missing required parameters");
    }
    return client.prePurchaseCheck({ saleUUID, entityID, walletAddress });
  }
);

type GeneratePurchasePermitInput = { saleUUID: string; entityID: string; walletAddress: string };

/**
 * Generate a purchase permit for an entity
 */
export const generatePurchasePermit = createSonarServerAction<
  GeneratePurchasePermitInput,
  GeneratePurchasePermitResponse
>(async (client, { saleUUID, entityID, walletAddress }) => {
  if (!saleUUID || !entityID || !walletAddress) {
    throw new Error("Missing required parameters");
  }
  return client.generatePurchasePermit({ saleUUID, entityID, walletAddress });
});
