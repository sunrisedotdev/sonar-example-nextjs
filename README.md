# sonar-example-react

A React example app demonstrating integration with the Sonar API using `@echoxyz/sonar-react` and `@echoxyz/sonar-core` libraries.

There is an integration guide for these libraries [here](https://docs.echo.xyz/sonar/integration-guides/react).

The example app demonstrates how to:

- Setup providers in `src/Provider.tsx`
- Authenticate with Sonar via the oauth flow
    - See `src/components/auth/AuthenticationSection.tsx` on how to create the login/logout buttons
    - See `src/pages/OAuthCallback.tsx` for an example of the oauth callback handler
- Prior to a sale going live, a way to list the state of all of a user's entities
    - See `src/pages/Home.tsx` while in the `!saleIsLive` state
- When sale is live, display setup/eligibily state of the entity on Sonar that is linked to the currently connected wallet
    - See `src/pages/Home.tsx` while in the `saleIsLive` state
- Surface the user's entity setup/eligibility state
    - See components in `src/components/entity`
- Run prepurchase checks
    - See `src/components/sale/PurchaseCard.tsx` for an example of how to run these checks and interpret the result
- Submit a purchase transaction to an example sale contract
    - See the `ReadyToPurchaseSection` in `src/components/sale/PurchaseCard.tsx` for an example of how to generate a purchase permit and pass this to the contract,
      using the `useSaleContract` hook in `src/hooks.ts`

## Configuration

By default this app is configured to point to use a test sonar sale and contract and should work out of the box.
If you want to point it at a different sale or contract, you can modify the env vars in `.env.local`.

## Running the app locally

```sh
pnpm i
pnpm dev
```

The app will be available at `http://localhost:3000`.
