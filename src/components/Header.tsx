
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useWeb3 } from '@/context/Web3Context';
import { Globe, Wallet, Moon, Sun, Menu, CheckCircle, AlertCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { account, chainId, isConnecting, connectWallet, disconnectWallet, switchToTestnet } = useWeb3();
  const location = useLocation();

  const BSC_TESTNET_CHAIN_ID = 97;
  const isCorrectNetwork = chainId === BSC_TESTNET_CHAIN_ID;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

  const navItems = [
    { path: '/', label: t('header.home') },
    { path: '/stake', label: t('header.stake') },
     { path: '/nfts', label: t('header.nft') },
    { path: '/swap', label: t('header.swap') },
    { path: '/profile', label: t('header.profile') },
    { path: '/market', label: 'Market' },
    { path: '/dashboard', label: 'Dashboard' }
  ];

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-lg border-b border-border/20 supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo with enhanced styling */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 via-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg hover:shadow-green-400/25 transition-all duration-500 group-hover:scale-105">
              <span className="text-black font-bold text-lg font-orbitron">mX</span>
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-br from-green-400 to-cyan-400 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
          </div>
          <span className="text-2xl font-bold gradient-text group-hover:scale-105 transition-transform duration-500 font-orbitron">modX</span>
        </Link>

        {/* Navigation - Hidden on mobile */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`text-foreground/80 hover:text-foreground transition-all duration-500 hover:scale-105 relative group ${
                location.pathname === item.path ? 'text-green-400' : ''
              }`}
            >
              {item.label}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-green-400 to-cyan-400 transition-all duration-500 ${
                location.pathname === item.path ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="hover-glow w-10 h-10 p-0"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* Language Switcher */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'tr' : 'en')}
            className="hover-glow"
          >
            <Globe className="w-4 h-4 mr-2" />
            {language.toUpperCase()}
          </Button>

          {/* Network Status */}
          {account && (
            <div className="flex items-center space-x-2">
              {isCorrectNetwork ? (
                <div className="flex items-center space-x-1 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span className="hidden md:inline">BSC Testnet</span>
                </div>
              ) : (
                <Button
                  onClick={switchToTestnet}
                  size="sm"
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  <span className="hidden md:inline">Switch Network</span>
                </Button>
              )}
            </div>
          )}

          {/* Connect Wallet Button */}
          {!account ? (
            <Button 
              onClick={connectWallet}
              disabled={isConnecting}
              className="cyber-glow hover-glow bg-gradient-to-r from-green-500 via-cyan-500 to-blue-500 hover:from-green-600 hover:via-cyan-600 hover:to-blue-600 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-green-400/25 transition-all duration-500 animate-pulse-glow"
            >
              <Wallet className="w-4 h-4 mr-2" />
              {isConnecting ? 'Connecting...' : t('header.connect')}
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20 rounded-xl px-4 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">{formatAddress(account)}</span>
              </div>
              <Button
                onClick={disconnectWallet}
                variant="outline"
                size="sm"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                Disconnect
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden w-10 h-10 p-0"
            onClick={() => setMobileMenuOpen((o) => !o)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className={`absolute top-0 right-0 h-full w-64 bg-background/90 backdrop-blur-lg shadow-lg p-6 transform transition-transform duration-300 ${
              mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block py-2 text-lg text-foreground/80 hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
