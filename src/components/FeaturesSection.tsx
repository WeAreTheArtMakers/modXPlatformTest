
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { Coins, ArrowRightLeft, Compass } from 'lucide-react';

const FeaturesSection = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Coins,
      title: t('features.stake.title'),
      description: t('features.stake.desc'),
      gradient: 'from-green-400 to-emerald-600'
    },
    {
      icon: ArrowRightLeft,
      title: t('features.swap.title'),
      description: t('features.swap.desc'),
      gradient: 'from-cyan-400 to-blue-600'
    },
    {
      icon: Compass,
      title: t('features.explore.title'),
      description: t('features.explore.desc'),
      gradient: 'from-yellow-400 to-orange-600'
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="cyber-card hover-glow group">
              <CardHeader className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-foreground/70 leading-relaxed">
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

export default FeaturesSection;
