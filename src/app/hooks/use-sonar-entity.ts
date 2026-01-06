"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { EntityDetails } from "@echoxyz/sonar-core";
import { saleUUID } from "../config";

/**
 * Hook to fetch Sonar entity details
 * Replaces useSonarEntity from sonar-react
 */
export function useSonarEntity(walletAddress?: string) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [entity, setEntity] = useState<EntityDetails | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);

  const sonarConnected = session?.user?.sonarConnected ?? false;

  useEffect(() => {
    // Only fetch if user is authenticated AND connected to Sonar
    if (!session?.user?.id || !sonarConnected || !walletAddress) {
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
  }, [session?.user?.id, sonarConnected, walletAddress]);

  return {
    loading,
    entity,
    error,
  };
}
