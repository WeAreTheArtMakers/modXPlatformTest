import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLiquidity } from '@/hooks/useLiquidity';
import { useSwap } from '@/hooks/useSwap';
import { useLanguage } from '@/context/LanguageContext';
import { useWeb3 } from '@/context/Web3Context';
import { Plus, Minus, Droplets, History, Loader2, AlertCircle } from 'lucide-react';

const LiquidityInterface: React.FC = () => {
  const { t } = useLanguage();
  const { account } = useWeb3();
  const { position, history, isLoading, addLiquidity, removeLiquidity } = useLiquidity();
  const { tokens, bnbBalance } = useSwap();

  const [modXAmount, setModXAmount] = useState('');
  const [bnbAmount, setBnbAmount] = useState('');
  const [removePercent, setRemovePercent] = useState(25);

  const modXToken = tokens.find(t => t.symbol === 'modX');

  const handleAddLiquidity = async () => {
    await addLiquidity(modXAmount, bnbAmount);
    setModXAmount('');
    setBnbAmount('');
  };

  const handleRemoveLiquidity = async () => {
    await removeLiquidity(removePercent);
  };

  if (!account) {
    return (
      <Card className="cyber-card">
        <CardContent className="py-12 text-center">
          <Droplets className="w-12 h-12 mx-auto mb-4 text-foreground/40" />
          <p className="text-foreground/60">{t('dashboard.connectWallet')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cyber-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-orbitron">
          <Droplets className="w-5 h-5 text-cyan-400" />
          {t('pool.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Position */}
        {position ? (
          <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20">
            <h3 className="text-sm font-medium text-foreground/70 mb-3">{t('pool.yourPosition')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-foreground/50">{t('pool.lpTokens')}</p>
                <p className="text-lg font-mono font-semibold">{parseFloat(position.lpBalance).toFixed(6)}</p>
              </div>
              <div>
                <p className="text-xs text-foreground/50">{t('pool.poolShare')}</p>
                <p className="text-lg font-mono font-semibold">{position.share}%</p>
              </div>
              <div>
                <p className="text-xs text-foreground/50">modX</p>
                <p className="text-sm font-mono">{parseFloat(position.token0Amount).toFixed(4)}</p>
              </div>
              <div>
                <p className="text-xs text-foreground/50">BNB</p>
                <p className="text-sm font-mono">{parseFloat(position.token1Amount).toFixed(4)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-background/30 border border-foreground/10 text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-foreground/40" />
            <p className="text-foreground/60 text-sm">{t('pool.noPosition')}</p>
            <p className="text-foreground/40 text-xs mt-1">{t('pool.noPositionDesc')}</p>
          </div>
        )}

        <Tabs defaultValue="add" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-background/30">
            <TabsTrigger value="add" className="data-[state=active]:bg-green-500/20">
              <Plus className="w-4 h-4 mr-1" />
              {t('pool.addLiquidity')}
            </TabsTrigger>
            <TabsTrigger value="remove" className="data-[state=active]:bg-red-500/20" disabled={!position}>
              <Minus className="w-4 h-4 mr-1" />
              {t('pool.removeLiquidity')}
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-cyan-500/20">
              <History className="w-4 h-4 mr-1" />
              {t('pool.history')}
            </TabsTrigger>
          </TabsList>

          {/* Add Liquidity Tab */}
          <TabsContent value="add" className="space-y-4 mt-4">
            <div className="p-4 bg-background/30 rounded-lg border border-green-500/20">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">modX</span>
                <span className="text-xs text-foreground/60">
                  {t('pool.balance')}: {modXToken ? parseFloat(modXToken.balance).toFixed(4) : '0'}
                </span>
              </div>
              <Input
                type="number"
                value={modXAmount}
                onChange={(e) => setModXAmount(e.target.value)}
                placeholder="0.0"
                className="text-xl bg-transparent border-0 focus:ring-0 p-0"
                aria-label="modX amount"
              />
            </div>

            <div className="flex justify-center">
              <Plus className="w-6 h-6 text-foreground/40" />
            </div>

            <div className="p-4 bg-background/30 rounded-lg border border-cyan-500/20">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">BNB</span>
                <span className="text-xs text-foreground/60">
                  {t('pool.balance')}: {parseFloat(bnbBalance).toFixed(4)}
                </span>
              </div>
              <Input
                type="number"
                value={bnbAmount}
                onChange={(e) => setBnbAmount(e.target.value)}
                placeholder="0.0"
                className="text-xl bg-transparent border-0 focus:ring-0 p-0"
                aria-label="BNB amount"
              />
            </div>

            <p className="text-xs text-foreground/50 text-center">{t('pool.poolInfo')}</p>

            <Button
              onClick={handleAddLiquidity}
              disabled={isLoading || !modXAmount || !bnbAmount || Number(modXAmount) <= 0 || Number(bnbAmount) <= 0}
              className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('pool.adding')}
                </>
              ) : (
                t('pool.addLiquidityBtn')
              )}
            </Button>
          </TabsContent>

          {/* Remove Liquidity Tab */}
          <TabsContent value="remove" className="space-y-4 mt-4">
            {position && (
              <>
                <div className="p-4 bg-background/30 rounded-lg">
                  <p className="text-sm text-foreground/70 mb-3">{t('pool.removePercent')}</p>
                  <div className="flex gap-2 mb-4">
                    {[25, 50, 75, 100].map((pct) => (
                      <Button
                        key={pct}
                        variant={removePercent === pct ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setRemovePercent(pct)}
                        className={removePercent === pct ? 'bg-red-500/80' : ''}
                      >
                        {pct}%
                      </Button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-foreground/50">modX</p>
                      <p className="font-mono">{(parseFloat(position.token0Amount) * removePercent / 100).toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-foreground/50">BNB</p>
                      <p className="font-mono">{(parseFloat(position.token1Amount) * removePercent / 100).toFixed(4)}</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleRemoveLiquidity}
                  disabled={isLoading}
                  variant="destructive"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('pool.removing')}
                    </>
                  ) : (
                    t('pool.confirmRemove')
                  )}
                </Button>
              </>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-4">
            {history.length === 0 ? (
              <div className="text-center py-8 text-foreground/50">
                <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t('pool.noHistory')}</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-background/30 rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {item.type === 'add' ? (
                        <Plus className="w-4 h-4 text-green-400" />
                      ) : (
                        <Minus className="w-4 h-4 text-red-400" />
                      )}
                      <div>
                        <p className="font-medium">
                          {item.type === 'add' ? t('pool.added') : t('pool.removed')}
                        </p>
                        <p className="text-xs text-foreground/50">
                          {item.modXAmount} modX + {item.bnbAmount} BNB
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-foreground/50">{item.date}</p>
                      <p className="text-xs font-mono text-foreground/40">{item.hash}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LiquidityInterface;
