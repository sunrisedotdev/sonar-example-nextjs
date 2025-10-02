"use client";

import {
  PrePurchaseFailureReason,
  PrePurchaseCheckResponse,
  SaleEligibility,
  EntitySetupState,
  AllocationPermit,
} from "@echoxyz/sonar-core";
import { useEffect, useState } from "react";
import { sonarConfig } from "./config";
import { useSonarClient, useSonarEntity } from "@echoxyz/sonar-react";
import { useAccount } from "wagmi";

function PrePurchaseCheckState({
  prePurchaseCheckState,
}: {
  prePurchaseCheckState: PrePurchaseCheckResponse;
}) {
  let stateDescription;
  let stateFgColor;
  let stateBgColor;
  if (
    prePurchaseCheckState.ReadyToPurchase ||
    (!prePurchaseCheckState.ReadyToPurchase &&
      prePurchaseCheckState.FailureReason ==
        PrePurchaseFailureReason.REQUIRES_LIVENESS)
  ) {
    stateFgColor = "text-green-500";
    stateBgColor = "bg-green-50";
    stateDescription = "You are ready to purchase";
  } else if (
    prePurchaseCheckState.FailureReason ==
    PrePurchaseFailureReason.MAX_WALLETS_USED
  ) {
    stateFgColor = "text-amber-500";
    stateBgColor = "bg-amber-50";
    stateDescription =
      "Maximum number of wallets reached. This entity cannot use the connected wallet to commit funds to this sale. Please use a previous wallet or select a different investing entity.";
  } else if (
    prePurchaseCheckState.FailureReason ==
    PrePurchaseFailureReason.NO_RESERVED_ALLOCATION
  ) {
    stateFgColor = "text-amber-500";
    stateBgColor = "bg-amber-50";
    stateDescription =
      "No reserved allocation. The connected wallet has no reserved allocation for this sale. Please connect a different wallet.";
  } else {
    stateFgColor = "text-red-500";
    stateBgColor = "bg-red-50";
    stateDescription = "Unknown failure reason. Please contact support.";
  }

  return (
    <div className={`${stateBgColor} p-2 rounded-md w-full`}>
      <p className={`${stateFgColor} w-full`}>{stateDescription}</p>
    </div>
  );
}

function PurchasePanel() {
  const { address, isConnected } = useAccount();
  const {
    authenticated,
    loading: entityLoading,
    entity,
  } = useSonarEntity({
    saleUUID: sonarConfig.saleUUID,
    wallet: { address, isConnected },
  });
  const client = useSonarClient();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [prePurchaseCheckState, setPrePurchaseCheckState] = useState<{
    loading: boolean;
    value?: PrePurchaseCheckResponse;
    error?: Error;
  }>({
    loading: false,
  });

  useEffect(() => {
    const prePurchaseCheck = async () => {
      if (!address || !authenticated || !entity) {
        return;
      }

      setPrePurchaseCheckState((prev) => ({
        ...prev,
        loading: true,
        error: undefined,
      }));

      try {
        const response = await client.prePurchaseCheck({
          saleUUID: sonarConfig.saleUUID,
          entityType: entity.EntityType,
          entityUUID: entity.EntityUUID,
          walletAddress: address,
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
  }, [address, authenticated, entity, client]);

  if (
    !address ||
    entityLoading ||
    entity?.SaleEligibility !== SaleEligibility.ELIGIBLE ||
    entity?.EntitySetupState !== EntitySetupState.COMPLETE ||
    !prePurchaseCheckState
  ) {
    return null;
  }

  const purchase = async () => {
    try {
      const response = await client.generatePurchasePermit({
        saleUUID: sonarConfig.saleUUID,
        entityUUID: entity.EntityUUID,
        entityType: entity.EntityType,
        walletAddress: address,
      });
      const r = response as unknown as {
        Signature: string;
        PermitJSON: AllocationPermit;
      };
      if (r.Signature && r.PermitJSON) {
        // These would get sent to the contract to commit funds
        console.log("response", response);
        setSuccessMessage("Purchase successful");
        return;
      }
    } catch (error) {
      setErrorMessage("Failed to generate purchase permit: " + error);
      return;
    }

    setErrorMessage("Failed to generate purchase permit");
  };

  if (prePurchaseCheckState.loading) {
    return <p>Loading...</p>;
  }

  if (prePurchaseCheckState.error) {
    return <p>Error: {prePurchaseCheckState.error.message}</p>;
  }

  if (!prePurchaseCheckState.value) {
    return <p>Error: No pre purchase check state</p>;
  }

  return (
    <div className="flex flex-col gap-2 bg-gray-100 p-4 rounded-xl w-full items-center">
      <h1 className="text-lg font-bold text-gray-900 w-full">Purchase</h1>

      <PrePurchaseCheckState
        prePurchaseCheckState={prePurchaseCheckState.value}
      />

      {prePurchaseCheckState.value.ReadyToPurchase && (
        <button
          className="cursor-pointer bg-gray-900 rounded-xl px-4 py-2 w-fit"
          onClick={purchase}
        >
          <p className="text-gray-100">Purchase</p>
        </button>
      )}

      {prePurchaseCheckState.value.FailureReason ===
        PrePurchaseFailureReason.REQUIRES_LIVENESS && (
        <button
          className="cursor-pointer bg-gray-900 rounded-xl px-4 py-2 w-fit"
          onClick={() => {
            window.open(
              prePurchaseCheckState.value?.LivenessCheckURL,
              "_blank"
            );
          }}
        >
          <p className="text-gray-100">Complete liveness check to purchase</p>
        </button>
      )}

      {successMessage && <p className="text-green-500">{successMessage}</p>}

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
    </div>
  );
}

export default PurchasePanel;
