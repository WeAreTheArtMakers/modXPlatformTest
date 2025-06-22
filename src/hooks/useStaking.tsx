
import { useState, useEffect, useMemo } from 'react';
import { ethers, Contract } from 'ethers';
import { useWeb3 } from '@/context/Web3Context';
import { useModXToken } from './useModXToken';
import { toast } from 'sonner';
import { CONTRACT_ADDRESSES } from '@/config/constants';

// MODX Staking contract ABI (güncellenmiş)
const STAKING_ABI = [
  // Pools & View
  "function stakingPools(uint256) view returns (uint256 duration,uint256 apy,uint256 totalStaked,uint256 maxStakePerUser,bool isActive)",
  "function poolCount() view returns (uint256)",
  "function userStakes(address,uint256) view returns (uint256 amount,uint256 rewardDebt,uint256 stakeTime,uint256 lockEndTime,uint256 poolId)",
  "function userPoolIds(address) view returns (uint256[])",
  "function userActivePoolIds(address) view returns (uint256[])",
  "function getPendingRewards(address,uint256) view returns (uint256)",
  "function getUserStakeInfo(address,uint256) view returns (uint256,uint256,uint256,uint256,bool)",
  // Mutating
  "function stake(uint256,uint256) external",
  "function unstake(uint256) external",
  "function claimRewards(uint256) external",
  // Events
  "event Staked(address indexed user,uint256 indexed poolId,uint256 amount)",
  "event Unstaked(address indexed user,uint256 indexed poolId,uint256 amount)",
  "event RewardsClaimed(address indexed user,uint256 amount)",
  "event PoolCreated(uint256 indexed poolId, uint256 duration, uint256 apy)",
  "event PoolUpdated(uint256 indexed poolId, uint256 apy, bool isActive)",
];

const STAKING_CONTRACT_ADDRESS = CONTRACT_ADDRESSES.MODX_STAKING;

export interface StakingPool {
  poolId: number;
  duration: number; // seconds
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

