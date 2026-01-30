import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";

export default function CartScreen({ navigation }) {
  const { isDark, colors } = useTheme();
  const styles = getStyles(colors);
  const { cart, removeItem, setQuantity, clearCart } = useCart();

  // Tab bar is hidden via navigation configuration in TabNavigator
  // No need for manual hide/show logic here

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.18; // 18% GST
  const shipping = cart.length > 0 ? 50 : 0;
  const total = subtotal + tax + shipping;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigation.navigate("Checkout", { cartItems: cart, isCartCheckout: true });
  };

  const handleQuantityChange = (productId, currentQty, increment) => {
    const newQty = currentQty + increment;
    if (newQty > 0) {
      setQuantity(productId, newQty);
    } else {
      removeItem(productId);
    }
  };

  if (cart.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Shopping Cart</Text>
          <View style={{ width: 30 }} />
        </View>

        {/* Empty State */}
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🛒</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Your cart is empty</Text>
          <Text style={[styles.emptySubtitle, { color: colors.placeholder }]}>
            Add some products to get started
          </Text>
          <TouchableOpacity
            style={[styles.shopButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.shopButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Shopping Cart ({cart.length})</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={[styles.clearButton, { color: colors.primary }]}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cart Items */}
        {cart.map((item) => (
          <View key={item.id} style={[styles.cartItem, { backgroundColor: colors.card }]}>
            <Image source={{ uri: item.thumbnail }} style={styles.itemImage} />
            
            <View style={styles.itemDetails}>
              <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={2}>
                {item.title}
              </Text>
              {item.brand && (
                <Text style={[styles.itemBrand, { color: colors.placeholder }]}>{item.brand}</Text>
              )}
              <Text style={[styles.itemPrice, { color: colors.primary }]}>
                ₹{item.price.toLocaleString()}
              </Text>

              {/* Quantity Controls */}
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={[styles.quantityButton, { backgroundColor: colors.searchBg }]}
                  onPress={() => handleQuantityChange(item.id, item.quantity, -1)}
                >
                  <Text style={[styles.quantityButtonText, { color: colors.text }]}>-</Text>
                </TouchableOpacity>
                
                <Text style={[styles.quantityText, { color: colors.text }]}>{item.quantity}</Text>
                
                <TouchableOpacity
                  style={[styles.quantityButton, { backgroundColor: colors.searchBg }]}
                  onPress={() => handleQuantityChange(item.id, item.quantity, 1)}
                >
                  <Text style={[styles.quantityButtonText, { color: colors.text }]}>+</Text>
                </TouchableOpacity>

                <Text style={[styles.itemTotal, { color: colors.text }]}>
                  ₹{(item.price * item.quantity).toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Remove Button */}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeItem(item.id)}
            >
              <Text style={{ fontSize: 18 }}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Order Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>₹{subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Tax (GST 18%)</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>₹{tax.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Shipping</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>₹{shipping.toFixed(2)}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border || colors.placeholder + "40" }]} />

          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>₹{total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Checkout Button */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border || "#E0E0E0" }]}>
        <TouchableOpacity
          style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
          onPress={handleCheckout}
          activeOpacity={0.8}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout • ₹{total.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    backButton: {
      fontSize: 28,
      fontWeight: "bold",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
    },
    clearButton: {
      fontSize: 14,
      fontWeight: "600",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: "700",
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 16,
      textAlign: "center",
      marginBottom: 32,
    },
    shopButton: {
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 12,
    },
    shopButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },
    cartItem: {
      flexDirection: "row",
      margin: 16,
      marginBottom: 8,
      padding: 12,
      borderRadius: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    itemImage: {
      width: 80,
      height: 80,
      borderRadius: 12,
      backgroundColor: "#f0f0f0",
    },
    itemDetails: {
      flex: 1,
      marginLeft: 12,
      justifyContent: "space-between",
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
    },
    itemBrand: {
      fontSize: 12,
      marginBottom: 4,
    },
    itemPrice: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 8,
    },
    quantityContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
    },
    quantityButton: {
      width: 32,
      height: 32,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    quantityButtonText: {
      fontSize: 18,
      fontWeight: "700",
    },
    quantityText: {
      marginHorizontal: 16,
      fontSize: 16,
      fontWeight: "600",
      minWidth: 20,
      textAlign: "center",
    },
    itemTotal: {
      marginLeft: "auto",
      fontSize: 16,
      fontWeight: "700",
    },
    removeButton: {
      padding: 8,
    },
    summaryCard: {
      margin: 16,
      padding: 20,
      borderRadius: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    summaryTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 16,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    summaryLabel: {
      fontSize: 15,
    },
    summaryValue: {
      fontSize: 15,
      fontWeight: "600",
    },
    divider: {
      height: 1,
      marginVertical: 12,
    },
    totalLabel: {
      fontSize: 18,
      fontWeight: "700",
    },
    totalValue: {
      fontSize: 20,
      fontWeight: "700",
    },
    bottomBar: {
      padding: 20,
      borderTopWidth: 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 10,
    },
    checkoutButton: {
      paddingVertical: 18,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    checkoutButtonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "700",
    },
  });
