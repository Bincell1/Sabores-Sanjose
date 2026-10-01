import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { UtensilsCrossed } from 'lucide-react-native';

type FoodImageProps = { uri: string; emoji: string; className?: string };

export function FoodImage({ uri, emoji, className }: FoodImageProps) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [uri]);
  if (failed) return <View className={`items-center justify-center bg-[#F1E9DF] ${className ?? ''}`}><UtensilsCrossed size={42} color="#C85A32" /></View>;
  return <Image source={{ uri }} cachePolicy="disk" onError={() => setFailed(true)} transition={350} contentFit="cover" className={className} />;
}
