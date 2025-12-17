"use client";

import { usePathname } from "next/navigation";

interface AuthenticationSectionProps {
  ready: boolean;
  authenticated: boolean;
  login: () => void;
  logout: () => void;
}

export function AuthenticationSection({
  ready,
  authenticated,
  login,
  logout,
}: AuthenticationSectionProps) {
  const pathname = usePathname();

  const handleLogin = () => {
    // Store current path before redirecting to OAuth
    if (typeof window !== "undefined") {
      localStorage.setItem("sonar_oauth_return_path", pathname);
    }
    login();
  };

  return (
    <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
      {!ready ? (
        <p className="text-gray-600">Loading authentication...</p>
      ) : !authenticated ? (
        <div>
          <p className="text-gray-600">
            Connect your Sonar account to check your eligibility status.
          </p>
          <button
            onClick={handleLogin}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Connect with Sonar
          </button>
        </div>
      ) : (
        <div className="flex flex-row gap-2 justify-between items-center">
          <p className="text-green-600 font-medium">✓ Sonar Connected</p>
          <button
            onClick={logout}
            className="text-blue-600 hover:text-blue-800 font-medium underline"
          >
            Disconnect from Sonar
          </button>
        </div>
      )}
    </div>
  );
}
