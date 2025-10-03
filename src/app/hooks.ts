import {
  PrePurchaseCheckResponse,
  GeneratePurchasePermitResponse,
  EntityType,
} from "@echoxyz/sonar-core";
import { WalletConnection, useSonarClient } from "@echoxyz/sonar-react";
import { useState, useEffect, useCallback, useRef } from "react";

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

  const prevParamsRef = useRef<{
    entityUUID?: string;
    entityType?: EntityType;
    walletAddress?: string;
}>({ entityUUID, entityType, walletAddress: wallet.address });

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
    const prevParams = prevParamsRef.current;
    const currentParams = { entityUUID, entityType, walletAddress: wallet.address };
    
    // Check if parameters have changed OR if this is the initial fetch
    const paramsChanged = 
        prevParams.entityUUID !== currentParams.entityUUID ||
        prevParams.entityType !== currentParams.entityType ||
        prevParams.walletAddress !== currentParams.walletAddress;
    const isInitialFetch = !state.hasFetched && !state.loading;
    
    if ((paramsChanged || isInitialFetch) && entityUUID && entityType && wallet.address && !state.loading) {
        refetch();
    }
    
    // Update the ref with current parameters
    prevParamsRef.current = currentParams;
}, [entityUUID, entityType, wallet.address, state.hasFetched, state.loading]);

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
