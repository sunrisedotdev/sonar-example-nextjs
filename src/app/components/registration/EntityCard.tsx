import { EntityDetails, SaleEligibility } from "@echoxyz/sonar-core";
import { EntityDetailRows } from "../entity/EntityDetailRows";
import { EntityStateDescription } from "../entity/EntityStateDescription";

interface EntityCardProps {
  entity: EntityDetails;
}

export function EntityCard({ entity }: EntityCardProps) {
  const isEligible = entity.SaleEligibility === SaleEligibility.ELIGIBLE;

  return (
    <div
      className={`p-4 rounded-lg border-2 ${
        isEligible
          ? "bg-green-50 border-green-300"
          : "bg-gray-50 border-gray-300"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <p className="font-medium text-gray-900">
          {entity.Label || "No name set"}
        </p>
        {isEligible && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-200 text-green-800">
            ✓ Eligible
          </span>
        )}
      </div>

      <div className="space-y-2">
        <EntityDetailRows entity={entity} />
        <EntityStateDescription entity={entity} />
      </div>
    </div>
  );
}
