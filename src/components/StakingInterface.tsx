
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useModXToken } from '@/hooks/useModXToken';
import { useStaking } from '@/hooks/useStaking';
import { useLanguage } from '@/context/LanguageContext';
import { Calculator, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface StakingInterfaceProps {
  selectedPeriod: number;
  onPeriodChange: (period: number) => void;
}

const StakingInterface: React.FC<StakingInterfaceProps> = ({ selectedPeriod, onPeriodChange }) => {
  const { balance } = useModXToken();
  const { pools, stake, isLoading, calculateEstimatedRewards } = useStaking();
  const { t } = useLanguage();
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedPoolId, setSelectedPoolId] = useState<number | null>(null);
  const [maxStakeWarning, setMaxStakeWarning] = useState<string | null>(null);

  useEffect(() => {
    if (pools && pools.length > 0) {
      const byPeriod = pools.find((p) => Math.round(p.duration / 86400) === selectedPeriod && p.isActive);
      setSelectedPoolId(byPeriod?.poolId ?? pools.find((p) => p.isActive)?.poolId ?? null);
    }
  }, [pools, selectedPeriod]);

  // Check max stake limit when amount changes
  useEffect(() => {
    if (stakeAmount && selectedPoolId !== null) {
      const pool = pools.find((p) => p.poolId === selectedPoolId);
      if (pool && Number(stakeAmount) > Number(pool.maxStakePerUser)) {
        setMaxStakeWarning(`Maksimum ${Number(pool.maxStakePerUser).toLocaleString()} modX stake edebilirsiniz`);
      } else {
        setMaxStakeWarning(null);
      }
    } else {
      setMaxStakeWarning(null);
    }
  }, [stakeAmount, selectedPoolId, pools]);

  // Fixed rewards calculation using the new calculateEstimatedRewards function
  const getEstimatedRewards = () => {
    if (!stakeAmount || isNaN(Number(stakeAmount)) || selectedPoolId === null || Number(stakeAmount) <= 0) {
      return '0';
    }
    
    return calculateEstimatedRewards(stakeAmount, selectedPoolId);
  };

  const handleStake = async () => {
    if (selectedPoolId == null) {
      toast.error('Havuz seçilmedi!');
      return;
    }
    if (!stakeAmount || isNaN(Number(stakeAmount))) {
      toast.error('Geçerli bir miktar girin');
      return;
    }
    if (Number(stakeAmount) > Number(balance)) {
      toast.error('Yetersiz bakiye');
      return;
    }
    
    const pool = pools.find((p) => p.poolId === selectedPoolId);
    if (pool && Number(stakeAmount) > Number(pool.maxStakePerUser)) {
      toast.error(`Maksimum ${Number(pool.maxStakePerUser).toLocaleString()} modX stake edebilirsiniz`);
      return;
    }
    
    try {
      await stake(stakeAmount, selectedPoolId);
      setStakeAmount('');
      setMaxStakeWarning(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleMaxClick = () => {
    const pool = pools.find((p) => p.poolId === selectedPoolId);
    if (pool) {
      const maxAllowed = Math.min(Number(balance), Number(pool.maxStakePerUser));
      setStakeAmount(maxAllowed.toString());
    } else {
      setStakeAmount(balance);
    }
  };

  // Get pool period name
  const getPoolPeriodName = (duration: number) => {
    const days = Math.round(duration / 86400);
    if (days === 30) return '30 Günlük Havuz';
    if (days === 90) return '90 Günlük Havuz';
    if (days === 180) return '6 Aylık Havuz';
    if (days === 365) return '1 Yıllık Havuz';
    return `${days} Günlük Havuz`;
  };

  return (
    <div className="space-y-8">
      {/* Staking Pools */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-8 gradient-text">
          {t('stake.stakingPools')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pools.map((pool) => (
            <Card 
              key={pool.poolId}
              className={`cyber-card hover-glow cursor-pointer transition-all duration-300 ${
                selectedPoolId === pool.poolId 
                  ? 'ring-2 ring-green-400 bg-gradient-to-br from-green-500/10 to-cyan-500/10' 
                  : ''
                } ${!pool.isActive ? 'opacity-60 pointer-events-none' : ''}`}
              onClick={() => { 
                if (pool.isActive) { 
                  setSelectedPoolId(pool.poolId); 
                  onPeriodChange(Math.round(pool.duration / 86400)); 
                }
              }}
            >
              <CardHeader className="text-center">
                <CardTitle className="text-lg">
                  {getPoolPeriodName(pool.duration)}
                </CardTitle>
                <p className="text-sm text-foreground/60">
                  Maks/Kullanıcı: {parseFloat(pool.maxStakePerUser).toLocaleString()} modX
                </p>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold gradient-text mb-1">{(pool.apy / 100).toFixed(0)}%</div>
                <p className="text-foreground/60 mb-2">{t('stake.apy')}</p>
                <p className="text-sm text-foreground/60 mb-2">
                  {t('stake.totalStaked')}: {parseFloat(pool.totalStaked).toLocaleString()} modX
                </p>
                <div className="flex items-center justify-center">
                  {pool.isActive ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
                      Pasif
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Staking Form */}
      <Card className="cyber-card max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-green-400" />
            <span>{t('stake.stakeTokens')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">{t('stake.amount')}</label>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.00"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="text-lg py-3 pr-20"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMaxClick}
                  className="text-xs text-green-400 hover:text-green-300"
                >
                  MAX
                </Button>
                <span className="text-foreground/60">modX</span>
              </div>
            </div>
            <p className="text-sm text-foreground/60 mt-1">
              {t('swap.balance')}: {parseFloat(balance).toFixed(2)} modX
            </p>
            
            {/* Max stake warning */}
            {maxStakeWarning && (
              <div className="flex items-center space-x-2 mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-400">{maxStakeWarning}</span>
              </div>
            )}
          </div>

          {/* Enhanced estimated rewards calculation - now works for ALL pools */}
          {stakeAmount && selectedPoolId !== null && Number(stakeAmount) > 0 && (
            <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20 rounded-xl p-4">
              <h4 className="font-semibold mb-2">{t('stake.estimatedRewards')}</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-foreground/60">{t('stake.lockPeriod')}:</span>
                  <p className="font-medium">
                    {Math.round((pools.find((p) => p.poolId === selectedPoolId)?.duration ?? 0) / 86400)} {t('stake.days')}
                  </p>
                </div>
                <div>
                  <span className="text-foreground/60">{t('stake.apy')}:</span>
                  <p className="font-medium">
                    {((pools.find((p) => p.poolId === selectedPoolId)?.apy ?? 0) / 100).toFixed(0)}%
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-foreground/60">{t('stake.estimatedRewards')}:</span>
                  <p className="font-bold text-green-400 text-lg">
                    {getEstimatedRewards()} modX
                  </p>
                  {getEstimatedRewards() === '0' && (
                    <p className="text-yellow-400 text-xs mt-1">
                      Lütfen geçerli bir miktar girin ve havuz seçin.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <Button 
            onClick={handleStake}
            disabled={!stakeAmount || isLoading || selectedPoolId == null || maxStakeWarning !== null || Number(stakeAmount) <= 0}
            className="w-full cyber-glow hover-glow bg-gradient-to-r from-green-500 via-cyan-500 to-blue-500 hover:from-green-600 hover:via-cyan-600 hover:to-blue-600 text-lg py-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Stake Ediliyor...
              </>
            ) : (
              t('stake.stakeNow')
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StakingInterface;
