"use client";

import { ConnectKitButton } from "connectkit";
import { useSonarAuth, useSonarEntity } from "@echoxyz/sonar-react";
import { sonarConfig, sonarHomeURL } from "./config";
import SonarEntity from "./SonarEntity";
import { useAccount } from "wagmi";
import PurchasePanel from "./PurchasePanel";

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
      <PurchasePanel />
    </div>
  );
}

const SonarEntityPanel = () => {
  const { address, isConnected } = useAccount();
  const { authenticated, loading, entity, error } = useSonarEntity({
    saleUUID: sonarConfig.saleUUID,
    wallet: { address, isConnected },
  });

  if (!isConnected || !authenticated) {
    return <p>Connect your wallet and Sonar account to continue</p>;
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!entity) {
    return (
      <p>
        No entity found for this wallet. Please link your wallet on{" "}
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

  return <SonarEntity key={entity?.EntityUUID} value={entity} />;
};
