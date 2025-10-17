"use client";

import {
  PrePurchaseFailureReason,
  GeneratePurchasePermitResponse,
} from "@echoxyz/sonar-core";
import { useState } from "react";
import { saleUUID } from "./config";
import {
  useSonarPurchase,
  UseSonarPurchaseResultNotReadyToPurchase,
  UseSonarPurchaseResultReadyToPurchase,
} from "@echoxyz/sonar-react";
import { useSaleContract } from "./hooks";

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

function ReadyToPurchasePanel({
  entityID,
  generatePurchasePermit,
}: {
  entityID: `0x${string}`;
  generatePurchasePermit: () => Promise<GeneratePurchasePermitResponse>;
}) {
  const { commitWithPermit, amountInContract, awaitingTxReceipt, txReceipt, awaitingTxReceiptError } =
    useSaleContract(entityID);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | undefined>(undefined);

  const purchase = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const purchasePermitResp = await generatePurchasePermit();
      await commitWithPermit({
        purchasePermitResp: purchasePermitResp,
        // TODO: could support selecting the amount
        amount: BigInt(1e8),
      });
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  // TODO: could fetch and show the user their allocation
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 items-center">
        <button
          disabled={loading || awaitingTxReceipt}
          className="cursor-pointer bg-gray-900 rounded-xl px-4 py-2 w-fit"
          onClick={purchase}
        >
          <p className="text-gray-100">
            {loading || awaitingTxReceipt ? "Loading..." : "Purchase 100"}
          </p>
        </button>

        {awaitingTxReceipt && !txReceipt && (
          <p className="text-gray-900">Waiting for transaction receipt...</p>
        )}
        {txReceipt?.status === "success" && (
          <p className="text-green-500">Purchase successful</p>
        )}
        {txReceipt?.status === "reverted" && (
          <p className="text-red-500">Purchase reverted</p>
        )}
        {error && <p className="text-red-500 wrap-anywhere">{error.message}</p>}
        {awaitingTxReceiptError && <p className="text-red-500 wrap-anywhere">{awaitingTxReceiptError.message}</p>}
      </div>

      <div className="bg-white p-2 rounded-md w-fit">
        <p className="text-gray-900">
          Current amount in contract:{" "}
          {amountInContract
            ? `${Number(amountInContract.amount) / 1e6}`
            : "Loading..."}
        </p>
      </div>
    </div>
  );
}

function PurchasePanel({
  entityUUID,
  entityID,
  walletAddress,
}: {
  entityUUID: string;
  entityID: `0x${string}`;
  walletAddress: `0x${string}`;
}) {
  const sonarPurchaser = useSonarPurchase({
    saleUUID,
    entityUUID,
    walletAddress,
  });

  if (sonarPurchaser.loading) {
    return <p>Loading...</p>;
  }

  if (sonarPurchaser.error) {
    return <p>Error: {sonarPurchaser.error.message}</p>;
  }

  const readinessCfg = readinessConfig(sonarPurchaser);

  return (
    <div className="flex flex-col gap-8 bg-gray-100 p-4 rounded-xl w-full">
      <div className="flex flex-col gap-2 items-center">
        <h1 className="text-lg font-bold text-gray-900 w-full">Purchase</h1>

        <div className={`${readinessCfg.bgCol} p-2 rounded-md w-full`}>
          <p className={`${readinessCfg.fgCol} w-full`}>
            {readinessCfg.description}
          </p>
        </div>

        {sonarPurchaser.readyToPurchase && (
          <ReadyToPurchasePanel
            entityID={entityID}
            generatePurchasePermit={sonarPurchaser.generatePurchasePermit}
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
              <p className="text-gray-100">
                Complete liveness check to purchase
              </p>
            </button>
          )}
      </div>
    </div>
  );
}

export default PurchasePanel;
