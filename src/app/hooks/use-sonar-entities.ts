"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { EntityDetails } from "@echoxyz/sonar-core";
import { saleUUID } from "../config";

/**
 * Hook to fetch all Sonar entities for the authenticated user
 * Replaces useSonarEntities from sonar-react
 */
export function useSonarEntities() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [entities, setEntities] = useState<EntityDetails[] | undefined>(undefined);
    const [error, setError] = useState<Error | undefined>(undefined);

    const sonarConnected = session?.user?.sonarConnected ?? false;

    useEffect(() => {
        if (!session?.user?.id || !sonarConnected) {
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
    }, [session?.user?.id, sonarConnected]);

    return {
        loading,
        entities,
        error,
    };
}

