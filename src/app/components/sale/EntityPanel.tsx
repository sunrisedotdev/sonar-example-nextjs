import { EntityDetails } from "@echoxyz/sonar-core";
import { EntityDisplay } from "../entity/EntityDisplay";
import { sonarConfig } from "@/app/config";

interface EntityPanelProps {
  loading: boolean;
  entity?: EntityDetails;
  error?: Error;
  authenticated: boolean;
  walletAddress?: string;
}

export function EntityPanel({
  loading,
  entity,
  error,
  authenticated,
  walletAddress,
}: EntityPanelProps) {
  if (!walletAddress || !authenticated) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 w-full">
        <p className="text-yellow-800 font-medium mb-2">Connection Required</p>
        <p className="text-yellow-700">
          Connect your wallet and Sonar account to continue with your purchase.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 w-full">
        <p className="text-gray-600">Loading your entity information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 w-full">
        <p className="text-red-800 font-medium mb-2">Error</p>
        <p className="text-red-700">{error.message}</p>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 w-full flex flex-col gap-4">
        <div>
        <p className="text-yellow-800 font-medium mb-2">No Entity Found</p>
        <p className="text-yellow-700">
          No entity found for this wallet. Please link your wallet on Sonar to continue.
        </p>
        </div>
        <div>
        <a
          href={sonarConfig.frontendURL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Continue Setup on Sonar
        </a>
        </div>
      </div>
    );
  }

  return <EntityDisplay entity={entity} />;
}
