import { useState, useEffect, useMemo } from 'react';
import { ethers, Contract } from 'ethers';
import { useWeb3 } from '@/context/Web3Context';
import { ERC20_ABI } from '@/abi/ERC20';
import { CONTRACT_ADDRESSES } from '@/config/constants';
import { logger } from '@/lib/logger';

export const useModXToken = () => {
  const { account, provider, signer } = useWeb3();
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);

  const contract = useMemo(() => {
    if (!provider) {
      return null;
    }
    return new Contract(CONTRACT_ADDRESSES.MODX_TOKEN, ERC20_ABI, provider);
  }, [provider]);

  const fetchBalance = async () => {
    if (!account || !contract) return;

    setIsLoading(true);
    try {
      const rawBalance = await contract['balanceOf'](account);
      const decimals = await contract['decimals']();
      const formattedBalance = ethers.formatUnits(rawBalance, decimals);
      setBalance(formattedBalance);
    } catch (error) {
      logger.error('Error fetching balance:', error);
      setBalance('0');
    } finally {
      setIsLoading(false);
    }
  };

  const transfer = async (to: string, amount: string) => {
    if (!signer || !contract) throw new Error('No signer or contract available');

    const decimals = await contract['decimals']();
    const amountInWei = ethers.parseUnits(amount, decimals);

    const contractWithSigner = contract.connect(signer) as Contract;
    const tx = await contractWithSigner['transfer'](to, amountInWei);
    await tx.wait();

    fetchBalance();
    return tx;
  };

  const approve = async (spender: string, amount: string) => {
    if (!signer || !contract) throw new Error('No signer or contract available');

    logger.log('[approve] spender:', spender);
    logger.log('[approve] raw amount:', amount);

    const decimals = await contract['decimals']();
    logger.log('[approve] decimals:', decimals);

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new Error("Approve: Invalid amount");
    }

    let amountInWei;
    try {
      amountInWei = ethers.parseUnits(amount, decimals);
      logger.log('[approve] amountInWei:', amountInWei.toString());
    } catch (e) {
      logger.error('[approve] parseUnits error:', e);
      throw new Error("Approve: Invalid amount parseUnits");
    }

    const contractWithSigner = contract.connect(signer) as Contract;
    let tx;
    try {
      tx = await contractWithSigner['approve'](spender, amountInWei);
      await tx.wait();
      logger.log('[approve] TX hash:', tx?.hash);
    } catch (e: unknown) {
      logger.error('[approve] Transaction error:', e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      throw new Error('Approve transaction error: ' + errorMessage);
    }

    return tx;
  };

  const getAllowance = async (spender: string) => {
    if (!account || !contract) return '0';

    const rawAllowance = await contract['allowance'](account, spender);
    const decimals = await contract['decimals']();
    return ethers.formatUnits(rawAllowance, decimals);
  };

  useEffect(() => {
    if (account && contract) {
      fetchBalance();
    } else {
      setBalance('0');
    }
  }, [account, contract]);

  return {
    balance,
    isLoading,
    contract,
    fetchBalance,
    transfer,
    approve,
    getAllowance,
    tokenAddress: CONTRACT_ADDRESSES.MODX_TOKEN
  };
};
