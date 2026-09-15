# Sabores San José

Aplicación móvil Expo para restaurante, construida con React Native, NativeWind v4, Moti, Expo Image, Expo Blur y Lucide.

## Arranque

```bash
npm install
npx expo start
```

Para Android o iOS: `npm run android` o `npm run ios`.

## Estructura

- `App.tsx`: pantalla principal y composición de la experiencia.
- `src/data/products.ts`: catálogo, categorías y URLs de imágenes.
- `src/context/CartContext.tsx`: estado del carrito.
- `src/components/ProductModal.tsx`: opciones, extras y notas.
- `src/components/CartBar.tsx`: resumen y checkout por WhatsApp.

Antes de publicar, reemplaza `PHONE` en `src/components/CartBar.tsx` por el número real de WhatsApp del restaurante.