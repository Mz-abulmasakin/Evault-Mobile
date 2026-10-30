
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const isWeb = Platform.OS === "web";

function getBrowserStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export async function getItemAsync(key, options) {
  if (isWeb) {
    return getBrowserStorage()?.getItem(key) ?? null;
  }

  return SecureStore.getItemAsync(key, options);
}

export async function setItemAsync(key, value, options) {
  if (typeof value !== "string") {
    throw new TypeError("Storage value must be a string.");
  }

  if (isWeb) {
    const storage = getBrowserStorage();

    if (!storage) {
      throw new Error("Browser storage is unavailable.");
    }

    storage.setItem(key, value);
    return;
  }

  return SecureStore.setItemAsync(key, value, options);
}

export async function deleteItemAsync(key, options) {
  if (isWeb) {
    getBrowserStorage()?.removeItem(key);
    return;
  }

  return SecureStore.deleteItemAsync(key, options);
}

export async function isAvailableAsync() {
  if (isWeb) {
    return Boolean(getBrowserStorage());
  }

  return SecureStore.isAvailableAsync();
}
