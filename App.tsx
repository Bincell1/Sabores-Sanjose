import './global.css';
import React, { Component, ErrorInfo, useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StatusBar, Text, TextInput, View, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Beef, Bell, CheckCheck, CupSoda, LucideIcon, MapPin, Moon, Phone, Pizza, Soup, Sparkles, Tag, Utensils, X } from 'lucide-react-native';
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
import { BottomNav, NavTab } from './src/components/BottomNav';
import { AdminPanel } from './src/components/AdminPanel';
import { deleteRemoteCategory, deleteRemoteProduct, exchangeRecoveryToken, isCurrentAdmin, isSupabaseConfigured, loadRemoteData, requestPasswordReset, saveRemoteCategory, saveRemoteProduct, setRecoveryToken, signInAdmin, signOutAdmin, updateAdminPassword } from './src/lib/supabase';

const MotiView = View as React.ComponentType<any>;
const FAVORITES_STORAGE_KEY = '@sabores-san-jose/favorites';
const CATEGORIES_STORAGE_KEY = '@sabores-san-jose/categories';
const NOTIFICATIONS_READ_STORAGE_KEY = '@sabores-san-jose/notifications-read';
const categoryIcons: Record<string, LucideIcon> = { sparkles: Sparkles, utensils: Utensils, pizza: Pizza, beef: Beef, soup: Soup, moon: Moon, 'cup-soda': CupSoda };
const renderCategoryIcon = (icon: string, size: number, color: string) => {
  const CategoryIcon = categoryIcons[icon];
  return CategoryIcon ? <CategoryIcon size={size} color={color} strokeWidth={2.2} /> : <Text style={{ fontSize: size + 3 }}>{icon || '🍽️'}</Text>;
};
const productFromDb = (row: any): Product => ({ id: row.id, name: row.name, description: row.description, price: Number(row.price), category: row.category, emoji: row.emoji, image: row.image, featured: row.featured, available: row.available, promotion: row.promotion ?? '', sizePrices: row.size_prices ?? undefined, options: row.options ?? undefined });
const productToDb = (product: Product) => ({ id: product.id, name: product.name, description: product.description, price: product.price, category: product.category, emoji: product.emoji, image: product.image, featured: product.featured ?? false, available: product.available !== false, promotion: product.promotion ?? null, size_prices: product.sizePrices ?? null, options: product.options ?? null, updated_at: new Date().toISOString() });

function PasswordRecovery({ onBack }: { onBack: () => void }) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const save = async () => {
    if (!ready || loading) return;
    if (password.length < 8 || password !== confirmation) { setError(password.length < 8 ? 'Usa al menos 8 caracteres.' : 'Las contraseñas no coinciden.'); return; }
    setLoading(true); setError('');
    const result = await updateAdminPassword(password);
    setLoading(false);
    if (result.error) { setError(`No se pudo guardar: ${result.error.message ?? 'el enlace expiró'}. Solicita otro correo de recuperación.`); return; }
    setError(''); setMessage('Contraseña actualizada correctamente.');
  };
  useEffect(() => { let active = true; const prepare = async () => { if (typeof window === 'undefined') return; const hash = new URLSearchParams(window.location.hash.slice(1)); const query = new URLSearchParams(window.location.search); const token = hash.get('access_token'); const tokenHash = query.get('token_hash'); const errorCode = hash.get('error_code') || query.get('error_code'); if (token) setRecoveryToken(token); else if (tokenHash) await exchangeRecoveryToken(tokenHash); if (active) { setReady(Boolean(token || tokenHash) && !errorCode); if (errorCode) setError('El enlace expiró o ya fue utilizado. Solicita uno nuevo.'); } }; void prepare(); return () => { active = false; }; }, []);
  return <View className="mt-8 rounded-[26px] bg-white p-6"><Text className="text-2xl font-extrabold text-cocoa">Cambiar contraseña</Text><Text className="mt-2 text-sm leading-5 text-sand">Escribe una nueva contraseña para tu cuenta de administrador.</Text>{!ready && !error ? <Text className="mt-4 text-sm font-bold text-sand">Preparando el enlace seguro…</Text> : null}<TextInput editable={ready && !loading} value={password} onChangeText={value => { setPassword(value); setError(''); }} secureTextEntry autoCapitalize="none" placeholder="Nueva contraseña" placeholderTextColor="#B3A397" className="mt-6 rounded-2xl bg-[#FAF6F0] px-4 py-4 text-cocoa" /><TextInput editable={ready && !loading} value={confirmation} onChangeText={value => { setConfirmation(value); setError(''); }} secureTextEntry autoCapitalize="none" placeholder="Repite la contraseña" placeholderTextColor="#B3A397" className="mt-3 rounded-2xl bg-[#FAF6F0] px-4 py-4 text-cocoa" />{error ? <Text className="mt-2 text-sm font-bold text-terracotta">{error}</Text> : null}{message ? <Text className="mt-2 text-sm font-bold text-[#31834B]">{message}</Text> : null}<Pressable disabled={!ready || loading || Boolean(message)} onPress={save} className="mt-4 items-center rounded-2xl bg-cocoa px-4 py-4"><Text className="font-bold text-white">{loading ? 'Guardando…' : 'Guardar contraseña'}</Text></Pressable><Pressable onPress={onBack} className="mt-3 items-center px-4 py-3"><Text className="font-bold text-sand">Volver</Text></Pressable></View>;
}

