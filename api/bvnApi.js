
// src/api/bvnApi.js

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
    typeof response === "object" &&
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
 * EXISTING BVN SERVICE
 * =========================================================
 */

export async function getBvnService() {
  const response =
    await api.get(
      "/identity/bvn/service"
    );

  return unwrapResponse(
    response
  );
}


/**
 * =========================================================
 * EXISTING BVN VALIDATION
 * =========================================================
 */

export async function submitBvn(
  payload
) {
  const response =
    await api.post(
      "/identity/bvn",
      payload
    );

  return unwrapResponse(
    response
  );
}


/**
 * =========================================================
 * EXISTING BVN STATUS
 * =========================================================
 */

export async function getBvnStatus(
  requestId
) {
  if (!requestId) {
    throw new Error(
      "BVN request ID is required."
    );
  }

  const response =
    await api.get(
      `/identity/bvn/${requestId}`
    );

  return unwrapResponse(
    response
  );
}


/**
 * =========================================================
 * EXISTING BVN HISTORY
 * =========================================================
 */

export async function getBvnHistory() {
  const response =
    await api.get(
      "/identity/bvn/history"
    );

  return unwrapResponse(
    response
  );
}


/**
 * =========================================================
 * EXISTING BVN PDF DOWNLOAD
 * =========================================================
 */

export async function downloadBvn(
  requestId
) {
  if (!requestId) {
    throw new Error(
      "BVN request ID is required."
    );
  }

  return api.get(
    `/identity/bvn/${requestId}/download`,
    {
      responseType:
        "arraybuffer",

      transformResponse: [
        (data) => data,
      ],
    }
  );
}


/**
 * =========================================================
 * BVN PHONE RECOVERY SERVICE
 * =========================================================
 */

export async function getBvnPhoneRecoveryService() {
  const response =
    await api.get(
      "/identity/bvn/phone-recovery/service"
    );

  return unwrapResponse(
    response
  );
}


/**
 * =========================================================
 * BVN PHONE RECOVERY
 * =========================================================
 */

export async function recoverBvnByPhone(
  payload
) {
  const response =
    await api.post(
      "/identity/bvn/phone-recovery",
      payload
    );

  return unwrapResponse(
    response
  );
}


/**
 * =========================================================
 * BVN PHONE RECOVERY STATUS
 * =========================================================
 */

export async function getBvnRecoveryStatus(
  requestId
) {
  if (!requestId) {
    throw new Error(
      "BVN recovery request ID is required."
    );
  }

  const response =
    await api.get(
      `/identity/bvn/phone-recovery/${requestId}`
    );

  return unwrapResponse(
    response
  );
}


export default {
  getBvnService,

  submitBvn,

  getBvnStatus,

  getBvnHistory,

  downloadBvn,

  getBvnPhoneRecoveryService,

  recoverBvnByPhone,

  getBvnRecoveryStatus,
};
