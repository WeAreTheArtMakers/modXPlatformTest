
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '@/context/Web3Context';
import { Coins, ArrowUpDown, TrendingUp, Wallet } from 'lucide-react';

const QuickActions = () => {
  const navigate = useNavigate();
  const { account } = useWeb3();

  const actions = [
    {
      title: 'Stake Tokens',
      description: 'Earn rewards by staking modX',
      icon: Coins,
      color: 'from-green-500 to-emerald-600',
      href: '/stake',
      disabled: !account
    },
    {
      title: 'Swap Tokens',
      description: 'Trade modX and other tokens',
      icon: ArrowUpDown,
      color: 'from-blue-500 to-cyan-600',
      href: '/swap',
      disabled: !account
    },
    {
      title: 'View Market',
      description: 'Check prices and trends',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-600',
      href: '/market',
      disabled: false
    },
    {
      title: 'Manage Profile',
      description: 'Update your settings',
      icon: Wallet,
      color: 'from-orange-500 to-red-600',
      href: '/profile',
      disabled: !account
    }
  ];

  const handleActionClick = (href: string, disabled: boolean) => {
    if (disabled) {
      return; // Don't navigate if disabled
    }
    navigate(href);
  };

  return (
    <Card className="cyber-card">
      <CardHeader>
        <CardTitle className="text-xl font-orbitron gradient-text">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={action.title}
                variant="ghost"
                className={`h-auto p-4 flex flex-col items-center space-y-2 hover-glow transition-all duration-300 ${
                  action.disabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:scale-105 cyber-glow'
                }`}
                onClick={() => handleActionClick(action.href, action.disabled)}
                disabled={action.disabled}
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center mb-2`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <p className="font-medium font-orbitron text-sm">{action.title}</p>
                  <p className="text-xs text-foreground/60 font-roboto">{action.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
        
        {!account && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-400 text-center font-roboto">
              Connect your wallet to access all features
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickActions;
