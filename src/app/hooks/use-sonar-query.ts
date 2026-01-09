"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "./use-session";
import { ServerActionResult } from "@/lib/sonar";

export type SonarQueryState<T> =
  | { loading: true; data: undefined; error: undefined }
  | { loading: false; data: T; error: undefined }
  | { loading: false; data: undefined; error: Error }
  | { loading: false; data: undefined; error: undefined }; // idle/skipped state

/**
 * Generic hook for Sonar server action queries with shared session/auth handling
 */
export function useSonarQuery<TInput, TOutput>(
  action: (input: TInput) => Promise<ServerActionResult<TOutput>>,
  input: TInput
): SonarQueryState<TOutput> {
  const { authenticated, sonarConnected, refreshSession } = useSession();
  const [state, setState] = useState<SonarQueryState<TOutput>>({
    loading: true,
    data: undefined,
    error: undefined,
  });

  // Serialize input for stable dependency comparison
  const serializedInput = JSON.stringify(input);

  const fetchData = useCallback(async () => {
    if (!authenticated || !sonarConnected) {
      setState({ loading: false, data: undefined, error: undefined });
      return;
    }

    setState({ loading: true, data: undefined, error: undefined });

    try {
      const result = await action(JSON.parse(serializedInput) as TInput);

      if (!result.success) {
        if (result.unauthorized) {
          await refreshSession();
          return;
        }
        throw new Error(result.error);
      }

      setState({ loading: false, data: result.data, error: undefined });
    } catch (err) {
      setState({
        loading: false,
        data: undefined,
        error: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }, [authenticated, sonarConnected, action, serializedInput, refreshSession]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return state;
}
