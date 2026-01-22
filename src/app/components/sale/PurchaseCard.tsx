"use client";

import { PrePurchaseFailureReason, GeneratePurchasePermitResponse, EntityID } from "@echoxyz/sonar-core";
import { UseSonarPurchaseResultNotReadyToPurchase, UseSonarPurchaseResultReadyToPurchase } from "@echoxyz/sonar-react";
import { useState } from "react";
import { saleUUID } from "@/lib/config";
import { useSonarPurchase } from "../../hooks/use-sonar-purchase";
import { useSaleContract } from "../../hooks/use-sale-contract";

function readinessConfig(
  sonarPurchaser: UseSonarPurchaseResultReadyToPurchase | UseSonarPurchaseResultNotReadyToPurchase
) {
  const okConfig = (msg: string) => ({
    fgCol: "text-green-800",
    bgCol: "bg-green-200",
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
      return warningConfig("The connected wallet is not eligible for this sale. Connect a different wallet.");
    case PrePurchaseFailureReason.MAX_WALLETS_USED:
      return warningConfig(
        "Maximum number of wallets reached — This entity can't use the connected wallet. Use a previous wallet."
      );
    case PrePurchaseFailureReason.WALLET_NOT_LINKED:
      return warningConfig(
        "Wallet not linked — The connected wallet is not linked to your entity. Please link it first."
      );
    case PrePurchaseFailureReason.SALE_NOT_ACTIVE:
      return errorConfig("The sale is not currently active.");
    default:
      return errorConfig("An unknown error occurred — Please try again or contact support.");
  }
}

function ReadyToPurchaseSection({
  walletAddress,
  generatePurchasePermit,
}: {
  walletAddress: `0x${string}`;
  generatePurchasePermit: () => Promise<GeneratePurchasePermitResponse>;
}) {
  const {
    commitWithPermit,
    amountInContract,
    amountInContractError,
    awaitingTxReceipt,
    txReceipt,
    awaitingTxReceiptError,
  } = useSaleContract(walletAddress);

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
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  // TODO: could fetch and show the user their allocation
  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="flex flex-col gap-2">
        <button
          disabled={loading || awaitingTxReceipt}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          onClick={purchase}
        >
          <p className="text-gray-100">{loading || awaitingTxReceipt ? "Loading..." : "Purchase 100"}</p>
        </button>

        {awaitingTxReceipt && !txReceipt && <p className="text-gray-900">Waiting for transaction receipt...</p>}
        {txReceipt?.status === "success" && <p className="text-green-500">Purchase successful</p>}
        {txReceipt?.status === "reverted" && <p className="text-red-500">Purchase reverted</p>}
        {error && <p className="text-red-500 wrap-anywhere">{error.message}</p>}
        {awaitingTxReceiptError && <p className="text-red-500 wrap-anywhere">{awaitingTxReceiptError.message}</p>}
      </div>

      <div className="bg-white p-2 rounded-md w-fit">
        {amountInContractError ? (
          <p className="text-red-500 wrap-anywhere">{amountInContractError.message}</p>
        ) : (
          <p className="text-gray-900">
            Current amount in contract:{" "}
            {amountInContract !== undefined ? `${Number(amountInContract) / 1e6}` : "Loading..."}
          </p>
        )}
      </div>
    </div>
  );
}

function PurchaseCard({ entityID, walletAddress }: { entityID: EntityID; walletAddress: `0x${string}` }) {
  const sonarPurchaser = useSonarPurchase({
    saleUUID,
    entityID,
    walletAddress,
  });

  if (sonarPurchaser.loading) {
    return <p>Loading...</p>;
  }

  if ("error" in sonarPurchaser && sonarPurchaser.error) {
    return <p>Error: {sonarPurchaser.error.message}</p>;
  }

  // At this point we know it's either ready or not-ready (not loading, not error)
  const purchaser = sonarPurchaser as UseSonarPurchaseResultReadyToPurchase | UseSonarPurchaseResultNotReadyToPurchase;
  const readinessCfg = readinessConfig(purchaser);

  return (
    <div className="flex flex-col gap-4 p-4 bg-linear-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
      <div className={`${readinessCfg.bgCol} p-2 rounded-md w-full`}>
        <p className={`${readinessCfg.fgCol} w-full`}>{readinessCfg.description}</p>
      </div>

      {purchaser.readyToPurchase && (
        <ReadyToPurchaseSection
          walletAddress={walletAddress}
          generatePurchasePermit={purchaser.generatePurchasePermit}
        />
      )}

      {!purchaser.readyToPurchase && purchaser.failureReason === PrePurchaseFailureReason.REQUIRES_LIVENESS && (
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors w-fit"
          onClick={() => {
            window.open(purchaser.livenessCheckURL, "_blank");
          }}
        >
          <p className="text-gray-100">Complete liveness check to purchase</p>
        </button>
      )}
    </div>
  );
}

export default PurchaseCard;
