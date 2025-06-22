
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Wallet, BookOpen, Sparkles, Zap } from 'lucide-react';

const HeroSection = () => {
  const { t } = useLanguage();

  const handleLearnMore = () => {
    window.open('https://modfxmarket.com', '_blank');
  };

  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      {/* Slower Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-green-400/15 to-cyan-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-cyan-400/15 to-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '10s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-r from-yellow-400/15 to-orange-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s', animationDuration: '12s' }}></div>
        
        {/* Slower Floating Particles */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '3s', animationDuration: '5s' }}></div>
        <div className="absolute bottom-1/3 left-1/5 w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '5s', animationDuration: '6s' }}></div>
      </div>

      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20 rounded-full px-6 py-2 mb-8 backdrop-blur-sm transition-all duration-700 hover:border-green-500/40">
            <Sparkles className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400 font-roboto">DeFi Innovation</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight font-orbitron">
            <span className="gradient-text neon-text block mb-4">
              {t('hero.headline')}
            </span>
            <span className="text-4xl md:text-5xl text-foreground/80 block font-roboto font-light">
              {t('hero.tagline')}
            </span>
          </h1>
          
          <p className="text-xl md:text-3xl text-foreground/70 mb-12 leading-relaxed max-w-3xl mx-auto font-roboto font-light">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button 
              size="lg" 
              className="cyber-glow hover-glow bg-gradient-to-r from-green-500 via-cyan-500 to-blue-500 hover:from-green-600 hover:via-cyan-600 hover:to-blue-600 text-lg px-10 py-7 rounded-2xl animate-pulse-glow shadow-2xl hover:shadow-green-400/50 transition-all duration-700 hover:scale-105 font-roboto font-medium"
            >
              <Wallet className="w-6 h-6 mr-3" />
              {t('hero.cta1')}
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleLearnMore}
              className="hover-glow border-2 border-green-400/30 text-green-400 hover:bg-green-400/10 text-lg px-10 py-7 rounded-2xl backdrop-blur-sm bg-background/20 hover:border-green-400/60 transition-all duration-700 hover:scale-105 font-roboto font-medium"
            >
              <BookOpen className="w-6 h-6 mr-3" />
              {t('hero.cta2')}
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 opacity-60">
            <div className="text-center transition-all duration-500 hover:opacity-100">
              <div className="text-2xl font-bold text-green-400 font-orbitron">
                {t('hero.support')}
              </div>
            </div>
            <div className="text-center transition-all duration-500 hover:opacity-100">
              <div className="text-2xl font-bold text-cyan-400 font-orbitron">
                {t('hero.secure')}
              </div>
            </div>
            <div className="text-center transition-all duration-500 hover:opacity-100">
              <div className="text-2xl font-bold text-blue-400 font-orbitron">
                {t('hero.fees')}
              </div>
            </div>
            <div className="text-center transition-all duration-500 hover:opacity-100">
              <div className="text-2xl font-bold text-purple-400 font-orbitron">
                {t('hero.possibilities')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
