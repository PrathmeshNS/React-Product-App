import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  StatusBar,
  Dimensions,
  Animated,
  PanResponder,
  BackHandler,
} from "react-native";
import { useFavorites } from "../context/FavoritesContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";

const { width, height } = Dimensions.get('window');
const MIN_SHEET_HEIGHT = 280;
const MAX_SHEET_HEIGHT = height - 200;

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const [isFav, setIsFav] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [adding, setAdding] = useState(false);
  const [cartMsg, setCartMsg] = useState("");

  const { isDark, colors } = useTheme();
  const styles = getStyles(colors);

  const { toggleFavorite, isFavorite } = useFavorites();
  const { addItem, isInCart: isInCartCtx, getItemQuantity, increaseQuantity, decreaseQuantity } = useCart();

  const quantity = getItemQuantity(product.id);

  // Bottom sheet animation
  const sheetHeight = useRef(new Animated.Value(MIN_SHEET_HEIGHT)).current;
  const [currentHeight, setCurrentHeight] = useState(MIN_SHEET_HEIGHT);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    setIsFav(isFavorite(product.id));
    setInCart(isInCartCtx(product.id));
  }, [product, isFavorite, isInCartCtx]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond if vertical movement is significant
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        const newHeight = currentHeight - gestureState.dy;
        if (newHeight >= MIN_SHEET_HEIGHT && newHeight <= MAX_SHEET_HEIGHT) {
          sheetHeight.setValue(newHeight);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const newHeight = currentHeight - gestureState.dy;
        
        // Snap to positions based on velocity and position
        if (gestureState.vy < -0.5 || newHeight > (MIN_SHEET_HEIGHT + MAX_SHEET_HEIGHT) / 2) {
          // Expand to max
          Animated.spring(sheetHeight, {
            toValue: MAX_SHEET_HEIGHT,
            useNativeDriver: false,
            tension: 50,
            friction: 8,
          }).start();
          setCurrentHeight(MAX_SHEET_HEIGHT);
        } else {
          // Collapse to min
          Animated.spring(sheetHeight, {
            toValue: MIN_SHEET_HEIGHT,
            useNativeDriver: false,
            tension: 50,
            friction: 8,
          }).start();
          setCurrentHeight(MIN_SHEET_HEIGHT);
        }
      },
    })
  ).current;

  const handleFav = async () => {
    await toggleFavorite(product);
    setIsFav(isFavorite(product.id));
  };

  const handleBuyNow = () => {
    navigation.navigate("Checkout", { product });
  };

  const handleAddToCart = async () => {
    if (adding) return;
    setAdding(true);
    try {
      await addItem(product);
      setInCart(true);
      // show ephemeral message
      setCartMsg('Added to cart');
      setTimeout(() => setCartMsg(''), 2000);
    } catch (e) {
      setCartMsg('Unable to add to cart');
      setTimeout(() => setCartMsg(''), 2000);
    } finally {
      setAdding(false);
    }
  };

  const handleIncrease = async () => {
    await increaseQuantity(product.id);
  };

  const handleDecrease = async () => {
    await decreaseQuantity(product.id);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />
      
      {/* Full Screen Hero Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.thumbnail }} style={styles.image} resizeMode="cover" />
        
        {/* Back Button Overlay */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        {/* Favorite Button Overlay */}
        <TouchableOpacity 
          style={styles.favButtonOverlay} 
          onPress={handleFav}
        >
          <Text style={{ fontSize: 24 }}>{isFav ? "❤️" : "🤍"}</Text>
        </TouchableOpacity>
      </View>

      {/* Draggable Bottom Sheet */}
      <Animated.View 
        style={[
          styles.detailsContainer, 
          { 
            backgroundColor: colors.card,
            height: sheetHeight,
          }
        ]}
      >
        {/* Draggable Handle */}
        <View {...panResponder.panHandlers} style={styles.handleContainer}>
          <View style={[styles.handleBar, { backgroundColor: colors.text }]} />
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: 120 }}
          scrollEnabled={currentHeight > MIN_SHEET_HEIGHT + 50}
        >
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.brand, { color: colors.placeholder }]}>
                {product.brand || "BRAND NAME"}
              </Text>
              <Text style={[styles.title, { color: colors.text }]}>{product.title}</Text>
            </View>
            <Text style={[styles.price, { color: colors.primary }]}>₹{product.price}</Text>
          </View>

         
          {/* Rating / Meta Info */}
          <View style={styles.ratingRow}>
            <Text style={styles.ratingText}>⭐ {(3.5 + Math.random() * 1.5).toFixed(1)} (200 Reviews)</Text>
            <Text style={styles.stockText}>In Stock</Text>
          </View>

          {/* Quantity Controls (if in cart) */}
          {quantity > 0 && (
            <View style={[styles.quantitySection, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
              <View style={styles.quantitySectionHeader}>
                <Text style={[styles.quantitySectionTitle, { color: colors.primary }]}>🛒 In Your Cart</Text>
                <View style={styles.quantityButtons}>
                  <TouchableOpacity 
                    style={[styles.quantityBtn, { backgroundColor: colors.primary }]} 
                    onPress={handleDecrease}
                  >
                    <Text style={styles.quantityBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={[styles.quantityText, { color: colors.primary }]}>{quantity}</Text>
                  <TouchableOpacity 
                    style={[styles.quantityBtn, { backgroundColor: colors.primary }]} 
                    onPress={handleIncrease}
                  >
                    <Text style={styles.quantityBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={[styles.quantitySubtext, { color: colors.primary }]}>
                Subtotal: ₹{(product.price * quantity).toLocaleString()}
              </Text>
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: colors.placeholder + "40" }]} />

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
          <Text style={[styles.description, { color: colors.placeholder }]}>
            {product.description}
            {"\n\n"}
            This product features premium build quality and is designed to meet your daily needs with style and efficiency. 
            Perfect for those who value both functionality and aesthetics.
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.placeholder + "40" }]} />

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Specifications</Text>
          <View style={styles.specRow}>
            <Text style={[styles.specLabel, { color: colors.placeholder }]}>Category:</Text>
            <Text style={[styles.specValue, { color: colors.text }]}>{product.category || 'Electronics'}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={[styles.specLabel, { color: colors.placeholder }]}>Brand:</Text>
            <Text style={[styles.specValue, { color: colors.text }]}>{product.brand || 'Premium Brand'}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={[styles.specLabel, { color: colors.placeholder }]}>SKU:</Text>
            <Text style={[styles.specValue, { color: colors.text }]}>#{product.id}</Text>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Sticky Bottom Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.placeholder + "40" }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity 
            style={[styles.addButton, inCart && styles.addButtonActive, { borderColor: colors.primary }]}
            onPress={handleAddToCart}
            disabled={adding || inCart}
          >
            {adding ? (
              <Text style={[styles.addButtonText, { color: colors.primary }]}>Adding...</Text>
            ) : (
              <Text style={[styles.addButtonText, { color: inCart ? '#fff' : colors.primary }]}>
                {inCart ? '✓ In Cart' : '+ Add to Cart'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.buyButton, { backgroundColor: colors.primary }]} 
            onPress={handleBuyNow}
          >
            <Text style={styles.buyButtonText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Ephemeral cart message */}
      {cartMsg ? (
        <View style={[styles.cartMsg, { backgroundColor: colors.primary + '10' }]}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>{cartMsg}</Text>
        </View>
      ) : null}
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    imageContainer: {
      height: height * 0.55,
      width: "100%",
      backgroundColor: "#f0f0f0",
      position: 'relative',
    },
    image: {
      width: "100%",
      height: "100%",
    },
    backButton: {
      position: "absolute",
      top: 50,
      left: 20,
      backgroundColor: "rgba(0,0,0,0.5)",
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      elevation: 5,
    },
    backButtonText: {
      color: "#fff",
      fontSize: 26,
      fontWeight: "bold",
      marginTop: -2,
    },
    favButtonOverlay: {
      position: "absolute",
      top: 50,
      right: 20,
      backgroundColor: "rgba(255,255,255,0.95)",
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      elevation: 5,
    },
    detailsContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      paddingHorizontal: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 15,
    },
    handleContainer: {
      paddingVertical: 16,
      alignItems: 'center',
      paddingBottom: 20,
    },
    handleBar: {
      width: 60,
      height: 5,
      borderRadius: 5,
      opacity: 0.8,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    brand: {
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 1,
      marginBottom: 6,
      textTransform: 'uppercase',
    },
    title: {
      fontSize: 24,
      fontWeight: "800",
      lineHeight: 30,
    },
    price: {
      fontSize: 26,
      fontWeight: "bold",
    },
    devBanner: {
      flexDirection: 'row',
      padding: 8,
      borderRadius: 6,
      marginBottom: 12,
    },
    ratingRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    ratingText: {
      color: "#FFD700",
      fontWeight: "600",
      marginRight: 15,
      fontSize: 14,
    },
    stockText: {
      color: "#4CAF50",
      fontWeight: "600",
      backgroundColor: "#E8F5E9",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      fontSize: 12,
    },
    quantitySection: {
      padding: 14,
      borderRadius: 12,
      borderWidth: 1.5,
      marginBottom: 16,
    },
    quantitySectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    quantitySectionTitle: {
      fontSize: 15,
      fontWeight: '700',
    },
    quantityButtons: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    quantityBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    quantityBtnText: {
      color: '#fff',
      fontSize: 20,
      fontWeight: '700',
      marginTop: -2,
    },
    quantityText: {
      fontSize: 18,
      fontWeight: '700',
      marginHorizontal: 14,
      minWidth: 24,
      textAlign: 'center',
    },
    quantitySubtext: {
      fontSize: 13,
      fontWeight: '600',
    },
    divider: {
      height: 1,
      marginVertical: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 10,
    },
    description: {
      fontSize: 15,
      lineHeight: 24,
    },
    specRow: {
      flexDirection: 'row',
      paddingVertical: 8,
    },
    specLabel: {
      fontSize: 14,
      width: 100,
      fontWeight: '600',
    },
    specValue: {
      fontSize: 14,
      flex: 1,
    },
    bottomBar: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      padding: 20,
      paddingBottom: 30,
      borderTopWidth: 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.08,
      elevation: 20,
    },
    favButton: {
      width: 50,
      height: 50,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 12,
      marginRight: 12,
    },
    favButtonActive: {
      backgroundColor: "#FFEBEB",
    },
    addButton: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 2,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    addButtonActive: {
      backgroundColor: "#4CAF50",
      borderColor: "#4CAF50",
    },
    addButtonText: {
      fontSize: 15,
      fontWeight: "700",
    },
    buyButton: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 14,
      justifyContent: "center",
      alignItems: "center",
    },
    buyButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    cartMsg: {
      position: 'absolute',
      bottom: 100,
      alignSelf: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      elevation: 5,
    },
  });