
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

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

    // Check if target price is reached
    if (
      (alarm.currentPrice < targetPrice && currentPrice >= targetPrice) ||
      (alarm.currentPrice > targetPrice && currentPrice <= targetPrice)
    ) {
      // Trigger notification
      toast({
        title: "🎯 Fiyat Alarmı!",
        description: `${alarm.token.toUpperCase()} hedef fiyata ulaştı: $${targetPrice.toFixed(6)}`,
        duration: 10000,
      });

      // Play sound notification
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+T0wWUjB');
        audio.play().catch(() => {
          // Fallback if audio fails
          console.log('Audio notification failed, using visual only');
        });
      } catch (error) {
        console.log('Audio notification not supported');
      }

      // Clear the alarm
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
