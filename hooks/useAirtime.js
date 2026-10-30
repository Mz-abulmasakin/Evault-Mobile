 // hooks/useAirtime.js

import { useState } from "react";

import {
  buyAirtime as buyAirtimeRequest,
} from "../api/airtimeApi";

/**
 * =========================================================
 * USE AIRTIME
 * =========================================================
 */

export function useAirtime() {
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  /**
   * =======================================================
   * BUY AIRTIME
   * =======================================================
   */

  const buyAirtime = async ({
    network,
    phoneNumber,
    amount,
    transactionPin,
  }) => {
    try {
      setLoading(true);
      setError(null);

      /**
       * ---------------------------------------------------
       * CLEAN PIN
       * ---------------------------------------------------
       */

      const cleanPin =
        String(transactionPin || "")
          .replace(/\D/g, "")
          .slice(0, 4);

      /**
       * ---------------------------------------------------
       * VALIDATE PIN
       * ---------------------------------------------------
       */

      if (!/^\d{4}$/.test(cleanPin)) {
        throw new Error(
          "Transaction PIN must be exactly 4 digits."
        );
      }

      /**
       * ---------------------------------------------------
       * DEBUG
       * ---------------------------------------------------
       */

      console.log(
        "USE AIRTIME:",
        {
          network,
          phoneNumber,
          amount,
          pinLength: cleanPin.length,
          hasPin: Boolean(cleanPin),
        }
      );

      /**
       * ---------------------------------------------------
       * SEND TO API
       * ---------------------------------------------------
       *
       * Notice:
       *
       * transactionPin
       *
       * is passed to airtimeApi.
       *
       * airtimeApi converts it to:
       *
       * pin
       */

      const result =
        await buyAirtimeRequest({
          network,
          phoneNumber,
          amount,
          transactionPin: cleanPin,
        });

      /**
       * ---------------------------------------------------
       * BACKEND FAILURE
       * ---------------------------------------------------
       */

      if (
        result?.success === false
      ) {
        throw new Error(
          result?.message ||
            "Airtime purchase failed."
        );
      }

      /**
       * ---------------------------------------------------
       * SUCCESS
       * ---------------------------------------------------
       */

      return result;

    } catch (err) {
      console.error(
        "USE AIRTIME ERROR:",
        err?.response?.data ||
          err?.message ||
          err
      );

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Airtime purchase failed.";

      setError(message);

      throw new Error(message);

    } finally {
      setLoading(false);
    }
  };

  return {
    buyAirtime,
    loading,
    error,
  };
}

export default useAirtime;