
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Heart, ExternalLink, Github, Twitter, Send } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="relative border-t border-border/20 py-16 px-4 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent"></div>
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-green-400/5 to-cyan-400/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 via-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-black font-bold text-lg">mX</span>
                </div>
                <div className="absolute -inset-0.5 bg-gradient-to-br from-green-400 to-cyan-400 rounded-xl blur opacity-30"></div>
              </div>
              <span className="text-3xl font-bold gradient-text">modX</span>
            </div>
            <p className="text-foreground/70 leading-relaxed text-lg mb-6 max-w-md">
              {t('footer.slogan')}
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="#" className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30 rounded-xl flex items-center justify-center hover:bg-gradient-to-r hover:from-green-500/30 hover:to-cyan-500/30 hover:border-green-500/50 transition-all duration-300 hover:scale-110">
                <Twitter className="w-5 h-5 text-green-400" />
              </a>
              <a href="#" className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30 rounded-xl flex items-center justify-center hover:bg-gradient-to-r hover:from-green-500/30 hover:to-cyan-500/30 hover:border-green-500/50 transition-all duration-300 hover:scale-110">
                <Send className="w-5 h-5 text-cyan-400" />
              </a>
              <a href="#" className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30 rounded-xl flex items-center justify-center hover:bg-gradient-to-r hover:from-green-500/30 hover:to-cyan-500/30 hover:border-green-500/50 transition-all duration-300 hover:scale-110">
                <Github className="w-5 h-5 text-blue-400" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-bold text-foreground mb-6 text-xl">
              {t('footer.platform')}
            </h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-foreground/70 hover:text-foreground transition-all duration-300 hover:translate-x-2 inline-flex items-center group">
                  {t('footer.about')}
                  <ExternalLink className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-foreground transition-all duration-300 hover:translate-x-2 inline-flex items-center group">
                  {t('footer.docs')}
                  <ExternalLink className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-foreground transition-all duration-300 hover:translate-x-2 inline-flex items-center group">
                  {t('footer.roadmap')}
                  <ExternalLink className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
              </li>
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h3 className="font-bold text-foreground mb-6 text-xl">
              {t('footer.community')}
            </h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-foreground/70 hover:text-foreground transition-all duration-300 hover:translate-x-2 inline-flex items-center group">
                  {t('footer.community')}
                  <ExternalLink className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-foreground transition-all duration-300 hover:translate-x-2 inline-flex items-center group">
                  {t('footer.support')}
                  <ExternalLink className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-foreground transition-all duration-300 hover:translate-x-2 inline-flex items-center group">
                  {t('footer.faq')}
                  <ExternalLink className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-foreground/50 text-center md:text-left">
              {t('footer.copyright')}
            </p>
            <div className="flex items-center space-x-2 text-foreground/50">
              <span>{t('footer.builtWith')}</span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span>{t('footer.by')}</span>
              <a 
                href="https://WeAreTheArtMakers.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-transparent bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text font-semibold hover:from-green-300 hover:to-cyan-300 transition-all duration-300 hover:scale-105"
              >
                WATAM
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
