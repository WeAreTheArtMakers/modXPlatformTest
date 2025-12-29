import { useState, useEffect, useMemo } from 'react';
import { ethers, Contract } from 'ethers';
import { useWeb3 } from '@/context/Web3Context';
import { useModXToken } from './useModXToken';
import { toast } from 'sonner';
import { CONTRACT_ADDRESSES } from '@/config/constants';
import { logger } from '@/lib/logger';

// MODX Staking contract ABI
const STAKING_ABI = [
  "function stakingPools(uint256) view returns (uint256 duration,uint256 apy,uint256 totalStaked,uint256 maxStakePerUser,bool isActive)",
  "function poolCount() view returns (uint256)",
  "function userStakes(address,uint256) view returns (uint256 amount,uint256 rewardDebt,uint256 stakeTime,uint256 lockEndTime,uint256 poolId)",
  "function userPoolIds(address) view returns (uint256[])",
  "function userActivePoolIds(address) view returns (uint256[])",
  "function getPendingRewards(address,uint256) view returns (uint256)",
  "function getUserStakeInfo(address,uint256) view returns (uint256,uint256,uint256,uint256,bool)",
  "function stake(uint256,uint256) external",
  "function unstake(uint256) external",
  "function claimRewards(uint256) external",
  "event Staked(address indexed user,uint256 indexed poolId,uint256 amount)",
  "event Unstaked(address indexed user,uint256 indexed poolId,uint256 amount)",
  "event RewardsClaimed(address indexed user,uint256 amount)",
  "event PoolCreated(uint256 indexed poolId, uint256 duration, uint256 apy)",
  "event PoolUpdated(uint256 indexed poolId, uint256 apy, bool isActive)",
];

const STAKING_CONTRACT_ADDRESS = CONTRACT_ADDRESSES.MODX_STAKING;

export interface StakingPool {
  poolId: number;
  duration: number;
  apy: number;
  totalStaked: string;
  maxStakePerUser: string;
  isActive: boolean;
}

export interface StakeInfo {
  poolId: number;
  amount: string;
  stakeTime: number;
  lockEndTime: number;
  pendingRewards: string;
  canUnstake: boolean;
  apy: number;
  duration: number;
}

export interface TransactionHistory {
  id: string;
  type: 'Stake' | 'Unstake' | 'Claim';
  amount: string;
  poolId: number;
  timestamp: number;
  txHash: string;
  blockNumber: number;
}

