import { useState, useMemo, useEffect } from 'react';
import { ethers, Contract } from 'ethers';
import { useWeb3 } from '@/context/Web3Context';
import { useModXToken } from './useModXToken';
import { useRealTimePrice } from './useRealTimePrice';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

// Router info for PancakeSwap testnet
export const PANCAKE_ROUTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory)",
  "function swapExactTokensForETHSupportingFeeOnTransferTokens(uint amountIn,uint amountOutMin,address[] calldata path,address to,uint deadline) external",
  "function swapExactETHForTokensSupportingFeeOnTransferTokens(uint amountOutMin,address[] calldata path,address to,uint deadline) external payable",
  "function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint amountIn,uint amountOutMin,address[] calldata path,address to,uint deadline) external",
  "function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint, uint, uint)",
  "function WETH() external pure returns (address)"
];
export const PANCAKE_ROUTER_ADDRESS = '0x9ac64cc6e4415144c455bd8e4837fea55603e5c3'; // BSC Testnet Router

// Native and bridge token addresses for BSC Testnet
export const NATIVE_BNB_ADDRESS = '0x0000000000000000000000000000000000000000';
export const WBNB_ADDRESS = '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd'; // Correct WBNB for BSC Testnet

// Generic ERC20 ABI for approvals
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

/**
 * Dynamically resolve a valid swap path using PancakeRouter.getAmountsOut.
 */
export async function resolveSwapPath(
  router: Contract,
  fromAddress: string,
  toAddress: string,
  amountIn: bigint
): Promise<string[] | null> {
  const adjustedFrom = fromAddress === NATIVE_BNB_ADDRESS ? WBNB_ADDRESS : fromAddress;
  const adjustedTo = toAddress === NATIVE_BNB_ADDRESS ? WBNB_ADDRESS : toAddress;

  const directPath = [adjustedFrom, adjustedTo];
  try {
    await router.getAmountsOut(amountIn, directPath);
    return directPath;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '';
    if (!message.includes('PancakeRouter: INVALID_PATH') && !message.toLowerCase().includes('invalid path')) {
      throw err;
    }
  }

  const bridgePath = [adjustedFrom, WBNB_ADDRESS, adjustedTo];
  try {
    await router.getAmountsOut(amountIn, bridgePath);
    return bridgePath;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '';
    if (!message.includes('PancakeRouter: INVALID_PATH') && !message.toLowerCase().includes('invalid path')) {
      throw err;
    }
  }

  return null;
}

interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  balance: string;
  logoUrl?: string;
}

interface SwapHistory {
  id: string;
  from: string;
  to: string;
  fromAmount: string;
  toAmount: string;
  date: string;
  hash: string;
  timestamp: number;
}

