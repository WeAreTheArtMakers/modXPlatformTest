import { useState, useEffect, useCallback } from 'react';
import { ethers, Contract } from 'ethers';
import { useWeb3 } from '@/context/Web3Context';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

// PancakeSwap Factory & Pair ABIs
const PANCAKE_FACTORY_ABI = [
  "function getPair(address tokenA, address tokenB) external view returns (address pair)"
];

const PANCAKE_PAIR_ABI = [
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function approve(address spender, uint256 value) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

const PANCAKE_ROUTER_ABI = [
  "function removeLiquidityETH(address token, uint liquidity, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external returns (uint amountToken, uint amountETH)",
  "function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)"
];

// BSC Testnet addresses
const PANCAKE_FACTORY_ADDRESS = '0x6725F303b657a9451d8BA641348b6761A6CC7a17';
const PANCAKE_ROUTER_ADDRESS = '0x9ac64cc6e4415144c455bd8e4837fea55603e5c3';
const WBNB_ADDRESS = '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd';
const MODX_TOKEN_ADDRESS = '0xB6322eD8561604Ca2A1b9c17e4d02B957EB242fe';

export interface LiquidityPosition {
  pairAddress: string;
  token0: string;
  token1: string;
  lpBalance: string;
  lpBalanceRaw: bigint;
  totalSupply: string;
  reserve0: string;
  reserve1: string;
  share: string;
  token0Amount: string;
  token1Amount: string;
}

export interface LiquidityHistory {
  id: string;
  type: 'add' | 'remove';
  modXAmount: string;
  bnbAmount: string;
  lpAmount: string;
  date: string;
  hash: string;
  timestamp: number;
}

export const useLiquidity = () => {
  const { account, provider, signer } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState<LiquidityPosition | null>(null);
  const [history, setHistory] = useState<LiquidityHistory[]>([]);

  // Load history from localStorage
  useEffect(() => {
    if (account) {
      const stored = localStorage.getItem(`liquidityHistory_${account}`);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    }
  }, [account]);

  const saveToHistory = (entry: Omit<LiquidityHistory, 'id' | 'timestamp'>) => {
    const newEntry: LiquidityHistory = {
      ...entry,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now()
    };
    const updated = [newEntry, ...history].slice(0, 20);
    setHistory(updated);
    if (account) {
      localStorage.setItem(`liquidityHistory_${account}`, JSON.stringify(updated));
    }
  };

  const fetchPosition = useCallback(async () => {
    if (!account || !provider) {
      setPosition(null);
      return;
    }

    try {
      const factory = new Contract(PANCAKE_FACTORY_ADDRESS, PANCAKE_FACTORY_ABI, provider);
      const pairAddress = await factory.getPair(MODX_TOKEN_ADDRESS, WBNB_ADDRESS);

      if (pairAddress === ethers.ZeroAddress) {
        setPosition(null);
        return;
      }

      const pair = new Contract(pairAddress, PANCAKE_PAIR_ABI, provider);
      
      const [lpBalance, totalSupply, reserves, token0] = await Promise.all([
        pair.balanceOf(account),
        pair.totalSupply(),
        pair.getReserves(),
        pair.token0()
      ]);

      if (lpBalance === 0n) {
        setPosition(null);
        return;
      }

      const isToken0ModX = token0.toLowerCase() === MODX_TOKEN_ADDRESS.toLowerCase();
      const reserve0 = reserves[0];
      const reserve1 = reserves[1];

      const share = (Number(lpBalance) / Number(totalSupply)) * 100;
      const token0Amount = (Number(lpBalance) * Number(reserve0)) / Number(totalSupply);
      const token1Amount = (Number(lpBalance) * Number(reserve1)) / Number(totalSupply);

      setPosition({
        pairAddress,
        token0: isToken0ModX ? 'modX' : 'BNB',
        token1: isToken0ModX ? 'BNB' : 'modX',
        lpBalance: ethers.formatEther(lpBalance),
        lpBalanceRaw: lpBalance,
        totalSupply: ethers.formatEther(totalSupply),
        reserve0: ethers.formatEther(reserve0),
        reserve1: ethers.formatEther(reserve1),
        share: share.toFixed(6),
        token0Amount: ethers.formatEther(BigInt(Math.floor(token0Amount))),
        token1Amount: ethers.formatEther(BigInt(Math.floor(token1Amount)))
      });
    } catch (error) {
      logger.error('Error fetching liquidity position:', error);
      setPosition(null);
    }
  }, [account, provider]);

  useEffect(() => {
    fetchPosition();
    const interval = setInterval(fetchPosition, 30000);
    return () => clearInterval(interval);
  }, [fetchPosition]);

  const addLiquidity = async (modXAmount: string, bnbAmount: string) => {
    if (!account || !signer) {
      toast.error('Please connect your wallet!');
      return;
    }

    setIsLoading(true);
    try {
      const router = new Contract(PANCAKE_ROUTER_ADDRESS, PANCAKE_ROUTER_ABI, signer);
      const modXContract = new Contract(
        MODX_TOKEN_ADDRESS,
        ["function approve(address spender, uint256 amount) external returns (bool)"],
        signer
      );

      const amountModX = ethers.parseEther(modXAmount);
      const amountBnb = ethers.parseEther(bnbAmount);
      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

      toast.info('Approving modX...');
      const approveTx = await modXContract.approve(PANCAKE_ROUTER_ADDRESS, amountModX);
      await approveTx.wait();

      toast.info('Adding liquidity...');
      const tx = await router.addLiquidityETH(
        MODX_TOKEN_ADDRESS,
        amountModX,
        0,
        0,
        account,
        deadline,
        { value: amountBnb }
      );

      const receipt = await tx.wait();
      toast.success('Liquidity added successfully!');

      saveToHistory({
        type: 'add',
        modXAmount,
        bnbAmount,
        lpAmount: '0',
        date: new Date().toLocaleDateString(),
        hash: receipt.hash.substring(0, 12) + '...'
      });

      await fetchPosition();
    } catch (error) {
      logger.error('Add liquidity error:', error);
      const msg = error instanceof Error ? error.message : 'Failed to add liquidity';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const removeLiquidity = async (percentage: number) => {
    if (!account || !signer || !position) {
      toast.error('No liquidity position found!');
      return;
    }

    setIsLoading(true);
    try {
      const router = new Contract(PANCAKE_ROUTER_ADDRESS, PANCAKE_ROUTER_ABI, signer);
      const pair = new Contract(position.pairAddress, PANCAKE_PAIR_ABI, signer);

      const lpToRemove = (position.lpBalanceRaw * BigInt(percentage)) / 100n;
      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

      toast.info('Approving LP tokens...');
      const approveTx = await pair.approve(PANCAKE_ROUTER_ADDRESS, lpToRemove);
      await approveTx.wait();

      toast.info('Removing liquidity...');
      const tx = await router.removeLiquidityETH(
        MODX_TOKEN_ADDRESS,
        lpToRemove,
        0,
        0,
        account,
        deadline
      );

      const receipt = await tx.wait();
      toast.success('Liquidity removed successfully!');

      saveToHistory({
        type: 'remove',
        modXAmount: (Number(position.token0Amount) * percentage / 100).toFixed(4),
        bnbAmount: (Number(position.token1Amount) * percentage / 100).toFixed(4),
        lpAmount: ethers.formatEther(lpToRemove),
        date: new Date().toLocaleDateString(),
        hash: receipt.hash.substring(0, 12) + '...'
      });

      await fetchPosition();
    } catch (error) {
      logger.error('Remove liquidity error:', error);
      const msg = error instanceof Error ? error.message : 'Failed to remove liquidity';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    position,
    history,
    isLoading,
    addLiquidity,
    removeLiquidity,
    refreshPosition: fetchPosition
  };
};
