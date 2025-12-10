"use client";

import { EntityDetails, SaleEligibility } from "@echoxyz/sonar-core";
import { ConnectKitButton } from "connectkit";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { useAccount } from "wagmi";
import { sonarHomeURL } from "./config";
import { useSIWE } from "./hooks/use-siwe";
import { useSonarEntity } from "./hooks/use-sonar-entity";
import PurchasePanel from "./PurchasePanel";
import { EntityCard } from "./components/entity/EntityCard";

const SonarAuthButton = ({
  sonarConnected,
  onConnect,
  onDisconnect,
}: {
  sonarConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}) => {
  return (
    <button
      className="cursor-pointer bg-gray-100 rounded-xl px-4 py-2"
      onClick={() => {
        if (sonarConnected) {
          onDisconnect();
          return;
        }
        onConnect();
      }}
    >
      <p className="text-gray-900">{sonarConnected ? "Disconnect from Sonar" : "Connect Sonar"}</p>
    </button>
  );
};

const SonarEntityPanel = ({
  loading,
  entity,
  error,
  sonarConnected,
  walletAddress,
}: {
  loading: boolean;
  entity?: EntityDetails;
  error?: Error;
  sonarConnected: boolean;
  walletAddress?: string;
}) => {
  if (!walletAddress) {
    return <p>Connect your wallet to continue</p>;
  }

  if (!sonarConnected) {
    return <p>Connect your Sonar account to continue</p>;
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!entity) {
    return <p>No entity found for this wallet</p>;
  }

  return <EntityCard entity={entity} />;
};

export default function Home() {
  const { data: session, update } = useSession();
  const { address } = useAccount();
  const { signInWithEthereum } = useSIWE();
  const { loading, entity, error } = useSonarEntity(address);
  const [isConnectingSonar, setIsConnectingSonar] = useState(false);

  const handleConnectSonar = async () => {
    setIsConnectingSonar(true);
    try {
      window.location.href = "/api/auth/sonar/authorize";
    } catch (error) {
      console.error("Failed to connect Sonar:", error);
      setIsConnectingSonar(false);
    }
  };

  const handleDisconnectSonar = async () => {
    try {
      await fetch("/api/auth/sonar/disconnect", { method: "POST" });
      // Reload page to refresh session - session callback will check token store
      window.location.reload();
    } catch (error) {
      console.error("Failed to disconnect Sonar:", error);
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithEthereum();
    } catch (error) {
      console.error("Failed to sign in:", error);
    }
  };

  const sonarConnected = session?.user?.sonarConnected ?? false;
  const walletConnected = !!address;
  const appAuthenticated = !!session;

  return (
    <div className="flex flex-col gap-5 p-5 w-[500px] justify-center items-center">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-4">
          <ConnectKitButton />
          {!appAuthenticated && walletConnected && (
            <button
              className="cursor-pointer bg-gray-100 rounded-xl px-4 py-2"
              onClick={handleSignIn}
            >
              <p className="text-gray-900">Sign in with Ethereum</p>
            </button>
          )}
          {appAuthenticated && (
            <>
              <SonarAuthButton
                sonarConnected={sonarConnected}
                onConnect={handleConnectSonar}
                onDisconnect={handleDisconnectSonar}
              />
              <button
                className="cursor-pointer bg-gray-100 rounded-xl px-4 py-2"
                onClick={() => signOut()}
              >
                <p className="text-gray-900">Sign out</p>
              </button>
            </>
          )}
        </div>
        {!walletConnected && <p className="text-gray-400">Connect your wallet to continue</p>}
        {walletConnected && !appAuthenticated && (
          <p className="text-gray-400">Sign in with Ethereum to continue</p>
        )}
      </div>
      {appAuthenticated && (
        <SonarEntityPanel
          loading={loading}
          entity={entity}
          error={error}
          sonarConnected={sonarConnected}
          walletAddress={address}
        />
      )}
      {entity && address && entity.SaleEligibility === SaleEligibility.ELIGIBLE && appAuthenticated && (
        <PurchasePanel entityID={entity.EntityID} walletAddress={address} />
      )}
    </div>
  );
}
