"use client";

import { ConnectKitButton } from "connectkit";
import { EntityDetails } from "@echoxyz/sonar-core";
import { useSonarAuth, useSonarClient } from "@echoxyz/sonar-react";
import { useCallback, useEffect, useState } from "react";
import { sonarConfig } from "./config";
import { useAccount } from "wagmi";
import SonarEntity from "./SonarEntity";

const SonarAuthButton = ({
  authenticated,
  login,
  logout,
}: {
  authenticated: boolean;
  login: () => void;
  logout: () => void;
}) => {
  return (
    <button
      className="cursor-pointer bg-gray-100 rounded-xl px-4 py-2"
      onClick={() => {
        if (authenticated) {
          logout();
        } else {
          login();
        }
      }}
    >
      <p className="text-gray-900">
        {authenticated ? "Disconnect from Sonar" : "Sign in with Sonar"}
      </p>
    </button>
  );
};

export type ResourceState<T> = {
  hasFetched: boolean;
  loading: boolean;
  error?: string;
  value?: T;
};

// TODO:
// support purchase flow, including liveness checks

export default function Home() {
  const { login, authenticated, logout } = useSonarAuth();

  return (
    <div className="flex flex-col gap-5 p-5 w-[500px] justify-center items-center">
      <div className="flex flex-row gap-4">
        <ConnectKitButton />
        <SonarAuthButton
          authenticated={authenticated}
          login={login}
          logout={logout}
        />
      </div>
      <SonarEntityPanel />
    </div>
  );
}

const SonarEntityPanel = () => {
  const client = useSonarClient();
  const { authenticated, ready } = useSonarAuth();
  const { address, isConnected } = useAccount();

  const [entity, setEntity] = useState<ResourceState<EntityDetails>>({
    hasFetched: false,
    loading: false,
    value: undefined,
  });

  const readEntity = useCallback(async () => {
    if (!ready || !authenticated || !address || !isConnected) {
      return;
    }

    try {
      const entity = await client.readEntity({
        saleUUID: sonarConfig.saleUUID,
        walletAddress: address,
      });
      setEntity({
        hasFetched: true,
        loading: false,
        value: entity.Entity,
      });
    } catch (error) {
      setEntity({
        hasFetched: true,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, [ready, authenticated, client, address, isConnected]);

  // Read entity on mount
  useEffect(() => {
    readEntity();
  }, [readEntity]);

  // Reset entity state if a user is not authenticated or doesn't have a connected wallet
  useEffect(() => {
    if (ready && (!authenticated || !address || !isConnected)) {
      setEntity({
        hasFetched: false,
        loading: false,
        value: undefined,
        error: undefined,
      });
    }
  }, [ready, authenticated, address, isConnected]);

  // Coordinate the state of both the wallet and Sonar account being connected.
  const fullyConnected = ready && authenticated && isConnected;
  const hasTriedLoading =
    !entity.loading &&
    (entity.value !== undefined || entity.error !== undefined);

  if (!fullyConnected) {
    return <p>Connect your wallet and Sonar account to continue</p>;
  }

  if (!ready || entity.loading || !hasTriedLoading) {
    return <p>Loading...</p>;
  }

  if (entity.error) {
    return <p>Error: {entity.error}</p>;
  }

  return <SonarEntity key={entity.value?.EntityUUID} value={entity.value} />;
};
