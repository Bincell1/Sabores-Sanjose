import React, { useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { ArrowRight, Trash2 } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { formatCordobas } from '../lib/currency';

// WhatsApp requires the Nicaragua country code; the visible business number remains 77756100.
const PHONE = '50577756100';
const CATEGORY_EMOJIS: Record<string, string> = {
  Almuerzos: '🍛',
  Pizzas: '🍕',
  Carta: '🥩',
  Sopas: '🥣',
  Cenas: '🍗',
  Postres: '🍰',
};
const ICON_NAMES = new Set(['sparkles', 'utensils', 'pizza', 'beef', 'soup', 'moon', 'cup-soda']);

const categoryEmoji = (category: string, productName: string, sectionEmojis: Record<string, string>) => {
  const configuredEmoji = sectionEmojis[category]?.trim();
  if (configuredEmoji && !ICON_NAMES.has(configuredEmoji)) return configuredEmoji;
  const normalizedCategory = category.toLowerCase();
  const normalizedName = productName.toLowerCase();
  if (normalizedCategory.includes('pizza')) return '🍕';
  if (normalizedCategory.includes('sopa') || normalizedCategory.includes('caldo')) return '🥣';
  if (normalizedCategory.includes('postre') || normalizedCategory.includes('bebida')) return '🍰';
  if (normalizedCategory.includes('almuerzo') || normalizedCategory.includes('desayuno')) return '🍛';
  if (normalizedCategory.includes('cena') || normalizedCategory.includes('antojito') || normalizedName.includes('búfalo') || normalizedName.includes('buffalo')) return '🍗';
  if (normalizedCategory.includes('carta')) return '🥩';
  return CATEGORY_EMOJIS[category] ?? '🍽️';
};

export function CartBar({ bottom = 78, sectionEmojis = {} }: { bottom?: number; sectionEmojis?: Record<string, string> }) {
  const { items, count, total, removeItem, clear } = useCart();
  const [showItems, setShowItems] = useState(false);
  if (!count) return null;
  const itemEmoji = (item: typeof items[number]) => item.sectionEmoji && !ICON_NAMES.has(item.sectionEmoji) ? item.sectionEmoji : categoryEmoji(item.category, item.name, sectionEmojis);
  const selectedEmojis = Array.from(new Set(items.map(itemEmoji))).slice(0, 3);
  const order = items.map(item => `- ${item.quantity}x ${item.name} (${formatCordobas(item.price)})`).join('\n');
  const message = `*¡Hola Sabores San José!* 👋\nQuiero hacer el siguiente pedido:\n${order}\n💵 *Forma de Pago:* Efectivo`;
  const send = () => { Linking.openURL(`whatsapp://send?phone=${PHONE}&text=${encodeURIComponent(message)}`).catch(() => Linking.openURL(`https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`)); clear(); };
  return <><View style={{ bottom }} className="absolute left-4 right-4 rounded-[24px] bg-cocoa p-3 shadow-md"><View className="flex-row items-center"><Pressable onPress={() => setShowItems(true)} className="h-11 w-11 flex-row items-center justify-center rounded-full bg-terracotta">{selectedEmojis.map(emoji => <Text key={emoji} className="text-lg">{emoji}</Text>)}</Pressable><Pressable onPress={() => setShowItems(true)} className="ml-3 flex-1"><Text className="text-xs text-[#DCC9BB]">{count} {count === 1 ? 'producto' : 'productos'} en tu pedido</Text><Text className="mt-0.5 text-lg font-extrabold text-white">C$ {total}</Text><Text className="text-[10px] font-bold text-[#FFE2D5]">Toca para revisar tu pedido</Text></Pressable><Pressable onPress={send} className="flex-row items-center rounded-full bg-whatsapp px-4 py-3"><Text className="mr-2 font-extrabold text-white">Pedir</Text><ArrowRight color="white" size={17} /></Pressable></View></View><Modal visible={showItems} transparent animationType="slide" onRequestClose={() => setShowItems(false)}><View className="flex-1 justify-end bg-black/35"><View className="max-h-[75%] rounded-t-[30px] bg-cream px-5 pb-8 pt-5"><View className="flex-row items-center justify-between"><Text className="text-2xl font-extrabold text-cocoa">Tu pedido</Text><Pressable onPress={() => setShowItems(false)} className="rounded-full bg-white px-4 py-2"><Text className="font-bold text-cocoa">Cerrar</Text></Pressable></View><ScrollView className="mt-5" showsVerticalScrollIndicator={false}>{items.map(item => <View key={`${item.id}-${item.quantity}`} className="mb-3 flex-row items-center rounded-2xl bg-white p-3"><Text className="mr-3 text-2xl">{itemEmoji(item)}</Text><View className="flex-1"><Text className="font-bold text-cocoa">{item.quantity}x {item.name}</Text></View><Text className="mr-3 font-extrabold text-terracotta">C$ {item.price * item.quantity}</Text><Pressable accessibilityRole="button" accessibilityLabel={`Eliminar ${item.name} del pedido`} onPress={() => removeItem(item)} className="h-10 w-10 items-center justify-center rounded-full bg-[#FCE9E2]"><Trash2 size={18} color="#C85A32" /></Pressable></View>)}</ScrollView><View className="mt-3 flex-row items-center justify-between"><View><Text className="text-sm text-sand">Total</Text><Text className="text-2xl font-extrabold text-cocoa">C$ {total}</Text></View><Pressable onPress={() => { setShowItems(false); send(); }} className="flex-row items-center rounded-full bg-whatsapp px-5 py-3"><Text className="mr-2 font-extrabold text-white">Enviar pedido</Text><ArrowRight color="white" size={17} /></Pressable></View></View></View></Modal></>;
}
