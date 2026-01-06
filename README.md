# sonar-example-nextjs

A **backend-focused** example Next.js app showing how to integrate with the Sonar API.

There is an integration guide for the Sonar libraries [here](https://docs.echo.xyz/sonar/integration-guides/react).

This example implements a backend OAuth flow where tokens are stored server-side and all Sonar API requests are proxied through the backend. For a simpler frontend-only approach where tokens are managed client-side, see [sonar-example-react](https://github.com/sunrisedotdev/sonar-example-react).

## Why Use the Backend Approach?

This approach is more secure than a frontend-only approach since the access tokens stay on the server and do not need to be sent to the client at all.

However it does increase the complexity, which might not be worth it if you already have a frontend-only single page app.

## Running the App Locally

Set the required env vars listed in `src/app/config.ts` (or update that file).
You can find the values for your sale on the [Echo founder dashboard](https://app.echo.xyz/founder).

```sh
pnpm i
pnpm dev
```

## What This Example Demonstrates

- **OAuth authentication with Sonar** via a secure backend flow with PKCE
- **Token management** — server-side storage with automatic refresh
- **Entity state display** — prior to sale, list all user entities; during sale, show linked entity status
- **Pre-purchase checks** — validate eligibility before transactions
- **Purchase transactions** — generate permits and submit to the sale contract

## Architecture Overview

### OAuth Flow

The backend handles the complete OAuth flow, storing tokens securely server-side:

```
┌─────────┐          ┌─────────┐          ┌─────────┐          ┌─────────┐
│ Browser │          │ Next.js │          │  Echo   │          │  Sonar  │
│         │          │ Backend │          │  OAuth  │          │   API   │
└────┬────┘          └────┬────┘          └────┬────┘          └────┬────┘
     │                    │                    │                    │
     │ 1. Click "Connect" │                    │                    │
     ├───────────────────>│                    │                    │
     │                    │                    │                    │
     │                    │ 2. Generate PKCE   │                    │
     │                    │    params & store  │                    │
     │                    │    verifier        │                    │
     │                    │                    │                    │
     │ 3. Redirect to Echo OAuth               │                    │
     │<───────────────────┼───────────────────>│                    │
     │                    │                    │                    │
     │ 4. User authenticates                   │                    │
     │<─────────────────────────────────-─────>│                    │
     │                    │                    │                    │
     │ 5. Redirect with auth code              │                    │
     │────────────────────┼───────────────────>│                    │
     │                    │                    │                    │
     │                    │ 6. Exchange code   │                    │
     │                    │    for tokens      │                    │
     │                    │<──────────────────>│                    │
     │                    │                    │                    │
     │                    │ 7. Store tokens    │                    │
     │                    │    server-side     │                    │
     │                    │                    │                    │
     │ 8. Success response│                    │                    │
     │<───────────────────│                    │                    │
     │                    │                    │                    │
```

### Proxied API Requests

Once authenticated, all Sonar API calls go through the backend, which handles token refresh automatically:

```
┌─────────┐                   ┌─────────┐                   ┌─────────┐
│ Browser │                   │ Next.js │                   │  Sonar  │
│         │                   │ Backend │                   │   API   │
└────┬────┘                   └────┬────┘                   └────┬────┘
     │                             │                             │
     │ 1. POST /api/sonar/entities │                             │
     │    { saleUUID: "..." }      │                             │
     ├────────────────────────────>│                             │
     │                             │                             │
     │                             │ 2. Verify session           │
     │                             │    & get tokens             │
     │                             │                             │
     │                             │ 3. Refresh token            │
     │                             │    if expiring              │
     │                             │                             │
     │                             │ 4. GET /entities            │
     │                             │    Authorization: Bearer... │
     │                             ├────────────────────────────>│
     │                             │                             │
     │                             │ 5. Response                 │
     │                             │<────────────────────────────│
     │                             │                             │
     │ 6. Forward response         │                             │
     │<────────────────────────────│                             │
     │                             │                             │
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/   # NextAuth config & session management
│   │   │   └── sonar/           # Sonar OAuth routes (authorize, callback, disconnect)
│   │   └── sonar/               # Proxied Sonar API routes (entities, pre-purchase, etc.)
│   ├── components/
│   │   ├── auth/                # Login/logout UI
│   │   ├── entity/              # Entity display components
│   │   ├── registration/        # Pre-sale entity list & eligibility
│   │   └── sale/                # Purchase flow UI
│   ├── hooks/                   # React hooks for Sonar API calls
│   ├── oauth/callback/          # OAuth callback page (frontend)
│   ├── config.ts                # Environment configuration
│   ├── page.tsx                 # Main page
│   └── Provider.tsx             # App providers setup
└── lib/                         # Server-side utilities (token storage, PKCE, Sonar client)
```
