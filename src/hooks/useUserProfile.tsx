
import { useState, useEffect } from 'react';
import { useWeb3 } from '@/context/Web3Context';

interface UserProfile {
  address: string;
  username: string;
  avatar: string;
  joinDate: string;
}

const futuristicNames = [
  'NeonCypher', 'QuantumRider', 'CyberNinja', 'DataMancer', 'VoidHacker',
  'NeoReaper', 'PixelPhantom', 'CryptoSamurai', 'DigitalWarrior', 'ByteAssassin',
  'GlitchMaster', 'CodeBreaker', 'TechnoShaman', 'CyberPunk', 'DataGhost',
  'NeonWalker', 'QuantumHunter', 'VirtualRogue', 'CyberSiren', 'DataDruid',
  'PixelPirate', 'TechVanguard', 'NeoMystic', 'CryptoNomad', 'DigitalSage'
];

const avatarEmojis = [
  '🤖', '👾', '🎭', '⚡', '🔮', '💎', '🌟', '🚀', '⭐', '💫',
  '🌈', '🎯', '🔥', '💥', '⚔️', '🛡️', '👑', '🎪', '🎨', '🎵'
];

export const useUserProfile = () => {
  const { account } = useWeb3();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Generate deterministic profile based on wallet address
  const generateProfile = (address: string): UserProfile => {
    // Use address to create a seed for consistent results
    const seed = address.slice(2, 10);
    const nameIndex = parseInt(seed.slice(0, 2), 16) % futuristicNames.length;
    const avatarIndex = parseInt(seed.slice(2, 4), 16) % avatarEmojis.length;
    const joinDay = parseInt(seed.slice(4, 6), 16) % 30 + 1;
    const joinMonth = parseInt(seed.slice(6, 8), 16) % 12 + 1;

    return {
      address,
      username: futuristicNames[nameIndex],
      avatar: avatarEmojis[avatarIndex],
      joinDate: `2024-${joinMonth.toString().padStart(2, '0')}-${joinDay.toString().padStart(2, '0')}`
    };
  };

  useEffect(() => {
    if (account) {
      // Check if profile exists in localStorage
      const storedProfile = localStorage.getItem(`userProfile_${account}`);
      
      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      } else {
        // Generate new profile and store it
        const newProfile = generateProfile(account);
        setUserProfile(newProfile);
        localStorage.setItem(`userProfile_${account}`, JSON.stringify(newProfile));
      }
    } else {
      setUserProfile(null);
    }
  }, [account]);

  return {
    userProfile,
    isLoading: account && !userProfile
  };
};
