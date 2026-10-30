// src/hooks/useCreatePin.js

import {
  useCallback,
  useState,
} from "react";

import {
  changeTransactionPin,
  createTransactionPin,
  getTransactionPinStatus,
} from "../services/profileService";

// =========================================================
// RESPONSE HELPER
// =========================================================

function getResponseData(response) {
  return response?.data?.data ?? response?.data ?? response;
}

function ensureSuccess(data, fallbackMessage) {
  if (
    data?.success === false ||
    data?.status === "FAILED" ||
    data?.status === "failed"
  ) {
    throw new Error(data?.message || fallbackMessage);
  }

  return data;
}

// =========================================================
// TRANSACTION PIN HOOK
// =========================================================

export default function useCreatePin() {
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);

  // null means the backend status has not been confirmed.
  const [hasTransactionPin, setHasTransactionPin] = useState(null);

  // =======================================================
  // LOAD SAVED PIN STATUS
  // =======================================================

  const loadPinStatus = useCallback(async () => {
    setStatusLoading(true);

    try {
      const response = await getTransactionPinStatus();
      const data = getResponseData(response);

      const savedStatus =
        data?.hasTransactionPin ??
        data?.has_transaction_pin;

      if (typeof savedStatus !== "boolean") {
        throw new Error(
          "The server did not return a valid transaction PIN status."
        );
      }

      setHasTransactionPin(savedStatus);

      return savedStatus;
    } catch (error) {
      console.error(
        "LOAD TRANSACTION PIN STATUS ERROR:",
        error?.response?.data || error?.message || error
      );

      setHasTransactionPin(null);

      return null;
    } finally {
      setStatusLoading(false);
    }
  }, []);

  // =======================================================
  // CREATE PIN
  // =======================================================

  const createPin = useCallback(async (password, pin) => {
    try {
      setLoading(true);

      const response = await createTransactionPin(password, pin);
      const data = ensureSuccess(
        getResponseData(response),
        "Transaction PIN could not be created."
      );

      // Update only after the API request reports success.
      setHasTransactionPin(true);

      return data;
    } catch (error) {
      console.error(
        "CREATE TRANSACTION PIN ERROR:",
        error?.response?.data || error?.message || error
      );

      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // =======================================================
  // CHANGE PIN
  // =======================================================

  const changePin = useCallback(async (currentPin, newPin) => {
    try {
      setLoading(true);

      const response = await changeTransactionPin(
        currentPin,
        newPin
      );

      const data = ensureSuccess(
        getResponseData(response),
        "Transaction PIN could not be changed."
      );

      // The account still has a PIN after changing it.
      setHasTransactionPin(true);

      return data;
    } catch (error) {
      console.error(
        "CHANGE TRANSACTION PIN ERROR:",
        error?.response?.data || error?.message || error
      );

      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createPin,
    changePin,
    loadPinStatus,
    hasTransactionPin,
    loading,
    statusLoading,
  };
}