"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * OAuth callback content - uses useSearchParams which requires Suspense
 */
function OAuthCallbackContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Extract query parameters
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const oauthError = searchParams.get("error");

      if (oauthError) {
        setError(`OAuth error: ${oauthError}`);
        setTimeout(() => (window.location.href = "/"), 3000);
        return;
      }

      if (!code || !state) {
        setError("Missing authorization code or state");
        setTimeout(() => (window.location.href = "/"), 3000);
        return;
      }

      try {
        // Call backend callback handler
        const response = await fetch(`/api/auth/sonar/callback?code=${code}&state=${state}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          setError(errorData.error || "Failed to complete OAuth flow");
          setTimeout(() => (window.location.href = "/"), 3000);
          return;
        }

        // Success - do a hard navigation to home
        // This ensures a full page load that picks up the updated session
        window.location.href = "/";
      } catch {
        setError("Failed to process OAuth callback");
        setTimeout(() => (window.location.href = "/"), 3000);
      }
    };

    handleCallback();
  }, [searchParams]);

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
