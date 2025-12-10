"use client";

import { useSignMessage } from "wagmi";
import { signIn } from "next-auth/react";
import { useAccount } from "wagmi";

/**
 * Hook for Sign In With Ethereum
 */
export function useSIWE() {
    const { address } = useAccount();
    const { signMessageAsync } = useSignMessage();

    const signInWithEthereum = async () => {
        if (!address) {
            throw new Error("Wallet not connected");
        }

        // Create SIWE message
        const domain = typeof window !== "undefined" ? window.location.host : "localhost";
        const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
        const statement = "Sign in with Ethereum to the app.";
        // Generate cryptographically secure nonce
        const nonce = crypto.randomUUID();
        const expirationTime = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(); // 24 hours

        const message = `${domain} wants you to sign in with your Ethereum account:
${address}

${statement}

URI: ${origin}
Version: 1
Chain ID: 11155111
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}
Expiration Time: ${expirationTime}`;

        try {
            // Sign the message
            const signature = await signMessageAsync({ message });

            // Send to NextAuth
            const result = await signIn("siwe", {
                message,
                signature,
                redirect: false,
            });

            if (result?.error) {
                throw new Error(result.error);
            }

            return result;
        } catch (error) {
            console.error("SIWE error:", error);
            throw error;
        }
    };

    return {
        signInWithEthereum,
    };
}

