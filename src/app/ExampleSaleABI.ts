export const examplSaleABI = [
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "bytes16",
                        name: "saleUUID",
                        type: "bytes16",
                    },
                    {
                        internalType: "address",
                        name: "purchasePermitSigner",
                        type: "address",
                    },
                ],
                internalType: "struct ExampleSale.Init",
                name: "init",
                type: "tuple",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [],
        name: "AccessControlBadConfirmation",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
            {
                internalType: "bytes32",
                name: "neededRole",
                type: "bytes32",
            },
        ],
        name: "AccessControlUnauthorizedAccount",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "addr",
                type: "address",
            },
            {
                internalType: "bytes16",
                name: "got",
                type: "bytes16",
            },
            {
                internalType: "bytes16",
                name: "existing",
                type: "bytes16",
            },
        ],
        name: "AddressTiedToAnotherEntity",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "minAmount",
                type: "uint256",
            },
        ],
        name: "AmountBelowMinimum",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "maxAmount",
                type: "uint256",
            },
        ],
        name: "AmountExceedsMaximum",
        type: "error",
    },
    {
        inputs: [],
        name: "ECDSAInvalidSignature",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "length",
                type: "uint256",
            },
        ],
        name: "ECDSAInvalidSignatureLength",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "s",
                type: "bytes32",
            },
        ],
        name: "ECDSAInvalidSignatureS",
        type: "error",
    },
    {
        inputs: [],
        name: "PurchasePermitExpired",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "bytes16",
                name: "got",
                type: "bytes16",
            },
            {
                internalType: "bytes16",
                name: "want",
                type: "bytes16",
            },
        ],
        name: "PurchasePermitSaleUUIDMismatch",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "got",
                type: "address",
            },
            {
                internalType: "address",
                name: "want",
                type: "address",
            },
        ],
        name: "PurchasePermitSenderMismatch",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "signer",
                type: "address",
            },
        ],
        name: "PurchasePermitUnauthorizedSigner",
        type: "error",
    },
    {
        inputs: [],
        name: "ZeroAddress",
        type: "error",
    },
    {
        inputs: [],
        name: "ZeroEntityID",
        type: "error",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "wallet",
                type: "address",
            },
            {
                indexed: true,
                internalType: "bytes16",
                name: "entityID",
                type: "bytes16",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "totalAmount",
                type: "uint256",
            },
        ],
        name: "Purchased",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "role",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "previousAdminRole",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "newAdminRole",
                type: "bytes32",
            },
        ],
        name: "RoleAdminChanged",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "role",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "address",
                name: "account",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
            },
        ],
        name: "RoleGranted",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "role",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "address",
                name: "account",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
            },
        ],
        name: "RoleRevoked",
        type: "event",
    },
    {
        inputs: [],
        name: "DEFAULT_ADMIN_ROLE",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "PURCHASE_PERMIT_SIGNER_ROLE",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        name: "amountByAddress",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        name: "entityIDByAddress",
        outputs: [
            {
                internalType: "bytes16",
                name: "",
                type: "bytes16",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "role",
                type: "bytes32",
            },
        ],
        name: "getRoleAdmin",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "role",
                type: "bytes32",
            },
            {
                internalType: "uint256",
                name: "index",
                type: "uint256",
            },
        ],
        name: "getRoleMember",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "role",
                type: "bytes32",
            },
        ],
        name: "getRoleMemberCount",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "role",
                type: "bytes32",
            },
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "grantRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "role",
                type: "bytes32",
            },
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "hasRole",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
            {
                components: [
                    {
                        internalType: "bytes16",
                        name: "entityID",
                        type: "bytes16",
                    },
                    {
                        internalType: "bytes16",
                        name: "saleUUID",
                        type: "bytes16",
                    },
                    {
                        internalType: "address",
                        name: "wallet",
                        type: "address",
                    },
                    {
                        internalType: "uint64",
                        name: "expiresAt",
                        type: "uint64",
                    },
                    {
                        internalType: "uint256",
                        name: "minAmount",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "maxAmount",
                        type: "uint256",
                    },
                    {
                        internalType: "uint64",
                        name: "minPrice",
                        type: "uint64",
                    },
                    {
                        internalType: "uint64",
                        name: "maxPrice",
                        type: "uint64",
                    },
                    {
                        internalType: "bytes",
                        name: "payload",
                        type: "bytes",
                    },
                ],
                internalType: "struct PurchasePermitV2",
                name: "purchasePermit",
                type: "tuple",
            },
            {
                internalType: "bytes",
                name: "purchasePermitSignature",
                type: "bytes",
            },
        ],
        name: "purchase",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "role",
                type: "bytes32",
            },
            {
                internalType: "address",
                name: "callerConfirmation",
                type: "address",
            },
        ],
        name: "renounceRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "reset",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "role",
                type: "bytes32",
            },
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "revokeRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "saleUUID",
        outputs: [
            {
                internalType: "bytes16",
                name: "",
                type: "bytes16",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes4",
                name: "interfaceId",
                type: "bytes4",
            },
        ],
        name: "supportsInterface",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
] as const;
