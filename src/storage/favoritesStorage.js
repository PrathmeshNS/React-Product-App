import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "FAVORITES";

export const getFavorites = async () => {
  const data = await AsyncStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
};

export const toggleFavorite = async (product) => {
  const favorites = await getFavorites();
  const exists = favorites.find(p => p.id === product.id);

  const updated = exists
    ? favorites.filter(p => p.id !== product.id)
    : [...favorites, product];

  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
};
