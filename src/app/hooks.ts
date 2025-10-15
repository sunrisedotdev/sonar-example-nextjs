import { GeneratePurchasePermitResponse, Hex } from "@echoxyz/sonar-core";
import { useCallback, useEffect, useState } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { saleContract } from "./config";
import { saleABI } from "./SaleABI";
import { useConfig, type UseWaitForTransactionReceiptReturnType  } from "wagmi";
import { simulateContract } from "wagmi/actions";

export type UseSaleContractResult = {
  awaitingTxReceipt: boolean;
  txReceipt?: UseWaitForTransactionReceiptReturnType;
  awaitingTxReceiptError?: Error;
  commitWithPermit: (args: {
    purchasePermitResp: GeneratePurchasePermitResponse;
    amount: bigint;
  }) => Promise<string>;
};

export const useSaleContract = (entityID: `0x${string}`) => {
  const { writeContractAsync } = useWriteContract();
  const config = useConfig();

  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  const {
    data: txReceipt,
    isFetching: awaitingTxReceipt,
    error: awaitingTxReceiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

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

      const { request } = await simulateContract(config, {
        address: saleContract,
        abi: saleABI,
        functionName: "purchase",
        args: [
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
        ] as const,
      });

      setTxHash(
        await writeContractAsync(request, {
          onError: (error: Error) => {
            throw error;
          },
        })
      );
    },
    [writeContractAsync, config]
  );

  const { data: amountInContract, refetch: refetchAmountInContract } =
    useReadContract({
      address: saleContract,
      abi: saleABI,
      functionName: "entityStateByID",
      args: [entityID],
    });

  useEffect(() => {
    if (txReceipt?.status === "success") {
      refetchAmountInContract();
    }
  }, [txReceipt?.status, refetchAmountInContract]);

  return {
    commitWithPermit,
    amountInContract,
    awaitingTxReceipt,
    txReceipt,
    awaitingTxReceiptError,
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
