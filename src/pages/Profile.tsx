import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProfileSettings from '@/components/ProfileSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useWeb3 } from '@/context/Web3Context';
import { useRealPortfolio } from '@/hooks/useRealPortfolio';
import { useStaking } from '@/hooks/useStaking';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useRealTimePrice } from '@/hooks/useRealTimePrice';
import { User, Wallet, History, Copy, ExternalLink, AlertCircle, ArrowUpCircle, ArrowDownCircle, Coins } from 'lucide-react';

const Profile = () => {
  const { t } = useLanguage();
  const { account } = useWeb3();
  const portfolioData = useRealPortfolio();
  const { stakes, transactionHistory } = useStaking();
  const { userProfile } = useUserProfile();
  const { priceData } = useRealTimePrice();
  const [showSettings, setShowSettings] = useState(false);

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
    }
  };

  // Get pool period name
  const getPoolPeriodName = (poolId: number) => {
    if (poolId === 0) return '30 Günlük';
    if (poolId === 1) return '90 Günlük';
    if (poolId === 2) return '6 Aylık';
    if (poolId === 3) return '1 Yıllık';
    return `Pool #${poolId}`;
  };

  // Get transaction icon
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'Stake':
        return <ArrowUpCircle className="w-4 h-4 text-green-400" />;
      case 'Unstake':
        return <ArrowDownCircle className="w-4 h-4 text-red-400" />;
      case 'Claim':
        return <Coins className="w-4 h-4 text-purple-400" />;
      default:
        return <Coins className="w-4 h-4 text-gray-400" />;
    }
  };

  // Get transaction color
  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'Stake':
        return 'text-green-400';
      case 'Unstake':
        return 'text-red-400';
      case 'Claim':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
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
                  {t('profile.connectWallet')}
                </h1>
                <p className="text-xl text-foreground/70">
                  {t('profile.connectWalletDescription')}
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
        <div className="container mx-auto max-w-6xl">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 gradient-text">
              {t('profile.title')}
            </h1>
            <p className="text-xl text-foreground/70">
              {t('profile.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <User className="w-5 h-5 mr-2 text-green-400" />
                    {t('profile.accountInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                      {userProfile?.avatar || '🤖'}
                    </div>
                    <h3 className="font-bold text-lg">{userProfile?.username || 'Web3 User'}</h3>
                    <p className="text-sm text-foreground/60">
                      Joined {userProfile?.joinDate || new Date().toLocaleDateString()}
                    </p>
                  </div>

                  <div className="bg-background/30 rounded-lg p-3">
                    <label className="text-xs text-foreground/60">{t('profile.walletAddress')}</label>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-mono">{account.substring(0, 6)}...{account.substring(38)}</span>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={copyAddress} className="h-6 w-6 p-0">
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-background/30 rounded-lg p-3 text-center">
                      <p className="text-xs text-foreground/60">{t('profile.totalValue')}</p>
                      <p className="font-bold text-green-400">${portfolioData.totalValue.toFixed(2)}</p>
                    </div>
                    <div className="bg-background/30 rounded-lg p-3 text-center">
                      <p className="text-xs text-foreground/60">{t('profile.totalEarned')}</p>
                      <p className="font-bold text-cyan-400">{portfolioData.totalRewards.toFixed(4)} modX</p>
                    </div>
                  </div>

                  <Button 
                    onClick={() => setShowSettings(!showSettings)}
                    className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600"
                  >
                    {showSettings ? t('common.hide') + ' ' + t('settings.title') : t('profile.quickSettings')}
                  </Button>
                </CardContent>
              </Card>

              {/* Settings Panel */}
              {showSettings && (
                <div className="w-full">
                  <ProfileSettings />
                </div>
              )}
            </div>

            {/* Portfolio & History */}
            <div className="lg:col-span-2 space-y-8">
              {/* Portfolio Overview */}
              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Wallet className="w-5 h-5 mr-2 text-purple-400" />
                    {t('profile.portfolioOverview')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-lg p-4 border border-green-500/20">
                      <p className="text-sm text-foreground/60">{t('profile.totalBalance')}</p>
                      <p className="text-2xl font-bold text-green-400">{portfolioData.totalBalance.toFixed(2)} modX</p>
                    </div>
                    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg p-4 border border-cyan-500/20">
                      <p className="text-sm text-foreground/60">{t('profile.totalStaked')}</p>
                      <p className="text-2xl font-bold text-cyan-400">{portfolioData.totalStaked.toFixed(2)} modX</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20">
                      <p className="text-sm text-foreground/60">{t('swap.change24h')}</p>
                      <p className={`text-2xl font-bold ${
                        portfolioData.dailyChange >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {portfolioData.dailyChange >= 0 ? '+' : ''}{portfolioData.dailyChange.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/20">
                          <th className="text-left py-3">{t('profile.token')}</th>
                          <th className="text-left py-3">{t('profile.balance')}</th>
                          <th className="text-left py-3">{t('market.price')}</th>
                          <th className="text-left py-3">{t('profile.value')}</th>
                          <th className="text-left py-3">{t('swap.change24h')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {portfolioData.tokens.map((token, index) => {
                          // Get real-time price from priceData
                          const realTimePrice = priceData[token.symbol]?.price || token.price;
                          const realTimeChange = priceData[token.symbol]?.change24h || token.change24h;
                          const realTimeValue = token.balance * realTimePrice;
                          
                          return (
                            <tr key={index} className="border-b border-border/10 hover:bg-background/30 transition-colors duration-300">
                              <td className="py-3 font-medium">{token.symbol}</td>
                              <td className="py-3">{token.balance.toFixed(6)}</td>
                              <td className="py-3">${realTimePrice.toFixed(token.symbol === 'modX' ? 6 : 2)}</td>
                              <td className="py-3">${realTimeValue.toFixed(2)}</td>
                              <td className="py-3">
                                <span className={`${realTimeChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {realTimeChange >= 0 ? '+' : ''}{realTimeChange.toFixed(2)}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Transaction History - Now from blockchain events */}
              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <History className="w-5 h-5 mr-2 text-blue-400" />
                    {t('profile.transactionHistory')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {transactionHistory.length === 0 ? (
                    <div className="text-center py-8 text-foreground/60">
                      <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{t('profile.noTransactions')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {transactionHistory.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-4 bg-background/30 rounded-lg hover:bg-background/50 transition-colors duration-300">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-background/50">
                              {getTransactionIcon(tx.type)}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="font-medium">{tx.type}</p>
                                {tx.poolId > 0 && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400">
                                    {getPoolPeriodName(tx.poolId)}
                                  </span>
                                )}
                              </div>
                              <p className={`text-sm font-semibold ${getTransactionColor(tx.type)}`}>
                                {Number(tx.amount).toFixed(4)} modX
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-foreground/60">Block #{tx.blockNumber}</p>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                                Confirmed
                              </span>
                              <span className="text-xs text-cyan-400 font-mono">
                                {tx.txHash.substring(0, 8)}...
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

export default Profile;
