export interface CartItem {
  sku: string;
  price: number;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
}

export function createCart(): Cart {
  return { items: [] };
}

export function addItem(cart: Cart, sku: string, price: number, quantity = 1): Cart {
  if (quantity <= 0) {
    throw new Error('Quantity must be positive');
  }
  if (price < 0) {
    throw new Error('Price cannot be negative');
  }

  const existing = cart.items.find((item) => item.sku === sku);
  if (existing) {
    return {
      items: cart.items.map((item) =>
        item.sku === sku ? { ...item, quantity: item.quantity + quantity } : item,
      ),
    };
  }
  return { items: [...cart.items, { sku, price, quantity }] };
}

export function removeItem(cart: Cart, sku: string): Cart {
  return { items: cart.items.filter((item) => item.sku !== sku) };
}

export function itemCount(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function subtotal(cart: Cart): number {
  const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return Math.round(total * 100) / 100;
}
