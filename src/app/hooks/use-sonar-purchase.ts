"use client";

import {
    EntityID,
    GeneratePurchasePermitResponse,
    PrePurchaseFailureReason,
} from "@echoxyz/sonar-core";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

export type UseSonarPurchaseResultLoading = {
    loading: true;
    readyToPurchase: false;
};

export type UseSonarPurchaseResultReadyToPurchase = {
    loading: false;
    readyToPurchase: true;
    generatePurchasePermit: () => Promise<GeneratePurchasePermitResponse>;
    livenessCheckURL?: string;
};

export type UseSonarPurchaseResultNotReadyToPurchase = {
    loading: false;
    readyToPurchase: false;
    failureReason: PrePurchaseFailureReason;
    livenessCheckURL?: string;
};

export type UseSonarPurchaseResultError = {
    loading: false;
    readyToPurchase: false;
    error: Error;
};

export type UseSonarPurchaseResult =
    | UseSonarPurchaseResultLoading
    | UseSonarPurchaseResultReadyToPurchase
    | UseSonarPurchaseResultNotReadyToPurchase
    | UseSonarPurchaseResultError;

/**
 * Hook for Sonar purchase flow
 * Replaces useSonarPurchase from sonar-react
 */
export function useSonarPurchase(args: {
    saleUUID: string;
    entityID: EntityID;
    walletAddress: string;
}): UseSonarPurchaseResult {
    const { data: session } = useSession();
    const [state, setState] = useState<UseSonarPurchaseResult>({
        loading: true,
        readyToPurchase: false,
    });

    const generatePurchasePermit = useCallback(async (): Promise<GeneratePurchasePermitResponse> => {
        if (!session?.user?.id) {
            throw new Error("Not authenticated");
        }

        const response = await fetch("/api/sonar/generate-purchase-permit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                saleUUID: args.saleUUID,
                entityID: args.entityID,
                walletAddress: args.walletAddress,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to generate purchase permit");
        }

        const data = await response.json();
        return data;
    }, [session?.user?.id, args.saleUUID, args.entityID, args.walletAddress]);

    const sonarConnected = session?.user?.sonarConnected ?? false;

    useEffect(() => {
        // Only fetch if user is authenticated AND connected to Sonar
        if (!session?.user?.id || !sonarConnected) {
            setState({
                loading: false,
                readyToPurchase: false,
                error: new Error("Not authenticated"),
            });
            return;
        }

        const fetchPurchaseData = async () => {
            setState({
                loading: true,
                readyToPurchase: false,
            });

            try {
                const response = await fetch("/api/sonar/pre-purchase-check", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        saleUUID: args.saleUUID,
                        entityID: args.entityID,
                        walletAddress: args.walletAddress,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to check purchase eligibility");
                }

                const data = await response.json();

                if (data.ReadyToPurchase) {
                    setState({
                        loading: false,
                        readyToPurchase: true,
                        generatePurchasePermit,
                        livenessCheckURL: data.LivenessCheckURL,
                    });
                    return;
                }

                setState({
                    loading: false,
                    readyToPurchase: false,
                    failureReason: data.FailureReason as PrePurchaseFailureReason,
                    livenessCheckURL: data.LivenessCheckURL,
                });
            } catch (err) {
                setState({
                    loading: false,
                    readyToPurchase: false,
                    error: err instanceof Error ? err : new Error(String(err)),
                });
            }
        };

        fetchPurchaseData();
    }, [session?.user?.id, sonarConnected, args.saleUUID, args.entityID, args.walletAddress, generatePurchasePermit]);

    return state;
}

