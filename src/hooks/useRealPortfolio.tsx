
import { useState, useEffect } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { useModXToken } from './useModXToken';
import { useStaking } from './useStaking';
import { useSwap } from './useSwap';
import { useRealTimePrice } from './useRealTimePrice';

interface PortfolioToken {
  symbol: string;
  balance: number;
  value: number;
  change24h: number;
  price: number;
}

interface PortfolioData {
  totalValue: number;
  totalBalance: number;
  totalStaked: number;
  totalRewards: number;
  dailyChange: number;
  tokens: PortfolioToken[];
}

export const useRealPortfolio = () => {
  const { account } = useWeb3();
  const { balance } = useModXToken();
  const { stakes } = useStaking();
  const { bnbBalance } = useSwap();
  const { priceData } = useRealTimePrice();
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    totalValue: 0,
    totalBalance: 0,
    totalStaked: 0,
    totalRewards: 0,
    dailyChange: 0,
    tokens: []
  });

  useEffect(() => {
    if (!account || !priceData) return;

    const modXBalance = parseFloat(balance);
    const bnbBalanceNum = parseFloat(bnbBalance);
    
    // Calculate staked amounts and rewards
    const totalStaked = stakes.reduce((sum, stake) => 
      Number(stake.amount) > 0 ? sum + parseFloat(stake.amount) : sum, 0
    );
    
    const totalRewards = stakes.reduce((sum, stake) => 
      Number(stake.pendingRewards) > 0 ? sum + parseFloat(stake.pendingRewards) : sum, 0
    );

    // Get real-time prices from API
    const modXPrice = priceData['modX']?.price || 0.251;
    const bnbPrice = priceData['BNB']?.price || 350;
    
    const tokens: PortfolioToken[] = [];

    // Add modX if user has any
    if (modXBalance > 0 || totalStaked > 0) {
      tokens.push({
        symbol: 'modX',
        balance: modXBalance + totalStaked,
        value: (modXBalance + totalStaked) * modXPrice,
        change24h: priceData['modX']?.change24h || 0,
        price: modXPrice
      });
    }

    // Add BNB if user has any
    if (bnbBalanceNum > 0) {
      tokens.push({
        symbol: 'BNB',
        balance: bnbBalanceNum,
        value: bnbBalanceNum * bnbPrice,
        change24h: priceData['BNB']?.change24h || 0,
        price: bnbPrice
      });
    }

    const totalValue = tokens.reduce((sum, token) => sum + token.value, 0);
    const weightedChange = totalValue > 0 ? tokens.reduce((sum, token) => 
      sum + (token.change24h * (token.value / totalValue)), 0
    ) : 0;

    setPortfolioData({
      totalValue,
      totalBalance: modXBalance,
      totalStaked,
      totalRewards,
      dailyChange: isNaN(weightedChange) ? 0 : weightedChange,
      tokens
    });

  }, [account, balance, bnbBalance, stakes, priceData]);

  return portfolioData;
};
