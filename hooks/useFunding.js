
import { useCallback, useEffect, useState } from "react";

import {
  createReservedAccount,
  getReservedAccount,
} from "../api/fundingApi";

export default function useFunding() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  /**
   * =========================================
   * GET EXISTING RESERVED ACCOUNT
   * =========================================
   */
  const loadAccount = useCallback(async () => {
    try {
      setLoading(true);

      const response =
        await getReservedAccount();

      /**
       * API returns:
       *
       * {
       *   success: true,
       *   data: account
       * }
       *
       * We only keep the account itself.
       */
      setAccount(response?.data || null);

    } catch (error) {
      console.error(
        "Load Reserved Account Error:",
        error.response?.data ||
          error.message
      );

      setAccount(null);

    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * =========================================
   * CREATE RESERVED ACCOUNT
   * =========================================
   */
  const generateAccount = useCallback(
    async () => {
      try {
        setGenerating(true);

        const response =
          await createReservedAccount();

        /**
         * Store newly-created account immediately.
         */
        const newAccount =
          response?.data || null;

        setAccount(newAccount);

        return newAccount;

      } catch (error) {
        console.error(
          "Generate Reserved Account Error:",
          error.response?.data ||
            error.message
        );

        throw error;

      } finally {
        setGenerating(false);
      }
    },
    []
  );

  /**
   * =========================================
   * LOAD ON MOUNT
   * =========================================
   */
  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  return {
    account,

    loading,

    generating,

    generateAccount,

    loadAccount,
  };
}