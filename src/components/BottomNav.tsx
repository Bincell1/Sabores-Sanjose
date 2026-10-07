import React from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Heart, Home, Menu, Phone, Settings2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type NavTab = 'home' | 'favorites' | 'menu' | 'contact' | 'admin';

const tabs: { key: NavTab; label: string; icon: typeof Home }[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'favorites', label: 'Favoritos', icon: Heart },
  { key: 'menu', label: 'Menú', icon: Menu },
  { key: 'contact', label: 'Contactar', icon: Phone },
  { key: 'admin', label: 'Admin', icon: Settings2 },
];

export function BottomNav({ activeTab, onChange }: { activeTab: NavTab; onChange: (tab: NavTab) => void }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  return <View
    className={isDesktop ? 'w-[116px] border-r border-[#EEE4D9] bg-white px-3' : 'border-t border-[#EEE4D9] bg-white px-4 pt-2'}
    style={isDesktop ? { paddingTop: insets.top + 28, paddingBottom: 24 } : { paddingBottom: insets.bottom + 8 }}
  >
    <View className={isDesktop ? 'items-center' : 'flex-row items-center justify-around'}>
      {tabs.map(({ key, label, icon: Icon }) => {
        const active = activeTab === key;
        return <Pressable key={key} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={label} onPress={() => onChange(key)} className={isDesktop ? 'my-1 w-full items-center rounded-2xl px-2 py-3 active:opacity-70' : 'min-w-[70px] items-center rounded-2xl px-3 py-1 active:opacity-70'}>
          <View className={active ? 'items-center rounded-xl bg-[#FCE9E2] px-3 py-2' : 'items-center rounded-xl px-3 py-2'}>
            <Icon size={isDesktop ? 23 : 22} color={active ? '#C85A32' : '#9B897A'} fill={active && key === 'favorites' ? '#C85A32' : 'none'} strokeWidth={active ? 2.6 : 2} />
          </View>
          <Text className={`mt-1 text-[11px] font-bold ${active ? 'text-terracotta' : 'text-sand'}`}>{label}</Text>
        </Pressable>;
      })}
    </View>
  </View>;
}
