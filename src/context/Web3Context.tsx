import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { logger } from '@/lib/logger';

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
}

interface Web3ContextType {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  chainId: number | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToTestnet: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const BSC_TESTNET_CHAIN_ID = 97;

  const getEthereum = (): EthereumProvider | undefined => {
    if (typeof window !== 'undefined') {
      return window.ethereum as EthereumProvider | undefined;
    }
    return undefined;
  };

  const connectWallet = async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
      alert('MetaMask is not installed!');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      const browserProvider = new ethers.BrowserProvider(ethereum as ethers.Eip1193Provider);
      const walletSigner = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();

      setAccount(accounts[0]);
      setProvider(browserProvider);
      setSigner(walletSigner);
      setChainId(Number(network.chainId));

      if (Number(network.chainId) !== BSC_TESTNET_CHAIN_ID) {
        await switchToTestnet();
      }
    } catch (error) {
      logger.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
  };

  const switchToTestnet = async () => {
    const ethereum = getEthereum();
    if (!ethereum) return;

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${BSC_TESTNET_CHAIN_ID.toString(16)}` }],
      });
    } catch (switchError: unknown) {
      const error = switchError as { code?: number };
      if (error.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${BSC_TESTNET_CHAIN_ID.toString(16)}`,
                chainName: 'BSC Testnet',
                nativeCurrency: {
                  name: 'tBNB',
                  symbol: 'tBNB',
                  decimals: 18,
                },
                rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
                blockExplorerUrls: ['https://testnet.bscscan.com/'],
              },
            ],
          });
        } catch (addError) {
          logger.error('Error adding BSC Testnet:', addError);
        }
      }
    }
  };

  useEffect(() => {
    const ethereum = getEthereum();
    if (ethereum) {
      const handleAccountsChanged = (accounts: unknown) => {
        const accountList = accounts as string[];
        if (accountList.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accountList[0]);
        }
      };

      const handleChainChanged = (chainIdHex: unknown) => {
        setChainId(parseInt(chainIdHex as string, 16));
      };

      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);

      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      const ethereum = getEthereum();
      if (ethereum) {
        try {
          const accounts = await ethereum.request({
            method: 'eth_accounts',
          }) as string[];
          
          if (accounts.length > 0) {
            const browserProvider = new ethers.BrowserProvider(ethereum as ethers.Eip1193Provider);
            const walletSigner = await browserProvider.getSigner();
            const network = await browserProvider.getNetwork();

            setAccount(accounts[0]);
            setProvider(browserProvider);
            setSigner(walletSigner);
            setChainId(Number(network.chainId));
          }
        } catch (error) {
          logger.error('Error checking connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        signer,
        chainId,
        isConnecting,
        connectWallet,
        disconnectWallet,
        switchToTestnet,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}