function AdminGate({ onUnlock, onBack }: { onUnlock: () => void; onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forgot, setForgot] = useState(false);
  const [sent, setSent] = useState('');
  const [loading, setLoading] = useState(false);

  const submitSupabase = async () => {
    if (!isSupabaseConfigured) return setError('Falta configurar la conexión con Supabase.');
    setLoading(true); setError('');
    const { user, error: signInError } = await signInAdmin(email.trim(), password);
    if (signInError || !user) { console.error('Supabase sign-in error', signInError); setError(signInError?.message ? `Supabase: ${signInError.message}` : 'Supabase no devolvió una sesión.'); setLoading(false); return; }
    if (!(await isCurrentAdmin(user.id))) { signOutAdmin(); setError('Este usuario no tiene permisos de administrador.'); setLoading(false); return; }
    setLoading(false); onUnlock();
  };

  const recover = async () => {
    if (!isSupabaseConfigured || !email.trim()) return setError('Escribe tu correo de administrador.');
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : 'https://saboressanjose.netlify.app';
    const result = await requestPasswordReset(email.trim(), redirectTo);
    if (result.error) setError('No se pudo enviar el correo.');
    else { setError(''); setSent('Revisa tu correo y abre el enlace más reciente.'); }
  };

  return (
    <View className="mt-8 rounded-[26px] bg-white p-6">
      <Text className="text-2xl font-extrabold text-cocoa">{forgot ? 'Recuperar contraseña' : 'Acceso privado'}</Text>
      <Text className="mt-2 text-sm leading-5 text-sand">{forgot ? 'Te enviaremos un enlace para crear una nueva contraseña.' : 'Ingresa con tu cuenta de administrador.'}</Text>

      <>
          <TextInput
            value={email}
            onChangeText={value => { setEmail(value); setError(''); }}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Correo electrónico"
            placeholderTextColor="#B3A397"
            className="mt-4 rounded-2xl bg-[#FAF6F0] px-4 py-4 text-cocoa"
          />
          {!forgot && (
            <TextInput
              value={password}
              onChangeText={value => { setPassword(value); setError(''); }}
              onSubmitEditing={submitSupabase}
              secureTextEntry
              autoCapitalize="none"
              placeholder="Contraseña"
              placeholderTextColor="#B3A397"
              className="mt-3 rounded-2xl bg-[#FAF6F0] px-4 py-4 text-cocoa"
            />
          )}
          {error ? <Text className="mt-2 text-sm font-bold text-terracotta">{error}</Text> : null}
          {sent ? <Text className="mt-2 text-sm font-bold text-[#31834B]">{sent}</Text> : null}
          <Pressable disabled={loading} onPress={forgot ? recover : submitSupabase} className="mt-4 items-center rounded-2xl bg-cocoa px-4 py-4">
            <Text className="font-bold text-white">{forgot ? 'Enviar enlace' : loading ? 'Verificando...' : 'Entrar'}</Text>
          </Pressable>
          {!forgot && (
            <Pressable onPress={() => { setForgot(true); setError(''); }} className="mt-3 items-center px-4 py-3">
              <Text className="font-bold text-terracotta">¿Olvidaste tu contraseña?</Text>
            </Pressable>
          )}
        </>

      {forgot ? (
        <Pressable onPress={() => { setForgot(false); setError(''); setSent(''); }} className="mt-3 items-center px-4 py-3">
          <Text className="font-bold text-sand">Volver al inicio de sesión</Text>
        </Pressable>
      ) : null}

      <Pressable onPress={onBack} className="mt-2 items-center px-4 py-3">
        <Text className="font-bold text-sand">Volver a Inicio</Text>
      </Pressable>
    </View>
  );
}

