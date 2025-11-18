// API utility functions for making HTTP requests
// These functions handle communication with backend services

const API_BASE_URL = "https://api.example.com";

// Fetch user data from API
// Makes GET request to /users endpoint
// Returns user data object
export async function fetchUser(userId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

// Fetch product data from API
// Makes GET request to /products endpoint
// Returns product data object
export async function fetchProduct(productId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
}

// Fetch order data from API
// Makes GET request to /orders endpoint
// Returns order data object
export async function fetchOrder(orderId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
}

// Create new user via API
// Makes POST request to /users endpoint
// Returns created user data object
export async function createUser(userData: Record<string, unknown>) {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// Create new product via API
// Makes POST request to /products endpoint
// Returns created product data object
export async function createProduct(productData: Record<string, unknown>) {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

