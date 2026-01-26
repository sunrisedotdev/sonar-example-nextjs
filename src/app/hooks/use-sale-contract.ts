import { BasicPermitV3, GeneratePurchasePermitResponse } from "@echoxyz/sonar-core";
import { useCallback, useEffect, useState } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { saleContract } from "@/lib/config";
import { examplSaleABI } from "../ExampleSaleABI";
import { useConfig } from "wagmi";
import { simulateContract } from "wagmi/actions";

export const useSaleContract = (walletAddress: `0x${string}`) => {
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
    async ({ purchasePermitResp, amount }: { purchasePermitResp: GeneratePurchasePermitResponse; amount: bigint }) => {
      if (!("OpensAt" in purchasePermitResp.PermitJSON)) {
        throw new Error("Invalid purchase permit response - expected V3 permit");
      }
      const permit = purchasePermitResp.PermitJSON as BasicPermitV3;

      const { request } = await simulateContract(config, {
        address: saleContract,
        abi: examplSaleABI,
        functionName: "purchase",
        args: [
          amount,
          {
            saleSpecificEntityID: permit.SaleSpecificEntityID,
            saleUUID: permit.SaleUUID,
            wallet: permit.Wallet,
            expiresAt: BigInt(permit.ExpiresAt),
            minAmount: BigInt(permit.MinAmount),
            maxAmount: BigInt(permit.MaxAmount),
            minPrice: BigInt(permit.MinPrice),
            maxPrice: BigInt(permit.MaxPrice),
            opensAt: BigInt(permit.OpensAt),
            closesAt: BigInt(permit.ClosesAt),
            payload: permit.Payload,
          },
          purchasePermitResp.Signature,
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

  const {
    data: amountInContract,
    refetch: refetchAmountInContract,
    error: amountInContractError,
  } = useReadContract({
    address: saleContract,
    abi: examplSaleABI,
    functionName: "amountByAddress",
    args: [walletAddress],
  });

  useEffect(() => {
    if (txReceipt?.status === "success") {
      refetchAmountInContract();
    }
  }, [txReceipt?.status, refetchAmountInContract]);

  return {
    amountInContract,
    amountInContractError,
    commitWithPermit,
    awaitingTxReceipt,
    txReceipt,
    awaitingTxReceiptError,
  };
};

