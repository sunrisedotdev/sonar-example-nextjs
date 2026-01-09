"use client";

import { ListAvailableEntitiesResponse } from "@echoxyz/sonar-core";
import { saleUUID } from "../config";
import { useSonarQuery } from "./use-sonar-query";

/**
 * Hook to fetch all Sonar entities for the authenticated user
 */
export function useSonarEntities() {
  const { loading, data, error } = useSonarQuery<ListAvailableEntitiesResponse>("/api/sonar/entities", { saleUUID });

  return {
    loading,
    entities: data?.Entities,
    error,
  };
}
