
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/context/LanguageContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Bell, Shield, Globe, Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

const ProfileSettings = () => {
  const { t, language, setLanguage } = useLanguage();
  const { userProfile, isLoading } = useUserProfile();
  const [activeTab, setActiveTab] = useState('general');

  // Local state for settings
  const [settings, setSettings] = useState({
    // General settings
    language: language,
    theme: 'dark',
    soundEnabled: true,
    
    // Notification settings
    rewardNotifications: true,
    priceAlerts: true,
    stakeExpiryAlerts: true,
    
    // Security settings
    twoFactorAuth: false,
    sessionTimeout: '30', // minutes
  });

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Handle language change immediately
    if (key === 'language' && typeof value === 'string') {
      setLanguage(value as 'en' | 'tr');
      toast.success(value === 'tr' ? 'Dil Türkçe olarak değiştirildi' : 'Language changed to English');
    }
  };

  const handleNotificationToggle = (type: string, enabled: boolean) => {
    handleSettingChange(type, enabled);
    
    const messages = {
      rewardNotifications: {
        tr: enabled ? 'Ödül bildirimleri aktif edildi' : 'Ödül bildirimleri pasif edildi',
        en: enabled ? 'Reward notifications enabled' : 'Reward notifications disabled'
      },
      priceAlerts: {
        tr: enabled ? 'Fiyat uyarıları aktif edildi' : 'Fiyat uyarıları pasif edildi',
        en: enabled ? 'Price alerts enabled' : 'Price alerts disabled'
      },
      stakeExpiryAlerts: {
        tr: enabled ? 'Stake sona erme uyarıları aktif edildi' : 'Stake sona erme uyarıları pasif edildi',
        en: enabled ? 'Stake expiry alerts enabled' : 'Stake expiry alerts disabled'
      }
    };
    
    const message = messages[type as keyof typeof messages];
    if (message) {
      toast.success(message[language as keyof typeof message]);
    }
  };

  const handleTwoFactorToggle = (enabled: boolean) => {
    handleSettingChange('twoFactorAuth', enabled);
    
    if (enabled) {
      toast.info(
        language === 'tr' 
          ? 'İki faktörlü doğrulama aktif edildi. Bir sonraki girişinizde telefonunuzdan doğrulama kodu gerekecek.'
          : 'Two-factor authentication enabled. You will need a verification code from your phone on next login.'
      );
    } else {
      toast.info(
        language === 'tr'
          ? 'İki faktörlü doğrulama pasif edildi'
          : 'Two-factor authentication disabled'
      );
    }
  };

  const handleSessionTimeoutChange = (minutes: string) => {
    handleSettingChange('sessionTimeout', minutes);
    toast.info(
      language === 'tr'
        ? `Oturum zaman aşımı ${minutes} dakika olarak ayarlandı`
        : `Session timeout set to ${minutes} minutes`
    );
  };

  const tabs = [
    { id: 'general', label: t('settings.general'), icon: Globe },
    { id: 'notifications', label: t('settings.notifications'), icon: Bell },
    { id: 'security', label: t('settings.security'), icon: Shield },
  ];

  return (
    <Card className="cyber-card">
      <CardHeader>
        <CardTitle className="text-xl font-orbitron gradient-text">
          {t('settings.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 max-h-96 overflow-y-auto">
        {/* Tabs */}
        <div className="flex space-x-1 bg-background/30 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'text-foreground/60 hover:text-foreground/80 hover:bg-background/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span className="font-medium">{t('settings.language')}</span>
                </div>
                <select
                  value={settings.language}
                  onChange={(e) =>handleSettingChange('language', e.target.value)}
                  className="bg-background/30 border border-green-500/30 rounded-lg px-3 py-1 text-sm"
                >
                  <option value="en">English</option>
                  <option value="tr">Türkçe</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  {settings.theme === 'dark' ? (
                    <Moon className="w-4 h-4 text-purple-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-yellow-400" />
                  )}
                  <span className="font-medium">{t('settings.theme')}</span>
                </div>
                <select
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                  className="bg-background/30 border border-green-500/30 rounded-lg px-3 py-1 text-sm"
                >
                  <option value="dark">{t('settings.darkMode')}</option>
                  <option value="light">{t('settings.lightMode')}</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  {settings.soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  )}
                  <span className="font-medium">{t('settings.soundEffects')}</span>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)}
                />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <Bell className="w-4 h-4 text-green-400" />
                    <span className="font-medium">{t('settings.rewardNotifications')}</span>
                  </div>
                  <p className="text-xs text-foreground/60 ml-7">
                    {t('settings.rewardNotificationsDesc')}
                  </p>
                </div>
                <Switch
                  checked={settings.rewardNotifications}
                  onCheckedChange={(checked) => handleNotificationToggle('rewardNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <Bell className="w-4 h-4 text-blue-400" />
                    <span className="font-medium">{t('settings.priceAlerts')}</span>
                  </div>
                  <p className="text-xs text-foreground/60 ml-7">
                    {t('settings.priceAlertsDesc')}
                  </p>
                </div>
                <Switch
                  checked={settings.priceAlerts}
                  onCheckedChange={(checked) => handleNotificationToggle('priceAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <Bell className="w-4 h-4 text-yellow-400" />
                    <span className="font-medium">{t('settings.stakeExpiryAlerts')}</span>
                  </div>
                  <p className="text-xs text-foreground/60 ml-7">
                    {t('settings.stakeExpiryAlertsDesc')}
                  </p>
                </div>
                <Switch
                  checked={settings.stakeExpiryAlerts}
                  onCheckedChange={(checked) => handleNotificationToggle('stakeExpiryAlerts', checked)}
                />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="font-medium">{t('settings.twoFactorAuth')}</span>
                  </div>
                  <p className="text-xs text-foreground/60 ml-7">
                    {t('settings.twoFactorAuthDesc')}
                  </p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={handleTwoFactorToggle}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span className="font-medium">{t('settings.sessionTimeout')}</span>
                </div>
                <select
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSessionTimeoutChange(e.target.value)}
                  className="bg-background/30 border border-green-500/30 rounded-lg px-3 py-1 text-sm"
                >
                  <option value="15">15 {t('settings.minutes')}</option>
                  <option value="30">30 {t('settings.minutes')}</option>
                  <option value="60">60 {t('settings.minutes')}</option>
                  <option value="120">120 {t('settings.minutes')}</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-border/20">
          <Button 
            onClick={() => {
              toast.success(
                language === 'tr' 
                  ? 'Ayarlar başarıyla kaydedildi' 
                  : 'Settings saved successfully'
              );
            }}
            className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600"
          >
            {t('settings.saveSettings')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
