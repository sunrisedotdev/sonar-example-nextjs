"use client";

import { usePathname } from "next/navigation";

interface SonarAuthButtonProps {
  authenticated: boolean;
  login: () => void;
  logout: () => void;
  variant?: "default" | "indigo";
}

export function SonarAuthButton({
  authenticated,
  login,
  logout,
  variant = "default",
}: SonarAuthButtonProps) {
  const pathname = usePathname();

  const baseClasses =
    "cursor-pointer rounded-xl px-6 py-3 transition-colors font-medium";
  const variantClasses =
    variant === "indigo"
      ? "bg-indigo-100 hover:bg-indigo-200 text-indigo-900"
      : "bg-blue-100 hover:bg-blue-200 text-blue-900";

  const handleLogin = () => {
    // Store current path before redirecting to OAuth
    if (typeof window !== "undefined") {
      localStorage.setItem("sonar_oauth_return_path", pathname);
    }
    login();
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses}`}
      onClick={() => {
        if (authenticated) {
          logout();
          return;
        }
        handleLogin();
      }}
    >
      <p>{authenticated ? "Disconnect from Sonar" : "Sign in with Sonar"}</p>
    </button>
  );
}
