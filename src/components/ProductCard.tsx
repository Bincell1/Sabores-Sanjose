import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { Product } from '../types';
import { FoodImage } from './FoodImage';

export function ProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
  return <Pressable onPress={onPress} className="mb-4 w-[48%] rounded-[26px] bg-white p-2 shadow-sm active:opacity-80">
    <View className="relative h-32 overflow-hidden rounded-[20px] bg-line"><FoodImage uri={product.image} emoji={product.emoji} className="h-full w-full" /><Text className="absolute left-2 top-2 text-xl">{product.emoji}</Text></View>
    <View className="px-1 pb-1 pt-3"><Text numberOfLines={1} className="font-bold text-[15px] text-cocoa">{product.name}</Text><Text numberOfLines={1} className="mt-1 text-xs text-sand">{product.description}</Text><View className="mt-3 flex-row items-center justify-between"><Text className="font-extrabold text-terracotta">C$ {product.price}</Text><View className="h-9 w-9 items-center justify-center rounded-full bg-terracotta"><Plus color="white" size={19} strokeWidth={2.8} /></View></View></View>
  </Pressable>;
}
