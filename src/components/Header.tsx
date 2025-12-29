import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useWeb3 } from '@/context/Web3Context';
import { Globe, Wallet, Moon, Sun, Menu, X, CheckCircle, AlertCircle, Home, Layers, ArrowLeftRight, User, BarChart3, LayoutDashboard, Image } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { account, chainId, isConnecting, connectWallet, disconnectWallet, switchToTestnet } = useWeb3();
  const location = useLocation();

  const BSC_TESTNET_CHAIN_ID = 97;
  const isCorrectNetwork = chainId === BSC_TESTNET_CHAIN_ID;

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close menu on escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

  // Prevent body scroll when menu open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { path: '/', label: t('header.home'), icon: Home },
    { path: '/stake', label: t('header.stake'), icon: Layers },
    { path: '/nfts', label: t('header.nft'), icon: Image },
    { path: '/swap', label: t('header.swap'), icon: ArrowLeftRight },
    { path: '/profile', label: t('header.profile'), icon: User },
    { path: '/market', label: 'Market', icon: BarChart3 },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }
  ];

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 w-full z-40 bg-background/95 backdrop-blur-lg border-b border-border/20">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group flex-shrink-0 z-50">
            <div className="relative">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-400 via-cyan-400 to-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-black font-bold text-sm sm:text-lg">mX</span>
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-bold gradient-text">modX</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`text-foreground/80 hover:text-foreground transition-all duration-300 relative group text-sm xl:text-base ${
                  location.pathname === item.path ? 'text-green-400' : ''
                }`}
              >
                {item.label}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-green-400 to-cyan-400 transition-all duration-300 ${
                  location.pathname === item.path ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </Link>
            ))}
          </nav>

          {/* Right Section - Desktop */}
          <div className="hidden lg:flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-9 h-9 p-0"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'tr' : 'en')}
              className="px-2"
              aria-label="Change language"
            >
              <Globe className="w-4 h-4 mr-1" />
              <span className="text-xs">{language.toUpperCase()}</span>
            </Button>

            {account && (
              <div className="flex items-center">
                {isCorrectNetwork ? (
                  <div className="flex items-center space-x-1 text-green-400 text-xs px-2">
                    <CheckCircle className="w-3 h-3" />
                    <span>BSC</span>
                  </div>
                ) : (
                  <Button
                    onClick={switchToTestnet}
                    size="sm"
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-8"
                  >
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Switch
                  </Button>
                )}
              </div>
            )}

            {!account ? (
              <Button 
                onClick={connectWallet}
                disabled={isConnecting}
                size="sm"
                className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-medium px-4 h-9 rounded-lg text-sm"
              >
                <Wallet className="w-4 h-4 mr-1.5" />
                {isConnecting ? '...' : t('header.connect')}
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium">{formatAddress(account)}</span>
                </div>
                <Button
                  onClick={disconnectWallet}
                  variant="outline"
                  size="sm"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-8 text-xs"
                >
                  Disconnect
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Right Section */}
          <div className="flex lg:hidden items-center space-x-2">
            {account && (
              <div className="hidden xs:flex items-center space-x-1 bg-green-500/10 border border-green-500/20 rounded-lg px-2 py-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium">{formatAddress(account)}</span>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0 z-50 relative"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Full Screen Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          
          {/* Menu Panel */}
          <div className="absolute top-0 right-0 h-full w-[300px] max-w-[85vw] bg-background border-l border-border/30 shadow-2xl flex flex-col">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-sm">mX</span>
                </div>
                <span className="font-bold text-lg gradient-text">modX</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-0"
                onClick={closeMobileMenu}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Wallet Section */}
            <div className="p-4 border-b border-border/30 bg-background">
              {!account ? (
                <Button 
                  onClick={() => {
                    connectWallet();
                    closeMobileMenu();
                  }}
                  disabled={isConnecting}
                  className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-medium py-3 rounded-xl"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  {isConnecting ? 'Connecting...' : t('header.connectWallet')}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">{formatAddress(account)}</span>
                    </div>
                    {isCorrectNetwork ? (
                      <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">BSC</span>
                    ) : (
                      <Button
                        onClick={switchToTestnet}
                        size="sm"
                        variant="outline"
                        className="border-red-500/30 text-red-400 text-xs h-7 px-2"
                      >
                        Switch
                      </Button>
                    )}
                  </div>
                  <Button
                    onClick={() => {
                      disconnectWallet();
                      closeMobileMenu();
                    }}
                    variant="outline"
                    className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    Disconnect Wallet
                  </Button>
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1 bg-background">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                        : 'text-foreground/80 hover:bg-foreground/5 active:bg-foreground/10'
                    }`}
                    onClick={closeMobileMenu}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-green-400' : ''}`} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom Settings */}
            <div className="p-4 border-t border-border/30 bg-background">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTheme}
                  className="flex-1 h-11"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLanguage(language === 'en' ? 'tr' : 'en')}
                  className="flex-1 h-11"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'TR' : 'EN'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
