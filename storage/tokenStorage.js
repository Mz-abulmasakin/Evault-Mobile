
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "evault_access_token";

/**
 * Get browser storage safely.
 * Browser storage is used only when running on web.
 */
function getWebStorage() {
  if (typeof window === "undefined") {
    throw new Error("Browser storage is unavailable.");
  }

  return window.localStorage;
}

/**
 * Save authentication token.
 *
 * Android/iOS: Expo SecureStore
 * Web: browser localStorage
 */
export async function saveToken(token) {
  if (typeof token !== "string" || !token.trim()) {
    throw new Error("A valid authentication token is required.");
  }

  if (Platform.OS === "web") {
    getWebStorage().setItem(TOKEN_KEY, token);
    return;
  }

  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/**
 * Retrieve authentication token.
 */
export async function getToken() {
  if (Platform.OS === "web") {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(TOKEN_KEY);
  }

  return await SecureStore.getItemAsync(TOKEN_KEY);
}

/**
 * Delete authentication token during logout.
 */
export async function removeToken() {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_KEY);
    }

    return;
  }

  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
