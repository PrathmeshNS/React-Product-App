import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

export default function PaymentResultScreen({ route, navigation }) {
  const { result, product, items, orderId, isCartCheckout } = route.params;
  const { isDark, colors } = useTheme();
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

  const isSuccess = result.success;
  
  // Support both single product and multiple items
  const displayItems = items || (product ? [product] : []);
  const totalAmount = displayItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const itemCount = displayItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const handleGoHome = () => {
    // Navigate back to the product list (home)
    navigation.navigate("HomeTab", { screen: "Products" });
  };

  const handleRetry = () => {
    // Go back to checkout with the same parameters
    if (isCartCheckout) {
      navigation.navigate("Checkout", { cartItems: displayItems, isCartCheckout: true });
    } else {
      navigation.navigate("Checkout", { product: displayItems[0] });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Icon / Illustration */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: isSuccess ? "#4CAF5015" : "#FF3B3015" },
          ]}
        >
          <Text style={styles.iconEmoji}>{isSuccess ? "✅" : "❌"}</Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          {isSuccess ? "Payment Successful!" : "Payment Failed"}
        </Text>

        {/* Message */}
        <Text style={[styles.message, { color: colors.placeholder }]}>
          {result.message || (isSuccess ? "Your order has been placed successfully." : "Unable to process payment.")}
        </Text>

        {/* Order Details Card */}
        <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
          {isSuccess && result.transactionId && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.placeholder }]}>Transaction ID</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{result.transactionId}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.placeholder }]}>Order ID</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{orderId}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.placeholder }]}>
              {isCartCheckout ? "Items" : "Product"}
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={1}>
              {isCartCheckout ? `${displayItems.length} item(s)` : displayItems[0]?.title || "N/A"}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.placeholder }]}>
              {isCartCheckout ? "Total Qty" : "Amount"}
            </Text>
            <Text style={[styles.detailValue, { color: isCartCheckout ? colors.text : colors.primary, fontWeight: "700" }]}>
              {isCartCheckout ? `${itemCount} item(s)` : `₹${displayItems[0]?.price?.toLocaleString() || "0"}`}
            </Text>
          </View>

          {isCartCheckout && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.placeholder }]}>Total Amount</Text>
              <Text style={[styles.detailValue, { color: colors.primary, fontWeight: "700" }]}>
                ₹{totalAmount.toLocaleString()}
              </Text>
            </View>
          )}

          {result.timestamp && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.placeholder }]}>Time</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {new Date(result.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          )}
        </View>

        {/* Product Thumbnail(s) */}
        {!isCartCheckout && displayItems[0] && (
          <Image source={{ uri: displayItems[0].thumbnail }} style={styles.productThumbnail} />
        )}
        {isCartCheckout && displayItems.length > 0 && (
          <View style={styles.thumbnailGrid}>
            {displayItems.slice(0, 3).map((item, index) => (
              <Image key={item.id || index} source={{ uri: item.thumbnail }} style={styles.gridThumbnail} />
            ))}
            {displayItems.length > 3 && (
              <View style={[styles.moreOverlay, { backgroundColor: colors.card }]}>
                <Text style={[styles.moreText, { color: colors.text }]}>+{displayItems.length - 3}</Text>
              </View>
            )}
          </View>
        )}
      </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {isSuccess ? (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleGoHome}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={handleRetry}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Retry Payment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.placeholder }]}
              onPress={handleGoHome}
              activeOpacity={0.8}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Go to Home</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    iconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
    },
    iconEmoji: {
      fontSize: 64,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      marginBottom: 12,
      textAlign: "center",
    },
    message: {
      fontSize: 16,
      textAlign: "center",
      lineHeight: 24,
      marginBottom: 32,
    },
    detailsCard: {
      width: "100%",
      padding: 20,
      borderRadius: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      marginBottom: 24,
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    detailLabel: {
      fontSize: 14,
      fontWeight: "600",
    },
    detailValue: {
      fontSize: 14,
      fontWeight: "600",
      flex: 1,
      textAlign: "right",
      marginLeft: 12,
    },
    productThumbnail: {
      width: 100,
      height: 100,
      borderRadius: 12,
      backgroundColor: "#F0F0F0",
    },
    thumbnailGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 8,
      position: "relative",
    },
    gridThumbnail: {
      width: 80,
      height: 80,
      borderRadius: 12,
      backgroundColor: "#F0F0F0",
    },
    moreOverlay: {
      width: 80,
      height: 80,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      opacity: 0.9,
    },
    moreText: {
      fontSize: 20,
      fontWeight: "700",
    },
    buttonContainer: {
      padding: 20,
      paddingBottom: 30,
    },
    primaryButton: {
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    primaryButtonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "700",
    },
    secondaryButton: {
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
    },
    secondaryButtonText: {
      fontSize: 16,
      fontWeight: "600",
    },
  });
