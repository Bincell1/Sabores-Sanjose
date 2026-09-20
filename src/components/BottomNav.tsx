import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Heart, Home, Menu, Phone } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type NavTab = 'home' | 'favorites' | 'menu' | 'contact';

const tabs: { key: NavTab; label: string; icon: typeof Home }[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'favorites', label: 'Favoritos', icon: Heart },
  { key: 'menu', label: 'Menú', icon: Menu },
  { key: 'contact', label: 'Contactar', icon: Phone },
];

export function BottomNav({ activeTab, onChange }: { activeTab: NavTab; onChange: (tab: NavTab) => void }) {
  const insets = useSafeAreaInsets();
  return <View className="border-t border-[#EEE4D9] bg-white px-4 pt-2" style={{ paddingBottom: insets.bottom + 8 }}>
    <View className="flex-row items-center justify-around">
      {tabs.map(({ key, label, icon: Icon }) => {
        const active = activeTab === key;
        return <Pressable key={key} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={label} onPress={() => onChange(key)} className="min-w-[70px] items-center rounded-2xl px-3 py-1 active:opacity-70">
          <Icon size={22} color={active ? '#C85A32' : '#9B897A'} fill={active && key === 'favorites' ? '#C85A32' : 'none'} strokeWidth={active ? 2.6 : 2} />
          <Text className={`mt-1 text-[11px] font-bold ${active ? 'text-terracotta' : 'text-sand'}`}>{label}</Text>
        </Pressable>;
      })}
    </View>
  </View>;
}
