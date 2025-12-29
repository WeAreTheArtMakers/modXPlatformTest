import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

interface BinanceTickerData {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  volume: string;
}

export const useRealTimePrice = () => {
  const [priceData, setPriceData] = useState<{ [key: string]: PriceData }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchPriceData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const binanceResponse = await fetch('https://api.binance.com/api/v3/ticker/24hr');
      const binanceData: BinanceTickerData[] = await binanceResponse.json();
      
      const relevantTokens = ['BNBUSDT', 'BTCUSDT', 'ETHUSDT', 'CAKEUSDT', 'ADAUSDT', 'DOTUSDT', 'LINKUSDT'];
      const filteredData: { [key: string]: PriceData } = {};
      
      binanceData.forEach((token) => {
        if (relevantTokens.includes(token.symbol)) {
          const symbol = token.symbol.replace('USDT', '');
          filteredData[symbol] = {
            symbol,
            price: parseFloat(token.lastPrice),
            change24h: parseFloat(token.priceChangePercent),
            volume24h: parseFloat(token.volume) * parseFloat(token.lastPrice),
            marketCap: 0
          };
        }
      });
      
      if (filteredData['ETH']) {
        filteredData['WETH'] = {
          symbol: 'WETH',
          price: filteredData['ETH'].price,
          change24h: filteredData['ETH'].change24h,
          volume24h: filteredData['ETH'].volume24h * 0.1,
          marketCap: filteredData['ETH'].marketCap * 0.001
        };
      }
      
      filteredData['modX'] = {
        symbol: 'modX',
        price: 0.251,
        change24h: 5.67,
        volume24h: 125450,
        marketCap: 2505000
      };
      
      const circulatingSupplies: { [key: string]: number } = {
        'BNB': 149856150,
        'BTC': 19700000,
        'ETH': 120000000,
        'CAKE': 312000000,
        'WETH': 118750,
        'ADA': 35200000000,
        'DOT': 1312830000,
        'LINK': 589000000,
        'modX': 10000000
      };
      
      Object.keys(filteredData).forEach(symbol => {
        if (circulatingSupplies[symbol]) {
          filteredData[symbol].marketCap = filteredData[symbol].price * circulatingSupplies[symbol];
        }
      });
      
      setPriceData(filteredData);
    } catch (err) {
      logger.error('Error fetching price data:', err);
      setError('Failed to fetch price data');
      
      setPriceData({
        'BNB': { symbol: 'BNB', price: 350, change24h: 2.34, volume24h: 890340, marketCap: 52450000 },
        'BTC': { symbol: 'BTC', price: 65000, change24h: 1.23, volume24h: 25000000, marketCap: 1200000000 },
        'ETH': { symbol: 'ETH', price: 3200, change24h: -0.45, volume24h: 15000000, marketCap: 380000000 },
        'CAKE': { symbol: 'CAKE', price: 2.85, change24h: 4.12, volume24h: 45000000, marketCap: 890000000 },
        'WETH': { symbol: 'WETH', price: 3200, change24h: -0.45, volume24h: 8900000, marketCap: 380000000 },
        'ADA': { symbol: 'ADA', price: 0.42, change24h: -2.15, volume24h: 125000000, marketCap: 14800000000 },
        'DOT': { symbol: 'DOT', price: 6.78, change24h: 3.45, volume24h: 78000000, marketCap: 8900000000 },
        'LINK': { symbol: 'LINK', price: 14.25, change24h: 1.85, volume24h: 156000000, marketCap: 8400000000 },
        'modX': { symbol: 'modX', price: 0.251, change24h: 5.67, volume24h: 125450, marketCap: 2505000 }
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceData();
    const interval = setInterval(fetchPriceData, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    priceData,
    isLoading,
    error,
    refreshPrices: fetchPriceData
  };
};
