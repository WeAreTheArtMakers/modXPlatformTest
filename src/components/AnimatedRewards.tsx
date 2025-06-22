
import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';

interface AnimatedRewardsProps {
  amount: number;
  className?: string;
}

const AnimatedRewards: React.FC<AnimatedRewardsProps> = ({ 
  amount, 
  className = '' 
}) => {
  const [displayRewards, setDisplayRewards] = useState(amount);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (amount > 0) {
      setIsAnimating(true);
      setDisplayRewards(amount);
      
      // Simple animation increment
      const increment = amount * 0.00001; // Very small increment for visual effect
      
      const interval = setInterval(() => {
        setDisplayRewards(prev => prev + increment);
      }, 1000);
      
      // Stop animation after 30 seconds
      const timeout = setTimeout(() => {
        setIsAnimating(false);
        clearInterval(interval);
      }, 30000);
      
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
        setIsAnimating(false);
      };
    } else {
      setDisplayRewards(amount);
      setIsAnimating(false);
    }
  }, [amount]);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <TrendingUp className={`w-4 h-4 text-green-400 ${isAnimating ? 'animate-pulse' : ''}`} />
      <span className="font-orbitron font-bold text-green-400">
        {displayRewards.toFixed(6)} modX
      </span>
      {isAnimating && (
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      )}
    </div>
  );
};

export default AnimatedRewards;
