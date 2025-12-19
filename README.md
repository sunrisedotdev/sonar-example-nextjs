# sonar-example-nextjs

Example Next.js app showing how to inetgrate with the Sonar API via the `sonar-react` and `sonar-core` libraries.

There is an integration guide for these libraries [here](https://docs.echo.xyz/sonar/integration-guides/react).

The example app demonstrates how to:

- Setup providers in `src/app/Provider.tsx`
- Authenticate with Sonar via the oauth flow
    - See `src/app/components/auth/AuthenticationSection.tsx` on how to create the login/logout buttons
    - See `src/app/oauth/callback/page.tsx` for an example of the oauth callback handler
- Prior to a sale going live, a way to list the state of all of a user's entities
    - See `src/app/page.tsx` while in the `!saleIsLive` state
- When sale is live, display setup/eligibily state of the entity on Sonar that is linked to the currently connected wallet
    - See `src/app/page.tsx` while in the `saleIsLive` state
- Surface the user's entity setup/eligibility state
    - See components in `src/app/components/entity`
- Run prepurchase checks
    - See `src/app/components/sale/PurchaseCard.tsx` for an example of how to run these checks and interpret the result
- Submit a purchase transaction to an example sale contract
    - See the `ReadyToPurchaseSection` in `src/app/components/sale/PurchaseCard.tsx` for an example of how to generate a purchase permit and pass this to the contract,
      using the `useSaleContract` hook in `src/app/hooks.ts`

## Running the app locally

Set the required env vars listed in `src/app/config.ts` (or update that file).
You can find the values for your sale on the [Echo founder dashboard](https://app.echo.xyz/founder).

```sh
pnpm i
pnpm dev
```
