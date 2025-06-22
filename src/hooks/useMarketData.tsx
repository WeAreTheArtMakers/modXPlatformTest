
import { useState, useEffect } from 'react';
import { useRealTimePrice } from './useRealTimePrice';

interface MarketToken {
  id: number;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  supply: number;
  chart: number[];
  favorite: boolean;
}

export const useMarketData = () => {
  const { priceData, isLoading } = useRealTimePrice();
  const [favorites, setFavorites] = useState<number[]>([1]); // modX favorited by default
  const [marketData, setMarketData] = useState<MarketToken[]>([]);

  useEffect(() => {
    if (!priceData || Object.keys(priceData).length === 0) return;

    // Extended token list with more BSC tokens
    const tokens: MarketToken[] = [
      {
        id: 1,
        symbol: 'modX',
        name: 'ModCopyX',
        price: priceData['modX']?.price || 0.251,
        change24h: priceData['modX']?.change24h || 5.67,
        volume24h: priceData['modX']?.volume24h || 125450,
        marketCap: priceData['modX']?.marketCap || 2505000,
        supply: 10000000,
        chart: [0.23, 0.24, 0.25, 0.26, 0.255, priceData['modX']?.price || 0.251],
        favorite: favorites.includes(1)
      },
      {
        id: 2,
        symbol: 'BNB',
        name: 'BNB',
        price: priceData['BNB']?.price || 350,
        change24h: priceData['BNB']?.change24h || 2.34,
        volume24h: priceData['BNB']?.volume24h || 890340,
        marketCap: priceData['BNB']?.marketCap || 52450000,
        supply: 149856150,
        chart: [340, 345, 350, 348, 352, priceData['BNB']?.price || 350],
        favorite: favorites.includes(2)
      },
      {
        id: 3,
        symbol: 'BTC',
        name: 'Bitcoin',
        price: priceData['BTC']?.price || 65000,
        change24h: priceData['BTC']?.change24h || 1.23,
        volume24h: priceData['BTC']?.volume24h || 25000000,
        marketCap: priceData['BTC']?.marketCap || 1200000000,
        supply: 19700000,
        chart: [64000, 64500, 65000, 64800, 65200, priceData['BTC']?.price || 65000],
        favorite: favorites.includes(3)
      },
      {
        id: 4,
        symbol: 'ETH',
        name: 'Ethereum',
        price: priceData['ETH']?.price || 3200,
        change24h: priceData['ETH']?.change24h || -0.45,
        volume24h: priceData['ETH']?.volume24h || 15000000,
        marketCap: priceData['ETH']?.marketCap || 380000000,
        supply: 120000000,
        chart: [3150, 3180, 3200, 3190, 3210, priceData['ETH']?.price || 3200],
        favorite: favorites.includes(4)
      },
      {
        id: 5,
        symbol: 'USDC',
        name: 'USD Coin',
        price: 1.00,
        change24h: 0.01,
        volume24h: 4500000,
        marketCap: 32000000000,
        supply: 32000000000,
        chart: [0.999, 1.001, 1.000, 0.998, 1.002, 1.000],
        favorite: favorites.includes(5)
      },
      {
        id: 6,
        symbol: 'CAKE',
        name: 'PancakeSwap',
        price: 2.85,
        change24h: 4.12,
        volume24h: 45000000,
        marketCap: 890000000,
        supply: 312000000,
        chart: [2.75, 2.80, 2.85, 2.82, 2.88, 2.85],
        favorite: favorites.includes(6)
      },
      {
        id: 7,
        symbol: 'WETH',
        name: 'Wrapped Ethereum',
        price: priceData['ETH']?.price || 3200,
        change24h: priceData['ETH']?.change24h || -0.45,
        volume24h: 8900000,
        marketCap: 380000000,
        supply: 118750,
        chart: [3150, 3180, 3200, 3190, 3210, priceData['ETH']?.price || 3200],
        favorite: favorites.includes(7)
      },
      {
        id: 8,
        symbol: 'ADA',
        name: 'Cardano',
        price: 0.42,
        change24h: -2.15,
        volume24h: 125000000,
        marketCap: 14800000000,
        supply: 35200000000,
        chart: [0.44, 0.43, 0.42, 0.41, 0.43, 0.42],
        favorite: favorites.includes(8)
      },
      {
        id: 9,
        symbol: 'DOT',
        name: 'Polkadot',
        price: 6.78,
        change24h: 3.45,
        volume24h: 78000000,
        marketCap: 8900000000,
        supply: 1312830000,
        chart: [6.50, 6.65, 6.78, 6.72, 6.85, 6.78],
        favorite: favorites.includes(9)
      },
      {
        id: 10,
        symbol: 'LINK',
        name: 'Chainlink',
        price: 14.25,
        change24h: 1.85,
        volume24h: 156000000,
        marketCap: 8400000000,
        supply: 589000000,
        chart: [13.90, 14.10, 14.25, 14.15, 14.35, 14.25],
        favorite: favorites.includes(10)
      }
    ];

    setMarketData(tokens);
  }, [priceData, favorites]);

  const toggleFavorite = (tokenId: number) => {
    setFavorites(prev => 
      prev.includes(tokenId) 
        ? prev.filter(id => id !== tokenId)
        : [...prev, tokenId]
    );
  };

  const formatNumber = (num: number, decimals = 2) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(decimals)}K`;
    return `$${num.toFixed(decimals)}`;
  };

  return {
    marketData,
    isLoading,
    toggleFavorite,
    formatNumber
  };
};
