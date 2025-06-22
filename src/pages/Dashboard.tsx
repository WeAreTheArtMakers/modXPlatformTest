
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Calendar, Trophy, Shield } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StatsSection from '@/components/StatsSection';
import QuickActions from '@/components/QuickActions';
import AnimatedRewards from '@/components/AnimatedRewards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { useWeb3 } from '@/context/Web3Context';
import { useModXToken } from '@/hooks/useModXToken';
import { useStaking } from '@/hooks/useStaking';
import { useRealTimePrice } from '@/hooks/useRealTimePrice';
import { Wallet, TrendingUp, DollarSign, Coins, AlertCircle, Clock, Lock } from 'lucide-react';

const Dashboard = () => {
  const { t } = useLanguage();
  const { account } = useWeb3();
  const { balance } = useModXToken();
  const { stakes, pools, stake, unstake, claimRewards } = useStaking();
  const { priceData } = useRealTimePrice();

  // Calculate total rewards from all active stakes
  const calculateTotalRewards = () => {
    if (!stakes || stakes.length === 0) return 0;
    
    return stakes.reduce((total, stake) => {
      const rewardAmount = parseFloat(stake.pendingRewards || '0');
      return total + (isNaN(rewardAmount) ? 0 : rewardAmount);
    }, 0);
  };

  // Calculate total staked amount
  const calculateTotalStaked = () => {
    if (!stakes || stakes.length === 0) return 0;
    
    return stakes.reduce((total, stake) => {
      const stakedAmount = parseFloat(stake.amount || '0');
      return total + (isNaN(stakedAmount) ? 0 : stakedAmount);
    }, 0);
  };

  const totalRewards = calculateTotalRewards();
  const totalStaked = calculateTotalStaked();
  const currentBalance = parseFloat(balance) || 0;
  const totalBalance = currentBalance + totalStaked;
  const modXPrice = priceData['modX']?.price || 0.251;
  const totalValueUSD = totalBalance * modXPrice;

  const POOL_PROGRESS_COLORS: Record<number, string> = {
    0: 'bg-green-400',
    1: 'bg-blue-400',
    2: 'bg-yellow-400',
    3: 'bg-purple-400',
  };

  // Dialog state for "Stake More" popup
  const [stakeDialogPool, setStakeDialogPool] = useState<number | null>(null);
  const [stakeDialogAmount, setStakeDialogAmount] = useState('');

  // Format time remaining for stakes
  const formatTimeRemaining = (lockEndTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = lockEndTime - now;
    
    if (remaining <= 0) return t('stake.unlocked');
    
    const days = Math.floor(remaining / (24 * 3600));
    const hours = Math.floor((remaining % (24 * 3600)) / 3600);
    
    if (days > 0) {
      return `${days} ${t('stake.days')} ${hours}h`;
    }
    return `${hours}h`;
  };

  // Get pool period name
  const getPoolPeriodName = (poolId: number) => {
    const pool = pools.find(p => p.poolId === poolId);
    if (!pool) return `Pool #${poolId}`;
    
    const days = Math.round(pool.duration / 86400);
    if (days === 30) return '30 Günlük Havuz';
    if (days === 90) return '90 Günlük Havuz';
    if (days === 180) return '6 Aylık Havuz';
    if (days === 365) return '1 Yıllık Havuz';
    return `${days} Günlük Havuz`;
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-20 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <Card className="cyber-card">
              <CardContent className="p-8">
                <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h1 className="text-3xl font-bold mb-4 gradient-text">
                  {t('dashboard.connectWallet')}
                </h1>
                <p className="text-xl text-foreground/70">
                  {t('dashboard.connectWalletDescription')}
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 gradient-text">
              {t('dashboard.title')}
            </h1>
            <p className="text-xl text-foreground/70">
              {t('dashboard.subtitle')}
            </p>
          </div>

          {/* Portfolio Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="cyber-card hover-glow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground/70">
                  {t('dashboard.totalBalance')}
                </CardTitle>
                <Wallet className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  {totalBalance.toFixed(2)} modX
                </div>
                <p className="text-xs text-foreground/60">
                  ≈ ${totalValueUSD.toFixed(2)} USD
                </p>
              </CardContent>
            </Card>

            <Card className="cyber-card hover-glow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground/70">
                  {t('dashboard.totalStaked')}
                </CardTitle>
                <Coins className="h-4 w-4 text-cyan-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-400">
                  {totalStaked.toFixed(2)} modX
                </div>
                <p className="text-xs text-foreground/60">
                  {stakes.length} {t('dashboard.activeStakes')}
                </p>
              </CardContent>
            </Card>

            <Card className="cyber-card hover-glow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground/70">
                  {t('dashboard.totalRewards')}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400">
                  {totalRewards.toFixed(4)} modX
                </div>
                <p className="text-xs text-foreground/60">
                  ≈ ${(totalRewards * modXPrice).toFixed(2)} USD
                </p>
              </CardContent>
            </Card>

            <Card className="cyber-card hover-glow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground/70">
                  modX {t('dashboard.price')}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">
                  ${modXPrice.toFixed(6)}
                </div>
                <p className="text-xs text-green-400">
                  +{priceData['modX']?.change24h?.toFixed(2) || '5.67'}% (24h)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Animated Rewards Display */}
          {totalRewards > 0 && (
            <div className="mb-8">
              <AnimatedRewards amount={totalRewards} />
            </div>
          )}

          {/* Active Stakes Section */}
          {stakes.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 gradient-text">
                {t('dashboard.activeStakes')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stakes.map((stake, index) => {
                  const now = Date.now() / 1000;
                  const totalSec = stake.lockEndTime - stake.stakeTime;
                  const remSec = Math.max(0, stake.lockEndTime - now);
                  const percent = totalSec > 0 ? (remSec / totalSec) * 100 : 0;
                  const color = POOL_PROGRESS_COLORS[stake.poolId] || POOL_PROGRESS_COLORS[0];
                  const icons: Record<number, JSX.Element> = {
                    0: <Calendar className="h-4 w-4 text-green-400" />, // 30d
                    1: <Clock className="h-4 w-4 text-blue-400" />,      // 90d
                    2: <Trophy className="h-4 w-4 text-yellow-400" />,   // 6mo
                    3: <Shield className="h-4 w-4 text-purple-400" />,  // 1y
                  };
                  const poolIcon = icons[stake.poolId] || <Lock className="h-4 w-4 text-cyan-400" />;
                  return (
                    <Card key={index} className="cyber-card hover-glow group relative bg-white/10 backdrop-blur-md">
                      {/* pulse indicator */}
                      <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                      <CardHeader className="flex items-center justify-between pb-2">
                        <CardTitle className="text-lg font-medium text-foreground flex items-center gap-2">
                          {poolIcon}
                          {getPoolPeriodName(stake.poolId)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-foreground/70">{t('stake.amount')}:</span>
                          <span className="font-bold text-cyan-400">
                            {parseFloat(stake.amount).toFixed(2)} modX
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-foreground/70">{t('stake.apy')}:</span>
                          <span className="px-2 py-1 rounded-full bg-green-900/30 text-green-400 font-bold transition-transform duration-200 group-hover:scale-105 group-hover:animate-pulse">
                            {(stake.apy / 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground/70">{t('stake.pendingRewards')}:</span>
                          <span className="font-bold text-purple-400">
                            {parseFloat(stake.pendingRewards).toFixed(4)} modX
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="pt-2">
                          <div className="h-2 w-full bg-foreground/20 rounded-full overflow-hidden">
                            <div className={`${color} h-full`} style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      </CardContent>
                      {/* Action Buttons */}
                      <div className="absolute bottom-4 inset-x-4 flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="outline" onClick={() => claimRewards(stake.poolId)}>
                          Claim
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setStakeDialogPool(stake.poolId);
                            setStakeDialogAmount('');
                          }}
                        >
                          Stake More
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => unstake(stake.amount, stake.poolId)}>
                          Unstake
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

        {/* Stake More Dialog */}
        <Dialog open={stakeDialogPool !== null} onOpenChange={(open) => { if (!open) setStakeDialogPool(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {stakeDialogPool !== null
                  ? `Stake More into ${getPoolPeriodName(stakeDialogPool)}`
                  : ''}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-foreground/80">
                {t('stake.amount')} (modX)
              </label>
              <Input
                type="number"
                autoFocus
                value={stakeDialogAmount}
                onChange={(e) => setStakeDialogAmount(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStakeDialogPool(null)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (stakeDialogPool !== null && stakeDialogAmount) {
                    await stake(stakeDialogAmount, stakeDialogPool);
                    setStakeDialogPool(null);
                  }
                }}
              >
                Stake
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

          {/* Stats Section */}
          <StatsSection />

          {/* Quick Actions */}
          <QuickActions />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
