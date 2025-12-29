import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useWeb3 } from '@/context/Web3Context';
import { Wallet, BookOpen, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const { t } = useLanguage();
  const { account, connectWallet, isConnecting } = useWeb3();

  const handleLearnMore = () => {
    window.open('https://modfxmarket.com', '_blank');
  };

  return (
    <section className="relative pt-20 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 overflow-hidden min-h-[calc(100vh-64px)] flex items-center">
      {/* Animated Background - Reduced on mobile for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-gradient-to-r from-green-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-40 right-5 sm:right-20 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '10s' }}></div>
        <div className="hidden sm:block absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s', animationDuration: '12s' }}></div>
      </div>

      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20 rounded-full px-4 sm:px-6 py-1.5 sm:py-2 mb-6 sm:mb-8 backdrop-blur-sm">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
            <span className="text-xs sm:text-sm font-medium text-green-400">DeFi Innovation</span>
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
          </div>

          {/* Main Heading - Responsive typography */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 md:mb-8 leading-tight font-orbitron">
            <span className="gradient-text neon-text block mb-2 sm:mb-4">
              {t('hero.headline')}
            </span>
            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-foreground/80 block font-roboto font-light">
              {t('hero.tagline')}
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-foreground/70 mb-8 sm:mb-10 md:mb-12 leading-relaxed max-w-3xl mx-auto font-roboto font-light px-2">
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons - Conditional based on wallet connection */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center items-center mb-10 sm:mb-12 md:mb-16 px-4">
            {!account ? (
              <Button 
                size="lg" 
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full sm:w-auto cyber-glow bg-gradient-to-r from-green-500 via-cyan-500 to-blue-500 hover:from-green-600 hover:via-cyan-600 hover:to-blue-600 text-base sm:text-lg px-6 sm:px-8 md:px-10 py-5 sm:py-6 md:py-7 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-green-400/30 transition-all duration-300 font-medium"
              >
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                {isConnecting ? 'Connecting...' : t('hero.cta1')}
              </Button>
            ) : (
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="w-full cyber-glow bg-gradient-to-r from-green-500 via-cyan-500 to-blue-500 hover:from-green-600 hover:via-cyan-600 hover:to-blue-600 text-base sm:text-lg px-6 sm:px-8 md:px-10 py-5 sm:py-6 md:py-7 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-green-400/30 transition-all duration-300 font-medium"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3" />
                </Button>
              </Link>
            )}
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleLearnMore}
              className="w-full sm:w-auto border-2 border-green-400/30 text-green-400 hover:bg-green-400/10 text-base sm:text-lg px-6 sm:px-8 md:px-10 py-5 sm:py-6 md:py-7 rounded-xl sm:rounded-2xl backdrop-blur-sm bg-background/20 hover:border-green-400/60 transition-all duration-300 font-medium"
            >
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
              {t('hero.cta2')}
            </Button>
          </div>

          {/* Trust Indicators - Responsive grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mt-8 sm:mt-12 md:mt-16">
            <div className="text-center p-3 sm:p-4 rounded-xl bg-foreground/5 backdrop-blur-sm">
              <div className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-green-400 font-orbitron">
                {t('hero.support')}
              </div>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-xl bg-foreground/5 backdrop-blur-sm">
              <div className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-cyan-400 font-orbitron">
                {t('hero.secure')}
              </div>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-xl bg-foreground/5 backdrop-blur-sm">
              <div className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-blue-400 font-orbitron">
                {t('hero.fees')}
              </div>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-xl bg-foreground/5 backdrop-blur-sm">
              <div className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-purple-400 font-orbitron">
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
