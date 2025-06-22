import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useWeb3 } from '@/context/Web3Context';
import { useModXToken } from '@/hooks/useModXToken';
import { useStaking, StakingPool, StakeInfo } from '@/hooks/useStaking';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StakingInterface from '@/components/StakingInterface';
import { Coins, TrendingUp, Wallet, AlertCircle, History, CheckCircle } from 'lucide-react';

// Helper to get the pool info for a given stake (by poolId)
const getPoolById = (pools: StakingPool[], poolId: number) =>
  pools.find((p) => p.poolId === poolId);

const Stake = () => {
  const { t } = useLanguage();
  const { account, isConnecting } = useWeb3();
  const { balance, isLoading } = useModXToken();
  const { pools, stakes, unstake, claimRewards } = useStaking();
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  // Only count user's active stakes (amount > 0, lockEndTime > now)
  const now = Math.floor(Date.now() / 1000);

  // Filter out stakes with 0 amount (completed/unstaked positions)
  const activeStakes = stakes.filter(stake => Number(stake.amount) > 0);

  const totalStaked = activeStakes.reduce((sum, stake) =>
    sum + parseFloat(stake.amount), 0
  );

  const totalRewards = activeStakes.reduce((sum, stake) =>
    sum + parseFloat(stake.pendingRewards), 0
  );

  // Konsola stakes ve pools yazdır
  console.log("Active stakes:", activeStakes);
  console.log("All pools:", pools);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text font-orbitron">
              {t('stake.title')}
            </h1>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto mb-8">
              {t('stake.subtitle')}
            </p>
          </div>

          {/* Connection Status */}
          {!account && (
            <Card className="cyber-card mb-8 max-w-2xl mx-auto">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">{t('stake.connectWallet')}</h3>
                <p className="text-foreground/70 mb-4">
                  {t('stake.connectWalletDescription')}
                </p>
              </CardContent>
            </Card>
          )}

          {account && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <Card className="cyber-card hover-glow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Wallet className="w-5 h-5 text-green-400" />
                      <span>{t('stake.yourBalance')}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold gradient-text mb-2">
                      {isLoading ? 'Loading...' : `${parseFloat(balance).toFixed(2)} modX`}
                    </div>
                    <p className="text-foreground/60">{t('stake.availableStaking')}</p>
                  </CardContent>
                </Card>

                <Card className="cyber-card hover-glow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Coins className="w-5 h-5 text-cyan-400" />
                      <span>{t('stake.totalStaked')}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold gradient-text mb-2">
                      {totalStaked.toFixed(2)} modX
                    </div>
                    <p className="text-foreground/60">{t('stake.currentlyStaking')}</p>
                  </CardContent>
                </Card>

                <Card className="cyber-card hover-glow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                      <span>{t('stake.pendingRewards')}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold gradient-text mb-2">
                      {totalRewards.toFixed(4)} modX
                    </div>
                    <p className="text-foreground/60">{t('stake.readyToClaim')}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Staking Interface */}
              <StakingInterface 
                selectedPeriod={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
              />

              {/* Staking History - Only show active positions */}
              <Card className="cyber-card mt-12">
              <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <History className="w-5 h-5 text-purple-400" />
                    <span>{t('stake.activePositions')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                    {activeStakes.length === 0 ? (
                    <div className="text-center py-8 text-foreground/60">
                      <Coins className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{t('stake.noActivePositions')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeStakes.map((stake, i) => {
                        const pool = getPoolById(pools, stake.poolId);
                        const periodDays = pool ? Math.round(pool.duration / 86400) : Math.round(stake.duration / 86400);
                        const apy = pool ? (pool.apy / 100).toFixed(2) : (stake.apy / 100).toFixed(2);
                        const isActive = stake.amount && stake.lockEndTime && Number(stake.amount) > 0 && now < Number(stake.lockEndTime);
                        const hasRewards = Number(stake.pendingRewards) > 0;
                        
                        return (
                          <div key={stake.poolId + '_' + i} className="bg-background/30 rounded-lg p-4 border border-green-500/20 hover:border-green-500/40 transition-colors">
                            <div className="flex justify-between items-center">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <p className="font-semibold text-lg">{Number(stake.amount).toLocaleString()} modX</p>
                                  {isActive && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Active
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-foreground/60">
                                  {periodDays} days • {apy}% APY
                                </p>
                                {stake.lockEndTime && (
                                  <p className="text-xs text-foreground/50">
                                    {t('stake.lockEnds')}{' '}
                                    {new Date(Number(stake.lockEndTime) * 1000).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className={`font-semibold ${hasRewards ? 'text-green-400' : 'text-foreground/60'}`}>
                                  {Number(stake.pendingRewards).toFixed(4)} modX
                                </p>
                                <p className="text-xs text-foreground/60 mb-2">
                                  {t('stake.pendingRewards')}
                                </p>
                                <div className="space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={() => claimRewards(stake.poolId)}
                                  disabled={!hasRewards || isLoading}
                                  className="bg-green-500 hover:bg-green-600 disabled:opacity-50"
                                  >
                                    {isLoading ? t('common.loading') : t('stake.claim')}
                                  </Button>
                                  {isActive && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => unstake(stake.poolId)}
                                      disabled={isLoading}
                                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                    >
                                      {isLoading ? t('common.loading') : t('stake.unstake')}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Stake;
