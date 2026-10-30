// api/walletApi.js

import api from "../services/api";

/**
 * =========================================================
 * GET MY WALLET
 * =========================================================
 */
export async function getMyWallet() {
  const response = await api.get("/wallet/me");

  /**
   * Backend normally returns:
   *
   * {
   *   success: true,
   *   data: wallet
   * }
   *
   * We also support `wallet` in case an older
   * controller is still being used.
   */

  const wallet =
    response.data?.data ??
    response.data?.wallet ??
    null;

  return wallet;
}