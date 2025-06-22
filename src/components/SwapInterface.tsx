
import React, { useState, useEffect, useMemo } from 'react';
import { ethers, Contract } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSwap, PANCAKE_ROUTER_ADDRESS, PANCAKE_ROUTER_ABI, NATIVE_BNB_ADDRESS, WBNB_ADDRESS, resolveSwapPath } from '@/hooks/useSwap';
import { useWeb3 } from '@/context/Web3Context';
import { ArrowUpDown, Settings, Loader2 } from 'lucide-react';

const SwapInterface = () => {
  const { account, provider, signer } = useWeb3();
  const {
    tokens,
    isLoading,
    calculateSwapAmount,
    calculatePriceImpact,
    executeSwap,
    getExchangeRate
  } = useSwap();
  
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState('modX');
  const [toToken, setToToken] = useState('BNB');
  const [swapPath, setSwapPath] = useState<string[] | null>(null);

  const handleAmountChange = (value: string, isFrom: boolean) => {
    if (isFrom) {
      setFromAmount(value);
      const calculated = calculateSwapAmount(value, fromToken, toToken);
      setToAmount(calculated);
    } else {
      setToAmount(value);
      const calculated = calculateSwapAmount(value, toToken, fromToken);
      setFromAmount(calculated);
    }
  };

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
    } catch (error) {
      console.error('Swap failed:', error);
    }
  };

  const exchangeRate = getExchangeRate(fromToken, toToken);
  const priceImpact = calculatePriceImpact(fromAmount);

  const router = useMemo(() =>
    signer
      ? new Contract(PANCAKE_ROUTER_ADDRESS, PANCAKE_ROUTER_ABI, signer)
      : null,
  [signer]);

  useEffect(() => {
    if (!router) {
      setSwapPath(null);
      return;
    }
    const loadPath = async () => {
      if (!fromAmount) {
        setSwapPath(null);
        return;
      }
      const fromInfo = tokens.find((t) => t.symbol === fromToken);
      const toInfo = tokens.find((t) => t.symbol === toToken);
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
    loadPath();
  }, [fromAmount, fromToken, toToken, tokens, router]);

  useEffect(() => {
    if (fromAmount) {
      const calculated = calculateSwapAmount(fromAmount, fromToken, toToken);
      setToAmount(calculated);
    }
  }, [fromToken, toToken]);

  return (
    <Card className="cyber-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-xl font-orbitron">
          <span className="flex items-center">
            <ArrowUpDown className="w-5 h-5 mr-2 text-green-400" />
            Swap Tokens
          </span>
          <Button variant="ghost" size="sm" className="hover-glow">
            <Settings className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* From Token */}
        <div className="bg-background/30 rounded-xl p-4 border border-green-400/20">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium font-roboto">From</label>
            <span className="text-xs text-foreground/60 font-roboto">
              Balance: {tokens.find(t => t.symbol === fromToken)?.balance || '0.0'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Input
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => handleAmountChange(e.target.value, true)}
              className="flex-1 text-xl font-mono bg-transparent border-none p-0 focus:ring-0"
            />
            <select 
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
              className="bg-green-500/20 border border-green-500/30 rounded-lg px-4 py-2 font-roboto font-medium"
            >
              {tokens.map(token => (
                <option key={token.symbol} value={token.symbol}>{token.symbol}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full w-12 h-12 hover-glow bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30"
            onClick={handleSwapTokens}
          >
            <ArrowUpDown className="w-5 h-5" />
          </Button>
        </div>

        {/* To Token */}
        <div className="bg-background/30 rounded-xl p-4 border border-cyan-400/20">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium font-roboto">To</label>
            <span className="text-xs text-foreground/60 font-roboto">
              Balance: {tokens.find(t => t.symbol === toToken)?.balance || '0.0'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Input
              type="number"
              placeholder="0.0"
              value={toAmount}
              onChange={(e) => handleAmountChange(e.target.value, false)}
              className="flex-1 text-xl font-mono bg-transparent border-none p-0 focus:ring-0"
            />
            <select 
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
              className="bg-cyan-500/20 border border-cyan-500/30 rounded-lg px-4 py-2 font-roboto font-medium"
            >
              {tokens.map(token => (
                <option key={token.symbol} value={token.symbol}>{token.symbol}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Details */}
        <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-lg p-4 border border-green-500/20 space-y-2">
          <div className="flex justify-between text-sm font-roboto">
            <span>Exchange Rate</span>
            <span className="font-mono">1 {fromToken} = {exchangeRate.toFixed(6)} {toToken}</span>
          </div>
          <div className="flex justify-between text-sm font-roboto">
            <span>Price Impact</span>
            <span className="text-yellow-400 font-mono">{priceImpact.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between text-sm font-roboto">
            <span>Liquidity Provider Fee</span>
            <span className="font-mono">0.3%</span>
          </div>
        </div>
        {swapPath && (
          <div className="flex justify-between text-sm font-roboto">
            <span>Path</span>
            <span className="font-mono">
              {swapPath
                .map((addr) => {
                  if (addr === NATIVE_BNB_ADDRESS) return 'BNB';
                  if (addr === WBNB_ADDRESS) return 'WBNB';
                  const tok = tokens.find((t) => t.address.toLowerCase() === addr.toLowerCase());
                  return tok?.symbol || addr;
                })
                .join(' → ')}
            </span>
          </div>
        )}
        {fromAmount && !swapPath && (
          <div className="text-sm text-red-500 font-roboto text-center">No route available</div>
        )}

        <Button 
          onClick={handleSwap}
          disabled={!fromAmount || !toAmount || isLoading || !swapPath}
          className="w-full cyber-glow bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 py-6 text-lg font-roboto font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Swapping...
            </>
          ) : (
            <>
              <ArrowUpDown className="w-5 h-5 mr-2" />
              Swap Tokens
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SwapInterface;
