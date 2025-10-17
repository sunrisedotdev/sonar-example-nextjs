export const saleABI = [
  {
    type: "constructor",
    inputs: [
      {
        name: "init",
        type: "tuple",
        internalType: "struct ExampleSale.Init",
        components: [
          { name: "saleUUID", type: "bytes16", internalType: "bytes16" },
          {
            name: "purchasePermitSigner",
            type: "address",
            internalType: "address",
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "DEFAULT_ADMIN_ROLE",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "PURCHASE_PERMIT_SIGNER_ROLE",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "entityStateByID",
    inputs: [{ name: "entityID", type: "bytes16", internalType: "bytes16" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct ExampleSale.EntityState",
        components: [
          { name: "addr", type: "address", internalType: "address" },
          { name: "entityID", type: "bytes16", internalType: "bytes16" },
          { name: "amount", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRoleAdmin",
    inputs: [{ name: "role", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRoleMember",
    inputs: [
      { name: "role", type: "bytes32", internalType: "bytes32" },
      { name: "index", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRoleMemberCount",
    inputs: [{ name: "role", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "grantRole",
    inputs: [
      { name: "role", type: "bytes32", internalType: "bytes32" },
      { name: "account", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "hasRole",
    inputs: [
      { name: "role", type: "bytes32", internalType: "bytes32" },
      { name: "account", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "purchase",
    inputs: [
      { name: "amount", type: "uint256", internalType: "uint256" },
      {
        name: "purchasePermit",
        type: "tuple",
        internalType: "struct PurchasePermitWithAllocation",
        components: [
          {
            name: "permit",
            type: "tuple",
            internalType: "struct PurchasePermit",
            components: [
              { name: "entityID", type: "bytes16", internalType: "bytes16" },
              { name: "saleUUID", type: "bytes16", internalType: "bytes16" },
              { name: "wallet", type: "address", internalType: "address" },
              { name: "expiresAt", type: "uint64", internalType: "uint64" },
              { name: "payload", type: "bytes", internalType: "bytes" },
            ],
          },
          { name: "reservedAmount", type: "uint256", internalType: "uint256" },
          { name: "minAmount", type: "uint256", internalType: "uint256" },
          { name: "maxAmount", type: "uint256", internalType: "uint256" },
        ],
      },
      { name: "purchasePermitSignature", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "renounceRole",
    inputs: [
      { name: "role", type: "bytes32", internalType: "bytes32" },
      { name: "callerConfirmation", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "reset",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "revokeRole",
    inputs: [
      { name: "role", type: "bytes32", internalType: "bytes32" },
      { name: "account", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "saleUUID",
    inputs: [],
    outputs: [{ name: "", type: "bytes16", internalType: "bytes16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "supportsInterface",
    inputs: [{ name: "interfaceId", type: "bytes4", internalType: "bytes4" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "Purchased",
    inputs: [
      {
        name: "entityID",
        type: "bytes16",
        indexed: true,
        internalType: "bytes16",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "totalAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoleAdminChanged",
    inputs: [
      { name: "role", type: "bytes32", indexed: true, internalType: "bytes32" },
      {
        name: "previousAdminRole",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "newAdminRole",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoleGranted",
    inputs: [
      { name: "role", type: "bytes32", indexed: true, internalType: "bytes32" },
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoleRevoked",
    inputs: [
      { name: "role", type: "bytes32", indexed: true, internalType: "bytes32" },
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  { type: "error", name: "AccessControlBadConfirmation", inputs: [] },
  {
    type: "error",
    name: "AccessControlUnauthorizedAccount",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "neededRole", type: "bytes32", internalType: "bytes32" },
    ],
  },
  {
    type: "error",
    name: "AddressTiedToAnotherEntity",
    inputs: [
      { name: "got", type: "bytes16", internalType: "bytes16" },
      { name: "existing", type: "bytes16", internalType: "bytes16" },
      { name: "addr", type: "address", internalType: "address" },
    ],
  },
  {
    type: "error",
    name: "BelowMinAmount",
    inputs: [
      { name: "newBidAmount", type: "uint256", internalType: "uint256" },
      { name: "minAmount", type: "uint256", internalType: "uint256" },
    ],
  },
  { type: "error", name: "ECDSAInvalidSignature", inputs: [] },
  {
    type: "error",
    name: "ECDSAInvalidSignatureLength",
    inputs: [{ name: "length", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "error",
    name: "ECDSAInvalidSignatureS",
    inputs: [{ name: "s", type: "bytes32", internalType: "bytes32" }],
  },
  {
    type: "error",
    name: "EntityTiedToAnotherAddress",
    inputs: [
      { name: "got", type: "address", internalType: "address" },
      { name: "existing", type: "address", internalType: "address" },
      { name: "entityID", type: "bytes16", internalType: "bytes16" },
    ],
  },
  {
    type: "error",
    name: "ExceedsMaxAmount",
    inputs: [
      { name: "newBidAmount", type: "uint256", internalType: "uint256" },
      { name: "maxAmount", type: "uint256", internalType: "uint256" },
    ],
  },
  {
    type: "error",
    name: "InvalidSaleUUID",
    inputs: [
      { name: "got", type: "bytes16", internalType: "bytes16" },
      { name: "want", type: "bytes16", internalType: "bytes16" },
    ],
  },
  {
    type: "error",
    name: "InvalidSender",
    inputs: [
      { name: "got", type: "address", internalType: "address" },
      { name: "want", type: "address", internalType: "address" },
    ],
  },
  { type: "error", name: "PurchasePermitExpired", inputs: [] },
  {
    type: "error",
    name: "UnauthorizedSigner",
    inputs: [{ name: "signer", type: "address", internalType: "address" }],
  },
  { type: "error", name: "ZeroAddress", inputs: [] },
  { type: "error", name: "ZeroAmount", inputs: [] },
  { type: "error", name: "ZeroEntityID", inputs: [] },
] as const;
