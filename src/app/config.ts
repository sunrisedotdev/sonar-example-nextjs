export const sonarConfig = {
    clientUUID: process.env.NEXT_PUBLIC_OAUTH_CLIENT_UUID ?? "d4301660-d56f-4a1b-ba46-29c909b58dfe",
    // Must match a redirect URI configured for your sale's oauth client on the Echo founder dashboard
    redirectURI: process.env.NEXT_PUBLIC_OAUTH_CLIENT_REDIRECT_URI ?? "http://localhost:3000/oauth/callback",

    // Optional:
    apiURL: process.env.NEXT_PUBLIC_ECHO_API_URL, // The sonar API URL - unlikely you'll need to change this
    frontendURL: process.env.NEXT_PUBLIC_FRONTEND_URL, // The sonar frontend URL - unlikely you'll need to change this
    tokenStorageKey: "sonar:auth-token",
};

export const saleUUID =
  process.env.REACT_APP_SALE_UUID ?? "c3e73992-d3d3-4c83-8709-d5864221da46";

export const sonarHomeURL = new URL(
  `/sonar/${saleUUID}/home`,
  sonarConfig.frontendURL ?? "https://app.echo.xyz"
);

export const saleContract = "0x296609c8631992C540CD418bF71E1089cDD6A651";
