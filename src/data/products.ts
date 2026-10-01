import { Product } from '../types';

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=85`;
const pizzaSizeOption = { label: 'Pedazos', values: ['8', '10', '12', '16'] };

export const products: Product[] = [
  { id: 'pizza-san-jose', name: 'Pizza San José', description: 'Pepperoni, jamón, champiñones y mozzarella.', price: 280, category: 'Pizzas', emoji: '🍕', featured: true, image: photo('photo-1574071318508-1cdbab80d002'), options: [pizzaSizeOption, { label: 'Masa', values: ['Clásica', 'Delgada'] }] },
  { id: 'sopa-mondongo', name: 'Sopa de Mondongo', description: 'Receta casera con verduras y hierbabuena.', price: 180, category: 'Sopas', emoji: '🥣', image: photo('photo-1547592180-85f173990554') },
  { id: 'pollo-plancha', name: 'Pollo a la Plancha', description: 'Pechuga dorada, arroz, ensalada y tajadas.', price: 220, category: 'Almuerzos', emoji: '🍗', image: photo('photo-1532550907401-a500c9a57435') },
  { id: 'lasagna-casa', name: 'Lasaña de la Casa', description: 'Capas de pasta, carne sazonada y queso gratinado.', price: 240, category: 'Carta', emoji: '🍝', image: photo('photo-1574894709920-11b28e7367e3') },
  { id: 'carne-asada', name: 'Carne Asada', description: 'Corte suave con chimichurri, gallo pinto y queso.', price: 290, category: 'Carta', emoji: '🥩', image: photo('photo-1544025162-d76694265947') },
  { id: 'tostones-ropa', name: 'Tostones con Ropa Vieja', description: 'Crujientes tostones, carne mechada y aguacate.', price: 190, category: 'Cenas', emoji: '🌙', image: photo('photo-1601050690597-df0568f70950') },
  { id: 'tres-leches', name: 'Tres Leches Casero', description: 'Suave, cremoso y con canela recién espolvoreada.', price: 95, category: 'Postres', emoji: '🍰', image: photo('photo-1571877227200-a0d98ea607e9') },
  { id: 'limonada', name: 'Limonada con Hierbabuena', description: 'Refrescante, natural y preparada al momento.', price: 65, category: 'Postres', emoji: '🥤', image: photo('photo-1513558161293-cdaf765ed2fd') },
  { id: 'desayuno-tipico', name: 'Desayuno Típico', description: 'Gallo pinto, huevo, queso, tajadas y crema.', price: 160, category: 'Almuerzos', emoji: '🍳', image: photo('photo-1533089860892-a7c6f0a88666') },
  { id: 'pizza-carnes', name: 'Pizza Tres Carnes', description: 'Pepperoni, jamón, salami y mozzarella fundida.', price: 320, category: 'Pizzas', emoji: '🍕', image: photo('photo-1593560708920-61dd98c8c8d4'), options: [pizzaSizeOption] },
  { id: 'hamburguesa-san-jose', name: 'Hamburguesa San José', description: 'Carne artesanal, queso, vegetales y papas caseras.', price: 230, category: 'Cenas', emoji: '🍔', image: photo('photo-1568901346375-23c9450c58cd') },
  { id: 'pollo-churrasco', name: 'Pollo en Salsa Criolla', description: 'Pollo jugoso en salsa de la casa, arroz y ensalada.', price: 210, category: 'Carta', emoji: '🍗', image: photo('photo-1601050690597-df0568f70950') },
  { id: 'sopa-res', name: 'Sopa de Res', description: 'Caldo sustancioso con verduras frescas y hierbas.', price: 190, category: 'Sopas', emoji: '🥣', image: photo('photo-1603105037880-880cd4edfb0d') },
  { id: 'cheesecake-casa', name: 'Cheesecake de la Casa', description: 'Cremoso, suave y servido con salsa de frutos rojos.', price: 110, category: 'Postres', emoji: '🍓', image: photo('photo-1565958011703-44f9829ba187') },
];

export const categories = [
  { name: 'Todos', label: 'Todo el menú', icon: 'sparkles' },
  { name: 'Almuerzos', label: 'Almuerzos Ejecutivos', icon: 'utensils' },
  { name: 'Pizzas', label: 'Pizzas Artesanales', icon: 'pizza' },
  { name: 'Carta', label: 'Platos a la Carta', icon: 'beef' },
  { name: 'Sopas', label: 'Sopas & Caldos', icon: 'soup' },
  { name: 'Cenas', label: 'Cenas & Antojitos', icon: 'moon' },
  { name: 'Postres', label: 'Postres & Bebidas', icon: 'cup-soda' },
];
