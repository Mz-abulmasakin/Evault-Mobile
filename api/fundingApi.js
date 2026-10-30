
// src/api/fundingApi.js

import api from "./apiClient";

/**
 * =========================================================
 * GET USER RESERVED ACCOUNT
 * =========================================================
 *
 * GET /api/v1/funding/reserved-account
 *
 * Returns the user's dedicated Monnify funding account.
 */
export async function getReservedAccount() {
  const response = await api.get(
    "/funding/reserved-account"
  );

  return response.data;
}

/**
 * =========================================================
 * CREATE USER RESERVED ACCOUNT
 * =========================================================
 *
 * POST /api/v1/funding/reserved-account
 *
 * Creates the user's dedicated funding account
 * if one does not already exist.
 */
export async function createReservedAccount() {
  const response = await api.post(
    "/funding/reserved-account"
  );

  return response.data;
}

