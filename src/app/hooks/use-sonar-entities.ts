"use client";

import { useState, useEffect } from "react";
import { useSession } from "./use-session";
import { EntityDetails } from "@echoxyz/sonar-core";
import { saleUUID } from "../config";

/**
 * Hook to fetch all Sonar entities for the authenticated user
 */
export function useSonarEntities() {
  const { authenticated, sonarConnected, refreshSession } = useSession();
  const [loading, setLoading] = useState(false);
  const [entities, setEntities] = useState<EntityDetails[] | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    if (!authenticated || !sonarConnected) {
      setEntities(undefined);
      setError(undefined);
      setLoading(false);
      return;
    }

    const fetchEntities = async () => {
      setLoading(true);
      setError(undefined);

      try {
        const response = await fetch("/api/sonar/entities", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            saleUUID,
          }),
        });

        if (!response.ok) {
          // If server says not connected (e.g., tokens lost after hot reload), refresh session state
          if (response.status === 401) {
            await refreshSession();
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch entities");
        }

        const data = await response.json();
        setEntities(data.Entities || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setEntities(undefined);
      } finally {
        setLoading(false);
      }
    };

    fetchEntities();
  }, [authenticated, sonarConnected, refreshSession]);

  return {
    loading,
    entities,
    error,
  };
}
