import { EntityDetails } from "@echoxyz/sonar-core";
import { EntityDetailRows } from "./EntityDetailRows";
import { EntityStateDescription } from "./EntityStateDescription";

interface EntityDisplayProps {
  entity?: EntityDetails;
}

export function EntityDisplay({ entity }: EntityDisplayProps) {
  return (
    <div className="flex flex-col gap-2 bg-gray-100 p-4 rounded-xl w-full">
      <EntityDetailRows entity={entity} />
      <EntityStateDescription entity={entity} />
    </div>
  );
}
