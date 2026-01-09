"use client";

import { ReadEntityResponse } from "@echoxyz/sonar-core";
import { saleUUID } from "@/lib/config";
import { useSonarQuery } from "./use-sonar-query";
import { getEntity } from "@/app/actions/sonar";

/**
 * Hook to fetch Sonar entity details for a specific wallet
 */
export function useSonarEntity(walletAddress?: string) {
  const query = useSonarQuery<
    { saleUUID: string; walletAddress: string },
    ReadEntityResponse
  >(getEntity, {
    saleUUID,
    walletAddress: walletAddress ?? "",
  });

  // No wallet address - return idle state
  if (!walletAddress) {
    return { loading: false, entity: undefined, error: undefined };
  }

  // Treat 404 as "no entity" rather than an error
  const is404 = query.error?.message.includes("404");

  return {
    loading: query.loading,
    entity: query.data?.Entity,
    error: is404 ? undefined : query.error,
  };
}
