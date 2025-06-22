import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/LanguageContext';
import { useRealTimePrice } from '@/hooks/useRealTimePrice';
import { usePriceAlarm } from '@/hooks/usePriceAlarm';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, TrendingDown, Activity, BarChart3, Search, Filter, Bell, AlertTriangle } from 'lucide-react';

const Market = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { priceData } = useRealTimePrice();
  const { alarm, setAlarm, clearAlarm } = usePriceAlarm(priceData);
  const { toast } = useToast();
  const [selectedToken, setSelectedToken] = useState('');
  const [showChart, setShowChart] = useState(false);
  const [alarmPrice, setAlarmPrice] = useState('');

  const marketData = [
    {
      symbol: 'modX',
      name: 'ModCopyX',
      price: 0.251,
      change24h: 5.67,
      volume24h: 125450,
      marketCap: 2456789,
      icon: '🔥'
    },
    {
      symbol: 'BNB',
      name: 'Binance Coin',
      price: 320.50,
      change24h: -1.23,
      volume24h: 876321,
      marketCap: 50432100,
      icon: '🟡'
    },
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 61345.78,
      change24h: 2.45,
      volume24h: 1543289,
      marketCap: 1156000000,
      icon: '🪙'
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      price: 3045.23,
      change24h: -0.87,
      volume24h: 987654,
      marketCap: 367000000,
      icon: '💎'
    },
    {
      symbol: 'CAKE',
      name: 'PancakeSwap',
      price: 12.56,
      change24h: 3.12,
      volume24h: 456789,
      marketCap: 12345678,
      icon: '🥞'
    },
    {
      symbol: 'WETH',
      name: 'Wrapped ETH',
      price: 3040.12,
      change24h: -0.55,
      volume24h: 876543,
      marketCap: 366000000,
      icon: '✨'
    },
    {
      symbol: 'ADA',
      name: 'Cardano',
      price: 1.23,
      change24h: 1.89,
      volume24h: 654321,
      marketCap: 41234567,
      icon: '🔷'
    },
    {
      symbol: 'DOT',
      name: 'Polkadot',
      price: 25.67,
      change24h: -2.34,
      volume24h: 765432,
      marketCap: 25678901,
      icon: '🔴'
    },
    {
      symbol: 'LINK',
      name: 'Chainlink',
      price: 28.90,
      change24h: 0.78,
      volume24h: 543210,
      marketCap: 14567890,
      icon: '🔗'
    }
  ];

  const handleBuyClick = (tokenSymbol: string) => {
    navigate('/swap', { state: { fromToken: 'BNB', toToken: tokenSymbol } });
  };

  const handleSellClick = (tokenSymbol: string) => {
    navigate('/swap', { state: { fromToken: tokenSymbol, toToken: 'BNB' } });
  };

  const handleChartView = (tokenSymbol: string) => {
    setSelectedToken(tokenSymbol);
    setShowChart(true);
    setAlarmPrice('');
  };

  const generateDetailedChartData = (token: string) => {
    const basePrice = priceData[token]?.price || marketData.find(t => t.symbol === token)?.price || 1;
    const variation = basePrice * 0.08;
    
    return Array.from({ length: 50 }, (_, i) => {
      const time = new Date();
      time.setMinutes(time.getMinutes() - (49 - i) * 2);
      return {
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        price: basePrice + (Math.sin(i * 0.2) + Math.random() - 0.5) * variation,
        volume: Math.random() * 1000000 + 100000
      };
    });
  };

  const handleSetAlarm = () => {
    if (alarm) {
      toast({
        title: "Alarm Hatası",
        description: "Zaten aktif bir alarmınız var. Önce onu silin.",
        variant: "destructive"
      });
      return;
    }

    if (!alarmPrice || isNaN(Number(alarmPrice))) {
      toast({
        title: "Geçersiz Fiyat",
        description: "Lütfen geçerli bir fiyat girin.",
        variant: "destructive"
      });
      return;
    }

    const currentPrice = priceData[selectedToken]?.price || marketData.find(t => t.symbol === selectedToken)?.price || 0;
    const targetPrice = Number(alarmPrice);

    const newAlarm = {
      token: selectedToken,
      targetPrice,
      currentPrice,
      timestamp: Date.now()
    };

    setAlarm(newAlarm);
    
    toast({
      title: "Alarm Kuruldu",
      description: `${selectedToken.toUpperCase()} için $${targetPrice} fiyat alarmı aktif edildi.`
    });

    setShowChart(false);
    setAlarmPrice('');
  };

  const handleClearAlarm = () => {
    clearAlarm();
    toast({
      title: "Alarm Silindi",
      description: "Fiyat alarmınız başarıyla silindi."
    });
  };

  const chartData = generateDetailedChartData(selectedToken);
  const maxPrice = Math.max(...chartData.map(d => d.price));
  const minPrice = Math.min(...chartData.map(d => d.price));
  const priceRange = maxPrice - minPrice;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 font-orbitron gradient-text">
              {t('market.title')}
            </h1>
            <p className="text-xl text-foreground/70 font-roboto">
              {t('market.subtitle')}
            </p>
          </div>

          {/* Alarm Status */}
          {alarm && (
            <Card className="cyber-card mb-6 border-orange-500/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-orange-400" />
                    <span className="text-orange-400 font-semibold">
                      Aktif Alarm: {alarm.token.toUpperCase()} - ${alarm.targetPrice}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAlarm}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    Alarmı Sil
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Market Data Table */}
          <Card className="cyber-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-2xl font-orbitron">
                <span className="flex items-center">
                  <Activity className="w-6 h-6 mr-2 text-green-400" />
                  {t('market.livePrices')}
                </span>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="hover-glow">
                    <Search className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="hover-glow">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/20">
                      <th className="text-left py-4 font-orbitron">#</th>
                      <th className="text-left py-4 font-orbitron">{t('market.name')}</th>
                      <th className="text-left py-4 font-orbitron">{t('market.price')}</th>
                      <th className="text-left py-4 font-orbitron">{t('market.change')}</th>
                      <th className="text-left py-4 font-orbitron">{t('market.volume')}</th>
                      <th className="text-left py-4 font-orbitron">{t('market.chart')}</th>
                      <th className="text-left py-4 font-orbitron">{t('market.action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketData.map((token, index) => {
                      const realTimePrice = priceData[token.symbol]?.price || token.price;
                      const realTimeChange = priceData[token.symbol]?.change24h || token.change24h;
                      const realTimeVolume = priceData[token.symbol]?.volume24h || token.volume24h;
                      
                      // Generate mini chart data
                      const miniChartData = Array.from({ length: 10 }, (_, i) => {
                        const variation = realTimePrice * 0.02;
                        return realTimePrice + (Math.sin(i * 0.5) + Math.random() - 0.5) * variation;
                      });
                      const miniMax = Math.max(...miniChartData);
                      const miniMin = Math.min(...miniChartData);
                      const miniRange = miniMax - miniMin;
                      
                      return (
                        <tr key={token.symbol} className="border-b border-border/10 hover:bg-background/30 transition-colors duration-300">
                          <td className="py-4 font-mono text-foreground/60">{index + 1}</td>
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center text-lg">
                                {token.icon}
                              </div>
                              <div>
                                <div className="font-bold font-orbitron">{token.symbol}</div>
                                <div className="text-xs text-foreground/60 font-roboto">{token.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 font-mono font-bold">
                            ${realTimePrice.toFixed(token.symbol === 'modX' ? 6 : 2)}
                          </td>
                          <td className="py-4">
                            <span className={`font-mono font-bold ${realTimeChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {realTimeChange >= 0 ? '+' : ''}{realTimeChange.toFixed(2)}%
                            </span>
                          </td>
                          <td className="py-4 font-mono">
                            ${realTimeVolume?.toLocaleString() || '0'}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              {/* Mini Chart */}
                              <div className="w-24 h-10 relative overflow-hidden rounded">
                                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                  <polyline
                                    points={miniChartData.map((price, i) => {
                                      const x = (i / (miniChartData.length - 1)) * 100;
                                      const y = miniRange > 0 ? ((miniMax - price) / miniRange) * 80 + 10 : 50;
                                      return `${x},${y}`;
                                    }).join(' ')}
                                    fill="none"
                                    stroke={realTimeChange >= 0 ? '#10B981' : '#EF4444'}
                                    strokeWidth="2"
                                    vectorEffect="non-scaling-stroke"
                                  />
                                </svg>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleChartView(token.symbol)}
                                className="text-xs text-blue-400 hover:text-blue-300"
                              >
                                <BarChart3 className="w-3 h-3 mr-1" />
                                {t('market.view')}
                              </Button>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleBuyClick(token.symbol)}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-xs"
                              >
                                {t('market.trade')}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSellClick(token.symbol)}
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10 px-3 py-1 text-xs"
                              >
                                {t('market.trade')}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Chart Modal */}
          <Dialog open={showChart} onOpenChange={setShowChart}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden cyber-card">
              <DialogHeader>
                <DialogTitle className="flex items-center text-xl font-orbitron">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
                  {selectedToken.toUpperCase()} {t('market.chart')}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Price Info */}
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-foreground/60">{t('market.price')}</p>
                    <p className="text-2xl font-bold text-green-400 font-orbitron">
                      ${(priceData[selectedToken]?.price || marketData.find(t => t.symbol === selectedToken)?.price || 0).toFixed(selectedToken === 'modX' ? 6 : 2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60">{t('market.change')}</p>
                    <p className={`text-2xl font-bold font-orbitron ${
                      (priceData[selectedToken]?.change24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {(priceData[selectedToken]?.change24h || 5.67) >= 0 ? '+' : ''}{(priceData[selectedToken]?.change24h || 5.67).toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60">{t('market.volume')}</p>
                    <p className="text-2xl font-bold text-cyan-400 font-orbitron">
                      ${(priceData[selectedToken]?.volume24h || 125450).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-background/30 rounded-xl p-4 border border-green-500/20">
                  <h4 className="font-semibold mb-4 font-orbitron">
                    {selectedToken.toUpperCase()} {t('market.chart')} (24h)
                  </h4>
                  <div className="w-full h-80 relative overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Grid lines */}
                      {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio) => (
                        <line
                          key={ratio}
                          x1="0"
                          y1={ratio * 100}
                          x2="100"
                          y2={ratio * 100}
                          stroke="currentColor"
                          strokeOpacity="0.1"
                          strokeDasharray="2,2"
                          vectorEffect="non-scaling-stroke"
                        />
                      ))}
                      
                      {/* Price area */}
                      <defs>
                        <linearGradient id={`areaGradient-${selectedToken}`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
                        </linearGradient>
                      </defs>
                      
                      <polygon
                        points={`0,100 ${chartData.map((point, index) => {
                          const x = (index / (chartData.length - 1)) * 100;
                          const y = priceRange > 0 ? ((maxPrice - point.price) / priceRange) * 80 + 10 : 50;
                          return `${x},${y}`;
                        }).join(' ')} 100,100`}
                        fill={`url(#areaGradient-${selectedToken})`}
                      />
                      
                      {/* Price line */}
                      <polyline
                        points={chartData.map((point, index) => {
                          const x = (index / (chartData.length - 1)) * 100;
                          const y = priceRange > 0 ? ((maxPrice - point.price) / priceRange) * 80 + 10 : 50;
                          return `${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="0.5"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                    
                    {/* Price labels */}
                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-foreground/60 font-mono py-2">
                      <span>${maxPrice.toFixed(selectedToken === 'modX' ? 6 : 2)}</span>
                      <span>${((maxPrice + minPrice) / 2).toFixed(selectedToken === 'modX' ? 6 : 2)}</span>
                      <span>${minPrice.toFixed(selectedToken === 'modX' ? 6 : 2)}</span>
                    </div>
                    
                    {/* Time labels */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-foreground/50 font-mono px-2">
                      <span>{chartData[0]?.time}</span>
                      <span>Now</span>
                    </div>
                  </div>
                </div>

                {/* Price Alarm Section */}
                <div className="bg-background/20 rounded-xl p-4 border border-orange-500/20">
                  <h4 className="font-semibold mb-4 font-orbitron flex items-center">
                    <Bell className="w-4 h-4 mr-2 text-orange-400" />
                    Fiyat Alarmı Kur
                  </h4>
                  {!alarm ? (
                    <div className="flex space-x-4">
                      <div className="flex-1">
                        <Input
                          type="number"
                          placeholder="Hedef fiyat ($)"
                          value={alarmPrice}
                          onChange={(e) => setAlarmPrice(e.target.value)}
                          className="bg-background/50"
                        />
                      </div>
                      <Button onClick={handleSetAlarm} className="bg-orange-500 hover:bg-orange-600">
                        <Bell className="w-4 h-4 mr-2" />
                        Alarmı Kur
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                        <span className="text-orange-400">Zaten aktif bir alarmınız var</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearAlarm}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        Sil
                      </Button>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <Button
                    onClick={() => {
                      setShowChart(false);
                      handleBuyClick(selectedToken);
                    }}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 font-orbitron"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Buy {selectedToken.toUpperCase()}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowChart(false);
                      handleSellClick(selectedToken);
                    }}
                    variant="outline"
                    className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 py-3 font-orbitron"
                  >
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Sell {selectedToken.toUpperCase()}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Market;
