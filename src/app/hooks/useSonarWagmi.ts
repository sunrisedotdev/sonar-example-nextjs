import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { EntityDetails } from "@echoxyz/sonar-core";
import { useSonarAuth, useSonarClient } from "@echoxyz/sonar-react";

export enum ConnectionState {
  Unknown = "unknown",
  WalletDisconnected = "wallet-disconnected",
  SonarDisconnected = "sonar-disconnected",
  AllConnected = "all-connected",
}

export type UseSonarEntityResult = {
  state: ConnectionState;
  loading: boolean;
  entity?: EntityDetails;
  error?: Error;
};

export function useSonarWagmi(args: {
  saleUUID: string;
}): UseSonarEntityResult {
  const { authenticated, ready } = useSonarAuth();
  const { address, isConnected } = useAccount();
  const client = useSonarClient();

  if (!args.saleUUID) {
    throw new Error("saleUUID is required");
  }

  const saleUUID = args.saleUUID;
  const activeWallet = address;

  const [state, setState] = useState<{
    loading: boolean;
    value?: EntityDetails;
    error?: Error;
    hasFetched: boolean;
  }>({
    loading: false,
    hasFetched: false,
  });

  const fullyConnected =
    ready && authenticated && Boolean(activeWallet) && isConnected;

  const refetch = useCallback(async () => {
    if (!saleUUID || !activeWallet || !fullyConnected) {
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    try {
      const resp = await client.readEntity({
        saleUUID,
        walletAddress: activeWallet,
      });
      setState({
        loading: false,
        value: resp.Entity,
        error: undefined,
        hasFetched: true,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({ loading: false, value: undefined, error, hasFetched: true });
    }
  }, [client, saleUUID, activeWallet, fullyConnected]);

  const reset = useCallback(() => {
    setState({
      loading: false,
      hasFetched: false,
      value: undefined,
      error: undefined,
    });
  }, []);

  useEffect(() => {
    if (fullyConnected) {
      if (!state.hasFetched && !state.loading) {
        refetch();
      }
    }
  }, [fullyConnected, state.hasFetched, state.loading, refetch]);

  useEffect(() => {
    if (ready && (!authenticated || !isConnected || !activeWallet)) {
      reset();
    }
  }, [ready, authenticated, isConnected, activeWallet, reset]);

  const connectionState: ConnectionState = (() => {
    if (!isConnected) {
      return ConnectionState.WalletDisconnected;
    }
    if (!authenticated) {
      return ConnectionState.SonarDisconnected;
    }
    if (fullyConnected) {
      return ConnectionState.AllConnected;
    }
    return ConnectionState.Unknown;
  })();

  return {
    state: connectionState,
    loading:
      state.loading ||
      (connectionState === "all-connected" && !state.hasFetched),
    entity: state.value,
    error: state.error,
  };
}
