import './global.css';
import React, { Component, ErrorInfo, useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Phone } from 'lucide-react-native';
import { CartProvider, useCart } from './src/context/CartContext';
import { categories, products } from './src/data/products';
import { Category, Product } from './src/types';
import { IconButton } from './src/components/IconButton';
import { ProductCard } from './src/components/ProductCard';
import { ProductModal } from './src/components/ProductModal';
import { CartBar } from './src/components/CartBar';
import { BrandIntro } from './src/components/BrandIntro';
import { Image } from 'expo-image';
import { FoodImage } from './src/components/FoodImage';
import { MapEmbed } from './src/components/MapEmbed';

const MotiView = View as React.ComponentType<any>;

function Home() {
  const [category, setCategory] = useState<Category>('Todos');
  const [selected, setSelected] = useState<Product | null>(null);
  const { addItem } = useCart();
  const [carouselIndex, setCarouselIndex] = useState(0);
  const featured = products.filter(product => product.featured || ['pollo-plancha', 'tres-leches', 'pizza-carnes'].includes(product.id));
  useEffect(() => {
    const timer = setInterval(() => setCarouselIndex(index => (index + 1) % featured.length), 4800);
    return () => clearInterval(timer);
  }, [featured.length]);
  const filtered = useMemo(() => products.filter(product =>
    category === 'Todos' || product.category === category
  ), [category]);

  return <SafeAreaView className="flex-1 bg-cream"><StatusBar barStyle="dark-content" /><View className="flex-1">
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 105 }}>
      <View className="px-5 pt-3"><View className="flex-row items-center justify-between"><View className="flex-row items-center"><Image source={require('./logo/logosisanjose.png')} contentFit="contain" className="mr-3 h-14 w-14" /><View><Text className="text-[13px] text-sand">¡Hola! Bienvenido a</Text><Text className="mt-0.5 text-[24px] font-extrabold text-cocoa">Sabores <Text className="text-terracotta">San José</Text></Text></View></View><IconButton icon={Bell} /></View>
        <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 600 }} className="mt-5 overflow-hidden rounded-[26px] bg-cocoa"><Pressable onPress={() => setSelected(featured[carouselIndex])} className="relative h-[205px]"><FoodImage uri={featured[carouselIndex].image} emoji={featured[carouselIndex].emoji} className="absolute inset-0 opacity-70" /><View className="absolute inset-0 bg-[#24150F]/45" /><View className="absolute inset-x-0 bottom-0 p-5"><Text className="font-bold uppercase tracking-[2px] text-[#FFE2D5]">Favoritos de la casa</Text><Text className="mt-1 max-w-[260px] text-[23px] font-extrabold leading-7 text-white">{featured[carouselIndex].name}</Text><Text className="mt-1 max-w-[270px] text-sm text-[#FFE2D5]">{featured[carouselIndex].description}</Text></View></Pressable><View className="absolute bottom-4 right-5 flex-row gap-1.5">{featured.map((item, index) => <Pressable key={item.id} onPress={() => setCarouselIndex(index)} className={`h-2 rounded-full ${index === carouselIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'}`} />)}</View></MotiView>
      </View>
      <View className="mt-6"><Text className="px-5 text-xl font-extrabold text-cocoa">Explora el menú</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 5 }}><View className="flex-row gap-2">{categories.map(item => <Pressable key={item.name} onPress={() => setCategory(item.name as Category)} className={`items-center rounded-2xl px-4 py-3 ${category === item.name ? 'bg-cocoa' : 'bg-white'}`}><Text className="text-2xl">{item.icon}</Text><Text className={`mt-1 max-w-[100px] text-center text-xs font-bold ${category === item.name ? 'text-white' : 'text-sand'}`}>{item.label ?? item.name}</Text></Pressable>)}</View></ScrollView></View>
      <View className="mt-5 px-5"><View className="mb-3 flex-row items-end justify-between"><Text className="text-xl font-extrabold text-cocoa">Recomendados</Text><Text className="text-sm font-bold text-terracotta">{filtered.length} opciones</Text></View><View className="flex-row flex-wrap justify-between">{filtered.map(product => <ProductCard key={product.id} product={product} onPress={() => setSelected(product)} />)}</View>{filtered.length === 0 && <Text className="py-10 text-center text-sand">No encontramos ese antojo todavía.</Text>}</View>
      <View className="mx-5 mt-7 mb-2 rounded-[24px] bg-white p-5"><Text className="text-lg font-extrabold text-cocoa">Visítanos o escríbenos</Text><Text className="mt-1 text-sm text-sand">Estamos listos para preparar algo especial para ti.</Text><Pressable onPress={() => Linking.openURL('tel:77756100')} className="mt-4 flex-row items-center rounded-2xl bg-[#F1E9DF] px-3 py-3"><Phone size={17} color="#C85A32" /><Text className="ml-2 text-sm font-bold text-cocoa">77756100</Text></Pressable><Text className="mt-5 text-lg font-extrabold text-cocoa">Ubicación del negocio</Text><Text className="mt-1 text-sm text-sand">Consulta el mapa directamente dentro de la app.</Text><MapEmbed /></View>
    </ScrollView><CartBar /></View>
    <ProductModal product={selected} onClose={() => setSelected(null)} onAdd={(options, notes) => { if (selected) addItem(selected, options, notes); setSelected(null); }} />
  </SafeAreaView>;
}

class AppErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Sabores San José render error', error, info); }
  render() { if (this.state.error) return <View style={{ flex: 1, padding: 32, justifyContent: 'center', backgroundColor: '#FAF6F0' }}><Text style={{ color: '#4A2810', fontSize: 24, fontWeight: '800' }}>No se pudo cargar la app</Text><Text style={{ color: '#8C7A6B', marginTop: 12 }}>{this.state.error.message}</Text></View>; return this.props.children; }
}

function AppShell() {
  const [showIntro, setShowIntro] = React.useState(true);
  const finishIntro = React.useCallback(() => setShowIntro(false), []);
  return showIntro ? <BrandIntro onFinish={finishIntro} /> : <Home />;
}

export default function App() { return <AppErrorBoundary><SafeAreaProvider><CartProvider><AppShell /></CartProvider></SafeAreaProvider></AppErrorBoundary>; }