  // Auto-refresh interval for real-time rewards
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const contract = useMemo(() => {
    if (!provider) return null;
    try {
      return new Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, provider);
    } catch (e) {
      console.error('Contract creation error:', e);
      return null;
    }
  }, [provider]);

  // Fixed calculation for estimated rewards - works for ALL pools including 30-day
  const calculateEstimatedRewards = (amount: string, poolId: number | null): string => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0 || poolId === null) {
      console.log('[calculateEstimatedRewards] Invalid inputs:', { amount, poolId });
      return '0';
    }
    
    const pool = pools.find(p => p.poolId === poolId);
    if (!pool) {
      console.log('[calculateEstimatedRewards] Pool not found:', poolId);
      return '0';
    }
    
    const principal = Number(amount);
    const annualRate = pool.apy / 100; // Convert basis points to percentage (1200 -> 12%)
    const durationInYears = pool.duration / (365 * 24 * 3600); // Convert seconds to years
    
    // Simple interest calculation: P * R * T
    const estimatedRewards = principal * annualRate * durationInYears;
    
    console.log('[calculateEstimatedRewards] Calculation:', {
      principal,
      annualRate,
      durationInYears,
      poolDuration: pool.duration,
      estimatedRewards
    });
    
    return Math.max(0, estimatedRewards).toFixed(6);
  };

  // Calculate real-time pending rewards
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

  // Fetch transaction history from blockchain events
  const fetchTransactionHistory = async () => {
    if (!account || !contract) {
      setTransactionHistory([]);
      return;
    }
    
    try {
      console.log('[fetchTransactionHistory] Fetching events for account:', account);
      
      const currentBlock = await provider!.getBlockNumber();
      const deploymentBlock = 0xab3544A6f2aF70064c5B5D3f0E74323DB9a81945; // TODO: replace with actual staking contract deployment block
      const chunkSize = 5000; // chunk size in blocks to avoid RPC limit exceeded
      const allEvents: TransactionHistory[] = [];
      for (let start = deploymentBlock; start <= currentBlock; start += chunkSize) {
        const end = Math.min(start + chunkSize - 1, currentBlock);
        console.log(`[fetchTransactionHistory] Fetching events from blocks ${start} to ${end}`);
        const [stakedEvents, unstakedEvents, claimedEvents] = await Promise.all([
          contract.queryFilter(contract.filters.Staked(account), start, end),
          contract.queryFilter(contract.filters.Unstaked(account), start, end),
          contract.queryFilter(contract.filters.RewardsClaimed(account), start, end)
        ]);
        stakedEvents.forEach((event: any) => {
          allEvents.push({
            id: `stake-${event.transactionHash}-${event.logIndex}`,
            type: 'Stake',
            amount: ethers.formatUnits(event.args.amount, 18),
            poolId: Number(event.args.poolId),
            timestamp: 0,
            txHash: event.transactionHash,
            blockNumber: event.blockNumber
          });
        });
        unstakedEvents.forEach((event: any) => {
          allEvents.push({
            id: `unstake-${event.transactionHash}-${event.logIndex}`,
            type: 'Unstake',
            amount: ethers.formatUnits(event.args.amount, 18),
            poolId: Number(event.args.poolId),
            timestamp: 0,
            txHash: event.transactionHash,
            blockNumber: event.blockNumber
          });
        });
        claimedEvents.forEach((event: any) => {
          allEvents.push({
            id: `claim-${event.transactionHash}-${event.logIndex}`,
            type: 'Claim',
            amount: ethers.formatUnits(event.args.amount, 18),
            poolId: 0,
            timestamp: 0,
            txHash: event.transactionHash,
            blockNumber: event.blockNumber
          });
        });
      }
      // Sort and trim history
      allEvents.sort((a, b) => b.blockNumber - a.blockNumber);
      const history = allEvents.slice(0, 10);
      console.log('[fetchTransactionHistory] Found transactions:', history.length);
      setTransactionHistory(history);
      
    } catch (error) {
      console.error('[fetchTransactionHistory] Error:', error);
      toast.error('Failed to fetch transaction history.');
      setTransactionHistory([]);
    }
  };

  // Pool'ları kontrattan dinamik oku
  const fetchPools = async () => {
    if (!contract) return;
    try {
      console.log('[fetchPools] Starting...');
      const count = await contract.poolCount();
      console.log('[fetchPools] Pool count:', count.toString());
      
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
        console.log(`[fetchPools] Pool ${i}:`, pool);
        poolArr.push(pool);
      }
      setPools(poolArr);
      console.log('[fetchPools] Pools set:', poolArr);
    } catch (err) {
      console.error('[fetchPools] Error:', err);
      setPools([]);
    }
  };

  // Enhanced fetchStakes with better filtering for active stakes
  const fetchStakes = async () => {
    if (!account || !contract) {
      console.log('[fetchStakes] No account or contract');
      setStakes([]);
      return;
    }
    
    console.log('[fetchStakes] Starting for account:', account);
    
    try {
      // Determine active pool IDs, with fallback if userActivePoolIds reverts
      let activePoolIds: number[] = [];
      try {
        activePoolIds = (await contract.userActivePoolIds(account)).map((x: any) => Number(x));
        console.log('[fetchStakes] Active pool IDs from contract:', activePoolIds);
      } catch (fallbackErr) {
        console.error('[fetchStakes] userActivePoolIds failed, falling back to manual getUserStakeInfo lookup', fallbackErr);
        console.warn('Cannot fetch active pool IDs; falling back to manual getUserStakeInfo lookup.');
        try {
          const count = await contract.poolCount();
          for (let i = 0; i < Number(count); i++) {
            try {
              const info = await contract.getUserStakeInfo(account, i);
              const stakedAmt = Number(ethers.formatUnits(info[0] ?? 0n, 18));
              if (stakedAmt > 0) activePoolIds.push(i);
            } catch (innerErr) {
              console.error(`[fetchStakes] Error checking getUserStakeInfo for pool ${i}:`, innerErr);
            }
          }
          console.log('[fetchStakes] Active pool IDs from manual fallback:', activePoolIds);
        } catch (countErr) {
          console.error('[fetchStakes] Error fetching pool count for fallback:', countErr);
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
            console.log(`[fetchStakes] Added stake for pool ${pid}:`, stakeInfo);
            stakeArr.push(stakeInfo);
          } else {
            console.log(`[fetchStakes] Skipping pool ${pid} - no active stake (amount: ${stakeAmount})`);
          }
        } catch (poolError) {
          console.error(`[fetchStakes] Error getting info for pool ${pid}:`, poolError);
        }
      }
      console.log('[fetchStakes] Final stakes array:', stakeArr);
      setStakes(stakeArr);
    } catch (err) {
      console.error('[fetchStakes] Error:', err);
      setStakes([]);
    }
  };

  // Enhanced stake function with proper transaction confirmation
  const stake = async (amount: string, poolId: number) => {
    if (!account || !signer || !contract) throw new Error('Wallet not connected');
    setIsLoading(true);
    
    console.log('[stake] Starting stake process:', { amount, poolId });
    
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
      
      // Approve and stake
      await approve(STAKING_CONTRACT_ADDRESS, amount);
      
      const contractWithSigner = contract.connect(signer) as any;
      const amountInWei = ethers.parseUnits(amount, 18);
      
      const tx = await contractWithSigner.stake(poolId, amountInWei);
      console.log('[stake] Transaction sent:', tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('[stake] Transaction confirmed:', receipt);
      
      toast.success(`Successfully staked ${amount} modX in Pool #${poolId}!`);
      
      // Refresh data after confirmed transaction
      await Promise.all([
        fetchStakes(),
        fetchBalance(),
        fetchPools(),
        fetchTransactionHistory()
      ]);
    } catch (error: any) {
      console.error('[stake] Error:', error);
      toast.error('Failed to stake tokens: ' + (error?.message ?? error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced unstake with proper transaction confirmation
  const unstake = async (poolId: number) => {
    if (!signer || !contract) throw new Error('Wallet not connected');
    setIsLoading(true);
    try {
      const contractWithSigner = contract.connect(signer) as any;
      const tx = await contractWithSigner.unstake(poolId);
      console.log('[unstake] Transaction sent:', tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('[unstake] Transaction confirmed:', receipt);
      
      toast.success('Successfully unstaked tokens!');
      
      // Refresh data after confirmed transaction
      await Promise.all([
        fetchStakes(),
        fetchBalance(),
        fetchPools(),
        fetchTransactionHistory()
      ]);
    } catch (err: any) {
      console.error('[unstake] Error:', err);
      toast.error('Failed to unstake tokens: ' + (err?.message ?? err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Fixed claimRewards function with proper transaction confirmation and immediate UI update
  const claimRewards = async (poolId: number) => {
    if (!signer || !contract) throw new Error('Wallet not connected');
    setIsLoading(true);
    
    try {
      const contractWithSigner = contract.connect(signer) as any;
      const tx = await contractWithSigner.claimRewards(poolId);
      console.log('[claimRewards] Transaction sent:', tx.hash);
      
      // Wait for transaction confirmation before updating UI
      const receipt = await tx.wait();
      console.log('[claimRewards] Transaction confirmed:', receipt);
      
      toast.success('Rewards claimed successfully!');
      
      // After transaction is confirmed, refresh all data from blockchain
      await Promise.all([
        fetchStakes(), // This will get fresh data from contract
        fetchBalance(), // Update token balance
        fetchPools(),    // Update pool data
        fetchTransactionHistory() // Update transaction history
      ]);
      
    } catch (err: any) {
      console.error('[claimRewards] Error:', err);
      toast.error('Failed to claim rewards: ' + (err?.message ?? err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh setup for real-time rewards (reduced frequency to avoid spam)
  useEffect(() => {
    if (account && contract && stakes.length > 0) {
      // Start auto-refresh every 60 seconds for rewards
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

  // Handle wallet/chain changes
  useEffect(() => {
    const handleAccountsChanged = () => {
      console.log('[useStaking] Account changed, clearing data');
      setStakes([]);
      setPools([]);
      setTransactionHistory([]);
    };

    const handleChainChanged = () => {
      console.log('[useStaking] Chain changed, refreshing data');
      if (contract) {
        fetchPools();
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [contract]);

  // Pool'ları kontrattan dinamik oku
  useEffect(() => {
    if (contract) {
      console.log('[useEffect] Contract available, fetching pools...');
      fetchPools();
    }
    // eslint-disable-next-line
  }, [contract]);

  useEffect(() => {
    fetchPools();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (account && contract && pools.length > 0) {
      console.log('[useEffect] Account, contract and pools available, fetching stakes...');
      fetchStakes();
      fetchTransactionHistory();
    } else {
      console.log('[useEffect] Clearing stakes - missing:', { account: !!account, contract: !!contract, poolsLength: pools.length });
      setStakes([]);
      setTransactionHistory([]);
    }
    // eslint-disable-next-line
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
