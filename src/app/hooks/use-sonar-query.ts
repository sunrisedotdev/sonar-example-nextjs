"use client";

import { useState, useEffect } from "react";
import { useSession } from "./use-session";

export type SonarQueryState<T> =
  | { loading: true; data: undefined; error: undefined }
  | { loading: false; data: T; error: undefined }
  | { loading: false; data: undefined; error: Error }
  | { loading: false; data: undefined; error: undefined }; // idle/skipped state

/**
 * Generic hook for Sonar API queries with shared session/auth handling
 */
export function useSonarQuery<T>(endpoint: string, body: Record<string, unknown>): SonarQueryState<T> {
  const { authenticated, sonarConnected, refreshSession } = useSession();
  const [state, setState] = useState<SonarQueryState<T>>({
    loading: true,
    data: undefined,
    error: undefined,
  });

  // Serialize body for stable dependency comparison
  const serializedBody = JSON.stringify(body);

  useEffect(() => {
    if (!authenticated || !sonarConnected) {
      setState({ loading: false, data: undefined, error: undefined });
      return;
    }

    const fetchData = async () => {
      setState({ loading: true, data: undefined, error: undefined });

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: serializedBody,
        });

        if (!response.ok) {
          if (response.status === 401) {
            await refreshSession();
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.error || `Request failed: ${response.status}`);
        }

        const data = await response.json();
        setState({ loading: false, data, error: undefined });
      } catch (err) {
        setState({
          loading: false,
          data: undefined,
          error: err instanceof Error ? err : new Error(String(err)),
        });
      }
    };

    fetchData();
  }, [authenticated, sonarConnected, endpoint, serializedBody, refreshSession]);

  return state;
}
