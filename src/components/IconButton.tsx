import React from 'react';
import { Pressable, PressableProps } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

export function IconButton({ icon: Icon, size = 20, color = '#4A2810', className = '', ...props }: PressableProps & { icon: LucideIcon; size?: number; color?: string }) {
  return <Pressable accessibilityRole="button" className={`h-11 w-11 items-center justify-center rounded-full bg-white/80 ${className}`} {...props}><Icon size={size} color={color} strokeWidth={2.2} /></Pressable>;
}
