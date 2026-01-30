import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Keyboard,
  ScrollView,
  Animated,
  BackHandler,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Make sure to update your import path if needed
import { fetchProducts } from "../api/productsApi";
import ProductCard from "../components/ProductCard";
import { useFavorites } from "../context/FavoritesContext";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";
import { debounce } from "../utils/debounce";

export default function ProductListScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination / server search
  const [page, setPage] = useState(0);
  // Default page size - avoid requesting 0 items
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Sorting: 'default' | 'price_asc' | 'price_desc' | 'alpha'
  const [sort, setSort] = useState("default");
  
  // Advanced Filters
  const [priceFilter, setPriceFilter] = useState({ min: null, max: null });
  const [ratingFilter, setRatingFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const { isDark, toggleTheme, colors } = useTheme();
  const styles = getStyles(colors);

  // Favorites come from context; no need for manual focus refresh
  const { favorites, toggleFavorite } = useFavorites();
  const { count: cartCount } = useCart();

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showFilters) {
        setShowFilters(false);
        return true; // Prevent default behavior
      }
      return false; // Let default behavior happen
    });

    return () => backHandler.remove();
  }, [showFilters]);

  // initial load
  useEffect(() => {
    loadPage(0, false, search);
  }, []);

  const applySort = (list, sortOption) => {
    if (!sortOption || sortOption === "default") return list;
    const copy = [...list];
    if (sortOption === "price_asc") return copy.sort((a, b) => a.price - b.price);
    if (sortOption === "price_desc") return copy.sort((a, b) => b.price - a.price);
    if (sortOption === "alpha") return copy.sort((a, b) => a.title.localeCompare(b.title));
    return copy;
  };

  const applyFilters = (list) => {
    let filtered = [...list];
    
    // Apply price filter
    if (priceFilter.min !== null || priceFilter.max !== null) {
      filtered = filtered.filter(p => {
        if (priceFilter.min !== null && p.price < priceFilter.min) return false;
        if (priceFilter.max !== null && p.price > priceFilter.max) return false;
        return true;
      });
    }
    
    // Apply rating filter (placeholder - using random rating for demo)
    if (ratingFilter !== null) {
      filtered = filtered.filter(p => {
        const rating = 3 + Math.random() * 2; // Mock rating 3-5
        return rating >= ratingFilter;
      });
    }
    
    // Apply category filter (placeholder)
    if (categoryFilter !== null) {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }
    
    return filtered;
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (priceFilter.min !== null || priceFilter.max !== null) count++;
    if (ratingFilter !== null) count++;
    if (categoryFilter !== null) count++;
    return count;
  };

  const clearAllFilters = () => {
    setPriceFilter({ min: null, max: null });
    setRatingFilter(null);
    setCategoryFilter(null);
  };

  const removePriceFilter = () => {
    setPriceFilter({ min: null, max: null });
  };

  const removeRatingFilter = () => {
    setRatingFilter(null);
  };

  const removeCategoryFilter = () => {
    setCategoryFilter(null);
  };

  const loadPage = async (pageToLoad = 0, append = false, q = "") => {
    if (pageToLoad === 0) {
      setLoading(true);
      setError("");
    } else {
      setLoadingMore(true);
    }

    try {
      const skip = pageToLoad * limit;
      const res = await fetchProducts({ limit, skip, q });
      const incoming = res.products || [];
      const newTotal = res.total || 0;

      const merged = append ? [...products, ...incoming] : incoming;
      const filtered = applyFilters(merged);
      const sorted = applySort(filtered, sort);

      console.log('Products loaded:', sorted.length, 'items');
      if (sorted.length > 0) {
        console.log('First product:', sorted[0].title, 'thumbnail:', sorted[0].thumbnail);
      }

      setProducts(sorted);
      setTotal(newTotal);
      setPage(pageToLoad);
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handleToggleFavorite = async (product) => {
    await toggleFavorite(product);
    // favorites context will update the UI
  };

  // Handle search submit (explicit)
  const handleSubmitSearch = () => {
    Keyboard.dismiss();
    loadPage(0, false, search);
  };

  const onSearchChange = (text) => {
    setSearch(text);
  };

  // Handle sort change with toggle behavior
  const onChangeSort = (next) => {
    const newSort = sort === next ? 'default' : next;
    setSort(newSort);
    // apply to current products
    const filtered = applyFilters(products);
    const sorted = applySort(filtered, newSort);
    setProducts(sorted);
  };

  // Clear sort
  const clearSort = () => {
    setSort('default');
    const filtered = applyFilters(products);
    const sorted = applySort(filtered, 'default');
    setProducts(sorted);
  };

  // Reapply filters when they change
  useEffect(() => {
    if (!loading) {
      loadPage(0, false, search);
    }
  }, [priceFilter, ratingFilter, categoryFilter]);

  // Render Header Component
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Discover</Text>
      <Text style={styles.headerSubtitle}>Find your perfect item</Text>

      {/* Top Right Icons Container */}
      <View style={{ position: "absolute", right: 20, top: 20, flexDirection: "row", alignItems: "center", gap: 12 }}>
        {/* Cart Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Cart")}
          style={{ position: "relative" }}
          accessibilityLabel="View cart"
        >
          <Text style={{ fontSize: 24 }}>🛒</Text>
          {cartCount > 0 && (
            <View style={{ 
              position: "absolute", 
              right: -6, 
              top: -4, 
              backgroundColor: "#FF3B30", 
              minWidth: 18, 
              paddingHorizontal: 5, 
              height: 18, 
              borderRadius: 9, 
              alignItems: "center", 
              justifyContent: "center" 
            }}>
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Theme Toggle */}
        <TouchableOpacity
          onPress={toggleTheme}
          accessibilityLabel="Toggle theme"
        >
          <Text style={{ fontSize: 18 }}>{isDark ? "🌙" : "☀️"}</Text>
        </TouchableOpacity>
      </View>

      {/* Modern Search Bar */}
      <View style={[styles.searchWrapper, { backgroundColor: colors.searchBg }]}> 
        <TouchableOpacity onPress={handleSubmitSearch}>
          <Text style={[styles.searchIcon, { opacity: 0.6 }]}>🔍</Text>
        </TouchableOpacity>
        <TextInput
          placeholder="Search products..."
          placeholderTextColor={colors.placeholder}
          value={search}
          onChangeText={onSearchChange}
          onSubmitEditing={handleSubmitSearch}
          style={[styles.searchInput, { color: colors.text }]}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => { setSearch(''); loadPage(0, false, ''); }}>
            <Text style={[styles.clearIcon, { color: colors.placeholder }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter & Sort Row */}
      <View style={styles.filterSortRow}>
        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: colors.searchBg, borderColor: getActiveFiltersCount() > 0 ? colors.primary : 'transparent' }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={{ fontSize: 16, marginRight: 6 }}>🔧</Text>
          <Text style={[styles.filterBtnText, { color: colors.text }]}>Filters</Text>
          {getActiveFiltersCount() > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1, marginLeft: 10 }}>
          <TouchableOpacity
            style={[styles.sortBtn, sort === "price_asc" && styles.sortBtnActive]}
            onPress={() => onChangeSort("price_asc")}
          >
            <Text style={[styles.sortText, sort === "price_asc" && styles.sortTextActive]}>💰 Low → High</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortBtn, sort === "price_desc" && styles.sortBtnActive]}
            onPress={() => onChangeSort("price_desc")}
          >
            <Text style={[styles.sortText, sort === "price_desc" && styles.sortTextActive]}>💎 High → Low</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortBtn, sort === "alpha" && styles.sortBtnActive]}
            onPress={() => onChangeSort("alpha")}
          >
            <Text style={[styles.sortText, sort === "alpha" && styles.sortTextActive]}>🔤 A → Z</Text>
          </TouchableOpacity>

          {sort !== 'default' && (
            <TouchableOpacity
              style={[styles.sortClearBtn, { backgroundColor: colors.error + '15', borderColor: colors.error }]}
              onPress={clearSort}
            >
              <Text style={[styles.sortClearText, { color: colors.error }]}>✕</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Active Filters Chips */}
      {getActiveFiltersCount() > 0 && (
        <View style={styles.activeFiltersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(priceFilter.min !== null || priceFilter.max !== null) && (
              <View style={[styles.filterChip, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
                <Text style={[styles.filterChipText, { color: colors.primary }]}>
                  💰 ₹{priceFilter.min || 0} - ₹{priceFilter.max || '∞'}
                </Text>
                <TouchableOpacity onPress={removePriceFilter} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={[styles.filterChipClose, { color: colors.primary }]}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {ratingFilter !== null && (
              <View style={[styles.filterChip, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
                <Text style={[styles.filterChipText, { color: colors.primary }]}>
                  ⭐ {ratingFilter}+ Stars
                </Text>
                <TouchableOpacity onPress={removeRatingFilter} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={[styles.filterChipClose, { color: colors.primary }]}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {categoryFilter !== null && (
              <View style={[styles.filterChip, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
                <Text style={[styles.filterChipText, { color: colors.primary }]}>
                  📁 {categoryFilter}
                </Text>
                <TouchableOpacity onPress={removeCategoryFilter} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={[styles.filterChipClose, { color: colors.primary }]}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <TouchableOpacity 
              style={[styles.clearAllBtn, { backgroundColor: colors.error + '15', borderColor: colors.error }]}
              onPress={clearAllFilters}
            >
              <Text style={[styles.clearAllText, { color: colors.error }]}>Clear All</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <View style={[styles.filterPanel, { backgroundColor: colors.searchBg }]}>
          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Price Range</Text>
            <View style={styles.priceFilterRow}>
              <View style={[styles.priceInputContainer, { backgroundColor: colors.card }]}>
                <Text style={{ color: colors.placeholder, marginRight: 4 }}>₹</Text>
                <TextInput
                  placeholder="Min"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="numeric"
                  value={priceFilter.min !== null ? String(priceFilter.min) : ''}
                  onChangeText={(text) => setPriceFilter(prev => ({ ...prev, min: text ? parseInt(text) : null }))}
                  style={[styles.priceInput, { color: colors.text }]}
                />
              </View>
              <Text style={{ color: colors.placeholder, marginHorizontal: 8 }}>-</Text>
              <View style={[styles.priceInputContainer, { backgroundColor: colors.card }]}>
                <Text style={{ color: colors.placeholder, marginRight: 4 }}>₹</Text>
                <TextInput
                  placeholder="Max"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="numeric"
                  value={priceFilter.max !== null ? String(priceFilter.max) : ''}
                  onChangeText={(text) => setPriceFilter(prev => ({ ...prev, max: text ? parseInt(text) : null }))}
                  style={[styles.priceInput, { color: colors.text }]}
                />
              </View>
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Minimum Rating</Text>
            <View style={styles.ratingFilterRow}>
              {[1, 2, 3, 4, 5].map(rating => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingBtn,
                    { backgroundColor: colors.card, borderColor: ratingFilter === rating ? colors.primary : colors.placeholder + '30' },
                    ratingFilter === rating && { backgroundColor: colors.primary + '15' }
                  ]}
                  onPress={() => setRatingFilter(ratingFilter === rating ? null : rating)}
                >
                  <Text style={{ fontSize: 16 }}>⭐</Text>
                  <Text style={[styles.ratingBtnText, { color: ratingFilter === rating ? colors.primary : colors.text }]}>
                    {rating}+
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>😕 {error}</Text>
        <TouchableOpacity onPress={loadData} style={[styles.retryButton, { backgroundColor: colors.primary }]}> 
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      <FlatList
        data={products}
        keyExtractor={(item) => `product-${item.id}`}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          // Load more when we have more pages
          const hasMore = products.length < total;
          if (hasMore && !loadingMore) {
            loadPage(page + 1, true, search);
          }
        }}
        onRefresh={() => {
          setRefreshing(true);
          loadPage(0, false, search);
        }}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.placeholder }]}>No products found.</Text>
          </View>
        }
        ListFooterComponent={loadingMore ? (
          <View style={styles.footerLoading}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={{ marginLeft: 8, color: colors.placeholder }}>Loading more...</Text>
          </View>
        ) : null}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            isFavorite={favorites.some((f) => f.id === item.id)}
            onToggleFavorite={() => handleToggleFavorite(item)}
            onPress={() => navigation.navigate("Details", { product: item })}
          />
        )}
      />
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    listContent: {
      paddingBottom: 20,
    },
    headerContainer: {
      padding: 20,
      backgroundColor: colors.card,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      marginBottom: 10,
      // Subtle shadow for header
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      elevation: 3,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.placeholder,
      marginBottom: 20,
      marginTop: 4,
    },
    searchWrapper: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 12,
      paddingHorizontal: 15,
      height: 50,
    },
    searchIcon: {
      fontSize: 16,
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      height: "100%",
    },
    clearIcon: {
      fontSize: 18,
      padding: 4,
    },
    sortRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 16,
    },
    sortBtn: {
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "transparent",
    },
    sortBtnActive: {
      backgroundColor: colors.primary + "22",
      borderColor: colors.primary,
    },
    sortText: {
      fontSize: 12,
      color: colors.placeholder,
      fontWeight: "600",
    },
    sortTextActive: {
      color: colors.primary,
    },
    footerLoading: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    },
    emptyContainer: {
      alignItems: "center",
      marginTop: 50,
    },
    emptyText: {
      fontSize: 16,
    },
    errorText: {
      fontSize: 18,
      marginBottom: 10,
    },
    retryButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    retryText: {
      color: "#fff",
      fontWeight: "bold",
    },
    filterSortRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 16,
    },
    filterBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 2,
    },
    filterBtnText: {
      fontSize: 14,
      fontWeight: '600',
    },
    filterBadge: {
      marginLeft: 8,
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
    },
    filterBadgeText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '700',
    },
    sortClearBtn: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      marginLeft: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sortClearText: {
      fontSize: 14,
      fontWeight: '700',
    },
    activeFiltersContainer: {
      marginTop: 12,
      flexDirection: 'row',
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 16,
      borderWidth: 1,
      marginRight: 8,
    },
    filterChipText: {
      fontSize: 12,
      fontWeight: '600',
      marginRight: 6,
    },
    filterChipClose: {
      fontSize: 14,
      fontWeight: '700',
      marginLeft: 2,
    },
    clearAllBtn: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 16,
      borderWidth: 1,
    },
    clearAllText: {
      fontSize: 12,
      fontWeight: '700',
    },
    filterPanel: {
      marginTop: 12,
      padding: 16,
      borderRadius: 12,
    },
    filterSection: {
      marginBottom: 16,
    },
    filterSectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 10,
    },
    priceFilterRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    priceInputContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    priceInput: {
      flex: 1,
      fontSize: 14,
    },
    ratingFilterRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    ratingBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      gap: 4,
    },
    ratingBtnText: {
      fontSize: 12,
      fontWeight: '600',
    },
  });