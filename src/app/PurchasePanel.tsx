"use client";

import {
  PrePurchaseFailureReason,
  AllocationPermit,
  EntityType,
  GeneratePurchasePermitResponse,
} from "@echoxyz/sonar-core";
import { useState } from "react";
import { sonarConfig } from "./config";
import {
  useSonarPurchase,
  UseSonarPurchaseResultReadyToPurchase,
  UseSonarPurchaseResultNotReadyToPurchase,
} from "./hooks";

function PrePurchaseCheckState({
  sonarPurchaser,
}: {
  sonarPurchaser:
    | UseSonarPurchaseResultReadyToPurchase
    | UseSonarPurchaseResultNotReadyToPurchase;
}) {
  let stateDescription;
  let stateFgColor;
  let stateBgColor;
  if (
    sonarPurchaser.readyToPurchase ||
    sonarPurchaser.failureReason == PrePurchaseFailureReason.REQUIRES_LIVENESS
  ) {
    stateFgColor = "text-green-500";
    stateBgColor = "bg-green-50";
    stateDescription = "You are ready to purchase";
  } else if (
    sonarPurchaser.failureReason == PrePurchaseFailureReason.MAX_WALLETS_USED
  ) {
    stateFgColor = "text-amber-500";
    stateBgColor = "bg-amber-50";
    stateDescription =
      "Maximum number of wallets reached. This entity cannot use the connected wallet to commit funds to this sale. Please use a previous wallet or select a different investing entity.";
  } else if (
    sonarPurchaser.failureReason ==
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

function PurchaseButton({
  generatePurchasePermit,
  onSuccess,
  onError,
}: {
  generatePurchasePermit: () => Promise<GeneratePurchasePermitResponse>;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}) {
  const purchase = async () => {
    try {
      const response = await generatePurchasePermit();
      const r = response as unknown as {
        Signature: string;
        PermitJSON: AllocationPermit;
      };
      if (r.Signature && r.PermitJSON) {
        // These would get sent to the contract to commit funds
        console.log("response", response);
        onSuccess("Purchase successful");
        return;
      }
    } catch (error) {
      onError("Failed to generate purchase permit: " + error);
      return;
    }

    onError("Failed to generate purchase permit");
  };

  return (
    <button
      className="cursor-pointer bg-gray-900 rounded-xl px-4 py-2 w-fit"
      onClick={purchase}
    >
      <p className="text-gray-100">Purchase</p>
    </button>
  );
}

function PurchasePanel({
  entityUUID,
  entityType,
  walletAddress,
}: {
  entityUUID: string;
  entityType: EntityType;
  walletAddress: string;
}) {
  const sonarPurchaser = useSonarPurchase({
    saleUUID: sonarConfig.saleUUID,
    entityUUID,
    entityType,
    walletAddress,
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (sonarPurchaser.loading) {
    return <p>Loading...</p>;
  }

  if (sonarPurchaser.error) {
    return <p>Error: {sonarPurchaser.error.message}</p>;
  }

  return (
    <div className="flex flex-col gap-2 bg-gray-100 p-4 rounded-xl w-full items-center">
      <h1 className="text-lg font-bold text-gray-900 w-full">Purchase</h1>

      <PrePurchaseCheckState sonarPurchaser={sonarPurchaser} />

      {sonarPurchaser.readyToPurchase && (
        <PurchaseButton
          generatePurchasePermit={sonarPurchaser.generatePurchasePermit}
          onSuccess={setSuccessMessage}
          onError={setErrorMessage}
        />
      )}

      {!sonarPurchaser.readyToPurchase &&
        sonarPurchaser.failureReason ===
          PrePurchaseFailureReason.REQUIRES_LIVENESS && (
          <button
            className="cursor-pointer bg-gray-900 rounded-xl px-4 py-2 w-fit"
            onClick={() => {
              window.open(sonarPurchaser.livenessCheckURL, "_blank");
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
