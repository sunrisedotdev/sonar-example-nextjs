"use client";

import {
  PrePurchaseFailureReason,
  PrePurchaseCheckResponse,
  AllocationPermit,
  EntityType,
} from "@echoxyz/sonar-core";
import { useState } from "react";
import { sonarConfig } from "./config";
import { useSonarPurchase } from "./hooks";

function PrePurchaseCheckState({
  prePurchaseCheckResponse,
}: {
  prePurchaseCheckResponse: PrePurchaseCheckResponse;
}) {
  let stateDescription;
  let stateFgColor;
  let stateBgColor;
  if (
    prePurchaseCheckResponse.ReadyToPurchase ||
    (!prePurchaseCheckResponse.ReadyToPurchase &&
      prePurchaseCheckResponse.FailureReason ==
        PrePurchaseFailureReason.REQUIRES_LIVENESS)
  ) {
    stateFgColor = "text-green-500";
    stateBgColor = "bg-green-50";
    stateDescription = "You are ready to purchase";
  } else if (
    prePurchaseCheckResponse.FailureReason ==
    PrePurchaseFailureReason.MAX_WALLETS_USED
  ) {
    stateFgColor = "text-amber-500";
    stateBgColor = "bg-amber-50";
    stateDescription =
      "Maximum number of wallets reached. This entity cannot use the connected wallet to commit funds to this sale. Please use a previous wallet or select a different investing entity.";
  } else if (
    prePurchaseCheckResponse.FailureReason ==
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

function PurchasePanel({
  entityUUID,
  entityType,
  walletAddress,
}: {
  entityUUID?: string;
  entityType?: EntityType;
  walletAddress?: string;
}) {
  const { loading, prePurchaseCheckResponse, generatePurchasePermit, error } =
    useSonarPurchase({
      saleUUID: sonarConfig.saleUUID,
      entityUUID,
      entityType,
      walletAddress,
    });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const purchase = async () => {
    if (!generatePurchasePermit) {
      setErrorMessage("Not ready to purchase");
      return;
    }

    try {
      const response = await generatePurchasePermit();
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

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!prePurchaseCheckResponse) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 bg-gray-100 p-4 rounded-xl w-full items-center">
      <h1 className="text-lg font-bold text-gray-900 w-full">Purchase</h1>

      <PrePurchaseCheckState
        prePurchaseCheckResponse={prePurchaseCheckResponse}
      />

      {prePurchaseCheckResponse.ReadyToPurchase && (
        <button
          className="cursor-pointer bg-gray-900 rounded-xl px-4 py-2 w-fit"
          onClick={purchase}
        >
          <p className="text-gray-100">Purchase</p>
        </button>
      )}

      {prePurchaseCheckResponse.FailureReason ===
        PrePurchaseFailureReason.REQUIRES_LIVENESS && (
        <button
          className="cursor-pointer bg-gray-900 rounded-xl px-4 py-2 w-fit"
          onClick={() => {
            window.open(prePurchaseCheckResponse.LivenessCheckURL, "_blank");
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
