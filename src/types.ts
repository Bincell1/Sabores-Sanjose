export type Category = 'Todos' | 'Almuerzos' | 'Pizzas' | 'Carta' | 'Sopas' | 'Cenas' | 'Postres';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Exclude<Category, 'Todos'>;
  emoji: string;
  image: string;
  featured?: boolean;
  available?: boolean;
  promotion?: string;
  sizePrices?: Record<string, number>;
  options?: { label: string; values: string[] }[];
};

export type CartItem = Product & { quantity: number; selectedOptions: Record<string, string>; notes?: string };
