import {
  PrePurchaseCheckResponse,
  GeneratePurchasePermitResponse,
  EntityType,
  EntityDetails,
  APIError,
} from "@echoxyz/sonar-core";
import { useSonarAuth, useSonarClient } from "@echoxyz/sonar-react";
import { useState, useEffect, useCallback } from "react";

export type UseSonarEntityResult = {
  authenticated: boolean;
  loading: boolean;
  entity?: EntityDetails;
  error?: Error;
};

export function useSonarEntity(args: {
  saleUUID: string;
  walletAddress?: string;
}): UseSonarEntityResult {
  const { authenticated, ready } = useSonarAuth();
  const client = useSonarClient();

  if (!args.saleUUID) {
    throw new Error("saleUUID is required");
  }

  const saleUUID = args.saleUUID;
  const walletAddress = args.walletAddress;

  const [state, setState] = useState<{
    loading: boolean;
    entity?: EntityDetails;
    walletAddress?: string; // To track the wallet address of the fetched entity (rather than the wallet address that was passed in)
    error?: Error;
    hasFetched: boolean;
  }>({
    loading: false,
    hasFetched: false,
  });

  const fullyConnected = ready && authenticated && Boolean(walletAddress);

  const refetch = useCallback(async () => {
    if (!walletAddress || !fullyConnected) {
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    try {
      const resp = await client.readEntity({
        saleUUID,
        walletAddress,
      });
      setState({
        loading: false,
        entity: resp.Entity,
        walletAddress: walletAddress,
        error: undefined,
        hasFetched: true,
      });
    } catch (err) {
      if (err instanceof APIError && err.status === 404) {
        // Return undefined entity if it doesn't exist
        setState({
          loading: false,
          entity: undefined,
          walletAddress: undefined,
          error: undefined,
          hasFetched: true,
        });
        return;
      }
      const error = err instanceof Error ? err : new Error(String(err));
      setState({
        loading: false,
        entity: undefined,
        walletAddress: undefined,
        error,
        hasFetched: true,
      });
    }
  }, [client, fullyConnected, saleUUID, walletAddress]);

  const reset = useCallback(() => {
    setState({
      loading: false,
      entity: undefined,
      walletAddress: undefined,
      error: undefined,
      hasFetched: false,
    });
  }, []);

  useEffect(() => {
    if (fullyConnected && state.walletAddress !== walletAddress) {
      console.log("refetching entity");
      refetch();
    }
  }, [fullyConnected, state.walletAddress, walletAddress, refetch]);

  useEffect(() => {
    if (ready && (!authenticated || !walletAddress)) {
      console.log("resetting entity");
      reset();
    }
  }, [ready, authenticated, walletAddress, reset]);

  return {
    authenticated,
    loading: state.loading,
    entity: state.entity,
    error: state.error,
  };
}

export type UseSonarPurchaseResult = {
  loading: boolean;
  prePurchaseCheckResponse?: PrePurchaseCheckResponse;
  generatePurchasePermit?: () => Promise<GeneratePurchasePermitResponse>;
  error?: Error;
};

export function useSonarPurchase(args: {
  saleUUID: string;
  entityUUID?: string;
  entityType?: EntityType;
  walletAddress?: string;
}): UseSonarPurchaseResult {
  const saleUUID = args.saleUUID;
  const entityUUID = args.entityUUID;
  const entityType = args.entityType;
  const walletAddress = args.walletAddress;

  const client = useSonarClient();

  const [state, setState] = useState<{
    loading: boolean;
    value?: PrePurchaseCheckResponse;
    walletAddress?: string; // To track the wallet address of the fetched entity (rather than the wallet address that was passed in)
    error?: Error;
    hasFetched: boolean;
  }>({
    loading: false,
    hasFetched: false,
  });

  const refetch = useCallback(async () => {
    if (!entityType || !entityUUID || !walletAddress) {
      return;
    }

    setState((s) => ({
      ...s,
      loading: true,
    }));

    try {
      const response = await client.prePurchaseCheck({
        saleUUID,
        entityType,
        entityUUID,
        walletAddress: walletAddress,
      });
      setState({
        loading: false,
        value: response,
        walletAddress: walletAddress,
        error: undefined,
        hasFetched: true,
      });
    } catch (error) {
      setState({
        loading: false,
        value: undefined,
        walletAddress: undefined,
        error: error instanceof Error ? error : new Error(String(error)),
        hasFetched: true,
      });
    }
  }, [client, saleUUID, entityType, entityUUID, walletAddress]);

  const reset = useCallback(() => {
    setState({
      loading: false,
      value: undefined,
      walletAddress: undefined,
      error: undefined,
      hasFetched: false,
    });
  }, []);

  useEffect(() => {
    if (entityUUID && state.walletAddress !== walletAddress) {
      console.log("refetching purchase");
      refetch();
    }
  }, [entityUUID, state.walletAddress, walletAddress, refetch]);

  useEffect(() => {
    if (!entityUUID || !walletAddress) {
      console.log("resetting purchase");
      reset();
    }
  }, [entityUUID, walletAddress, reset]);

  const generatePurchasePermit = useCallback(() => {
    if (!entityUUID || !walletAddress || !entityType) {
      // Should never happen because this callback is returned as undefined if the pre-purchase check has not run
      throw new Error("entityUUID and walletAddress are required");
    }
    return client.generatePurchasePermit({
      saleUUID,
      entityUUID,
      entityType,
      walletAddress,
    });
  }, [client, saleUUID, entityUUID, walletAddress, entityType]);

  return {
    loading: state.loading,
    error: state.error,
    prePurchaseCheckResponse: state.value,
    generatePurchasePermit: state.value?.ReadyToPurchase
      ? generatePurchasePermit
      : undefined,
  };
}
