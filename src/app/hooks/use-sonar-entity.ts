"use client";

import { useState, useEffect } from "react";
import { useSession } from "./use-session";
import { EntityDetails } from "@echoxyz/sonar-core";
import { saleUUID } from "../config";

/**
 * Hook to fetch Sonar entity details for a specific wallet
 */
export function useSonarEntity(walletAddress?: string) {
  const { authenticated, sonarConnected, refreshSession } = useSession();
  const [loading, setLoading] = useState(false);
  const [entity, setEntity] = useState<EntityDetails | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    // Only fetch if user is authenticated AND connected to Sonar
    if (!authenticated || !sonarConnected || !walletAddress) {
      setEntity(undefined);
      setError(undefined);
      setLoading(false);
      return;
    }

    const fetchEntity = async () => {
      setLoading(true);
      setError(undefined);

      try {
        const response = await fetch("/api/sonar/entity", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            saleUUID,
            walletAddress,
          }),
        });

        if (!response.ok) {
          if (response.status === 404) {
            setEntity(undefined);
            setLoading(false);
            return;
          }
          // If server says not connected (e.g., tokens lost after hot reload), refresh session state
          if (response.status === 401) {
            await refreshSession();
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch entity");
        }

        const data = await response.json();
        setEntity(data.Entity);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setEntity(undefined);
      } finally {
        setLoading(false);
      }
    };

    fetchEntity();
  }, [authenticated, sonarConnected, walletAddress, refreshSession]);

  return {
    loading,
    entity,
    error,
  };
}
