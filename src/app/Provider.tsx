"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { SonarProvider } from "@echoxyz/sonar-react";
import { sonarConfig } from "./config";
import { sepolia } from "wagmi/chains";

const config = createConfig(
    getDefaultConfig({
        chains: [sepolia],
        transports: {
            [sepolia.id]: http(),
        },

        // Required API Keys
        walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",

        // Required App Info
        appName: "Sonar Next.js example app",
        appDescription:
            "Next.js app showing how to integrate with the Sonar API via the sonar-react and sonar-core libraries.",
    }),
);

const queryClient = new QueryClient();

export const Provider = ({ children }: { children: React.ReactNode }) => {
    return (
        <SonarProvider config={sonarConfig}>
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                    <ConnectKitProvider>{children}</ConnectKitProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </SonarProvider>
    );
};
