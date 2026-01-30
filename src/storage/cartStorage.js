import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_KEY = 'cart_items_v1';

export const getCart = async () => {
  try {
    const raw = await AsyncStorage.getItem(CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('getCart error', e);
    return [];
  }
};

export const saveCart = async (items) => {
  try {
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('saveCart error', e);
  }
};

export const addToCart = async (product) => {
  try {
    const items = await getCart();
    // avoid duplicates by product id
    const exists = items.find((i) => i.id === product.id);
    if (exists) return items; // no-op

    const next = [...items, { ...product, quantity: 1 }];
    await saveCart(next);
    return next;
  } catch (e) {
    console.warn('addToCart error', e);
    return [];
  }
};

export const removeFromCart = async (productId) => {
  try {
    const items = await getCart();
    const next = items.filter((i) => i.id !== productId);
    await saveCart(next);
    return next;
  } catch (e) {
    console.warn('removeFromCart error', e);
    return [];
  }
};

export const isInCart = async (productId) => {
  const items = await getCart();
  return items.some((i) => i.id === productId);
};

export const clearCart = async () => {
  try {
    await saveCart([]);
  } catch (e) {
    console.warn('clearCart error', e);
  }
};
