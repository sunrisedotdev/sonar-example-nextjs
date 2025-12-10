/**
 * SIWE (Sign In With Ethereum) verification utilities
 * Implements proper signature verification using the siwe library
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
                    return null;
                }
            }

            // Validate expiration time if present
            if (siweMessage.expirationTime) {
                const expirationDate = new Date(siweMessage.expirationTime);
                if (expirationDate.getTime() < Date.now()) {
                    return null; // Message has expired
                }
            }

            // Validate chain ID if present (optional - can be configured via env)
            const expectedChainId = process.env.NEXT_PUBLIC_SIWE_CHAIN_ID;
            if (expectedChainId && siweMessage.chainId) {
                const expectedChainIdNum = parseInt(expectedChainId, 10);
                if (siweMessage.chainId !== expectedChainIdNum) {
                    return null; // Chain ID mismatch
                }
            }

            // Verify the signature using the siwe library
            // This performs cryptographic signature verification and validates message fields
            const verifyOptions: Parameters<typeof siweMessage.verify>[0] = {
                signature: signature as `0x${string}`,
            };

            // Add domain validation if configured
            if (expectedDomain) {
                verifyOptions.domain = expectedDomain;
            }

            const result = await siweMessage.verify(verifyOptions);

            // Check if verification was successful
            if (!result.success) {
                return null;
            }

            // Return the verified address from the message
            return siweMessage.address.toLowerCase();
        } catch (error) {
            // Any error during validation or verification means the signature is invalid
            // Don't log the error to avoid information leakage
            return null;
        }
    },
};