function Home({ activeTab, menuProducts, menuCategories, favorites, toggleFavorite, onNavigate, onSaveProduct, onDeleteProduct, onCreateCategory, onEditCategory, onDeleteCategory, adminAuthenticated, onAdminUnlock, onAdminLogout }: { activeTab: NavTab; menuProducts: Product[]; menuCategories: typeof categories; favorites: string[]; toggleFavorite: (id: string) => void; onNavigate: (tab: NavTab) => void; onSaveProduct: (product: Product) => void; onDeleteProduct: (id: string) => void; onCreateCategory: (name: string, icon: string) => void; onEditCategory: (oldName: string, name: string, icon: string) => void; onDeleteCategory: (name: string) => void; adminAuthenticated: boolean; onAdminUnlock: () => void; onAdminLogout: () => void }) {
  const [category, setCategory] = useState<Category>('Todos');
  const [selected, setSelected] = useState<Product | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState<string[]>([]);
  const { addItem } = useCart();
  const [carouselIndex, setCarouselIndex] = useState(0);
  const visibleProducts = menuProducts.filter(product => product.available !== false);
  const carouselProducts = visibleProducts.filter(product => product.featured);
  const notifications = useMemo(() => {
    const items: { id: string; title: string; message: string; icon: LucideIcon }[] = [
      { id: 'menu-ready', title: 'Menú listo para ti', message: 'Explora nuestros platos y descubre tu próximo favorito.', icon: Sparkles },
    ];
    const featured = visibleProducts.find(product => product.featured);
    if (featured) items.push({ id: `featured-${featured.id}`, title: 'Favorito de la casa', message: `${featured.name} está entre nuestras recomendaciones.`, icon: Sparkles });
    visibleProducts.filter(product => product.promotion).slice(0, 3).forEach(product => items.push({ id: `promotion-${product.id}`, title: 'Promoción disponible', message: `${product.name}: ${product.promotion}`, icon: Tag }));
    return items;
  }, [visibleProducts]);
  const unreadCount = notifications.filter(item => !readNotifications.includes(item.id)).length;
  const greeting = new Date().getHours() < 12 ? '¡Hola, buenos días!' : new Date().getHours() < 18 ? '¡Hola, buenas tardes!' : '¡Hola, buenas noches!';
  useEffect(() => { AsyncStorage.getItem(NOTIFICATIONS_READ_STORAGE_KEY).then(value => { if (value) { const saved = JSON.parse(value); if (Array.isArray(saved)) setReadNotifications(saved.filter(item => typeof item === 'string')); } }).catch(error => console.warn('No se pudieron cargar las notificaciones', error)); }, []);
  const markNotificationsRead = () => { const ids = notifications.map(item => item.id); setReadNotifications(ids); void AsyncStorage.setItem(NOTIFICATIONS_READ_STORAGE_KEY, JSON.stringify(ids)); };
  useEffect(() => { const timer = carouselProducts.length ? setInterval(() => setCarouselIndex(index => (index + 1) % carouselProducts.length), 4800) : undefined; return () => { if (timer) clearInterval(timer); }; }, [carouselProducts.length]);
  const filtered = useMemo(() => activeTab === 'favorites' ? visibleProducts.filter(product => favorites.includes(product.id)) : visibleProducts.filter(product => category === 'Todos' || product.category === category), [activeTab, category, favorites, visibleProducts]);
  const isContact = activeTab === 'contact';
  const isAdmin = activeTab === 'admin';

  return <SafeAreaView edges={['top']} className="flex-1 bg-cream"><StatusBar barStyle="dark-content" /><View className="flex-1">
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 135 }}>
      <View className="px-5 pt-3"><View className="flex-row items-center justify-between"><Pressable onLongPress={() => onNavigate('admin')} delayLongPress={1800} accessibilityLabel="Logo de Sabores San José"><View className="flex-row items-center"><Image source={require('./logo/logosisanjose.png')} contentFit="contain" className="mr-3 h-14 w-14" /><View><Text className="text-[13px] text-sand">{greeting}</Text><Text className="mt-0.5 text-[24px] font-extrabold text-cocoa">Sabores <Text className="text-terracotta">San José</Text></Text></View></View></Pressable><View className="relative"><IconButton icon={Bell} accessibilityLabel="Notificaciones" onPress={() => setNotificationsOpen(current => !current)} />{unreadCount > 0 && <View className="absolute right-0 top-0 min-w-5 items-center rounded-full bg-terracotta px-1"><Text className="text-[10px] font-extrabold text-white">{unreadCount > 9 ? '9+' : unreadCount}</Text></View>}</View></View>
        {notificationsOpen && <View className="mt-3 rounded-[22px] bg-white p-4 shadow-sm"><View className="flex-row items-center justify-between"><View><Text className="text-lg font-extrabold text-cocoa">Notificaciones</Text><Text className="mt-0.5 text-xs text-sand">Avisos del menú para ti</Text></View><View className="flex-row items-center"><Pressable onPress={markNotificationsRead} className="mr-2 flex-row items-center rounded-full bg-[#F1E9DF] px-3 py-2"><CheckCheck size={14} color="#4A2810" /><Text className="ml-1 text-xs font-bold text-cocoa">Leer todo</Text></Pressable><Pressable onPress={() => setNotificationsOpen(false)} className="h-8 w-8 items-center justify-center rounded-full bg-[#FAF6F0]"><X size={16} color="#4A2810" /></Pressable></View></View><View className="mt-3">{notifications.map(item => { const NotificationIcon = item.icon; const isRead = readNotifications.includes(item.id); return <Pressable key={item.id} onPress={() => { if (!isRead) { const next = [...readNotifications, item.id]; setReadNotifications(next); void AsyncStorage.setItem(NOTIFICATIONS_READ_STORAGE_KEY, JSON.stringify(next)); } }} className={`mb-2 flex-row rounded-2xl p-3 ${isRead ? 'bg-[#FAF6F0]' : 'bg-[#FFF0EA]'}`}><View className="h-9 w-9 items-center justify-center rounded-full bg-white"><NotificationIcon size={17} color="#C85A32" /></View><View className="ml-3 flex-1"><Text className="font-bold text-cocoa">{item.title}</Text><Text className="mt-0.5 text-xs leading-4 text-sand">{item.message}</Text></View>{!isRead && <View className="mt-1 h-2 w-2 rounded-full bg-terracotta" />}</Pressable>; })}</View></View>}
        {isAdmin && !adminAuthenticated ? <AdminGate onUnlock={onAdminUnlock} onBack={() => onNavigate('home')} /> : isAdmin ? <AdminPanel products={menuProducts} categories={menuCategories} onSave={onSaveProduct} onDelete={onDeleteProduct} onCreateCategory={onCreateCategory} onEditCategory={onEditCategory} onDeleteCategory={onDeleteCategory} onLogout={onAdminLogout} /> : isContact ? <ContactContent /> : <>
          {activeTab !== 'favorites' && carouselProducts.length > 0 && <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 600 }} className="mt-5 overflow-hidden rounded-[26px] bg-cocoa"><Pressable onPress={() => setSelected(carouselProducts[carouselIndex % carouselProducts.length])} className="relative h-[205px]"><FoodImage uri={carouselProducts[carouselIndex % carouselProducts.length].image} emoji={carouselProducts[carouselIndex % carouselProducts.length].emoji} className="absolute inset-0 opacity-70" /><View className="absolute inset-0 bg-[#24150F]/45" /><View className="absolute inset-x-0 bottom-0 p-5"><Text className="font-bold uppercase tracking-[2px] text-[#FFE2D5]">Favoritos de la casa</Text><Text className="mt-1 max-w-[260px] text-[23px] font-extrabold leading-7 text-white">{carouselProducts[carouselIndex % carouselProducts.length].name}</Text><Text className="mt-1 max-w-[270px] text-sm text-[#FFE2D5]">{carouselProducts[carouselIndex % carouselProducts.length].description}</Text></View></Pressable><View className="absolute bottom-4 right-5 flex-row gap-1.5">{carouselProducts.map((item, index) => <Pressable key={item.id} onPress={() => setCarouselIndex(index)} className={`h-2 rounded-full ${index === carouselIndex % carouselProducts.length ? 'w-6 bg-white' : 'w-2 bg-white/50'}`} />)}</View></MotiView>}
          <View className="mt-6"><Text className="text-xl font-extrabold text-cocoa">{activeTab === 'favorites' ? 'Tus favoritos' : 'Explora el menú'}</Text>{activeTab !== 'favorites' && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingTop: 14, paddingBottom: 5 }}><View className="flex-row gap-2">{menuCategories.map(item => { const active = category === item.name; return <Pressable key={item.name} onPress={() => setCategory(item.name as Category)} className={`items-center rounded-2xl px-4 py-3 ${active ? 'bg-cocoa' : 'bg-white'}`}>{renderCategoryIcon(item.icon, 24, active ? 'white' : '#C85A32')}<Text className={`mt-1 max-w-[100px] text-center text-xs font-bold ${active ? 'text-white' : 'text-sand'}`}>{item.label ?? item.name}</Text></Pressable>; })}</View></ScrollView>}</View>
          <View className="mt-5"><View className="mb-3 flex-row items-end justify-between"><Text className="text-xl font-extrabold text-cocoa">{activeTab === 'favorites' ? 'Guardados para después' : 'Recomendados'}</Text><Text className="text-sm font-bold text-terracotta">{filtered.length} opciones</Text></View><View className="flex-row flex-wrap justify-between">{filtered.map(product => <ProductCard key={product.id} product={product} onPress={() => setSelected(product)} isFavorite={favorites.includes(product.id)} onToggleFavorite={() => toggleFavorite(product.id)} />)}</View>{filtered.length === 0 && <View className="items-center rounded-[24px] bg-white px-5 py-10"><Text className="text-3xl">♡</Text><Text className="mt-3 text-center font-bold text-cocoa">Todavía no tienes favoritos</Text><Text className="mt-1 text-center text-sm text-sand">Toca el corazón de un platillo para guardarlo aquí.</Text><Pressable onPress={() => onNavigate('menu')} className="mt-4 rounded-full bg-terracotta px-5 py-3"><Text className="font-bold text-white">Ver menú</Text></Pressable></View>}</View>
          {activeTab === 'home' && <View className="mt-7 mb-2 rounded-[24px] bg-white p-5"><Text className="text-lg font-extrabold text-cocoa">Visítanos o escríbenos</Text><Text className="mt-1 text-sm text-sand">Estamos listos para preparar algo especial para ti.</Text><Pressable onPress={() => Linking.openURL('tel:77756100')} className="mt-4 flex-row items-center rounded-2xl bg-[#F1E9DF] px-3 py-3"><Phone size={17} color="#C85A32" /><Text className="ml-2 text-sm font-bold text-cocoa">77756100</Text></Pressable><Text className="mt-5 text-lg font-extrabold text-cocoa">Ubicación del negocio</Text><Text className="mt-1 text-sm text-sand">Consulta el mapa directamente dentro de la app.</Text><MapEmbed /></View>}
        </>}
      </View>
    </ScrollView><CartBar bottom={12} />
    <ProductModal product={selected} onClose={() => setSelected(null)} onAdd={(options, notes) => { if (selected) addItem(selected, options, notes); setSelected(null); }} />
  </View></SafeAreaView>;
}

