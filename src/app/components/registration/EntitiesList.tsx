import { EntityDetails } from "@echoxyz/sonar-core";
import { EntityCard } from "./EntityCard";

interface EntitiesListProps {
  loading: boolean;
  error?: Error;
  entities?: EntityDetails[];
  saleUUID: string;
  sonarFrontendURL: string | undefined;
}

export function EntitiesList({
  loading,
  error,
  entities,
  saleUUID,
  sonarFrontendURL,
}: EntitiesListProps) {
  if (loading) {
    return <p className="text-gray-600">Loading your entities...</p>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error loading entities: {error.message}</p>
      </div>
    );
  }

  if (!entities || entities.length === 0) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 font-medium mb-2">No entities found</p>
        <p className="text-yellow-700 mb-4">
          You need to set up an entity on Sonar before you can participate in
          this sale.
        </p>
        <a
          href={`${sonarFrontendURL}/sales/${saleUUID}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Continue Setup on Sonar
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entities.map((entity) => (
        <EntityCard key={entity.EntityID} entity={entity} />
      ))}
    </div>
  );
}
