"use client";

import {
  PrePurchaseFailureReason,
  AllocationPermit,
  GeneratePurchasePermitResponse,
} from "@echoxyz/sonar-core";
import { useState } from "react";
import { saleUUID } from "./config";
import {
  useSonarPurchase,
  UseSonarPurchaseResultNotReadyToPurchase,
  UseSonarPurchaseResultReadyToPurchase,
} from "@echoxyz/sonar-react";

function readinessConfig(
  sonarPurchaser:
    | UseSonarPurchaseResultReadyToPurchase
    | UseSonarPurchaseResultNotReadyToPurchase
) {
  const okConfig = (msg: string) => ({
    fgCol: "text-green-500",
    bgCol: "bg-green-50",
    description: msg,
  });

  const warningConfig = (msg: string) => ({
    fgCol: "text-amber-500",
    bgCol: "bg-amber-50",
    description: msg,
  });

  const errorConfig = (msg: string) => ({
    fgCol: "text-red-500",
    bgCol: "bg-red-50",
    description: msg,
  });

  if (sonarPurchaser.readyToPurchase) {
    return okConfig("You are ready to purchase");
  }

  switch (sonarPurchaser.failureReason) {
    case PrePurchaseFailureReason.REQUIRES_LIVENESS:
      return okConfig("Complete a liveness check in order to purchase.");
    case PrePurchaseFailureReason.WALLET_RISK:
      return warningConfig(
        "The connected wallet is not eligible for this sale. Connect a different wallet."
      );
    case PrePurchaseFailureReason.MAX_WALLETS_USED:
      return warningConfig(
        "Maximum number of wallets reached — This entity can’t use the connected wallet. Use a previous wallet."
      );
    case PrePurchaseFailureReason.NO_RESERVED_ALLOCATION:
      return warningConfig(
        "No reserved allocation — The connected wallet doesn’t have a reserved spot for this sale. Connect a different wallet."
      );
    case PrePurchaseFailureReason.SALE_NOT_ACTIVE:
      return errorConfig("The sale is not currently active.");
    default:
      return errorConfig(
        "An unknown error occurred — Please try again or contact support."
      );
  }
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
  walletAddress,
}: {
  entityUUID: string;
  walletAddress: string;
}) {
  const sonarPurchaser = useSonarPurchase({
    saleUUID,
    entityUUID,
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

  const readinessCfg = readinessConfig(sonarPurchaser);

  return (
    <div className="flex flex-col gap-2 bg-gray-100 p-4 rounded-xl w-full items-center">
      <h1 className="text-lg font-bold text-gray-900 w-full">Purchase</h1>

      <div
        className={`${readinessCfg.bgCol} p-2 rounded-md w-full`}
      >
        <p className={`${readinessCfg.fgCol} w-full`}>
          {readinessCfg.description}
        </p>
      </div>

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
