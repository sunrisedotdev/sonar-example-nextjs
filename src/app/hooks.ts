import {
  PrePurchaseCheckResponse,
  GeneratePurchasePermitResponse,
} from "@echoxyz/sonar-core";
import {
  useSonarEntity,
  WalletConnection,
  useSonarClient,
} from "@echoxyz/sonar-react";
import { useState, useEffect } from "react";

export type UseSonarPurchaseResult = {
  loading: boolean;
  prePurchaseCheckResult?: PrePurchaseCheckResponse;
  generatePurchasePermit?: () => Promise<GeneratePurchasePermitResponse>;
  error?: Error;
};

export function useSonarPurchase(args: {
  saleUUID: string;
  wallet: WalletConnection;
}): UseSonarPurchaseResult {
  const {
    loading: entityLoading,
    error,
    entity,
  } = useSonarEntity(args);

  const client = useSonarClient();

  const [prePurchaseCheckState, setPrePurchaseCheckState] = useState<{
    loading: boolean;
    value?: PrePurchaseCheckResponse;
    error?: Error;
  }>({
    loading: false,
  });

  useEffect(() => {
    const prePurchaseCheck = async () => {
      if (!args.wallet.address || !entity) {
        return;
      }

      setPrePurchaseCheckState((prev) => ({
        ...prev,
        loading: true,
        error: undefined,
      }));

      try {
        const response = await client.prePurchaseCheck({
          saleUUID: args.saleUUID,
          entityType: entity.EntityType,
          entityUUID: entity.EntityUUID,
          walletAddress: args.wallet.address,
        });
        setPrePurchaseCheckState({
          loading: false,
          value: response,
        });
      } catch (error) {
        setPrePurchaseCheckState({
          loading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    };

    prePurchaseCheck();
  }, [args.wallet.address, entity, client]);

  if (entityLoading || !entity || error) {
    return {
      loading: entityLoading,
      error,
    };
  }

  const generatePurchasePermit = args.wallet.address
    ? ((walletAddress: string) => {
        return async () =>
          await client.generatePurchasePermit({
            saleUUID: args.saleUUID,
            entityUUID: entity.EntityUUID,
            entityType: entity.EntityType,
            walletAddress: walletAddress,
          });
      })(args.wallet.address)
    : undefined;

  return {
    loading: entityLoading || prePurchaseCheckState.loading,
    error: error || prePurchaseCheckState.error,
    prePurchaseCheckResult: prePurchaseCheckState.value,
    generatePurchasePermit,
  };
}
