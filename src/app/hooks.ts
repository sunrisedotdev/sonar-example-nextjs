import {
  GeneratePurchasePermitResponse,
  EntityType,
  EntityDetails,
  APIError,
  PrePurchaseFailureReason,
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

export type UseSonarPurchaseReadyToPurchaseResult = {
  loading: false;
  readyToPurchase: true;
  error: undefined;
  generatePurchasePermit: () => Promise<GeneratePurchasePermitResponse>;
};

export type UseSonarPurchaseNotReadyToPurchaseResult = {
  loading: false;
  readyToPurchase: false;
  error: undefined;
  failureReason: PrePurchaseFailureReason;
  livenessCheckURL: string;
};

export type UseSonarPurchaseErrorResult = {
  loading: false;
  readyToPurchase: false;
  error: Error;
};

export type UseSonarPurchaseLoadingResult = {
  loading: true;
  readyToPurchase: false;
  error: undefined;
};

export type UseSonarPurchaseResult =
  | UseSonarPurchaseLoadingResult
  | UseSonarPurchaseReadyToPurchaseResult
  | UseSonarPurchaseNotReadyToPurchaseResult
  | UseSonarPurchaseErrorResult;

export function useSonarPurchase(args: {
  saleUUID: string;
  entityUUID: string;
  entityType: EntityType;
  walletAddress: string;
}): UseSonarPurchaseResult {
  const saleUUID = args.saleUUID;
  const entityUUID = args.entityUUID;
  const entityType = args.entityType;
  const walletAddress = args.walletAddress;

  const client = useSonarClient();

  const generatePurchasePermit = useCallback(() => {
    return client.generatePurchasePermit({
      saleUUID,
      entityUUID,
      entityType,
      walletAddress,
    });
  }, [client, saleUUID, entityUUID, walletAddress, entityType]);

  const [state, setState] = useState<UseSonarPurchaseResult>({
    loading: true,
    readyToPurchase: false,
    error: undefined,
  });

  // To track the wallet address of the fetched entity (rather than the wallet address that was passed in)
  const [fetchedWalletAddress, setFetchedWalletAddress] = useState<string | undefined>(undefined);

  const refetch = useCallback(async () => {
    try {
      const response = await client.prePurchaseCheck({
        saleUUID,
        entityType,
        entityUUID,
        walletAddress,
      });
      if (response.ReadyToPurchase) {
        setState({
          loading: false,
          readyToPurchase: true,
          generatePurchasePermit,
          error: undefined,
        });
      } else {
        setState({
          loading: false,
          readyToPurchase: false,
          failureReason: response.FailureReason as PrePurchaseFailureReason,
          livenessCheckURL: response.LivenessCheckURL,
          error: undefined,
        });
      }
      setFetchedWalletAddress(walletAddress);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({
        loading: false,
        readyToPurchase: false,
        error: error,
      });
      setFetchedWalletAddress(undefined);
    }
  }, [client, saleUUID, entityType, entityUUID, walletAddress, generatePurchasePermit]);

  useEffect(() => {
    if (entityUUID && fetchedWalletAddress !== walletAddress) {
      setState({
        loading: true,
        readyToPurchase: false,
        error: undefined,
      });
      setFetchedWalletAddress(undefined);

      refetch();
    }
  }, [entityUUID, fetchedWalletAddress, walletAddress, refetch]);

  return state;
}
