/**
 * Mock Payment Service
 * Simulates payment processing with network delay and random success/failure
 */

export const processPayment = async (orderData) => {
  // Simulate network delay (2 seconds)
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Randomly determine success or failure (70% success rate)
  const isSuccess = Math.random() > 0.3;

  if (isSuccess) {
    return {
      success: true,
      transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
      message: "Payment processed successfully",
      timestamp: new Date().toISOString(),
      orderData,
    };
  } else {
    return {
      success: false,
      error: "Payment declined",
      message: "Unable to process payment. Please try again.",
      timestamp: new Date().toISOString(),
      orderData,
    };
  }
};

/**
 * Generate a unique order ID
 */
export const generateOrderId = () => {
  return `ORD${Date.now()}${Math.floor(Math.random() * 10000)}`;
};
