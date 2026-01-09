"use client";

import {
  EntityID,
  GeneratePurchasePermitResponse,
  PrePurchaseCheckResponse,
  PrePurchaseFailureReason,
} from "@echoxyz/sonar-core";
import { UseSonarPurchaseResult } from "@echoxyz/sonar-react";
import { useSession } from "./use-session";
import { useCallback } from "react";
import { useSonarQuery } from "./use-sonar-query";

/**
 * Hook for Sonar purchase flow
 */
export function useSonarPurchase(args: {
  saleUUID: string;
  entityID: EntityID;
  walletAddress: string;
}): UseSonarPurchaseResult {
  const { authenticated } = useSession();

  const { loading, data, error } = useSonarQuery<PrePurchaseCheckResponse>("/api/sonar/pre-purchase-check", {
    saleUUID: args.saleUUID,
    entityID: args.entityID,
    walletAddress: args.walletAddress,
  });

  const generatePurchasePermit = useCallback(async (): Promise<GeneratePurchasePermitResponse> => {
    if (!authenticated) {
      throw new Error("Not authenticated");
    }

    const response = await fetch("/api/sonar/generate-purchase-permit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        saleUUID: args.saleUUID,
        entityID: args.entityID,
        walletAddress: args.walletAddress,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Request failed: ${response.status}`);
    }

    return response.json();
  }, [authenticated, args.saleUUID, args.entityID, args.walletAddress]);

  if (loading) {
    return { loading: true, readyToPurchase: false, error: undefined };
  }

  if (error || !data) {
    return { loading: false, readyToPurchase: false, error: error ?? new Error("No data") };
  }

  if (data.ReadyToPurchase) {
    return { loading: false, readyToPurchase: true, error: undefined, generatePurchasePermit };
  }

  return {
    loading: false,
    readyToPurchase: false,
    error: undefined,
    failureReason: data.FailureReason as PrePurchaseFailureReason,
    livenessCheckURL: data.LivenessCheckURL,
  };
}
