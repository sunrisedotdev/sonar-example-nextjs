export const sonarConfig = {
    saleUUID: process.env.REACT_APP_SALE_UUID ?? "510f2069-69e3-4cb1-bed1-2ad49513ee80",
    clientUUID: process.env.REACT_APP_OAUTH_CLIENT_UUID ?? "da4e8c0c-f514-438a-adab-d7bb0ed4fc85",
    redirectURI: (process.env.REACT_APP_FRONTEND_URL ?? "http://localhost:3001") + "/oauth/callback",
    // Optional:
    apiURL: process.env.REACT_APP_ECHO_API_URL ?? "http://localhost:4000",
    frontendURL: process.env.REACT_APP_FRONTEND_URL ?? "http://localhost:3000",
    tokenStorageKey: "sonar:auth-token",
};
