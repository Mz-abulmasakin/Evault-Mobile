// src/services/profileService.js

import axios from "axios";
import { getToken } from "../storage/tokenStorage";

// =========================================================
// API CONFIGURATION
// =========================================================

const API_URL =
  "https://evault-backend-lm13.onrender.com/api/v1";

// All transaction PIN routes are under /profile.
const PROFILE_URL = `${API_URL}/profile`;

// =========================================================
// AUTHENTICATED REQUEST CONFIG
// =========================================================

async function getAuthConfig() {
  const token = await getToken();

  if (!token) {
    throw new Error(
      "Your session has expired. Please sign in again."
    );
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };
}

// =========================================================
// CREATE TRANSACTION PIN
// POST /api/v1/profile/create-pin
// =========================================================

export async function createTransactionPin(password, pin) {
  const config = await getAuthConfig();

  return axios.post(
    `${PROFILE_URL}/create-pin`,
    {
      password,
      pin,
    },
    config
  );
}

// =========================================================
// CHANGE TRANSACTION PIN
// POST /api/v1/profile/change-pin
// =========================================================

export async function changeTransactionPin(
  currentPin,
  newPin
) {
  const config = await getAuthConfig();

  return axios.post(
    `${PROFILE_URL}/change-pin`,
    {
      currentPin,
      newPin,
    },
    config
  );
}

// =========================================================
// READ TRANSACTION PIN STATUS
// GET /api/v1/profile/pin-status
// =========================================================

export async function getTransactionPinStatus() {
  const config = await getAuthConfig();

  return axios.get(
    `${PROFILE_URL}/pin-status`,
    config
  );
}