export const useStaking = () => {
  const { account, provider, signer } = useWeb3();
  const { approve, fetchBalance } = useModXToken();

  const [pools, setPools] = useState<StakingPool[]>([]);
  const [stakes, setStakes] = useState<StakeInfo[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const contract = useMemo(() => {
    if (!provider) return null;
    try {
      return new Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, provider);
    } catch (e) {
      logger.error('Contract creation error:', e);
      return null;
    }
  }, [provider]);

  const calculateEstimatedRewards = (amount: string, poolId: number | null): string => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0 || poolId === null) {
      logger.log('[calculateEstimatedRewards] Invalid inputs:', { amount, poolId });
      return '0';
    }
    
    const pool = pools.find(p => p.poolId === poolId);
    if (!pool) {
      logger.log('[calculateEstimatedRewards] Pool not found:', poolId);
      return '0';
    }
    
    const principal = Number(amount);
    const annualRate = pool.apy / 100;
    const durationInYears = pool.duration / (365 * 24 * 3600);
    const estimatedRewards = principal * annualRate * durationInYears;
    
    logger.log('[calculateEstimatedRewards] Calculation:', {
      principal,
      annualRate,
      durationInYears,
      poolDuration: pool.duration,
      estimatedRewards
    });
    
    return Math.max(0, estimatedRewards).toFixed(6);
  };

  const calculatePendingRewards = (stake: StakeInfo): string => {
    if (!stake.amount || Number(stake.amount) === 0) return '0';
    
    const now = Math.floor(Date.now() / 1000);
    const timeStaked = now - stake.stakeTime;
    const durationInYears = timeStaked / (365 * 24 * 3600);
    
    const principal = Number(stake.amount);
    const annualRate = stake.apy / 100;
    
    const pendingRewards = principal * annualRate * durationInYears;
    return Math.max(0, pendingRewards).toFixed(4);
  };

  const fetchTransactionHistory = async () => {
    if (!account || !contract || !provider) {
      setTransactionHistory([]);
      return;
    }
    
    try {
      logger.log('[fetchTransactionHistory] Fetching events for account:', account);
      
      const currentBlock = await provider.getBlockNumber();
      const deploymentBlock = Math.max(0, currentBlock - 50000);
      const chunkSize = 5000;
      const allEvents: TransactionHistory[] = [];
      
      for (let start = deploymentBlock; start <= currentBlock; start += chunkSize) {
        const end = Math.min(start + chunkSize - 1, currentBlock);
        logger.log(`[fetchTransactionHistory] Fetching events from blocks ${start} to ${end}`);
        
        const [stakedEvents, unstakedEvents, claimedEvents] = await Promise.all([
          contract.queryFilter(contract.filters.Staked(account), start, end),
          contract.queryFilter(contract.filters.Unstaked(account), start, end),
          contract.queryFilter(contract.filters.RewardsClaimed(account), start, end)
        ]);
        
        stakedEvents.forEach((event) => {
          const args = (event as ethers.EventLog).args;
          if (args) {
            allEvents.push({
              id: `stake-${event.transactionHash}-${event.index}`,
              type: 'Stake',
              amount: ethers.formatUnits(args.amount, 18),
              poolId: Number(args.poolId),
              timestamp: 0,
              txHash: event.transactionHash,
              blockNumber: event.blockNumber
            });
          }
        });
        
        unstakedEvents.forEach((event) => {
          const args = (event as ethers.EventLog).args;
          if (args) {
            allEvents.push({
              id: `unstake-${event.transactionHash}-${event.index}`,
              type: 'Unstake',
              amount: ethers.formatUnits(args.amount, 18),
              poolId: Number(args.poolId),
              timestamp: 0,
              txHash: event.transactionHash,
              blockNumber: event.blockNumber
            });
          }
        });
        
        claimedEvents.forEach((event) => {
          const args = (event as ethers.EventLog).args;
          if (args) {
            allEvents.push({
              id: `claim-${event.transactionHash}-${event.index}`,
              type: 'Claim',
              amount: ethers.formatUnits(args.amount, 18),
              poolId: 0,
              timestamp: 0,
              txHash: event.transactionHash,
              blockNumber: event.blockNumber
            });
          }
        });
      }
      
      allEvents.sort((a, b) => b.blockNumber - a.blockNumber);
      const history = allEvents.slice(0, 10);
      logger.log('[fetchTransactionHistory] Found transactions:', history.length);
      setTransactionHistory(history);
      
    } catch (error) {
      logger.error('[fetchTransactionHistory] Error:', error);
      toast.error('Failed to fetch transaction history.');
      setTransactionHistory([]);
    }
  };

  const fetchPools = async () => {
    if (!contract) return;
    try {
      logger.log('[fetchPools] Starting...');
      const count = await contract.poolCount();
      logger.log('[fetchPools] Pool count:', count.toString());
      
      const poolArr: StakingPool[] = [];
      for (let i = 0; i < Number(count); i++) {
        const data = await contract.stakingPools(i);
        const pool = {
          poolId: i,
          duration: Number(data.duration),
          apy: Number(data.apy),
          totalStaked: ethers.formatUnits(data.totalStaked ?? 0n, 18),
          maxStakePerUser: ethers.formatUnits(data.maxStakePerUser ?? 0n, 18),
          isActive: !!data.isActive,
        };
        logger.log(`[fetchPools] Pool ${i}:`, pool);
        poolArr.push(pool);
      }
      setPools(poolArr);
      logger.log('[fetchPools] Pools set:', poolArr);
    } catch (err) {
      logger.error('[fetchPools] Error:', err);
      setPools([]);
    }
  };

  const fetchStakes = async () => {
    if (!account || !contract) {
      logger.log('[fetchStakes] No account or contract');
      setStakes([]);
      return;
    }
    
    logger.log('[fetchStakes] Starting for account:', account);
    
    try {
      let activePoolIds: number[] = [];
      try {
        activePoolIds = (await contract.userActivePoolIds(account)).map((x: bigint) => Number(x));
        logger.log('[fetchStakes] Active pool IDs from contract:', activePoolIds);
      } catch (fallbackErr) {
        logger.error('[fetchStakes] userActivePoolIds failed, falling back to manual lookup', fallbackErr);
        try {
          const count = await contract.poolCount();
          for (let i = 0; i < Number(count); i++) {
            try {
              const info = await contract.getUserStakeInfo(account, i);
              const stakedAmt = Number(ethers.formatUnits(info[0] ?? 0n, 18));
              if (stakedAmt > 0) activePoolIds.push(i);
            } catch (innerErr) {
              logger.error(`[fetchStakes] Error checking getUserStakeInfo for pool ${i}:`, innerErr);
            }
          }
          logger.log('[fetchStakes] Active pool IDs from manual fallback:', activePoolIds);
        } catch (countErr) {
          logger.error('[fetchStakes] Error fetching pool count for fallback:', countErr);
        }
      }

      const stakeArr: StakeInfo[] = [];
      for (const pid of activePoolIds) {
        try {
          const info = await contract.getUserStakeInfo(account, pid);
          const pool = pools.find((p) => p.poolId === pid);
          const stakeAmount = Number(ethers.formatUnits(info[0] ?? 0n, 18));
          if (stakeAmount > 0) {
            const stakeInfo = {
              poolId: pid,
              amount: ethers.formatUnits(info[0] ?? 0n, 18),
              stakeTime: Number(info[1] ?? 0),
              lockEndTime: Number(info[2] ?? 0),
              pendingRewards: ethers.formatUnits(info[3] ?? 0n, 18),
              canUnstake: Boolean(info[4]),
              apy: pool?.apy ?? 0,
              duration: pool?.duration ?? 0,
            };
            logger.log(`[fetchStakes] Added stake for pool ${pid}:`, stakeInfo);
            stakeArr.push(stakeInfo);
          } else {
            logger.log(`[fetchStakes] Skipping pool ${pid} - no active stake`);
          }
        } catch (poolError) {
          logger.error(`[fetchStakes] Error getting info for pool ${pid}:`, poolError);
        }
      }
      logger.log('[fetchStakes] Final stakes array:', stakeArr);
      setStakes(stakeArr);
    } catch (err) {
      logger.error('[fetchStakes] Error:', err);
      setStakes([]);
    }
  };

  const stake = async (amount: string, poolId: number) => {
    if (!account || !signer || !contract) throw new Error('Wallet not connected');
    setIsLoading(true);
    
    logger.log('[stake] Starting stake process:', { amount, poolId });
    
    try {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        throw new Error('Stake: Invalid amount!');
      }
      
      const pool = pools.find((p) => p.poolId === poolId);
      if (!pool || !pool.isActive) {
        throw new Error("Selected pool is not valid or inactive!");
      }
      
      if (Number(amount) > Number(pool.maxStakePerUser)) {
        throw new Error('Stake exceeds max allowed per user for this pool!');
      }
      
      await approve(STAKING_CONTRACT_ADDRESS, amount);
      
      const contractWithSigner = contract.connect(signer) as Contract;
      const amountInWei = ethers.parseUnits(amount, 18);
      
      const tx = await contractWithSigner.stake(poolId, amountInWei);
      logger.log('[stake] Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      logger.log('[stake] Transaction confirmed:', receipt);
      
      toast.success(`Successfully staked ${amount} modX in Pool #${poolId}!`);
      
      await Promise.all([
        fetchStakes(),
        fetchBalance(),
        fetchPools(),
        fetchTransactionHistory()
      ]);
    } catch (error: unknown) {
      logger.error('[stake] Error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error('Failed to stake tokens: ' + errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const unstake = async (poolId: number) => {
    if (!signer || !contract) throw new Error('Wallet not connected');
    setIsLoading(true);
    try {
      const contractWithSigner = contract.connect(signer) as Contract;
      const tx = await contractWithSigner.unstake(poolId);
      logger.log('[unstake] Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      logger.log('[unstake] Transaction confirmed:', receipt);
      
      toast.success('Successfully unstaked tokens!');
      
      await Promise.all([
        fetchStakes(),
        fetchBalance(),
        fetchPools(),
        fetchTransactionHistory()
      ]);
    } catch (err: unknown) {
      logger.error('[unstake] Error:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error('Failed to unstake tokens: ' + errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const claimRewards = async (poolId: number) => {
    if (!signer || !contract) throw new Error('Wallet not connected');
    setIsLoading(true);
    
    try {
      const contractWithSigner = contract.connect(signer) as Contract;
      const tx = await contractWithSigner.claimRewards(poolId);
      logger.log('[claimRewards] Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      logger.log('[claimRewards] Transaction confirmed:', receipt);
      
      toast.success('Rewards claimed successfully!');
      
      await Promise.all([
        fetchStakes(),
        fetchBalance(),
        fetchPools(),
        fetchTransactionHistory()
      ]);
      
    } catch (err: unknown) {
      logger.error('[claimRewards] Error:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error('Failed to claim rewards: ' + errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (account && contract && stakes.length > 0) {
      const interval = setInterval(() => {
        fetchStakes();
      }, 60000);
      
      setRefreshInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [account, contract, stakes.length]);

  useEffect(() => {
    const handleAccountsChanged = () => {
      logger.log('[useStaking] Account changed, clearing data');
      setStakes([]);
      setPools([]);
      setTransactionHistory([]);
    };

    const handleChainChanged = () => {
      logger.log('[useStaking] Chain changed, refreshing data');
      if (contract) {
        fetchPools();
      }
    };

    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [contract]);

  useEffect(() => {
    if (contract) {
      logger.log('[useEffect] Contract available, fetching pools...');
      fetchPools();
    }
  }, [contract]);

  useEffect(() => {
    fetchPools();
  }, []);

  useEffect(() => {
    if (account && contract && pools.length > 0) {
      logger.log('[useEffect] Account, contract and pools available, fetching stakes...');
      fetchStakes();
      fetchTransactionHistory();
    } else {
      logger.log('[useEffect] Clearing stakes - missing:', { account: !!account, contract: !!contract, poolsLength: pools.length });
      setStakes([]);
      setTransactionHistory([]);
    }
  }, [account, contract, pools]);

  return {
    pools,
    stakes,
    transactionHistory,
    isLoading,
    stake,
    unstake,
    claimRewards,
    fetchPools,
    fetchStakes,
    fetchTransactionHistory,
    calculateEstimatedRewards,
    calculatePendingRewards,
    stakingContractAddress: STAKING_CONTRACT_ADDRESS,
  };
};
