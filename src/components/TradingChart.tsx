
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRealTimePrice } from '@/hooks/useRealTimePrice';
import { useNavigate } from 'react-router-dom';
import { X, TrendingUp, ArrowUpDown } from 'lucide-react';

interface TradingChartProps {
  symbol: string;
  isOpen: boolean;
  onClose: () => void;
}

const TradingChart = ({ symbol, isOpen, onClose }: TradingChartProps) => {
  const { priceData } = useRealTimePrice();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const tokenData = priceData[symbol];
  const currentPrice = tokenData?.price || 0;
  const priceChange = tokenData?.change24h || 0;

  // Generate chart data for visualization
  const generateChartData = () => {
    const basePrice = currentPrice;
    const variation = basePrice * 0.03; // 3% variation
    return Array.from({ length: 48 }, (_, i) => {
      const time = new Date();
      time.setMinutes(time.getMinutes() - (47 - i) * 30); // 30-minute intervals
      return {
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        price: basePrice + (Math.sin(i * 0.2) + Math.random() - 0.5) * variation
      };
    });
  };

  const chartData = generateChartData();
  const maxPrice = Math.max(...chartData.map(d => d.price));
  const minPrice = Math.min(...chartData.map(d => d.price));
  const priceRange = maxPrice - minPrice;

  const handleBuyClick = () => {
    // Navigate to swap page with token pre-selected
    navigate('/swap', { 
      state: { 
        fromToken: 'modX', 
        toToken: symbol,
        action: 'buy'
      }
    });
    onClose();
  };

  const handleSellClick = () => {
    // Navigate to swap page with token pre-selected
    navigate('/swap', { 
      state: { 
        fromToken: symbol, 
        toToken: 'modX',
        action: 'sell'
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="cyber-card w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-xl">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              {symbol.toUpperCase()} Trading Chart
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Price Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-background/30 rounded-lg p-4">
              <p className="text-sm text-foreground/60">Current Price</p>
              <p className="text-2xl font-bold text-green-400">
                ${symbol === 'modX' ? currentPrice.toFixed(6) : currentPrice.toFixed(2)}
              </p>
            </div>
            <div className="bg-background/30 rounded-lg p-4">
              <p className="text-sm text-foreground/60">24h Change</p>
              <p className={`text-2xl font-bold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
              </p>
            </div>
            <div className="bg-background/30 rounded-lg p-4">
              <p className="text-sm text-foreground/60">24h Volume</p>
              <p className="text-2xl font-bold text-cyan-400">
                ${tokenData?.volume24h?.toLocaleString() || '0'}
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-background/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">{symbol.toUpperCase()} Price Chart (24h)</h3>
            <div className="h-64 relative">
              <svg className="w-full h-full">
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                  <line
                    key={ratio}
                    x1="0"
                    y1={`${ratio * 100}%`}
                    x2="100%"
                    y2={`${ratio * 100}%`}
                    stroke="currentColor"
                    strokeOpacity="0.1"
                  />
                ))}
                
                {/* Price line */}
                <polyline
                  points={chartData.map((point, index) => {
                    const x = (index / (chartData.length - 1)) * 100;
                    const y = ((maxPrice - point.price) / priceRange) * 100;
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="url(#priceGradient)"
                  strokeWidth="2"
                  className="drop-shadow-lg"
                />
                
                {/* Area under curve */}
                <polygon
                  points={[
                    ...chartData.map((point, index) => {
                      const x = (index / (chartData.length - 1)) * 100;
                      const y = ((maxPrice - point.price) / priceRange) * 100;
                      return `${x},${y}`;
                    }),
                    '100,100',
                    '0,100'
                  ].join(' ')}
                  fill="url(#areaGradient)"
                  opacity="0.3"
                />
                
                {/* Gradient definitions */}
                <defs>
                  <linearGradient id="priceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="50%" stopColor="#06B6D4" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Time labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-foreground/50">
                <span>{chartData[0]?.time}</span>
                <span>{chartData[Math.floor(chartData.length / 2)]?.time}</span>
                <span>{chartData[chartData.length - 1]?.time}</span>
              </div>

              {/* Price labels */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-foreground/50">
                <span>${maxPrice.toFixed(symbol === 'modX' ? 6 : 2)}</span>
                <span>${((maxPrice + minPrice) / 2).toFixed(symbol === 'modX' ? 6 : 2)}</span>
                <span>${minPrice.toFixed(symbol === 'modX' ? 6 : 2)}</span>
              </div>
            </div>
          </div>

          {/* Trading Actions */}
          <div className="flex space-x-4">
            <Button
              onClick={handleBuyClick}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 text-lg font-semibold"
            >
              <ArrowUpDown className="w-5 h-5 mr-2" />
              Buy {symbol.toUpperCase()}
            </Button>
            <Button
              onClick={handleSellClick}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 text-lg font-semibold"
            >
              <ArrowUpDown className="w-5 h-5 mr-2" />
              Sell {symbol.toUpperCase()}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingChart;
