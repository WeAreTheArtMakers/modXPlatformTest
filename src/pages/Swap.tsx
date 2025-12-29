
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { useSwap } from '@/hooks/useSwap';
import { useRealTimePrice } from '@/hooks/useRealTimePrice';
import SwapInterface from '@/components/SwapInterface';
import AddLiquidityInterface from '@/components/AddLiquidityInterface';
import { History, TrendingUp, BarChart3, ArrowUpDown } from 'lucide-react';


const Swap = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const { getSwapHistory } = useSwap();
  const { priceData } = useRealTimePrice();
  const [selectedToken, setSelectedToken] = useState('modX');

  // Handle navigation from market page
  useEffect(() => {
    if (location.state?.fromToken && location.state?.toToken) {
      // SwapInterface will handle the state
    }
  }, [location.state]);

  const swapHistory = getSwapHistory();
  const currentPrice = priceData[selectedToken]?.price || 0;
  const priceChange = priceData[selectedToken]?.change24h || 0;

  // Available tokens for price chart selection
  const availableTokens = ['modX', 'BNB', 'BTC', 'ETH', 'CAKE', 'WETH', 'ADA', 'DOT', 'LINK'];

  // Generate enhanced chart data
  const generateChartData = () => {
    const basePrice = currentPrice;
    const variation = basePrice * 0.05;
    return Array.from({ length: 48 }, (_, i) => {
      const time = new Date();
      time.setMinutes(time.getMinutes() - (47 - i) * 30); // 30-minute intervals
      return {
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        price: basePrice + (Math.sin(i * 0.3) + Math.random() - 0.5) * variation,
        volume: Math.random() * 500000 + 50000
      };
    });
  };

  const chartData = generateChartData();
  const maxPrice = Math.max(...chartData.map(d => d.price));
  const minPrice = Math.min(...chartData.map(d => d.price));
  const priceRange = maxPrice - minPrice;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 font-orbitron gradient-text">
              {t('swap.title')}
            </h1>
            <p className="text-xl text-foreground/70 font-roboto">
              {t('swap.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Swap Interface */}
            <div className="lg:col-span-2">
              <SwapInterface />
              <div className="mt-8">
                <AddLiquidityInterface />
              </div>

              {/* Swap History */}
              <Card className="cyber-card mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-orbitron">
                    <History className="w-5 h-5 mr-2 text-blue-400" />
                    {t('swap.recentSwaps')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {swapHistory.length === 0 ? (
                    <div className="text-center py-8 text-foreground/60">
                      <ArrowUpDown className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="font-roboto">{t('swap.noHistory')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {swapHistory.map((swap: { id: string; fromAmount: string; from: string; to: string; toAmount: string; date: string; hash: string }) => (
                        <div key={swap.id} className="flex items-center justify-between p-3 bg-background/30 rounded-lg hover:bg-background/50 transition-colors duration-300">
                          <div className="flex items-center space-x-3">
                            <div className="text-sm font-roboto">
                              <span className="font-medium">{swap.fromAmount} {swap.from}</span>
                              <ArrowUpDown className="inline mx-2 w-3 h-3" />
                              <span className="font-medium">{swap.toAmount} {swap.to}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-foreground/60 font-roboto">{swap.date}</div>
                            <div className="text-xs text-cyan-400 font-mono">{swap.hash}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Price Chart & Stats */}
            <div className="space-y-6">
              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg font-orbitron">
                    <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
                    {selectedToken.toUpperCase()} {t('swap.priceChart')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <select 
                      value={selectedToken}
                      onChange={(e) => setSelectedToken(e.target.value)}
                      className="bg-background/30 border border-green-500/30 rounded-lg px-3 py-2 font-roboto w-full"
                      aria-label="Select token for price chart"
                    >
                      {availableTokens.map(token => (
                        <option key={token} value={token}>{token.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-2xl font-bold font-orbitron">
                      ${currentPrice.toFixed(selectedToken === 'modX' ? 6 : 2)}
                    </div>
                    <div className={`text-sm font-roboto ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}% (24h)
                    </div>
                  </div>

                  {/* Fixed chart container with proper responsive sizing */}
                  <div className="w-full h-64 relative bg-background/30 rounded-lg border border-green-500/20 overflow-hidden">
                    <div className="absolute inset-4">
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {/* Background grid */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                          <line
                            key={ratio}
                            x1="5"
                            y1={5 + ratio * 85}
                            x2="95"
                            y2={5 + ratio * 85}
                            stroke="currentColor"
                            strokeOpacity="0.1"
                            strokeDasharray="1,1"
                            vectorEffect="non-scaling-stroke"
                          />
                        ))}
                        
                        {/* Vertical grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                          <line
                            key={`v-${ratio}`}
                            x1={5 + ratio * 90}
                            y1="5"
                            x2={5 + ratio * 90}
                            y2="90"
                            stroke="currentColor"
                            strokeOpacity="0.1"
                            strokeDasharray="1,1"
                            vectorEffect="non-scaling-stroke"
                          />
                        ))}
                        
                        {/* Price area fill */}
                        <defs>
                          <linearGradient id={`priceGradient-${selectedToken}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                            <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
                          </linearGradient>
                          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10B981" />
                            <stop offset="50%" stopColor="#06B6D4" />
                            <stop offset="100%" stopColor="#8B5CF6" />
                          </linearGradient>
                        </defs>
                        
                        <polygon
                          points={`5,90 ${chartData.map((point, index) => {
                            const x = 5 + (index / (chartData.length - 1)) * 90;
                            const y = priceRange > 0 ? 5 + ((maxPrice - point.price) / priceRange) * 80 : 45;
                            return `${x},${y}`;
                          }).join(' ')} 95,90`}
                          fill={`url(#priceGradient-${selectedToken})`}
                        />
                        
                        {/* Price line */}
                        <polyline
                          points={chartData.map((point, index) => {
                            const x = 5 + (index / (chartData.length - 1)) * 90;
                            const y = priceRange > 0 ? 5 + ((maxPrice - point.price) / priceRange) * 80 : 45;
                            return `${x},${y}`;
                          }).join(' ')}
                          fill="none"
                          stroke="url(#lineGradient)"
                          strokeWidth="0.5"
                          vectorEffect="non-scaling-stroke"
                        />
                        
                        {/* Data points */}
                        {chartData.filter((_, i) => i % 8 === 0).map((point, index) => {
                          const realIndex = index * 8;
                          const x = 5 + (realIndex / (chartData.length - 1)) * 90;
                          const y = priceRange > 0 ? 5 + ((maxPrice - point.price) / priceRange) * 80 : 45;
                          return (
                            <circle
                              key={index}
                              cx={x}
                              cy={y}
                              r="0.8"
                              fill="#10B981"
                              opacity="0.8"
                            />
                          );
                        })}
                      </svg>
                      
                      {/* Price labels on Y-axis */}
                      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-foreground/60 font-mono pointer-events-none">
                        <span>${maxPrice.toFixed(selectedToken === 'modX' ? 4 : 2)}</span>
                        <span>${((maxPrice + minPrice) / 2).toFixed(selectedToken === 'modX' ? 4 : 2)}</span>
                        <span>${minPrice.toFixed(selectedToken === 'modX' ? 4 : 2)}</span>
                      </div>
                      
                      {/* Time labels on X-axis */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-foreground/50 font-mono pointer-events-none">
                        <span>{chartData[0]?.time}</span>
                        <span>{chartData[Math.floor(chartData.length / 2)]?.time}</span>
                        <span>{chartData[chartData.length - 1]?.time}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Market Stats */}
              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg font-orbitron">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                    {t('swap.marketStats')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-roboto">{t('swap.volume24h')}</span>
                    <span className="font-orbitron font-medium">
                      ${priceData[selectedToken]?.volume24h?.toLocaleString() || '125,450'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-roboto">{t('swap.marketCap')}</span>
                    <span className="font-orbitron font-medium">
                      ${priceData[selectedToken]?.marketCap?.toLocaleString() || '2,456,789'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-roboto">{selectedToken.toUpperCase()} {t('swap.price')}</span>
                    <span className="font-orbitron font-medium text-green-400">
                      ${currentPrice.toFixed(selectedToken === 'modX' ? 6 : 2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-roboto">{t('swap.change24h')}</span>
                    <span className={`font-orbitron font-medium ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Swap;
