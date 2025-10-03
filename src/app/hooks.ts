import {
  PrePurchaseCheckResponse,
  GeneratePurchasePermitResponse,
  EntityType,
} from "@echoxyz/sonar-core";
import { WalletConnection, useSonarClient } from "@echoxyz/sonar-react";
import { useState, useEffect } from "react";

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

  const [prePurchaseCheckState, setPrePurchaseCheckState] = useState<{
    loading: boolean;
    value?: PrePurchaseCheckResponse;
    error?: Error;
  }>({
    loading: false,
  });

  useEffect(() => {
    const prePurchaseCheck = async () => {
      if (!entityType || !entityUUID || !wallet.address) {
        return;
      }

      setPrePurchaseCheckState((prev) => ({
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
  }, [wallet.address, entityUUID, entityType, client]);

  const generatePurchasePermit =
    entityUUID &&
    entityType &&
    wallet.address &&
    prePurchaseCheckState.value?.ReadyToPurchase
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
    loading: prePurchaseCheckState.loading,
    error: prePurchaseCheckState.error,
    prePurchaseCheckResponse: prePurchaseCheckState.value,
    generatePurchasePermit,
  };
}
