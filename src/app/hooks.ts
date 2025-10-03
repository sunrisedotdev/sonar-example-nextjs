import {
  PrePurchaseCheckResponse,
  GeneratePurchasePermitResponse,
  EntityType,
} from "@echoxyz/sonar-core";
import { WalletConnection, useSonarClient } from "@echoxyz/sonar-react";
import { useState, useEffect, useCallback } from "react";

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
  wallet: WalletConnection;
}): UseSonarPurchaseResult {
  const saleUUID = args.saleUUID;
  const entityUUID = args.entityUUID;
  const entityType = args.entityType;
  const wallet = args.wallet;

  const client = useSonarClient();

  const [state, setState] = useState<{
    loading: boolean;
    value?: PrePurchaseCheckResponse;
    error?: Error;
    hasFetched: boolean;
  }>({
    loading: false,
    hasFetched: false,
  });

  const refetch = useCallback(async () => {
    if (!entityType || !entityUUID || !wallet.address) {
      return;
    }

    setState((prev) => ({
      ...prev,
      loading: true,
      error: undefined,
    }));

    try {
      const response = await client.prePurchaseCheck({
        saleUUID,
        entityType,
        entityUUID,
        walletAddress: wallet.address,
      });
      setState({
        loading: false,
        value: response,
        hasFetched: true,
      });
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
        hasFetched: true,
      });
    }
  }, [client, saleUUID, entityType, entityUUID, wallet.address]);

  const reset = useCallback(() => {
    setState({
      loading: false,
      value: undefined,
      error: undefined,
      hasFetched: false,
    });
  }, []);

  useEffect(() => {
    if (!state.hasFetched && !state.loading) {
      refetch();
    }
  }, [state.hasFetched, state.loading, refetch]);

  useEffect(() => {
    if (!entityUUID || !entityType || !wallet.address) {
      reset();
    }
  }, [entityUUID, entityType, wallet.address, reset]);

  const generatePurchasePermit =
    entityUUID && entityType && wallet.address && state.value?.ReadyToPurchase
      ? ((walletAddress: string) => {
          return async () =>
            await client.generatePurchasePermit({
              saleUUID,
              entityUUID,
              entityType,
              walletAddress: walletAddress,
            });
        })(wallet.address)
      : undefined;

  return {
    loading: state.loading,
    error: state.error,
    prePurchaseCheckResponse: state.value,
    generatePurchasePermit,
  };
}
