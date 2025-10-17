# sonar-example-nextjs

Example Next.js app showing how to inetgrate with the Sonar API via the `sonar-react` and `sonar-core` libraries.

There is an integration guide for these libraries [here](https://docs.echo.xyz/sonar/integration-guides/react).

The example app demonstrates how to:

- Setup providers in `src/app/Provider.tsx`
- Authenticate with Sonar via the oauth flow
    - See `AuthButton` on how to create the login/logout buttons
    - See `src/app/oauth/callback/page.tsx` for an example of the oauth callback handler
- Display setup/eligibily state of the entity on Sonar that is linked to the currently connected wallet
    - See `src/app/SonarEntity.tsx` for an example of how to display the state of a user's entity
- Run prepurchase checks
    - See `src/app/PurchasePanel.tsx` for an example of how to run these checks and interpret the result
- Submit a purchase transaction to an example sale contract
    - See the `ReadyToPurchasePanel` in `src/app/PurchasePanel.tsx` for an example of how to generate a purchase permit and pass this to the contract,
      using the `useSaleContract` hook in `src/app/hooks.ts`

## Running the app locally

Set the required env vars listed in `src/app/config.ts` (or update that file).
You can find the values for your sale on the [Echo founder dashboard](https://app.echo.xyz/founder).

```sh
pnpm i
pnpm dev
```
