import { useState, useEffect, useMemo } from 'react';
import { ethers, Contract } from 'ethers';
import { useWeb3 } from '@/context/Web3Context';
import { ERC20_ABI } from '@/abi/ERC20';
import { CONTRACT_ADDRESSES } from '@/config/constants';

export const useModXToken = () => {
  const { account, provider, signer } = useWeb3();
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);

  // Create contract instance
  const contract = useMemo(() => {
    if (!provider) {
      return null;
    }
    return new Contract(CONTRACT_ADDRESSES.MODX_TOKEN, ERC20_ABI, provider);
  }, [provider]);

  // Fetch balance
  const fetchBalance = async () => {
    if (!account || !contract) return;

    setIsLoading(true);
    try {
      const rawBalance = await contract['balanceOf'](account);
      const decimals = await contract['decimals']();
      const formattedBalance = ethers.formatUnits(rawBalance, decimals);
      setBalance(formattedBalance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('0');
    } finally {
      setIsLoading(false);
    }
  };

  // Transfer tokens
  const transfer = async (to: string, amount: string) => {
    if (!signer || !contract) throw new Error('No signer or contract available');

    const decimals = await contract['decimals']();
    const amountInWei = ethers.parseUnits(amount, decimals);

    // as any, çünkü typescript tip çıkarımı yapılmıyor
    const contractWithSigner = contract.connect(signer) as any;
    const tx = await contractWithSigner['transfer'](to, amountInWei);
    await tx.wait();

    // Refresh balance after transfer
    fetchBalance();
    return tx;
  };

  // Approve tokens (harcama izni)
  const approve = async (spender: string, amount: string) => {
    if (!signer || !contract) throw new Error('No signer or contract available');

    console.log('[approve] spender:', spender);
    console.log('[approve] raw amount:', amount);

    // decimals kontrolü
    const decimals = await contract['decimals']();
    console.log('[approve] decimals:', decimals);

    // Hatalı inputu önle
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new Error("Approve: Invalid amount verilmiş");
    }

    let amountInWei;
    try {
      amountInWei = ethers.parseUnits(amount, decimals);
      console.log('[approve] amountInWei:', amountInWei.toString());
    } catch (e) {
      console.error('[approve] parseUnits HATASI:', e);
      throw new Error("Approve: Hatalı miktar parseUnits");
    }

    // ... keep existing code (connect signer & send tx) the same ...
    const contractWithSigner = contract.connect(signer) as any;
    let tx;
    try {
      tx = await contractWithSigner['approve'](spender, amountInWei);
      await tx.wait();
      console.log('[approve] TX hash:', tx?.hash);
    } catch (e) {
      console.error('[approve] Tx gönderimi sırasında hata:', e);
      throw new Error(
        'Approve işlemi sırasında hata oluştu: ' +
        (e?.message ?? e.toString())
      );
    }

    return tx;
  };

  // Get allowance
  const getAllowance = async (spender: string) => {
    if (!account || !contract) return '0';

    const rawAllowance = await contract['allowance'](account, spender);
    const decimals = await contract['decimals']();
    return ethers.formatUnits(rawAllowance, decimals);
  };

  // Auto-fetch balance when account changes
  useEffect(() => {
    if (account && contract) {
      fetchBalance();
    } else {
      setBalance('0');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
