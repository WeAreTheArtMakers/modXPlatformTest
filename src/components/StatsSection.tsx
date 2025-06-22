
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';

const StatsSection = () => {
  const { t } = useLanguage();

  const stats = [
    {
      title: t('stats.tvl'),
      value: '$2.5M',
      change: '+12.5%',
      positive: true
    },
    {
      title: t('stats.staked'),
      value: '100K modX',
      change: '+8.2%',
      positive: true
    },
    {
      title: t('stats.users'),
      value: '1,234',
      change: '+15.7%',
      positive: true
    },
    {
      title: t('stats.apy'),
      value: '24.5%',
      change: '-2.1%',
      positive: false
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="cyber-card hover-glow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground/70">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className={`text-sm font-medium ${
                  stat.positive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.change}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
