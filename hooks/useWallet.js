
 // src/hooks/useWallet.js

import {
  useCallback,
  useRef,
  useState,
} from "react";

import {
  AppState,
} from "react-native";

import {
  useFocusEffect,
} from "@react-navigation/native";

import {
  getMyWallet,
} from "../api/walletApi";

export default function useWallet() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const screenActiveRef = useRef(false);
  const requestInProgressRef = useRef(false);

  /**
   * Fetch the latest wallet from the backend.
   * Prevent overlapping requests from the timer,
   * foreground listener, and manual refresh.
   */
  const loadWallet = useCallback(
    async ({ manual = false } = {}) => {
      if (requestInProgressRef.current) {
        return;
      }

      requestInProgressRef.current = true;

      if (manual) {
        setRefreshing(true);
      }

      try {
        const latestWallet = await getMyWallet();

        if (screenActiveRef.current) {
          if (latestWallet) {
            setWallet(latestWallet);
          }

          console.log(
            "[EVAULT WALLET] Balance refreshed:",
            latestWallet?.available_balance
          );
        }
      } catch (error) {
        console.log(
          "[EVAULT WALLET] Refresh failed:",
          error?.response?.data || error?.message || error
        );
      } finally {
        requestInProgressRef.current = false;

        if (screenActiveRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    []
  );

  /**
   * Refresh on focus, periodically while focused,
   * and whenever the app returns to the foreground.
   */
  useFocusEffect(
    useCallback(() => {
      screenActiveRef.current = true;

      // Fetch immediately when the screen becomes active.
      loadWallet();

      // Detect credits while the user is using eVault.
      const intervalId = setInterval(() => {
        if (
          screenActiveRef.current &&
          AppState.currentState === "active"
        ) {
          loadWallet();
        }
      }, 15000);

      // Refresh after returning from the background.
      const appStateSubscription = AppState.addEventListener(
        "change",
        (nextState) => {
          if (
            nextState === "active" &&
            screenActiveRef.current
          ) {
            loadWallet();
          }
        }
      );

      return () => {
        screenActiveRef.current = false;

        clearInterval(intervalId);

        appStateSubscription.remove();
      };
    }, [loadWallet])
  );

  /**
   * Pull-to-refresh support for components
   * that call the returned refresh function.
   */
  const refresh = useCallback(async () => {
    await loadWallet({ manual: true });
  }, [loadWallet]);

  return {
    wallet,
    loading,
    refreshing,
    refresh,
  };
}
