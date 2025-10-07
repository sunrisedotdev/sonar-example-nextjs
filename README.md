# sonar-example-nextjs

Example Next.js app showing how to inetgrate with the Sonar API via the `sonar-react` and `sonar-core` libraries.

The key logic is implemented in the `src/app/page.tsx` file.

It demonstrates how to:

- Setup providers in `src/app/Provider.tsx`
- Authenticate with Sonar via the oauth flow
  - See `AuthButton` on how to create the login/logout buttons
  - See `src/app/oauth/callback/page.tsx` for an example of the oauth callback handler
- Display setup/eligibily state of the entity on Sonar that is linked to the currently connected wallet
  - See `src/app/SonarEntity.tsx` for an example of how to display the state of a user's entity

## Running the app locally

Set the required env vars listed in `src/app/config.ts` (or update that file).
You can find the values for your sale on the [Echo founder dashboard](https://app.echo.xyz/founder).

```sh
pnpm i
pnpm dev
```
