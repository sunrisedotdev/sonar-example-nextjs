import { EntityDetails } from "@echoxyz/sonar-core";
import { saleUUID, sonarConfig } from "@/app/config";
import { EntityCard } from "../entity/EntityCard";

interface EntityProps {
  loading: boolean;
  entity?: EntityDetails;
  error?: Error;
  authenticated: boolean;
  walletAddress?: string;
}

export function Entity({ loading, entity, error, authenticated, walletAddress }: EntityProps) {
  if (!walletAddress || !authenticated) {
    return (
      <div className="flex flex-col gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-6 w-full">
        <p className="text-yellow-800 font-medium">Connection Required</p>
        <p className="text-yellow-700">Connect your wallet and Sonar account to continue with your purchase.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-2 bg-gray-50 rounded-lg p-6 w-full">
        <p className="text-gray-600">Loading your entity information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-2 bg-red-50 border border-red-200 rounded-lg p-6 w-full">
        <p className="text-red-800 font-medium">Error</p>
        <p className="text-red-700">{error.message}</p>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="flex flex-col gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-6 w-full">
        <div>
          <p className="text-yellow-800 font-medium">No Entity Found</p>
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

  return (
    <div className="flex flex-col gap-2 w-full">
      <EntityCard entity={entity} />
      <p className="text-gray-700 text-sm">
        You can switch entity by connecting a wallet that is linked to one of your other entities on{" "}
        <a
          href={`${sonarConfig.frontendURL}/sonar/${saleUUID}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Sonar
        </a>
        .
      </p>
    </div>
  );
}
