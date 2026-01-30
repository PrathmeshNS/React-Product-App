import React from "react";
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
        animation: "slide_from_right",
        // 3. maintain a white background during transitions
        contentStyle: { backgroundColor: "#F8F9FA" }, 
      }}
    >
      <Stack.Screen name="Products" component={ProductListScreen} />
      <Stack.Screen 
        name="Details" 
        component={ProductDetailScreen}
        options={{
          tabBarStyle: { display: 'none' }
        }}
      />
      <Stack.Screen 
        name="Cart" 
        component={CartScreen}
        options={{
          tabBarStyle: { display: 'none' }
        }}
      />
      <Stack.Screen 
        name="Checkout" 
        component={CheckoutScreen}
        options={{
          tabBarStyle: { display: 'none' }
        }}
      />
      <Stack.Screen 
        name="PaymentResult" 
        component={PaymentResultScreen}
        options={{
          tabBarStyle: { display: 'none' }
        }}
      />
    </Stack.Navigator>
  );
}