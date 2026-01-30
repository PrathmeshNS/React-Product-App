import React, { createContext, useContext, useEffect, useState } from "react";
import { getFavorites as storageGetFavorites, toggleFavorite as storageToggleFavorite } from "../storage/favoritesStorage";

const FavoritesContext = createContext({
  favorites: [],
  toggleFavorite: async () => {},
  isFavorite: (id) => false,
  count: 0,
});

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    (async () => {
      const f = await storageGetFavorites();
      setFavorites(f);
    })();
  }, []);

  const toggleFavorite = async (product) => {
    const updated = await storageToggleFavorite(product);
    setFavorites(updated);
    return updated;
  };

  const isFavorite = (id) => favorites.some((p) => p.id === id);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, count: favorites.length }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
