import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ethers, Contract } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSwap, PANCAKE_ROUTER_ADDRESS, PANCAKE_ROUTER_ABI, resolveSwapPath } from '@/hooks/useSwap';
import { useWeb3 } from '@/context/Web3Context';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowUpDown, Settings, Loader2, Droplets } from 'lucide-react';
import LiquidityInterface from '@/components/LiquidityInterface';

const SwapInterface: React.FC = () => {
  const { t } = useLanguage();
  const { account, signer } = useWeb3();
  const {
    tokens,
    isLoading,
    calculateSwapAmount,
    calculatePriceImpact,
    executeSwap,
    getExchangeRate,
    getSwapHistory
  } = useSwap();

  const [mode, setMode] = useState<'swap' | 'pool'>('swap');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState('modX');
  const [toToken, setToToken] = useState('BNB');
  const [swapPath, setSwapPath] = useState<string[] | null>(null);

  const handleAmountChange = useCallback(async (value: string, isFrom: boolean) => {
    if (isFrom) {
      setFromAmount(value);
      if (value && Number(value) > 0) {
        const calculatedTo = await calculateSwapAmount(value, fromToken, toToken);
        setToAmount(calculatedTo);
      } else {
        setToAmount('');
      }
    } else {
      setToAmount(value);
      if (value && Number(value) > 0) {
        const calculatedFrom = await calculateSwapAmount(value, toToken, fromToken);
        setFromAmount(calculatedFrom);
      } else {
        setFromAmount('');
      }
    }
  }, [calculateSwapAmount, fromToken, toToken]);

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleSwap = async () => {
    if (!account) {
      alert('Please connect your wallet');
      return;
    }
    try {
      await executeSwap(fromToken, toToken, fromAmount, toAmount);
      setFromAmount('');
      setToAmount('');
    } catch {
      // Error handled in hook
    }
  };

  const exchangeRate = getExchangeRate(fromToken, toToken);
  const priceImpact = calculatePriceImpact(fromAmount);
  const swapHistory = getSwapHistory();

  const router = useMemo(
    () => (signer ? new Contract(PANCAKE_ROUTER_ADDRESS, PANCAKE_ROUTER_ABI, signer) : null),
    [signer]
  );

  useEffect(() => {
    if (!router || !fromAmount || Number(fromAmount) <= 0) {
      setSwapPath(null);
      return;
    }
    
    const checkPath = async () => {
      const fromInfo = tokens.find(t => t.symbol === fromToken);
      const toInfo = tokens.find(t => t.symbol === toToken);
      if (!fromInfo || !toInfo) {
        setSwapPath(null);
        return;
      }
      try {
        const amountIn = ethers.parseUnits(fromAmount, fromInfo.decimals);
        const path = await resolveSwapPath(router, fromInfo.address, toInfo.address, amountIn);
        setSwapPath(path);
      } catch {
        setSwapPath(null);
      }
    };
    
    checkPath();
  }, [fromAmount, fromToken, toToken, tokens, router]);

  useEffect(() => {
    const recalculate = async () => {
      if (fromAmount && Number(fromAmount) > 0) {
        const newToAmount = await calculateSwapAmount(fromAmount, fromToken, toToken);
        setToAmount(newToAmount);
      }
    };
    recalculate();
  }, [fromToken, toToken, calculateSwapAmount, fromAmount]);

  return (
    <div className="space-y-6">
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-xl font-orbitron">
            <span className="flex items-center">
              {mode === 'swap' ? (
                <>
                  <ArrowUpDown className="w-5 h-5 mr-2 text-green-400" />
                  {t('swap.title')}
                </>
              ) : (
                <>
                  <Droplets className="w-5 h-5 mr-2 text-cyan-400" />
                  {t('pool.title')}
                </>
              )}
            </span>
            <Button variant="ghost" size="sm" className="hover-glow">
              <Settings className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Toggle */}
          <div className="flex justify-center gap-2 p-1 bg-background/30 rounded-lg">
            <button
              onClick={() => setMode('swap')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                mode === 'swap'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'text-foreground/60 hover:text-foreground/80'
              }`}
            >
              Swap
            </button>
            <button
              onClick={() => setMode('pool')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                mode === 'pool'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-foreground/60 hover:text-foreground/80'
              }`}
            >
              Pool
            </button>
          </div>

          {mode === 'swap' ? (
            <>
              {/* From Token */}
              <div className="bg-background/30 rounded-xl p-4 border border-green-400/20">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">{t('swap.from')}</label>
                  <span className="text-xs text-foreground/60">
                    {t('swap.balance')}: {tokens.find(t => t.symbol === fromToken)?.balance || '0.0'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={e => handleAmountChange(e.target.value, true)}
                    className="flex-1 text-xl font-mono bg-transparent border-none p-0 focus:ring-0"
                    aria-label="Amount to swap from"
                  />
                  <select
                    value={fromToken}
                    onChange={e => setFromToken(e.target.value)}
                    className="bg-green-500/20 border border-green-500/30 rounded-lg px-4 py-2 font-medium"
                    aria-label="Select token to swap from"
                  >
                    {tokens.map(token => (
                      <option key={token.symbol} value={token.symbol}>{token.symbol}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Swap Direction Button */}
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full w-12 h-12 hover-glow bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30"
                  onClick={handleSwapTokens}
                  aria-label="Swap token direction"
                >
                  <ArrowUpDown className="w-5 h-5" />
                </Button>
              </div>

              {/* To Token */}
              <div className="bg-background/30 rounded-xl p-4 border border-cyan-400/20">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">{t('swap.to')}</label>
                  <span className="text-xs text-foreground/60">
                    {t('swap.balance')}: {tokens.find(t => t.symbol === toToken)?.balance || '0.0'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={toAmount}
                    onChange={e => handleAmountChange(e.target.value, false)}
                    className="flex-1 text-xl font-mono bg-transparent border-none p-0 focus:ring-0"
                    aria-label="Amount to receive"
                  />
                  <select
                    value={toToken}
                    onChange={e => setToToken(e.target.value)}
                    className="bg-cyan-500/20 border border-cyan-500/30 rounded-lg px-4 py-2 font-medium"
                    aria-label="Select token to receive"
                  >
                    {tokens.map(token => (
                      <option key={token.symbol} value={token.symbol}>{token.symbol}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Swap Details */}
              <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-lg p-4 border border-green-500/20 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">{t('swap.exchangeRate')}</span>
                  <span className="font-mono">1 {fromToken} = {exchangeRate.toFixed(6)} {toToken}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">{t('swap.priceImpact')}</span>
                  <span className={`font-mono ${priceImpact > 1 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {priceImpact.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">{t('swap.liquidityFee')}</span>
                  <span className="font-mono">0.25%</span>
                </div>
              </div>

              {/* Path Info */}
              {swapPath && (
                <div className="flex justify-between text-xs text-foreground/50">
                  <span>Route:</span>
                  <span className="font-mono">{swapPath.map(addr => addr.slice(0, 6)).join(' → ')}</span>
                </div>
              )}
              
              {fromAmount && !swapPath && (
                <div className="text-sm text-red-400 text-center">No route available</div>
              )}

              {/* Swap Button */}
              <Button
                onClick={handleSwap}
                disabled={!fromAmount || !toAmount || isLoading || !swapPath}
                className="w-full cyber-glow bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 py-6 text-lg font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Swapping...
                  </>
                ) : (
                  t('swap.swapTokens')
                )}
              </Button>

              {/* Recent Swaps */}
              {swapHistory.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-foreground/70 mb-3">{t('swap.recentSwaps')}</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {swapHistory.slice(0, 5).map((swap) => (
                      <div
                        key={swap.id}
                        className="flex items-center justify-between p-3 bg-background/30 rounded-lg text-sm"
                      >
                        <div>
                          <span className="font-mono">{swap.fromAmount} {swap.from}</span>
                          <span className="mx-2 text-foreground/40">→</span>
                          <span className="font-mono">{parseFloat(swap.toAmount).toFixed(6)} {swap.to}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-foreground/50">{swap.date}</p>
                          <p className="text-xs font-mono text-foreground/40">{swap.hash}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <LiquidityInterface />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SwapInterface;
