/**
 * SIWE (Sign In With Ethereum) verification utilities
 * Uses the siwe library for message parsing and signature verification
 */

import { SiweMessage } from "siwe";

/**
 * Verify SIWE message signature
 * @param message - The SIWE message string
 * @param signature - The signature string (hex format with 0x prefix)
 * @returns The verified Ethereum address if valid, null otherwise
 */
export const siwe = {
    async verify(message: string, signature: string): Promise<string | null> {
        try {
            // Parse the SIWE message
            const siweMessage = new SiweMessage(message);

            // Verify domain matches expected domain (if configured)
            const expectedDomain = process.env.NEXT_PUBLIC_SIWE_DOMAIN;
            if (expectedDomain) {
                // Allow both with and without port for localhost
                const normalizedExpected = expectedDomain.split(":")[0];
                const normalizedParsed = siweMessage.domain.split(":")[0];
                if (normalizedExpected !== normalizedParsed) {
                    console.error("SIWE: Domain mismatch");
                    return null;
                }
            }

            // Validate chain ID if present (optional - can be configured via env)
            const expectedChainId = process.env.NEXT_PUBLIC_SIWE_CHAIN_ID;
            if (expectedChainId && siweMessage.chainId) {
                const expectedChainIdNum = parseInt(expectedChainId, 10);
                if (siweMessage.chainId !== expectedChainIdNum) {
                    console.error("SIWE: Chain ID mismatch");
                    return null;
                }
            }

            // Verify the signature using the siwe library
            // This performs cryptographic signature verification and validates message fields
            const result = await siweMessage.verify({
                signature,
            });

            // Check if verification was successful
            if (!result.success) {
                console.error("SIWE: Verification failed", result.error);
                return null;
            }

            // Return the verified address from the message
            return siweMessage.address.toLowerCase();
        } catch (error) {
            console.error("SIWE verification error:", error);
            return null;
        }
    },
};
