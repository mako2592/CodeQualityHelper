import { describe, expect, it } from 'vitest';
import { addItem, createCart, itemCount, removeItem, subtotal } from './cart';

describe('cart', () => {
  it('starts empty', () => {
    const cart = createCart();
    expect(cart.items).toEqual([]);
    expect(itemCount(cart)).toBe(0);
    expect(subtotal(cart)).toBe(0);
  });

  it('adds a new item with default quantity 1', () => {
    const cart = addItem(createCart(), 'apple', 1.5);
    expect(cart.items).toEqual([{ sku: 'apple', price: 1.5, quantity: 1 }]);
  });

  it('increases quantity of an existing item and leaves others untouched', () => {
    let cart = addItem(createCart(), 'apple', 1.5, 2);
    cart = addItem(cart, 'pear', 2);
    cart = addItem(cart, 'apple', 1.5, 3);
    expect(cart.items).toEqual([
      { sku: 'apple', price: 1.5, quantity: 5 },
      { sku: 'pear', price: 2, quantity: 1 },
    ]);
  });

  it('does not mutate the original cart', () => {
    const cart = addItem(createCart(), 'apple', 1.5);
    addItem(cart, 'apple', 1.5);
    expect(cart.items[0].quantity).toBe(1);
  });

  it('rejects non-positive quantity', () => {
    expect(() => addItem(createCart(), 'apple', 1, 0)).toThrow('Quantity must be positive');
    expect(() => addItem(createCart(), 'apple', 1, -1)).toThrow('Quantity must be positive');
  });

  it('rejects negative price but allows free items', () => {
    expect(() => addItem(createCart(), 'apple', -0.01)).toThrow('Price cannot be negative');
    expect(addItem(createCart(), 'gift', 0).items).toHaveLength(1);
  });

  it('removes an item by sku', () => {
    let cart = addItem(createCart(), 'apple', 1.5);
    cart = addItem(cart, 'pear', 2);
    expect(removeItem(cart, 'apple').items).toEqual([{ sku: 'pear', price: 2, quantity: 1 }]);
  });

  it('counts items and computes rounded subtotal', () => {
    let cart = addItem(createCart(), 'apple', 0.1, 3);
    cart = addItem(cart, 'pear', 2.25, 2);
    expect(itemCount(cart)).toBe(5);
    expect(subtotal(cart)).toBe(4.8);
  });
});
