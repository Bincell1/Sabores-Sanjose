import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Text, View } from 'react-native';
import { Image } from 'expo-image';

export function BrandIntro({ onFinish }: { onFinish: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.82)).current;
  const translateY = useRef(new Animated.Value(18)).current;
  const haloScale = useRef(new Animated.Value(0.72)).current;
  const finished = useRef(false);

  const finishIntro = () => {
    if (finished.current) return;
    finished.current = true;
    onFinish();
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }),
      Animated.spring(scale, { toValue: 1, friction: 7, tension: 45, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(translateY, { toValue: 0, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(haloScale, { toValue: 1.12, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: Platform.OS !== 'web' }),
    ]).start();

    const exitTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 420, easing: Easing.in(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(translateY, { toValue: -18, duration: 420, easing: Easing.in(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }),
      ]).start(finishIntro);
    }, 1750);
    // Fallback for Expo Go/native animation edge cases: the app must never remain on the intro.
    const fallbackTimer = setTimeout(finishIntro, 2600);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(fallbackTimer);
    };
  }, [haloScale, opacity, scale, translateY]);

  return <View className="absolute inset-0 z-50 items-center justify-center overflow-hidden bg-cream">
    <Animated.View style={{ transform: [{ scale: haloScale }] }} className="absolute h-[330px] w-[330px] rounded-full bg-[#E8D3BF] opacity-40" />
    <Animated.View style={{ opacity, transform: [{ translateY }, { scale }] }} className="items-center">
      <Image source={require('../../logo/logosisanjose.png')} contentFit="contain" transition={300} className="h-[285px] w-[285px]" />
    </Animated.View>
  </View>;
}
