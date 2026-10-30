 // src/api/airtimeApi.js

import axios from "axios";

import { getToken } from "../storage/tokenStorage";
import { API_BASE_URL } from "./config";

/**
 * =========================================================
 * AIRTIME API
 * =========================================================
 *
 * Frontend uses:
 *
 * transactionPin
 *
 * Backend receives:
 *
 * pin
 *
 * This file performs that translation.
 */

const airtimeApi = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * =========================================================
 * AUTH INTERCEPTOR
 * =========================================================
 */

airtimeApi.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      console.error(
        "Airtime API token error:",
        error
      );

      return config;
    }
  },

  (error) => {
    return Promise.reject(error);
  }
);

/**
 * =========================================================
 * BUY AIRTIME
 * =========================================================
 */

export const buyAirtime = async ({
  network,
  phoneNumber,
  amount,
  transactionPin,
}) => {
  /**
   * -------------------------------------------------------
   * CLEAN VALUES
   * -------------------------------------------------------
   */

  const cleanNetwork =
    String(network || "")
      .trim()
      .toLowerCase();

  const cleanPhoneNumber =
    String(phoneNumber || "")
      .replace(/\s+/g, "")
      .trim();

  const numericAmount =
    Number(amount);

  const cleanPin =
    String(transactionPin || "")
      .replace(/\D/g, "")
      .slice(0, 4);

  /**
   * -------------------------------------------------------
   * FRONTEND VALIDATION
   * -------------------------------------------------------
   */

  if (!cleanNetwork) {
    throw new Error(
      "Please select a network."
    );
  }

  if (
    !/^0\d{10}$/.test(
      cleanPhoneNumber
    )
  ) {
    throw new Error(
      "Please enter a valid Nigerian phone number."
    );
  }

  if (
    !Number.isFinite(numericAmount) ||
    numericAmount <= 0
  ) {
    throw new Error(
      "Please enter a valid airtime amount."
    );
  }

  if (!/^\d{4}$/.test(cleanPin)) {
    throw new Error(
      "Transaction PIN must be exactly 4 digits."
    );
  }

  /**
   * -------------------------------------------------------
   * IMPORTANT
   * -------------------------------------------------------
   *
   * Backend expects:
   *
   * pin
   *
   * NOT:
   *
   * transactionPin
   */

  const payload = {
    network: cleanNetwork,
    phoneNumber: cleanPhoneNumber,
    amount: numericAmount,
    pin: cleanPin,
  };

  /**
   * -------------------------------------------------------
   * DEBUG
   * -------------------------------------------------------
   *
   * Never print the real PIN.
   */

  console.log(
    "AIRTIME REQUEST:",
    {
      network: payload.network,
      phoneNumber: payload.phoneNumber,
      amount: payload.amount,
      pin: "****",
      pinLength: cleanPin.length,
    }
  );

  /**
   * -------------------------------------------------------
   * REQUEST
   * -------------------------------------------------------
   */

  const response =
    await airtimeApi.post(
      "/airtime/purchase",
      payload
    );

  console.log(
    "AIRTIME RESPONSE:",
    response?.data
  );

  return response.data;
};

/**
 * =========================================================
 * DEFAULT EXPORT
 * =========================================================
 */

export default airtimeApi;