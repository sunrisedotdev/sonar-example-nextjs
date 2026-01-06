"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

/**
 * OAuth callback content - uses useSearchParams which requires Suspense
 */
function OAuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { update } = useSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Extract query parameters
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const oauthError = searchParams.get("error");

      if (oauthError) {
        setError(`OAuth error: ${oauthError}`);
        setTimeout(() => router.push("/"), 3000);
        return;
      }

      if (!code || !state) {
        setError("Missing authorization code or state");
        setTimeout(() => router.push("/"), 3000);
        return;
      }

      try {
        // Call backend callback handler
        const response = await fetch(`/api/auth/sonar/callback?code=${code}&state=${state}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          setError(errorData.error || "Failed to complete OAuth flow");
          setTimeout(() => router.push("/"), 3000);
          return;
        }

        // Success - refresh NextAuth session to pick up new tokens
        // The update() call triggers a new session fetch, which runs the session callback
        // The session callback checks the token store and updates sonarConnected
        await update(); // Force NextAuth to refresh the session (triggers session callback server-side)

        // Navigate to home - the session should now be updated
        router.push("/");
      } catch {
        setError("Failed to process OAuth callback");
        setTimeout(() => router.push("/"), 3000);
      }
    };

    handleCallback();
  }, [searchParams, router, update]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to home...</p>
          </>
        ) : (
          <h2 className="text-xl font-semibold mb-4 text-white">Connecting to Sonar...</h2>
        )}
      </div>
    </div>
  );
}

/**
 * OAuth callback page - redirects to backend callback handler
 * Wrapped in Suspense because useSearchParams requires it for static generation
 */
export default function OAuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4 text-white">Loading...</h2>
          </div>
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
