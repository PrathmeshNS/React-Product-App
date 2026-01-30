import React from "react";
import { Platform } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProductListScreen from "../screens/ProductListScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import CartScreen from "../screens/CartScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import PaymentResultScreen from "../screens/PaymentResultScreen";

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        // 1. Hide the default top bar so our custom designs show nicely
        headerShown: false,
        // 2. Add a smooth slide animation (standard iOS/Android feel)
        animation: Platform.OS === 'android' ? 'slide_from_right' : 'default',
        // 3. Maintain background during transitions
        contentStyle: { backgroundColor: "#F8F9FA" },
        // 4. Optimize for Android gesture navigation
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        // 5. Proper orientation handling
        orientation: 'portrait',
      }}
    >
      <Stack.Screen 
        name="Products" 
        component={ProductListScreen}
        options={{
          // Root screen - cannot swipe back
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="Details" 
        component={ProductDetailScreen}
        options={{
          // Allow swipe back gesture
          gestureEnabled: true,
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="Cart" 
        component={CartScreen}
        options={{
          gestureEnabled: true,
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="Checkout" 
        component={CheckoutScreen}
        options={{
          gestureEnabled: true,
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="PaymentResult" 
        component={PaymentResultScreen}
        options={{
          // Prevent going back from payment result
          gestureEnabled: false,
          animation: 'fade',
        }}
      />
    </Stack.Navigator>
  );
}