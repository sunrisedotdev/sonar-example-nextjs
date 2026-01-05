import { EntityDetails, EntityType } from "@echoxyz/sonar-core";

interface EntityDetailRowsProps {
  entity?: EntityDetails;
}

export function EntityDetailRows({ entity }: EntityDetailRowsProps) {
  if (!entity) {
    return null;
  }

  let usRegion = "unknown";
  switch (entity.InvestingRegion) {
    case "us":
      usRegion = "yes";
      break;
    case "other":
      usRegion = "no";
      break;
  }

  return (
    <div className="flex flex-col gap-1 bg-gray-200 p-2 rounded-md w-full">
      <span className="text-gray-900">
        Type: {entity.EntityType === EntityType.USER ? "individual" : "organization"}
      </span>
      <span className="text-gray-900">Is US investor: {usRegion}</span>
    </div>
  );
}
