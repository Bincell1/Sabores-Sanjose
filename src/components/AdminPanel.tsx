import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Beef, Check, CupSoda, LucideIcon, Moon, Pencil, Pizza, Plus, Save, Soup, Sparkles, Trash2, Utensils, X } from 'lucide-react-native';
import { FoodImage } from './FoodImage';
import { Product } from '../types';

type AdminCategory = { name: string; label: string; icon: string };
const categoryIconOptions: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: 'sparkles', label: 'Especial', Icon: Sparkles },
  { key: 'utensils', label: 'Almuerzo', Icon: Utensils },
  { key: 'pizza', label: 'Pizza', Icon: Pizza },
  { key: 'beef', label: 'Carnes', Icon: Beef },
  { key: 'soup', label: 'Sopa', Icon: Soup },
  { key: 'moon', label: 'Cena', Icon: Moon },
  { key: 'cup-soda', label: 'Bebida', Icon: CupSoda },
];
const PIZZA_SIZES = ['8', '10', '12', '16'];
const isPizza = (category: string) => category.trim().toLowerCase().includes('pizza');

export function AdminPanel({ products, categories, onSave, onDelete, onCreateCategory, onEditCategory, onDeleteCategory, onLogout }: { products: Product[]; categories: AdminCategory[]; onSave: (product: Product) => void; onDelete: (id: string) => void; onCreateCategory: (name: string, icon: string) => void; onEditCategory: (oldName: string, name: string, icon: string) => void; onDeleteCategory: (name: string) => void; onLogout: () => void }) {
  const [filter, setFilter] = useState('Todos');
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('🍽️');
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const visible = useMemo(() => filter === 'Todos' ? products : products.filter(product => product.category === filter), [products, filter]);
  const createCategory = () => { const name = newCategory.trim().replace(/\s+/g, ' '); const icon = newCategoryIcon.trim() || '🍽️'; if (!name || name.toLowerCase() === 'todos' || categories.some(item => item.name.toLowerCase() === name.toLowerCase())) return; onCreateCategory(name, icon); setNewCategory(''); setNewCategoryIcon('🍽️'); };
  const saveCategory = () => {
    if (!editingCategory) return;
    const name = editingCategory.name.trim().replace(/\s+/g, ' ');
    const oldCategory = categories.find(item => item.name === editingCategory.name);
    if (!name || name.toLowerCase() === 'todos' || !oldCategory || categories.some(item => item.name !== oldCategory.name && item.name.toLowerCase() === name.toLowerCase())) return;
    onEditCategory(oldCategory.name, name, editingCategory.icon?.trim() || '🍽️');
    setEditingCategory(null);
  };
  const save = () => {
    if (!editing?.name.trim() || !editing.description.trim() || !editing.price || !editing.image.trim()) return;
    const pizza = isPizza(editing.category);
    const sizePrices = pizza ? Object.fromEntries(PIZZA_SIZES.filter(size => editing.sizePrices?.[size]).map(size => [size, Number(editing.sizePrices?.[size])])) : undefined;
    const options = pizza
      ? [{ label: 'Pedazos', values: PIZZA_SIZES }, ...(editing.options ?? []).filter(option => option.label !== 'Pedazos')]
      : (editing.options ?? []).filter(option => option.label !== 'Pedazos');
    onSave({ ...editing, name: editing.name.trim(), description: editing.description.trim(), image: editing.image.trim(), price: Number(editing.price), sizePrices, options: options.length ? options : undefined });
    setEditing(null);
  };
  const chooseCategory = (category: string) => setEditing(current => current ? { ...current, category, ...(isPizza(category) ? { options: [{ label: 'Pedazos', values: PIZZA_SIZES }, ...(current.options ?? []).filter(option => option.label !== 'Pedazos')] } : { sizePrices: undefined, options: (current.options ?? []).filter(option => option.label !== 'Pedazos') }) } : current);

  if (editing) return <View className="mt-6 rounded-[26px] bg-white p-5">
    <View className="flex-row items-center justify-between"><Text className="text-2xl font-extrabold text-cocoa">Editar producto</Text><Pressable onPress={() => setEditing(null)} className="h-10 w-10 items-center justify-center rounded-full bg-[#F1E9DF]"><X size={19} color="#4A2810" /></Pressable></View>
    <Text className="mb-1 mt-5 text-sm font-bold text-cocoa">Nombre</Text><TextInput value={editing.name} onChangeText={name => setEditing({ ...editing, name })} className="rounded-2xl bg-[#FAF6F0] px-4 py-3 text-cocoa" />
    <Text className="mb-1 mt-4 text-sm font-bold text-cocoa">Descripción</Text><TextInput value={editing.description} onChangeText={description => setEditing({ ...editing, description })} multiline className="min-h-20 rounded-2xl bg-[#FAF6F0] px-4 py-3 text-cocoa" />
    <Text className="mb-1 mt-4 text-sm font-bold text-cocoa">{isPizza(editing.category) ? 'Precio base (8 slices)' : 'Precio (C$)'}</Text><TextInput value={String(editing.price || '')} onChangeText={price => setEditing({ ...editing, price: Number(price.replace(/[^0-9.]/g, '')) || 0 })} keyboardType="numeric" className="rounded-2xl bg-[#FAF6F0] px-4 py-3 text-cocoa" />
    <Text className="mb-2 mt-4 text-sm font-bold text-cocoa">Categoría</Text><ScrollView horizontal><View className="flex-row gap-2">{categories.filter(item => item.name !== 'Todos').map(item => <Pressable key={item.name} onPress={() => chooseCategory(item.name)} className={`rounded-full px-4 py-2 ${editing.category === item.name ? 'bg-terracotta' : 'bg-[#F1E9DF]'}`}><Text className="font-bold text-cocoa">{item.label}</Text></Pressable>)}</View></ScrollView>
    {isPizza(editing.category) && <View className="mt-5 rounded-2xl bg-[#FFF6F0] p-4"><Text className="font-bold text-cocoa">Precios por porción</Text><Text className="mt-1 text-xs text-sand">Define cuánto cuesta esta pizza según la cantidad de slices.</Text><View className="mt-3 flex-row flex-wrap justify-between">{PIZZA_SIZES.map(size => <View key={size} className="mb-3 w-[48%]"><Text className="mb-1 text-xs font-bold text-cocoa">{size} slices (C$)</Text><TextInput value={editing.sizePrices?.[size] ? String(editing.sizePrices[size]) : ''} onChangeText={value => setEditing({ ...editing, sizePrices: { ...(editing.sizePrices ?? {}), [size]: Number(value.replace(/[^0-9.]/g, '')) || 0 } })} keyboardType="numeric" placeholder="Ej. 280" placeholderTextColor="#B5A69A" className="rounded-2xl bg-white px-4 py-3 text-cocoa" /></View>)}</View></View>}
    <Pressable onPress={() => setEditing({ ...editing, featured: !editing.featured })} className={`mt-5 flex-row items-center rounded-2xl border px-4 py-3 ${editing.featured ? 'border-terracotta bg-[#FCE9E2]' : 'border-[#E8DED3] bg-[#FAF6F0]'}`}><View className={`mr-3 h-6 w-6 items-center justify-center rounded-md border ${editing.featured ? 'border-terracotta bg-terracotta' : 'border-[#B5A69A] bg-white'}`}>{editing.featured && <Check size={16} color="white" strokeWidth={3} />}</View><View><Text className="font-bold text-cocoa">Favorito de la casa</Text><Text className="mt-0.5 text-xs text-sand">Mostrar este producto en la sección destacada</Text></View></Pressable>
    <Text className="mb-1 mt-4 text-sm font-bold text-cocoa">URL de imagen</Text><TextInput value={editing.image} onChangeText={image => setEditing({ ...editing, image })} autoCapitalize="none" className="rounded-2xl bg-[#FAF6F0] px-4 py-3 text-cocoa" />
    <Pressable onPress={save} className="mt-6 flex-row items-center justify-center rounded-2xl bg-terracotta px-5 py-4"><Save size={18} color="white" /><Text className="ml-2 font-bold text-white">Guardar cambios</Text></Pressable>
  </View>;

  return <View className="mt-6 rounded-[26px] bg-white p-5">
    <View className="flex-row items-center justify-between"><View><Text className="text-2xl font-extrabold text-cocoa">Administrador</Text><Text className="mt-1 text-sm text-sand">{visible.length} productos en la vista</Text></View><View className="flex-row items-center"><Pressable onPress={onLogout} className="mr-2 rounded-full bg-[#F1E9DF] px-3 py-3"><Text className="text-xs font-bold text-cocoa">Salir</Text></Pressable><Pressable onPress={() => setEditing({ id: `producto-${Date.now()}`, name: '', description: '', price: 0, category: (filter === 'Todos' ? categories[1]?.name : filter) as Product['category'], emoji: '🍽️', image: '', available: true })} className="flex-row items-center rounded-full bg-terracotta px-4 py-3"><Plus size={17} color="white" /><Text className="ml-1 font-bold text-white">Nuevo</Text></Pressable></View></View>
    <Text className="mb-2 mt-6 text-sm font-bold text-cocoa">Buscar por categoría</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}><View className="flex-row gap-2">{categories.map(item => <Pressable key={item.name} onPress={() => setFilter(item.name)} className={`rounded-full px-4 py-2 ${filter === item.name ? 'bg-cocoa' : 'bg-[#F1E9DF]'}`}><Text className={`font-bold ${filter === item.name ? 'text-white' : 'text-cocoa'}`}>{item.name === 'Todos' ? 'Todas' : item.label}</Text></Pressable>)}</View></ScrollView>
    <View className="mt-5 rounded-2xl bg-[#FAF6F0] p-4"><Text className="font-bold text-cocoa">Gestionar categorías</Text><View className="mt-3 flex-row"><TextInput value={newCategory} onChangeText={setNewCategory} onSubmitEditing={createCategory} placeholder="Ej. Bebidas frías" placeholderTextColor="#B5A69A" className="flex-1 rounded-2xl bg-white px-4 py-3 text-cocoa" /><Pressable onPress={createCategory} className="ml-2 items-center justify-center rounded-2xl bg-cocoa px-4"><Plus size={19} color="white" /></Pressable></View><Text className="mb-1 mt-4 text-xs font-bold text-sand">Emoji de la sección</Text><Text className="text-xs text-sand">Presiona Windows + . para elegir un emoji</Text><TextInput value={newCategoryIcon} onChangeText={setNewCategoryIcon} placeholder="Ej. 🍔" placeholderTextColor="#B5A69A" className="mt-2 rounded-2xl bg-white px-4 py-3 text-2xl text-cocoa" />{editingCategory && <View className="mt-4 rounded-2xl bg-white p-3"><View className="flex-row items-center justify-between"><Text className="font-bold text-cocoa">Editar categoría</Text><Pressable onPress={() => setEditingCategory(null)}><X size={18} color="#8C7A6B" /></Pressable></View><TextInput value={editingCategory.name} onChangeText={name => setEditingCategory({ ...editingCategory, name })} placeholder="Nombre de la categoría" placeholderTextColor="#B5A69A" className="mt-3 rounded-2xl bg-[#FAF6F0] px-4 py-3 text-cocoa" /><Text className="mb-1 mt-3 text-xs font-bold text-sand">Emoji de la sección</Text><Text className="text-xs text-sand">Presiona Windows + . para elegir un emoji</Text><TextInput value={editingCategory.icon} onChangeText={icon => setEditingCategory({ ...editingCategory, icon })} placeholder="Ej. 🍔" placeholderTextColor="#B5A69A" className="mt-2 rounded-2xl bg-[#FAF6F0] px-4 py-3 text-2xl text-cocoa" /><Pressable onPress={saveCategory} className="mt-3 items-center rounded-2xl bg-terracotta px-4 py-3"><Text className="font-bold text-white">Guardar categoría</Text></Pressable></View>}<View className="mt-3 flex-row flex-wrap gap-2">{categories.filter(item => item.name !== 'Todos').map(item => { const option = categoryIconOptions.find(icon => icon.key === item.icon); const canDelete = !item.name.toLowerCase().includes('pizza'); return <View key={item.name} className="flex-row items-center rounded-full bg-white px-3 py-2">{option ? <option.Icon size={14} color="#C85A32" /> : <Text className="text-base">{item.icon || '🍽️'}</Text>}<Text className="ml-1 text-xs font-bold text-cocoa">{item.label}</Text><Pressable onPress={() => setEditingCategory({ ...item })} className="ml-2"><Pencil size={13} color="#4A2810" /></Pressable>{canDelete && <Pressable onPress={() => onDeleteCategory(item.name)} className="ml-2"><X size={14} color="#C85A32" /></Pressable>}</View>; })}</View><Text className="mt-3 text-xs text-sand">La sección de pizzas se conserva para que puedas agregar pizzas con tamaños y precios por porción.</Text></View>
    <View className="mt-5 gap-3">{visible.map(product => <View key={product.id} className="flex-row items-center rounded-2xl bg-[#FAF6F0] p-3"><FoodImage uri={product.image} emoji={product.emoji} className="mr-3 h-14 w-14 rounded-xl" /><View className="flex-1"><Text className="font-bold text-cocoa">{product.name}</Text><Text className="mt-1 text-xs text-sand">C$ {product.price} · {product.category}</Text>{product.featured && <Text className="mt-1 self-start rounded-full bg-[#FFF0C7] px-2 py-1 text-[10px] font-bold text-[#9A6D10]">Favorito de la casa</Text>}</View><Pressable onPress={() => setEditing({ ...product })} className="mr-2 h-10 w-10 items-center justify-center rounded-full bg-white"><Pencil size={17} color="#4A2810" /></Pressable><Pressable onPress={() => onDelete(product.id)} className="h-10 w-10 items-center justify-center rounded-full bg-[#FCE9E2]"><Trash2 size={17} color="#C85A32" /></Pressable></View>)}</View>
  </View>;
}
