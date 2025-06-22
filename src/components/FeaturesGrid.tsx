
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { Coins, ArrowRightLeft, Compass, Shield, Zap, TrendingUp } from 'lucide-react';

const FeaturesGrid = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Coins,
      title: t('features.stake.title'),
      description: t('features.stake.desc'),
      gradient: 'from-green-400 to-emerald-600',
      bgGradient: 'from-green-500/10 to-emerald-600/10',
      borderColor: 'border-green-500/20',
      hoverBorder: 'hover:border-green-500/40'
    },
    {
      icon: ArrowRightLeft,
      title: t('features.swap.title'),
      description: t('features.swap.desc'),
      gradient: 'from-cyan-400 to-blue-600',
      bgGradient: 'from-cyan-500/10 to-blue-600/10',
      borderColor: 'border-cyan-500/20',
      hoverBorder: 'hover:border-cyan-500/40'
    },
    {
      icon: Compass,
      title: t('features.explore.title'),
      description: t('features.explore.desc'),
      gradient: 'from-yellow-400 to-orange-600',
      bgGradient: 'from-yellow-500/10 to-orange-600/10',
      borderColor: 'border-yellow-500/20',
      hoverBorder: 'hover:border-yellow-500/40'
    },
    {
      icon: Shield,
      title: 'Security First',
      description: 'Multi-layered security protocols to protect your assets with enterprise-grade encryption.',
      gradient: 'from-purple-400 to-pink-600',
      bgGradient: 'from-purple-500/10 to-pink-600/10',
      borderColor: 'border-purple-500/20',
      hoverBorder: 'hover:border-purple-500/40'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Ultra-fast transactions powered by BSC network with minimal fees and maximum efficiency.',
      gradient: 'from-indigo-400 to-purple-600',
      bgGradient: 'from-indigo-500/10 to-purple-600/10',
      borderColor: 'border-indigo-500/20',
      hoverBorder: 'hover:border-indigo-500/40'
    },
    {
      icon: TrendingUp,
      title: 'Maximize Yields',
      description: 'Advanced algorithms to optimize your returns with automated compounding strategies.',
      gradient: 'from-rose-400 to-red-600',
      bgGradient: 'from-rose-500/10 to-red-600/10',
      borderColor: 'border-rose-500/20',
      hoverBorder: 'hover:border-rose-500/40'
    }
  ];

  return (
    <section className="py-24 px-4 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-green-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">Powerful Features</span>
          </h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Discover the next generation of DeFi tools designed for modern investors
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`cyber-card hover-glow group relative overflow-hidden bg-gradient-to-br ${feature.bgGradient} backdrop-blur-sm border-2 ${feature.borderColor} ${feature.hoverBorder} transition-all duration-500 hover:scale-105 hover:shadow-2xl`}
            >
              {/* Animated background overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              
              <CardHeader className="text-center relative z-10">
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-2xl`}>
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-green-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-center text-foreground/70 leading-relaxed text-lg">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
