import { GeneratePurchasePermitResponse } from "@echoxyz/sonar-core";
import { useCallback, useEffect, useState } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { saleContract } from "./config";
import { examplSaleABI } from "./ExampleSaleABI";
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
              abi: examplSaleABI,
              functionName: "purchase",
              args: [
                amount,
                {
                  permit: {
                    entityID: purchasePermitResp.PermitJSON.Permit.EntityID,
                    saleUUID: purchasePermitResp.PermitJSON.Permit.SaleUUID,
                    wallet: purchasePermitResp.PermitJSON.Permit.Wallet,
                    expiresAt: BigInt(purchasePermitResp.PermitJSON.Permit.ExpiresAt),
                    payload: purchasePermitResp.PermitJSON.Permit.Payload,
                  },
                  reservedAmount: BigInt(
                    purchasePermitResp.PermitJSON.ReservedAmount
                  ),
                  minAmount: BigInt(purchasePermitResp.PermitJSON.MinAmount),
                  maxAmount: BigInt(purchasePermitResp.PermitJSON.MaxAmount),
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
