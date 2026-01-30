import React, { useState, memo } from "react";
import { View, Text, Image, TouchableOpacity, Modal, StyleSheet, Platform, ActivityIndicator, LayoutAnimation, UIManager, Dimensions } from "react-native";
import { useTheme } from "../context/ThemeContext";

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Note: You can install 'expo-vector-icons' or 'react-native-vector-icons' for real icons
// I'm using text emojis here for compatibility, but the style is set up for icons.

import { useNavigation } from "@react-navigation/native";
import { useCart } from "../context/CartContext";

function ProductCard({ product, onPress, isFavorite, onToggleFavorite }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const nav = useNavigation();

  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addedMsg, setAddedMsg] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const { addItem, isInCart, getItemQuantity, increaseQuantity, decreaseQuantity } = useCart();

  const quantity = getItemQuantity(product.id);
  const { width, height } = Dimensions.get('window');

  const onImagePress = () => {
    setModalVisible(true);
  };

  const quickAdd = async () => {
    if (adding) return;
    setAdding(true);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    try {
      await addItem(product);
      setAddedMsg("Added to cart");
      setTimeout(() => setAddedMsg(""), 2000);
    } catch (e) {
      setAddedMsg("Error adding");
      setTimeout(() => setAddedMsg(""), 2000);
    } finally {
      setAdding(false);
    }
  };

  const handleIncrease = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await increaseQuantity(product.id);
  };

  const handleDecrease = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await decreaseQuantity(product.id);
  };

  const quickBuy = () => {
    nav.navigate("Checkout", { product });
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.card}>
      {/* Image Container */}
      <View style={styles.imageContainer}>
        {/* Placeholder while loading */}
        {imgLoading && (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.card }]}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}

        {/* Image (press to view full fit) */}
        {!imgError && (
          <TouchableOpacity activeOpacity={0.9} onPress={onImagePress} accessible accessibilityLabel="Open image">
            <Image
              source={{ uri: product.thumbnail }}
              style={styles.image}
              resizeMode="cover"
              onLoad={() => setImgLoading(false)}
              onError={() => {
                setImgLoading(false);
                setImgError(true);
              }}
            />
          </TouchableOpacity>
        )}

        {/* Error fallback */}
        {imgError && (
          <View style={[styles.imageFallback, { backgroundColor: colors.card }]}>
            <Text style={{ fontSize: 28 }}>🖼️</Text>
            <Text style={{ color: colors.placeholder, marginTop: 6 }}>Image unavailable</Text>
          </View>
        )}

        {/* Floating Favorite Button */}
        <TouchableOpacity style={styles.favoriteButton} onPress={onToggleFavorite}>
          <Text style={{ fontSize: 18 }}>{isFavorite ? "❤️" : "🤍"}</Text>
        </TouchableOpacity>

        {/* Optional: Discount Badge if you have it */}
        {product.discountPercentage && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{product.discountPercentage}% OFF</Text>
          </View>
        )}
      </View>

      {/* Content Container */}
      <View style={styles.content}>
        <Text style={styles.brand} numberOfLines={1}>
          {product.brand || "Brand Name"}
        </Text>

        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{product.price.toLocaleString()}</Text>
          {product.originalPrice && <Text style={styles.oldPrice}>₹{product.originalPrice}</Text>}
        </View>

        {/* Quantity Controls (shown when in cart) */}
        {quantity > 0 && (
          <View style={[styles.quantityControls, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
            <Text style={[styles.quantityLabel, { color: colors.primary }]}>In Cart:</Text>
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
        )}

        {/* Quick action row */}
        <View style={styles.quickRow}>
          <TouchableOpacity style={[styles.quickBtn, { borderColor: colors.primary }]} onPress={quickAdd} disabled={adding}>
            <Text style={[styles.quickText, { color: colors.primary }]}>{adding ? 'Adding...' : 'Add'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.quickBtnFill, { backgroundColor: colors.primary }]} onPress={quickBuy}>
            <Text style={[styles.quickTextFill]}>Buy</Text>
          </TouchableOpacity>
        </View>

        {addedMsg ? (
          <View style={[styles.addedMsg, { backgroundColor: colors.primary + '10' }]}>
            <Text style={{ color: colors.primary }}>{addedMsg}</Text>
          </View>
        ) : null}
      </View>

      {/* Image Modal for press fit */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalBackdrop} onPress={() => setModalVisible(false)} activeOpacity={1}>
          <Image source={{ uri: product.thumbnail }} style={[styles.modalImage, { width, height: height * 0.8 }]} resizeMode="contain" />
        </TouchableOpacity>
      </Modal>
    </TouchableOpacity>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      margin: 10,
      marginBottom: 20,
      // Modern Shadow for iOS
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      // Elevation for Android
      elevation: 5,
      overflow: Platform.OS === "android" ? "hidden" : "visible", // Fixes rounded corners on Android
    },
    imageContainer: {
      position: "relative",
      height: 180, // Taller image for better visuals
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
    },
    image: {
      width: "100%",
      height: "100%",
      position: "absolute",
      top: 0,
      left: 0,
    },
    imagePlaceholder: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    imageFallback: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalImage: {
      borderRadius: 12,
      backgroundColor: '#fff',
    },
    favoriteButton: {
      position: "absolute",
      top: 10,
      right: 10,
      backgroundColor: colors.card === "#FFFFFF" ? "rgba(255,255,255,0.85)" : "rgba(30,30,30,0.75)",
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      // Subtle shadow for the button
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      elevation: 3,
    },
    badge: {
      position: "absolute",
      bottom: 10,
      left: 10,
      backgroundColor: "#FF3B30",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    badgeText: {
      color: "#fff",
      fontSize: 10,
      fontWeight: "bold",
    },
    content: {
      padding: 12,
    },
    brand: {
      fontSize: 12,
      color: colors.placeholder,
      fontWeight: "600",
      marginBottom: 4,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    title: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 8,
      lineHeight: 22,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    price: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.primary,
      marginRight: 8,
    },
    oldPrice: {
      fontSize: 14,
      color: colors.placeholder,
      textDecorationLine: "line-through",
    },
    quantityControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
      padding: 8,
      borderRadius: 8,
      borderWidth: 1,
    },
    quantityLabel: {
      fontSize: 13,
      fontWeight: '700',
    },
    quantityButtons: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    quantityBtn: {
      width: 28,
      height: 28,
      borderRadius: 6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    quantityBtnText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '700',
      marginTop: -2,
    },
    quantityText: {
      fontSize: 16,
      fontWeight: '700',
      marginHorizontal: 12,
      minWidth: 20,
      textAlign: 'center',
    },
    quickRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    quickBtn: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      marginRight: 8,
    },
    quickBtnFill: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
    },
    quickText: {
      fontSize: 14,
      fontWeight: '700',
    },
    quickTextFill: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '700',
    },
    addedMsg: {
      marginTop: 8,
      padding: 8,
      borderRadius: 8,
      alignItems: 'center',
    },
  });

// Memoize the component to prevent unnecessary re-renders
export default memo(ProductCard, (prevProps, nextProps) => {
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.isFavorite === nextProps.isFavorite
  );
});