import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Image } from 'expo-image';

type FoodImageProps = { uri: string; emoji: string; className?: string };

export function FoodImage({ uri, emoji, className }: FoodImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return <View className={`items-center justify-center bg-[#F1E9DF] ${className ?? ''}`}><Text className="text-5xl">{emoji}</Text></View>;
  return <Image source={{ uri }} cachePolicy="disk" onError={() => setFailed(true)} transition={350} contentFit="cover" className={className} />;
}
