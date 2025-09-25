import {
  SaleEligibility,
  EntitySetupState,
  EntityType,
  EntityDetails,
} from "@echoxyz/sonar-core";
import { sonarConfig } from "./config";

function EntityStateDescription({ entity }: { entity?: EntityDetails }) {
  if (!entity) {
    return (
      <div className={`bg-amber-50 p-2 rounded-md w-full`}>
        <p className={`text-amber-500 w-full`}>
          No entity found. You must have an entity in Sonar with a linked wallet
          matching the currently connected wallet.
        </p>
      </div>
    );
  }

  let stateDescription;
  let stateFgColor;
  let stateBgColor;
  switch (
    entity.EntitySetupState as EntitySetupState // TODO: should auto cast this in the library
  ) {
    case (EntitySetupState.NOT_STARTED, EntitySetupState.IN_PROGRESS):
      stateFgColor = "text-amber-500";
      stateBgColor = "bg-amber-50";
      stateDescription = "You need to complete entity setup on Sonar";
      break;
    case EntitySetupState.IN_REVIEW:
      stateFgColor = "text-gray-900";
      stateBgColor = "bg-gray-200";
      stateDescription = "Your entity is currently under review by Sonar";
      break;
    case EntitySetupState.FAILURE:
      stateFgColor = "text-amber-500";
      stateBgColor = "bg-amber-50";
      stateDescription =
        "There is an issue with your entity setup that needs to be resolved on Sonar";
      break;
    case EntitySetupState.FAILURE_FINAL:
      stateFgColor = "text-red-500";
      stateBgColor = "bg-red-50";
      stateDescription = "You are not eligible to invest in this sale";
    case EntitySetupState.COMPLETE:
      switch (entity.SaleEligibility as SaleEligibility) {
        case SaleEligibility.ELIGIBLE:
          stateFgColor = "text-green-500";
          stateBgColor = "bg-green-50";
          stateDescription = "You are eligible to invest in this sale";
          break;
        case SaleEligibility.NOT_ELIGIBLE:
          stateFgColor = "text-red-500";
          stateBgColor = "bg-red-50";
          stateDescription =
            "You are not currently eligible to invest in this sale";
          break;
      }
  }
  return (
    <div className={`${stateBgColor} p-2 rounded-md w-full`}>
      <p className={`${stateFgColor} w-full`}>{stateDescription}</p>
    </div>
  );
}

function EntityDetailRows({ entity }: { entity?: EntityDetails }) {
  if (!entity) {
    return null;
  }

  let usRegion = "unknown";
  switch (
    entity.InvestingRegion // TODO: should have a type for this in the library
  ) {
    case "us":
      usRegion = "yes";
      break;
    case "other":
      usRegion = "no";
      break;
  }

  return (
    <div className="flex flex-col gap-1 bg-gray-200 p-2 rounded-md w-full">
      {entity.Label && (
        <span className="text-gray-900">Investing as: {entity.Label}</span>
      )}
      <span className="text-gray-900">
        Type:{" "}
        {entity.EntityType === EntityType.USER ? "individual" : "organization"}
      </span>
      <span className="text-gray-900">Is US investor: {usRegion}</span>
    </div>
  );
}

export default function SonarEntity({
  value: entity,
}: {
  value?: EntityDetails;
}) {
  const onClick = () => {
    if (!entity) {
      return;
    }
    window.open(
      new URL(`/sonar/${sonarConfig.saleUUID}`, sonarConfig.frontendURL).href,
      "_blank"
    );
  };

  return (
    <div className="flex flex-col gap-2 bg-gray-100 p-4 rounded-xl w-full items-center">
      <h1 className="text-lg font-bold text-gray-900 w-full">
        Sonar entity details
      </h1>

      <EntityDetailRows entity={entity} />
      <EntityStateDescription entity={entity} />

      <button
        className="cursor-pointer bg-gray-900 rounded-xl px-4 py-2 w-fit"
        onClick={onClick}
      >
        <p className="text-gray-100">Manage on Sonar</p>
      </button>
    </div>
  );
}
