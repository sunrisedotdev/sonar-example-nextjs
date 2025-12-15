"use client";

import { useState, useEffect } from "react";
import { ConnectKitButton } from "connectkit";
import { useSonarAuth, useSonarEntity, useSonarEntities } from "@echoxyz/sonar-react";
import { saleUUID, sonarHomeURL, sonarConfig } from "./config";
import { useAccount } from "wagmi";
import PurchasePanel from "./PurchasePanel";
import { SaleEligibility } from "@echoxyz/sonar-core";
import { SonarAuthButton } from "./components/auth/SonarAuthButton";
import { AuthenticationSection } from "./components/auth/AuthenticationSection";
import { EntityPanel } from "./components/sale/EntityPanel";
import { NotEligibleMessage } from "./components/sale/NotEligibleMessage";
import { EntitiesList } from "./components/registration/EntitiesList";
import { EligibilityResults } from "./components/registration/EligibilityResults";

export default function Home() {
  const [saleIsLive, setSaleIsLive] = useState(false);

  // Load sale state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("sale_is_live");
    if (stored === "true") {
      setSaleIsLive(true);
    }
  }, []);

  // Save sale state to localStorage
  const toggleSaleLive = () => {
    const newState = !saleIsLive;
    setSaleIsLive(newState);
    localStorage.setItem("sale_is_live", String(newState));
  };

  // Auth and data hooks
  const { address } = useAccount();
  const { login, authenticated, logout, ready } = useSonarAuth();

  // Registration data
  const { loading: entitiesLoading, entities, error: entitiesError } = useSonarEntities({
    saleUUID: saleUUID,
  });

  const eligibleEntities =
    entities?.filter(
      (entity) => entity.SaleEligibility === SaleEligibility.ELIGIBLE
    ) || [];

  // Sale data
  const { loading: entityLoading, entity, error: entityError } = useSonarEntity({
    saleUUID: saleUUID,
    walletAddress: address,
  });

  const isEligible = entity && entity.SaleEligibility === SaleEligibility.ELIGIBLE;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header with Status Toggle */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Easy Company Token Sale
              </h1>
              <button
                onClick={toggleSaleLive}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  saleIsLive
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {saleIsLive ? "🟢 Sale Live" : "⏳ Pre-Sale"}
              </button>
            </div>

            {/* Countdown Banner */}
            {!saleIsLive && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="text-center">
                  <p className="text-blue-900 font-semibold text-lg mb-2">
                    Sale Starting Soon
                  </p>
                  <p className="text-blue-700 mb-4">
                    Register now to ensure you&apos;re ready when the sale goes live
                  </p>
                  <button
                    onClick={toggleSaleLive}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                  >
                    🚀 Start Sale (Demo)
                  </button>
                </div>
              </div>
            )}

            {saleIsLive && (
              <p className="text-green-700 font-medium mb-4">
                🎉 The sale is now live! Connect your wallet to participate.
              </p>
            )}
          </div>

          {/* Registration Phase */}
          {!saleIsLive && (
            <>
              <AuthenticationSection
                ready={ready}
                authenticated={authenticated}
                login={login}
                logout={logout}
              />

              {authenticated && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Check Your Eligibility
                  </h2>

                  <EntitiesList
                    loading={entitiesLoading}
                    error={entitiesError}
                    entities={entities}
                    saleUUID={saleUUID}
                    sonarFrontendURL={sonarConfig.frontendURL}
                  />

                  {!entitiesLoading && !entitiesError && entities && (
                    <EligibilityResults
                      entities={entities}
                      eligibleEntities={eligibleEntities}
                      saleUUID={saleUUID}
                      sonarFrontendURL={sonarConfig.frontendURL}
                    />
                  )}
                </div>
              )}
            </>
          )}

          {/* Sale Phase */}
          {saleIsLive && (
            <>
              {/* Connection Buttons */}
              <div className="flex flex-wrap gap-4 mb-8 justify-center">
                <div className="transform hover:scale-105 transition-transform">
                  <ConnectKitButton />
                </div>
                <SonarAuthButton
                  authenticated={authenticated}
                  login={login}
                  logout={logout}
                  variant="indigo"
                />
              </div>

              {/* Entity Information */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Your Entity Information
                </h2>
                <EntityPanel
                  loading={entityLoading}
                  entity={entity}
                  error={entityError}
                  authenticated={authenticated}
                  walletAddress={address}
                />
              </div>

              {/* Purchase Panel */}
              {isEligible && address && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Make a Purchase
                  </h2>
                  <PurchasePanel entityID={entity.EntityID} walletAddress={address} />
                </div>
              )}

              {/* Not Eligible Message */}
              {entity && !isEligible && (
                <NotEligibleMessage sonarHomeURL={sonarHomeURL.href} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
