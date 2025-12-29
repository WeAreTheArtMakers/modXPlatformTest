import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

interface PriceAlarm {
  token: string;
  targetPrice: number;
  currentPrice: number;
  timestamp: number;
}

export const usePriceAlarm = (currentPrices: { [key: string]: { price: number } }) => {
  const [alarm, setAlarm] = useState<PriceAlarm | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedAlarm = localStorage.getItem('priceAlarm');
    if (savedAlarm) {
      setAlarm(JSON.parse(savedAlarm));
    }
  }, []);

  useEffect(() => {
    if (!alarm || !currentPrices[alarm.token]) return;

    const currentPrice = currentPrices[alarm.token].price;
    const targetPrice = alarm.targetPrice;

    if (
      (alarm.currentPrice < targetPrice && currentPrice >= targetPrice) ||
      (alarm.currentPrice > targetPrice && currentPrice <= targetPrice)
    ) {
      toast({
        title: "🎯 Fiyat Alarmı!",
        description: `${alarm.token.toUpperCase()} hedef fiyata ulaştı: ${targetPrice.toFixed(6)}`,
        duration: 10000,
      });

      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+T0wWUjB');
        audio.play().catch(() => {
          logger.log('Audio notification failed, using visual only');
        });
      } catch {
        logger.log('Audio notification not supported');
      }

      localStorage.removeItem('priceAlarm');
      setAlarm(null);
    }
  }, [currentPrices, alarm, toast]);

  const setAlarmData = (newAlarm: PriceAlarm) => {
    localStorage.setItem('priceAlarm', JSON.stringify(newAlarm));
    setAlarm(newAlarm);
  };

  const clearAlarm = () => {
    localStorage.removeItem('priceAlarm');
    setAlarm(null);
  };

  return {
    alarm,
    setAlarm: setAlarmData,
    clearAlarm
  };
};
