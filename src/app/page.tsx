"use client";

import { useState, useEffect } from "react";
import { ConnectKitButton } from "connectkit";
import { useSonarAuth, useSonarEntity, useSonarEntities } from "@echoxyz/sonar-react";
import { saleUUID, sonarHomeURL, sonarConfig } from "./config";
import { useAccount } from "wagmi";
import PurchaseCard from "./components/sale/PurchaseCard";
import { SaleEligibility } from "@echoxyz/sonar-core";
import { AuthenticationSection } from "./components/auth/AuthenticationSection";
import { Entity } from "./components/sale/Entity";
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
  const {
    loading: entitiesLoading,
    entities,
    error: entitiesError,
  } = useSonarEntities({
    saleUUID: saleUUID,
  });

  const eligibleEntities = entities?.filter((entity) => entity.SaleEligibility === SaleEligibility.ELIGIBLE) || [];

  // Sale data
  const {
    loading: entityLoading,
    entity,
    error: entityError,
  } = useSonarEntity({
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
              <h1 className="text-3xl font-bold text-gray-900">Easy Company Token Sale</h1>
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
              <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <div className="text-center">
                  <p className="text-blue-900 font-semibold text-lg">Sale Starting Soon</p>
                  <p className="text-blue-700">Register now to ensure you&apos;re ready when the sale goes live</p>
                </div>
              </div>
            )}

            {saleIsLive && (
              <div className="bg-linear-to-r bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="text-center">
                  <p className="text-green-700 font-semibold text-lg">The sale is now live!</p>
                </div>
              </div>
            )}
          </div>

          {/* Registration Phase */}
          {!saleIsLive && (
            <div className="flex flex-col gap-8">
              <AuthenticationSection ready={ready} authenticated={authenticated} login={login} logout={logout} />

              {authenticated && (
                <div className="flex flex-col gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">Check Your Eligibility</h2>

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
            </div>
          )}

          {/* Sale Phase */}
          {saleIsLive && (
            <div className="flex flex-col gap-8">
              {/* Connection Buttons */}
              <AuthenticationSection ready={ready} authenticated={authenticated} login={login} logout={logout} />

              {/* Entity Information */}
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold text-gray-900">Your Entity Information</h2>
                <ConnectKitButton />
                <Entity
                  loading={entityLoading}
                  entity={entity}
                  error={entityError}
                  authenticated={authenticated}
                  walletAddress={address}
                />
              </div>

              {/* Purchase Panel */}
              {isEligible && address && (
                <div className="flex flex-col gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">Make a Purchase</h2>
                  <PurchaseCard entityID={entity.EntityID} walletAddress={address} />
                </div>
              )}

              {/* Not Eligible Message */}
              {entity && !isEligible && <NotEligibleMessage sonarHomeURL={sonarHomeURL.href} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
