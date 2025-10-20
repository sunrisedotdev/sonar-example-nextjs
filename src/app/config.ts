import { Hex } from "@echoxyz/sonar-core";
import { SonarProviderConfig } from "@echoxyz/sonar-react";

export const sonarConfig = {
    clientUUID: process.env.NEXT_PUBLIC_OAUTH_CLIENT_UUID ?? "",
    redirectURI: process.env.NEXT_PUBLIC_OAUTH_CLIENT_REDIRECT_URI ?? "",
} as SonarProviderConfig;

export const saleUUID = process.env.NEXT_PUBLIC_SALE_UUID ?? "";
export const saleContract =
    (process.env.NEXT_PUBLIC_SALE_CONTRACT_ADDRESS as Hex) ?? "0x0000000000000000000000000000000000000000";
export const sonarHomeURL = new URL(`/sonar/${saleUUID}/home`, "https://app.echo.xyz");
