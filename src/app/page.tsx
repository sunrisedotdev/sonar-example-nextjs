"use client";

import { ConnectKitButton } from "connectkit";
import { APIError } from "@echoxyz/sonar-core";
import { useSonarAuth } from "@echoxyz/sonar-react";
import { ConnectionState, useSonarWagmi } from "./hooks/useSonarWagmi";
import { sonarConfig, sonarHomeURL } from "./config";
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
          return;
        }
        login();
      }}
    >
      <p className="text-gray-900">
        {authenticated ? "Disconnect from Sonar" : "Sign in with Sonar"}
      </p>
    </button>
  );
};

// TODO: support purchase flow, including liveness checks

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
  const { state, loading, entity, error } = useSonarWagmi({
    saleUUID: sonarConfig.saleUUID,
  });

  if (state === ConnectionState.Unknown) {
    return <p>Unknown state</p>;
  }

  if (
    state === ConnectionState.WalletDisconnected ||
    state === ConnectionState.SonarDisconnected
  ) {
    return <p>Connect your wallet and Sonar account to continue</p>;
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    if (error instanceof APIError && error.status === 404) {
      return (
        <p>
          No entity found for this user and wallet. Please link your wallet on{" "}
          <a
            className="font-bold underline underline-offset-4 cursor-pointer"
            href={sonarHomeURL.href}
          >
            Sonar
          </a>{" "}
          to continue.
        </p>
      );
    }
    return <p>Error: {error.message}</p>;
  }

  return <SonarEntity key={entity?.EntityUUID} value={entity} />;
};
