// BSC Testnet Contract Addresses
export const CONTRACT_ADDRESSES = {
  MODX_TOKEN: '0xB6322eD8561604Ca2A1b9c17e4d02B957EB242fe',
  MODX_STAKING: '0xab3544A6f2aF70064c5B5D3f0E74323DB9a81945', // NEW UPDATED CONTRACT ADDRESS
} as const;

// Network Configuration
export const NETWORK_CONFIG = {
  BSC_TESTNET: {
    chainId: 97,
    name: 'BSC Testnet',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    blockExplorer: 'https://testnet.bscscan.com/',
    nativeCurrency: {
      name: 'tBNB',
      symbol: 'tBNB',
      decimals: 18,
    },
  },
} as const;

// Token Information
export const TOKEN_INFO = {
  MODX: {
    name: 'ModCopyX',
    symbol: 'modX',
    decimals: 18,
    address: CONTRACT_ADDRESSES.MODX_TOKEN,
  },
} as const;
