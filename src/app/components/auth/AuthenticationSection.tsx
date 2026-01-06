"use client";

import { ConnectKitButton } from "connectkit";
import { signOut, useSession } from "next-auth/react";
import { useAccount } from "wagmi";
import { useSIWE } from "../../hooks/use-siwe";

export function AuthenticationSection() {
  const { data: session } = useSession();
  const { address } = useAccount();
  const { signInWithEthereum } = useSIWE();

  const sonarConnected = session?.user?.sonarConnected ?? false;
  const walletConnected = !!address;
  const appAuthenticated = !!session;

  const handleSignIn = async () => {
    try {
      await signInWithEthereum();
    } catch (error) {
      console.error("Failed to sign in:", error);
    }
  };

  const handleConnectSonar = () => {
    window.location.href = "/api/auth/sonar/authorize";
  };

  const handleDisconnectSonar = async () => {
    try {
      await fetch("/api/auth/sonar/disconnect", { method: "POST" });
      window.location.reload();
    } catch (error) {
      console.error("Failed to disconnect Sonar:", error);
    }
  };

  if (!walletConnected) {
    return (
      <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex flex-col gap-3">
          <p className="text-gray-600">Connect your wallet to continue.</p>
          <ConnectKitButton />
        </div>
      </div>
    );
  }

  if (!appAuthenticated) {
    return (
      <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex flex-col gap-3">
          <p className="text-gray-600">Sign in with your wallet to continue.</p>
          <button onClick={handleSignIn} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors w-fit">
            Sign in with Ethereum
          </button>
        </div>
      </div>
    );
  }

  if (!sonarConnected) {
    return (
      <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex flex-col gap-3">
          <div className="flex flex-row justify-between items-center gap-4">
            <p className="text-gray-600">Connect your Sonar account to check your eligibility status.</p>
            <button onClick={() => signOut()} className="text-sm text-gray-500 hover:text-gray-700 underline">
              Sign out
            </button>
          </div>
          <button onClick={handleConnectSonar} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors w-fit">
            Connect with Sonar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex flex-row justify-between items-center flex-wrap gap-2">
        <p className="text-green-600 font-medium">✓ Sonar Connected</p>
        <div className="flex gap-4">
          <button onClick={handleDisconnectSonar} className="text-sm text-gray-500 hover:text-gray-700 underline">
            Disconnect Sonar
          </button>
          <button onClick={() => signOut()} className="text-sm text-gray-500 hover:text-gray-700 underline">
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