export const useSwap = () => {
  const { account, provider, signer } = useWeb3();
  const { balance, approve, fetchBalance } = useModXToken();
  const { priceData } = useRealTimePrice();
  const [isLoading, setIsLoading] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [bnbBalance, setBnbBalance] = useState('0.0');
  const [swapHistory, setSwapHistory] = useState<SwapHistory[]>([]);

  // Fetch real BNB balance
  const fetchBNBBalance = async () => {
    if (!account || !provider) {
      setBnbBalance('0.0');
      return;
    }
    
    try {
      const balanceWei = await provider.getBalance(account);
      const balanceEth = ethers.formatEther(balanceWei);
      setBnbBalance(parseFloat(balanceEth).toFixed(6));
    } catch (error) {
      logger.error('Error fetching BNB balance:', error);
      setBnbBalance('0.0');
    }
  };

  // Auto-refresh BNB balance
  useEffect(() => {
    if (account && provider) {
      fetchBNBBalance();
      const interval = setInterval(fetchBNBBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [account, provider]);

  // Load swap history from localStorage
  useEffect(() => {
    if (account) {
      const stored = localStorage.getItem(`swapHistory_${account}`);
      if (stored) {
        setSwapHistory(JSON.parse(stored));
      }
    }
  }, [account]);

  // Extended token list
  const tokens = useMemo<Token[]>(() => [
    {
      symbol: 'modX',
      name: 'ModCopyX',
      address: '0xB6322eD8561604Ca2A1b9c17e4d02B957EB242fe',
      decimals: 18,
      balance: balance,
      logoUrl: '🔥'
    },
    {
      symbol: 'BNB',
      name: 'BNB',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      balance: bnbBalance,
      logoUrl: '🟡'
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      decimals: 18,
      balance: '0.0',
      logoUrl: '💵'
    },
    {
      symbol: 'CAKE',
      name: 'PancakeSwap Token',
      address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
      decimals: 18,
      balance: '0.0',
      logoUrl: '🥞'
    },
    {
      symbol: 'WETH',
      name: 'Wrapped Ethereum',
      address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
      decimals: 18,
      balance: '0.0',
      logoUrl: '💎'
    },
    {
      symbol: 'ADA',
      name: 'Cardano Token',
      address: '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47',
      decimals: 18,
      balance: '0.0',
      logoUrl: '🔷'
    },
    {
      symbol: 'DOT',
      name: 'Polkadot',
      address: '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402',
      decimals: 18,
      balance: '0.0',
      logoUrl: '🔴'
    },
    {
      symbol: 'LINK',
      name: 'Chainlink',
      address: '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD',
      decimals: 18,
      balance: '0.0',
      logoUrl: '🔗'
    }
  ], [balance, bnbBalance]);

  // Real-time exchange rates using price data
  const getExchangeRate = (fromToken: string, toToken: string): number => {
    if (!priceData) return 1;
    const fromPrice = priceData[fromToken]?.price || (fromToken === 'modX' ? 0.251 : 1);
    const toPrice = priceData[toToken]?.price || (toToken === 'modX' ? 0.251 : 1);
    return fromPrice / toPrice;
  };

  const calculateSwapAmount = async (inputAmount: string, fromToken: string, toToken: string): Promise<string> => {
    if (!inputAmount || isNaN(Number(inputAmount)) || !provider || Number(inputAmount) <= 0) return '0';

    const from = tokens.find(t => t.symbol === fromToken);
    const to = tokens.find(t => t.symbol === toToken);
    if (!from || !to) return '0';

    try {
      const router = new Contract(PANCAKE_ROUTER_ADDRESS, PANCAKE_ROUTER_ABI, provider);
      const amountIn = ethers.parseUnits(inputAmount, from.decimals);
      
      const path = [
        from.address === NATIVE_BNB_ADDRESS ? WBNB_ADDRESS : from.address,
        to.address === NATIVE_BNB_ADDRESS ? WBNB_ADDRESS : to.address
      ];

      if (path[0] !== WBNB_ADDRESS && path[1] !== WBNB_ADDRESS) {
        const directPathWorks = await router.getAmountsOut(amountIn, path).catch(() => false);
        if (!directPathWorks) {
          path.splice(1, 0, WBNB_ADDRESS);
        }
      }

      const amountsOut = await router.getAmountsOut(amountIn, path);
      return ethers.formatUnits(amountsOut[amountsOut.length - 1], to.decimals);
    } catch (error) {
      logger.error("Failed to calculate swap amount:", error);
      return '0';
    }
  };

  const calculatePriceImpact = (inputAmount: string): number => {
    const amount = Number(inputAmount);
    if (amount < 100) return 0.1;
    if (amount < 1000) return 0.15;
    if (amount < 10000) return 0.3;
    return 0.5;
  };

  const saveSwapToHistory = (from: string, to: string, fromAmount: string, toAmount: string, hash: string) => {
    const newSwap: SwapHistory = {
      id: Math.random().toString(36).substring(7),
      from,
      to,
      fromAmount,
      toAmount,
      date: new Date().toLocaleDateString(),
      hash: hash.substring(0, 12) + '...',
      timestamp: Date.now()
    };

    const updatedHistory = [newSwap, ...swapHistory].slice(0, 10);
    setSwapHistory(updatedHistory);
    
    if (account) {
      localStorage.setItem(`swapHistory_${account}`, JSON.stringify(updatedHistory));
    }
  };

  const executeSwap = async (
    fromToken: string,
    toToken: string,
    fromAmount: string,
    toAmount: string
  ) => {
    if (!account || !signer || !provider) {
      toast.error('Please connect your wallet!');
      return;
    }

    setIsLoading(true);
    try {
      if (!fromAmount || isNaN(Number(fromAmount)) || Number(fromAmount) <= 0) {
        throw new Error('Please enter a valid amount');
      }

      const fromInfo = tokens.find((t) => t.symbol === fromToken);
      const toInfo = tokens.find((t) => t.symbol === toToken);
      if (!fromInfo || !toInfo) {
        throw new Error('Selected token is not supported');
      }

      const router = new Contract(PANCAKE_ROUTER_ADDRESS, PANCAKE_ROUTER_ABI, signer);
      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
      const slippageTolerance = slippage / 100;

      const amountIn = ethers.parseUnits(fromAmount, fromInfo.decimals);
      const minAmountOut = ethers.parseUnits(
        (Number(toAmount) * (1 - slippageTolerance)).toFixed(toInfo.decimals),
        toInfo.decimals
      );

      const path = await resolveSwapPath(router, fromInfo.address, toInfo.address, amountIn);
      if (!path) {
        toast.error('No swap path available for selected tokens');
        return;
      }

      const useNativeIn = fromInfo.address === NATIVE_BNB_ADDRESS;
      if (!useNativeIn) {
        const tokenContract = new Contract(fromInfo.address, ERC20_ABI, signer);
        await tokenContract.approve(PANCAKE_ROUTER_ADDRESS, amountIn);
      }

      let tx: ethers.ContractTransactionResponse;
      if (useNativeIn) {
        tx = await router.swapExactETHForTokensSupportingFeeOnTransferTokens(
          minAmountOut,
          path,
          account,
          deadline,
          { value: amountIn }
        );
      } else if (toInfo.address === NATIVE_BNB_ADDRESS) {
        tx = await router.swapExactTokensForETHSupportingFeeOnTransferTokens(
          amountIn,
          minAmountOut,
          path,
          account,
          deadline
        );
      } else {
        tx = await router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
          amountIn,
          minAmountOut,
          path,
          account,
          deadline
        );
      }

      toast.info('Transaction sent! Waiting for confirmation...');
      const receipt = await tx.wait();
      toast.success(`Swapped ${fromAmount} ${fromToken} → ${toAmount} ${toToken}`);
      if (receipt) {
        saveSwapToHistory(fromToken, toToken, fromAmount, toAmount, receipt.hash);
      }

      await Promise.all([fetchBNBBalance(), fetchBalance()]);
    } catch (error: unknown) {
      logger.error('Swap error:', error);
      const msg = error instanceof Error ? error.message : 'Swap failed';
      toast.error(
        msg.includes('PancakeRouter: INVALID_PATH')
          ? 'Swap path invalid or liquidity insufficient'
          : msg
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addLiquidity = async (modXAmount: string, bnbAmount: string) => {
    if (!account || !signer) {
      toast.error('Please connect your wallet!');
      return;
    }
    if (!modXAmount || !bnbAmount || Number(modXAmount) <= 0 || Number(bnbAmount) <= 0) {
      toast.error('Please enter valid amounts for liquidity.');
      return;
    }

    setIsLoading(true);
    try {
      const router = new Contract(PANCAKE_ROUTER_ADDRESS, PANCAKE_ROUTER_ABI, signer);
      const modXTokenInfo = tokens.find(t => t.symbol === 'modX');
      if (!modXTokenInfo) throw new Error("modX token info not found");

      const amountModXDesired = ethers.parseUnits(modXAmount, modXTokenInfo.decimals);
      const amountBnbDesired = ethers.parseEther(bnbAmount);
      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

      const modXContract = new Contract(modXTokenInfo.address, ERC20_ABI, signer);
      const allowance = await modXContract.allowance(account, PANCAKE_ROUTER_ADDRESS);
      if (allowance < amountModXDesired) {
        toast.info("Approving modX token for the router...");
        const approveTx = await modXContract.approve(PANCAKE_ROUTER_ADDRESS, amountModXDesired);
        await approveTx.wait();
        toast.success("modX token approved!");
      }

      const tx = await router.addLiquidityETH(
        modXTokenInfo.address,
        amountModXDesired,
        0,
        0,
        account,
        deadline,
        { value: amountBnbDesired }
      );

      toast.info("Adding liquidity... waiting for confirmation.");
      await tx.wait();
      toast.success("Successfully added liquidity!");
      
      await Promise.all([fetchBNBBalance(), fetchBalance()]);

    } catch (error: unknown) {
      logger.error("Failed to add liquidity:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to add liquidity: ${errorMessage}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    tokens,
    isLoading,
    slippage,
    setSlippage,
    getExchangeRate,
    calculateSwapAmount,
    calculatePriceImpact,
    executeSwap,
    addLiquidity,
    resolveSwapPath,
    getSwapHistory: () => swapHistory,
    bnbBalance,
    fetchBNBBalance
  };
};
