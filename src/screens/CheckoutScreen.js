import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";
import { processPayment, generateOrderId } from "../services/paymentService";

export default function CheckoutScreen({ route, navigation }) {
  const { product, cartItems, isCartCheckout } = route.params;
  const { isDark, colors } = useTheme();
  const { clearCart } = useCart();
  const styles = getStyles(colors);

  useEffect(() => {
    const parent = navigation.getParent();
    const onFocus = () => {
      parent?.setOptions({ tabBarStyle: { display: "none" } });
      navigation.setOptions({ headerShown: false });
    };
    const onBlur = () => {
      parent?.setOptions({ tabBarStyle: undefined });
      navigation.setOptions({ headerShown: undefined });
    };

    const unsubFocus = navigation.addListener("focus", onFocus);
    const unsubBlur = navigation.addListener("blur", onBlur);

    return () => {
      unsubFocus();
      unsubBlur();
    };
  }, [navigation]);

  const [processing, setProcessing] = useState(false);
  const orderId = React.useRef(generateOrderId()).current;

  // Calculate totals based on whether it's cart checkout or single product
  const items = isCartCheckout ? cartItems : [{ ...product, quantity: 1 }];
  const subtotal = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const tax = subtotal * 0.18; // 18% GST
  const shipping = 50;
  const total = subtotal + tax + shipping;

  const handlePayment = async () => {
    setProcessing(true);

    try {
      const orderData = {
        orderId,
        items: items.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity || 1,
          thumbnail: item.thumbnail,
        })),
        amount: total,
        currency: "INR",
      };

      const result = await processPayment(orderData);

      // Clear cart if this was a cart checkout
      if (isCartCheckout) {
        await clearCart();
      }

      // Navigate to result screen
      navigation.replace("PaymentResult", {
        result,
        items,
        orderId,
        isCartCheckout,
      });
    } catch (error) {
      // In case of unexpected error
      navigation.replace("PaymentResult", {
        result: {
          success: false,
          error: "Unexpected error occurred",
          message: "Something went wrong. Please try again.",
        },
        items,
        orderId,
        isCartCheckout,
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={processing}>
          <Text style={[styles.backButton, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Checkout</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order ID */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.orderIdLabel, { color: colors.placeholder }]}>Order ID</Text>
          <Text style={[styles.orderId, { color: colors.text }]}>{orderId}</Text>
        </View>

        {/* Product Details */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {isCartCheckout ? `Items (${items.length})` : "Product Details"}
          </Text>

          {items.map((item, index) => (
            <View key={item.id} style={[styles.productRow, index > 0 && { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.placeholder + "20" }]}>
              <Image source={{ uri: item.thumbnail }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={[styles.productTitle, { color: colors.text }]} numberOfLines={2}>
                  {item.title}
                </Text>
                {item.brand && (
                  <Text style={[styles.productBrand, { color: colors.placeholder }]}>{item.brand}</Text>
                )}
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={[styles.productPrice, { color: colors.primary }]}>
                    ₹{item.price.toLocaleString()}
                  </Text>
                  {(item.quantity || 1) > 1 && (
                    <Text style={[styles.quantityBadge, { color: colors.text, backgroundColor: colors.searchBg }]}>
                      Qty: {item.quantity || 1}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>

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

        {/* Payment Note */}
        <View style={[styles.noteCard, { backgroundColor: colors.primary + "15" }]}>
          <Text style={[styles.noteIcon, { color: colors.primary }]}>ℹ️</Text>
          <Text style={[styles.noteText, { color: colors.text }]}>
            This is a demo payment flow. No real transaction will be processed.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Payment Button */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border || "#E0E0E0" }]}>
        <TouchableOpacity
          style={[styles.payButton, { backgroundColor: processing ? colors.placeholder : colors.primary }]}
          onPress={handlePayment}
          disabled={processing}
          activeOpacity={0.8}
        >
          {processing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.payButtonText}>Processing Payment...</Text>
            </View>
          ) : (
            <Text style={styles.payButtonText}>Pay ₹{total.toFixed(2)}</Text>
          )}
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
    card: {
      margin: 16,
      marginBottom: 0,
      padding: 20,
      borderRadius: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    orderIdLabel: {
      fontSize: 12,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    orderId: {
      fontSize: 18,
      fontWeight: "700",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 16,
    },
    productRow: {
      flexDirection: "row",
    },
    productImage: {
      width: 80,
      height: 80,
      borderRadius: 12,
      backgroundColor: "#F0F0F0",
    },
    productInfo: {
      flex: 1,
      marginLeft: 16,
      justifyContent: "center",
    },
    productTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
    },
    productBrand: {
      fontSize: 12,
      fontWeight: "500",
      marginBottom: 6,
      textTransform: "uppercase",
    },
    productPrice: {
      fontSize: 18,
      fontWeight: "800",
    },
    quantityBadge: {
      fontSize: 12,
      fontWeight: "600",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
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
      fontSize: 22,
      fontWeight: "800",
    },
    noteCard: {
      margin: 16,
      marginTop: 8,
      padding: 16,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "flex-start",
    },
    noteIcon: {
      fontSize: 20,
      marginRight: 12,
      marginTop: 2,
    },
    noteText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
    },
    bottomBar: {
      padding: 20,
      paddingBottom: 30,
      borderTopWidth: 1,
    },
    payButton: {
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    payButtonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "700",
    },
    processingContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
  });
