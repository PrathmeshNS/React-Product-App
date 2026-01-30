import React, { useState, useCallback } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  StatusBar, 
  TouchableOpacity 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFavorites } from "../context/FavoritesContext";
import ProductCard from "../components/ProductCard";

export default function FavoritesScreen({ navigation }) {
  const { favorites, toggleFavorite } = useFavorites();

  const handleRemoveFavorite = async (product) => {
    await toggleFavorite(product);
    // Favorites context will update the UI automatically
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <Text style={styles.headerSubtitle}>
            {favorites.length} {favorites.length === 1 ? 'Item' : 'Items'} Saved
        </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      <FlatList
        data={favorites}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={favorites.length > 0 ? renderHeader : null}
        showsVerticalScrollIndicator={false}
        
        // Beautiful Empty State
        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>💔</Text>
                <Text style={styles.emptyTitle}>No favorites yet</Text>
                <Text style={styles.emptySubtitle}>
                    Save items you love to revisit them later.
                </Text>
                <TouchableOpacity 
                    style={styles.exploreButton}
                    onPress={() => navigation.navigate("HomeTab", { screen: "Products" })} // Navigate to Home tab, show Products
                >
                    <Text style={styles.exploreButtonText}>Start Shopping</Text>
                </TouchableOpacity>
            </View>
        }
        
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            isFavorite={true}
            // Passing this allows the user to remove from favorites directly here
            onToggleFavorite={() => handleRemoveFavorite(item)}
            onPress={() => navigation.navigate("Details", { product: item })}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  listContent: {
    paddingBottom: 20,
    flexGrow: 1, // Ensures the empty component can be centered
  },
  headerContainer: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: "#F8F9FA",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a1a",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80, // Push down a bit
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 20,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  exploreButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    elevation: 8,
  },
  exploreButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});