function ContactContent() {
  return <View className="mt-6 rounded-[26px] bg-white p-5"><View className="h-14 w-14 items-center justify-center rounded-full bg-[#F1E9DF]"><Phone size={25} color="#C85A32" /></View><Text className="mt-4 text-2xl font-extrabold text-cocoa">Contacta con nosotros</Text><Text className="mt-2 text-base leading-6 text-sand">¿Tienes una pregunta o quieres hacer un pedido especial? Estamos para ayudarte.</Text><Pressable onPress={() => Linking.openURL('tel:77756100')} className="mt-6 flex-row items-center rounded-2xl bg-cocoa px-4 py-4"><Phone size={19} color="white" /><Text className="ml-3 font-bold text-white">Llamar al 77756100</Text></Pressable><Pressable onPress={() => Linking.openURL('https://wa.me/50577756100')} className="mt-3 flex-row items-center rounded-2xl bg-whatsapp px-4 py-4"><Text className="text-lg">💬</Text><Text className="ml-3 font-bold text-white">Escribir por WhatsApp</Text></Pressable><View className="mt-6 flex-row items-start"><MapPin size={19} color="#C85A32" /><View className="ml-3 flex-1"><Text className="font-bold text-cocoa">Visítanos</Text><Text className="mt-1 text-sm leading-5 text-sand">Sabores San José · Nicaragua</Text></View></View><MapEmbed /></View>;
}

class AppErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Sabores San José render error', error, info); }
  render() { if (this.state.error) return <View style={{ flex: 1, padding: 32, justifyContent: 'center', backgroundColor: '#FAF6F0' }}><Text style={{ color: '#4A2810', fontSize: 24, fontWeight: '800' }}>No se pudo cargar la app</Text><Text style={{ color: '#8C7A6B', marginTop: 12 }}>{this.state.error.message}</Text></View>; return this.props.children; }
}

function AppShell() {
  const [showIntro, setShowIntro] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);
  useEffect(() => { if (typeof window !== 'undefined' && (window.location.hash.includes('type=recovery') || window.location.hash.includes('error_code=otp_expired'))) setRecoveryMode(true); }, []);
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [menuProducts, setMenuProducts] = useState<Product[]>(products);
  const [menuCategories, setMenuCategories] = useState(categories);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);
  useEffect(() => {
    // Cuando Supabase está configurado, es la fuente compartida de verdad.
    // No mezclamos ni cargamos la copia local en paralelo: esa copia pertenece
    // a cada dispositivo y podía devolver productos que ya fueron borrados.
    if (isSupabaseConfigured) {
      loadRemoteData().then(([productsResult, categoriesResult]) => {
        if (!productsResult.error && Array.isArray(productsResult.data)) {
          setMenuProducts(productsResult.data.map((row: any) => productFromDb(row)));
        }
        if (!categoriesResult.error && Array.isArray(categoriesResult.data)) {
          setMenuCategories([
            { name: 'Todos', label: 'Todo el menú', icon: 'sparkles' },
            ...categoriesResult.data
              .filter((item: any) => item.name !== 'Todos')
              .map((item: any) => ({ name: item.name, label: item.label ?? item.name, icon: item.icon ?? 'sparkles' })),
          ]);
        }
        setProductsLoaded(true);
      }).catch(error => {
        console.warn('No se pudieron cargar los datos de Supabase', error);
        setProductsLoaded(true);
      });
      return;
    }

    AsyncStorage.getItem('@sabores-san-jose/products')
      .then(value => {
        if (value) {
          const savedProducts: unknown = JSON.parse(value);
          if (Array.isArray(savedProducts)) setMenuProducts(savedProducts as Product[]);
        }
        setProductsLoaded(true);
      })
      .catch(error => {
        console.warn('No se pudieron cargar los productos', error);
        setProductsLoaded(true);
      });
  }, []);
  useEffect(() => {
    AsyncStorage.getItem(FAVORITES_STORAGE_KEY)
      .then(value => {
        if (value) {
          const savedFavorites: unknown = JSON.parse(value);
          if (Array.isArray(savedFavorites) && savedFavorites.every(item => typeof item === 'string')) {
            setFavorites(savedFavorites);
          }
        }
        setFavoritesLoaded(true);
      })
      .catch(error => {
        console.warn('No se pudieron cargar los favoritos', error);
        setFavoritesLoaded(true);
      });
  }, []);
  useEffect(() => {
    if (!favoritesLoaded) return;
    AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites))
      .catch(error => console.warn('No se pudieron guardar los favoritos', error));
  }, [favorites, favoritesLoaded]);
  useEffect(() => {
    if (!productsLoaded || isSupabaseConfigured) return;
    AsyncStorage.setItem('@sabores-san-jose/products', JSON.stringify(menuProducts))
      .catch(error => console.warn('No se pudieron guardar los productos', error));
  }, [menuProducts, productsLoaded]);
  useEffect(() => {
    if (isSupabaseConfigured) return;
    AsyncStorage.getItem(CATEGORIES_STORAGE_KEY).then(value => {
      if (value) {
        const saved = JSON.parse(value);
        if (Array.isArray(saved) && saved.some(item => item?.name === 'Todos')) setMenuCategories(saved);
      }
    }).catch(error => console.warn('No se pudieron cargar las categorías', error));
  }, []);
  useEffect(() => { if (!isSupabaseConfigured) AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(menuCategories)).catch(error => console.warn('No se pudieron guardar las categorías', error)); }, [menuCategories]);
  const saveProduct = (product: Product) => { setMenuProducts(current => current.some(item => item.id === product.id) ? current.map(item => item.id === product.id ? product : item) : [...current, product]); void saveRemoteProduct(productToDb(product)); };
  const deleteProduct = (id: string) => { setMenuProducts(current => current.filter(product => product.id !== id)); void deleteRemoteProduct(id); };
  const createCategory = (name: string, icon: string) => { const category = { name, label: name, icon }; setMenuCategories(current => [...current, category]); void saveRemoteCategory(category); };
  const editCategory = (oldName: string, name: string, icon: string) => {
    setMenuCategories(current => current.map(category => category.name === oldName ? { ...category, name, label: name, icon } : category));
    setMenuProducts(current => current.map(product => product.category === oldName ? { ...product, category: name as Product['category'] } : product));
    if (oldName === name) {
      void saveRemoteCategory({ name, label: name, icon });
    } else {
      void (async () => {
        await deleteRemoteCategory(oldName);
        await saveRemoteCategory({ name, label: name, icon });
      })();
    }
    menuProducts.filter(product => product.category === oldName).forEach(product => void saveRemoteProduct(productToDb({ ...product, category: name as Product['category'] })));
  };
  const deleteCategory = (name: string) => { if (menuProducts.some(product => product.category === name)) return; setMenuCategories(current => current.filter(category => category.name !== name)); void deleteRemoteCategory(name); };
  const toggleFavorite = (id: string) => setFavorites(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const isDesktop = width >= 900;
  const navigate = (tab: NavTab) => { setActiveTab(tab); if (tab !== 'admin') setAdminAuthenticated(false); };
  if (recoveryMode) return <SafeAreaView className="flex-1 bg-cream"><ScrollView contentContainerStyle={{ padding: 20 }}><PasswordRecovery onBack={() => { if (typeof window !== 'undefined') window.history.replaceState({}, '', window.location.pathname); setRecoveryMode(false); }} /></ScrollView></SafeAreaView>;
  return showIntro ? <BrandIntro onFinish={() => setShowIntro(false)} /> : <View className="flex-1 bg-cream" style={isDesktop ? { flexDirection: 'row' } : undefined}><Home activeTab={activeTab} menuProducts={menuProducts} menuCategories={menuCategories} favorites={favorites} toggleFavorite={toggleFavorite} onNavigate={navigate} onSaveProduct={saveProduct} onDeleteProduct={deleteProduct} onCreateCategory={createCategory} onEditCategory={editCategory} onDeleteCategory={deleteCategory} adminAuthenticated={adminAuthenticated} onAdminUnlock={() => setAdminAuthenticated(true)} onAdminLogout={() => { signOutAdmin(); navigate('home'); }} /><BottomNav activeTab={activeTab} onChange={navigate} /></View>;
}

export default function App() { return <AppErrorBoundary><SafeAreaProvider><CartProvider><AppShell /></CartProvider></SafeAreaProvider></AppErrorBoundary>; }
