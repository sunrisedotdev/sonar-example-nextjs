import { GeneratePurchasePermitResponse, Hex } from "@echoxyz/sonar-core";
import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { saleContract } from "./config";
import { saleABI } from "./SaleABI";

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

export type UseSaleContractResult = {
  awaitingTxReceipt: boolean;
  txReceipt?: ethers.TransactionReceipt | null;
  awaitingTxReceiptError?: Error;
  commitWithPermit: (args: {
    purchasePermitResp: GeneratePurchasePermitResponse;
    amount: bigint;
  }) => Promise<string>;
};

export const useSaleContract = (entityID: `0x${string}`) => {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [txReceipt, setTxReceipt] = useState<ethers.TransactionReceipt | null>(null);
  const [awaitingTxReceipt, setAwaitingTxReceipt] = useState(false);
  const [awaitingTxReceiptError, setAwaitingTxReceiptError] = useState<Error | undefined>(undefined);
  const [amountInContract, setAmountInContract] = useState<{
    addr: string;
    entityID: string;
    amount: bigint;
  } | null>(null);

  const commitWithPermit = useCallback(
    async ({
      purchasePermitResp,
      amount,
    }: {
      purchasePermitResp: GeneratePurchasePermitResponse;
      amount: bigint;
    }) => {
      // TODO: In the future, could also show an example of basic permits without per-entity allocations
      if (!("Permit" in purchasePermitResp.PermitJSON)) {
        throw new Error("Invalid purchase permit response");
      }

      try {
        // Get provider and signer from window.ethereum
        if (!window.ethereum) {
          throw new Error("No wallet found");
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(saleContract, saleABI, signer);

        // Prepare the transaction data
        const args = [
          amount,
          {
            permit: {
              entityID: arrayToHex(
                purchasePermitResp.PermitJSON.Permit.EntityID
              ),
              saleUUID: arrayToHex(
                purchasePermitResp.PermitJSON.Permit.SaleUUID
              ),
              wallet: purchasePermitResp.PermitJSON.Permit.Wallet as Hex,
              expiresAt: BigInt(purchasePermitResp.PermitJSON.Permit.ExpiresAt),
              payload: arrayToHex(purchasePermitResp.PermitJSON.Permit.Payload),
            },
            reservedAmount: BigInt(
              purchasePermitResp.PermitJSON.ReservedAmount
            ),
            minAmount: BigInt(purchasePermitResp.PermitJSON.MinAmount),
            maxAmount: BigInt(purchasePermitResp.PermitJSON.MaxAmount),
          },
          base64ToHex(purchasePermitResp.Signature),
        ];

        // Estimate gas first (similar to simulateContract)
        const gasEstimate = await contract.purchase.estimateGas(...args);
        
        // Send the transaction
        const tx = await contract.purchase(...args, {
          gasLimit: gasEstimate,
        });

        setTxHash(tx.hash as `0x${string}`);
        setAwaitingTxReceipt(true);
        setAwaitingTxReceiptError(undefined);

        // Wait for transaction receipt
        const receipt = await tx.wait();
        setTxReceipt(receipt);
        setAwaitingTxReceipt(false);

        return tx.hash;
      } catch (error) {
        setAwaitingTxReceipt(false);
        setAwaitingTxReceiptError(error as Error);
        throw error;
      }
    },
    []
  );

  // Function to fetch amount in contract
  const refetchAmountInContract = useCallback(async () => {
    try {
      if (!window.ethereum) {
        console.warn("No wallet found for reading contract");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(saleContract, saleABI, provider);
      const result = await contract.entityStateByID(entityID);
      setAmountInContract(result);
    } catch (error) {
      console.error("Error fetching contract data:", error);
    }
  }, [entityID]);

  // Fetch initial data
  useEffect(() => {
    refetchAmountInContract();
  }, [refetchAmountInContract]);

  // Refetch when transaction is successful
  useEffect(() => {
    if (txReceipt?.status === 1) { // 1 = success in ethers.js
      refetchAmountInContract();
    }
  }, [txReceipt?.status, refetchAmountInContract]);

  return {
    commitWithPermit,
    amountInContract,
    awaitingTxReceipt,
    txReceipt,
    awaitingTxReceiptError,
    txHash,
  };
};

function arrayToHex(arr: Uint8Array | number[] | undefined | null): Hex {
  if (!arr) {
    return "0x";
  }

  return `0x${Array.from(arr)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;
}

function base64ToHex(base64: string | null): Hex {
  if (!base64) {
    return "0x";
  }
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return arrayToHex(bytes);
}
