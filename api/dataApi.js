/**
 * =========================================================
 * eVAULT DATA API
 * =========================================================
 */

import api from "../services/api";

/**
 * =========================================================
 * RESPONSE UNWRAPPER
 * =========================================================
 */

function unwrapResponse(
  response
) {
  if (
    response &&
    typeof response ===
      "object" &&
    Object.prototype.hasOwnProperty.call(
      response,
      "data"
    )
  ) {
    return response.data;
  }

  return response;
}

/**
 * =========================================================
 * GET DATA PLANS
 * =========================================================
 */

export async function getDataPlans(
  network = null
) {
  const config = {};

  if (network) {
    config.params = {
      network,
    };
  }

  const response =
    await api.get(
      "/data/plans",
      config
    );

  return unwrapResponse(
    response
  );
}

/**
 * =========================================================
 * BUY DATA
 * =========================================================
 */

export async function buyData(
  payload
) {
  const response =
    await api.post(
      "/data/purchase",
      payload
    );

  return unwrapResponse(
    response
  );
}

/**
 * =========================================================
 * DEFAULT EXPORT
 * =========================================================
 */

export default {
  getDataPlans,
  buyData,
};