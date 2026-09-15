import React from 'react';
import { Linking, Platform, Pressable, Text, View } from 'react-native';
import { ExternalLink, MapPin } from 'lucide-react-native';
import { WebView } from 'react-native-webview';

export const MAP_EMBED_URL = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3894.25486962528!2d-86.9704852!3d12.5654388!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f70e32244c3f72f%3A0xa37318d842cbade5!2sRpto.Divina%20misericordia!5e0!3m2!1ses!2sni!4v1789438936913!5m2!1ses!2sni';
const MAP_LINK = 'https://maps.app.goo.gl/hveBWyArtR6zeJ8L6?g_st=ac';

export function MapEmbed() {
  return <View className="mt-4 overflow-hidden rounded-[22px] border border-[#E8D3BF] bg-[#F1E9DF]">
    <View className="flex-row items-center px-4 py-3"><MapPin size={18} color="#C85A32" /><Text className="ml-2 font-bold text-cocoa">Rpto. Divina Misericordia</Text></View>
    {Platform.OS === 'web'
      ? React.createElement('iframe', { src: MAP_EMBED_URL, title: 'Ubicación de Sabores San José', style: { width: '100%', height: 190, border: 0 }, loading: 'lazy', allowFullScreen: true })
      : <WebView source={{ uri: MAP_EMBED_URL }} originWhitelist={['*']} style={{ height: 190, backgroundColor: '#F1E9DF' }} />}
    <Pressable onPress={() => Linking.openURL(MAP_LINK)} className="flex-row items-center justify-center px-4 py-3"><ExternalLink size={16} color="#C85A32" /><Text className="ml-2 text-sm font-bold text-terracotta">Abrir ubicación completa</Text></Pressable>
  </View>;
}
