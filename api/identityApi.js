
// src/api/identityApi.js

import api from "../services/api";

/**
 * =========================================================
 * RESPONSE UNWRAPPER
 * =========================================================
 */
function unwrapResponse(response) {
  if (
    response &&
    typeof response === "object" &&
    Object.prototype.hasOwnProperty.call(
      response,
      "data"
    )
  ) {
    const body = response.data;

    if (
      body &&
      typeof body === "object" &&
      Object.prototype.hasOwnProperty.call(
        body,
        "data"
      )
    ) {
      return body.data;
    }

    return body;
  }

  return response;
}

/**
 * =========================================================
 * API ERROR
 * =========================================================
 */
function getApiError(error) {
  const response = error?.response;
  const responseData = response?.data;

  /**
   * -------------------------------------------------------
   * BACKEND RESPONDED
   * -------------------------------------------------------
   */
  if (response) {
    let backendMessage = null;
    let backendCode = null;

    if (
      responseData &&
      typeof responseData === "object" &&
      !(responseData instanceof ArrayBuffer)
    ) {
      backendMessage =
        responseData?.message ||
        responseData?.error ||
        responseData?.data?.message ||
        null;

      backendCode =
        responseData?.code ||
        responseData?.data?.code ||
        null;
    }

    const message =
      backendMessage ||
      `Request failed with status ${response.status}.`;

    const normalized = new Error(message);

    normalized.status = response.status;
    normalized.code = backendCode;
    normalized.response = response;
    normalized.originalError = error;
    normalized.isNetworkError = false;

    return normalized;
  }

  /**
   * -------------------------------------------------------
   * NO BACKEND RESPONSE
   * -------------------------------------------------------
   */
  if (
    error?.code === "ERR_NETWORK" ||
    error?.message === "Network Error" ||
    error?.request
  ) {
    const normalized = new Error(
      "Unable to reach the eVault backend. Please check that the backend server is running and that the phone is using the correct API address."
    );

    normalized.code =
      "EVault_BACKEND_NETWORK_ERROR";

    normalized.status = null;
    normalized.response = null;
    normalized.originalError = error;
    normalized.isNetworkError = true;

    return normalized;
  }

  /**
   * -------------------------------------------------------
   * TIMEOUT
   * -------------------------------------------------------
   */
  if (
    error?.code === "ECONNABORTED" ||
    error?.code === "ETIMEDOUT"
  ) {
    const normalized = new Error(
      "The eVault backend took too long to respond. Please try again."
    );

    normalized.code =
      "EVault_BACKEND_TIMEOUT";

    normalized.status = null;
    normalized.response = null;
    normalized.originalError = error;
    normalized.isNetworkError = false;

    return normalized;
  }

  /**
   * -------------------------------------------------------
   * UNKNOWN ERROR
   * -------------------------------------------------------
   */
  const normalized = new Error(
    error?.message ||
      "An unexpected API error occurred."
  );

  normalized.status =
    error?.response?.status;

  normalized.code =
    error?.code || null;

  normalized.response =
    error?.response || null;

  normalized.originalError =
    error;

  normalized.isNetworkError =
    false;

  return normalized;
}

/**
 * =========================================================
 * EXISTING KYC / PROFILE IDENTITY
 * =========================================================
 *
 * Backend:
 *
 * GET  /api/v1/identity/me
 * POST /api/v1/identity/kyc
 *
 * These functions were missing from the current file.
 * =========================================================
 */

/**
 * GET MY SAVED IDENTITY
 */
export async function getMyIdentity() {
  try {
    const response = await api.get(
      "/identity/me"
    );

    return unwrapResponse(response);
  } catch (error) {
    throw getApiError(error);
  }
}

/**
 * SAVE MY IDENTITY
 *
 * Payload:
 *
 * {
 *   bvn: "12345678901",
 *   nin: "12345678901"
 * }
 *
 * BVN, NIN, or both may be supplied.
 */
export async function saveMyIdentity(
  payload = {}
) {
  try {
    const response = await api.post(
      "/identity/kyc",
      payload
    );

    return unwrapResponse(response);
  } catch (error) {
    throw getApiError(error);
  }
}

/**
 * =========================================================
 * NIN SERVICE
 * =========================================================
 */
export async function getNinService() {
  try {
    const response =
      await api.get(
        "/identity/nin/service"
      );

    return unwrapResponse(
      response
    );
  } catch (error) {
    throw getApiError(error);
  }
}

/**
 * =========================================================
 * GET NIN PRICING
 * =========================================================
 */
export async function getNinPricing() {
  return getNinService();
}

/**
 * =========================================================
 * SUBMIT NIN
 * =========================================================
 */
export async function submitNin(
  payload
) {
  try {
    const response =
      await api.post(
        "/identity/nin",
        payload
      );

    return unwrapResponse(
      response
    );
  } catch (error) {
    throw getApiError(error);
  }
}

/**
 * =========================================================
 * RECOVER NIN BY PHONE
 * =========================================================
 */
export async function recoverNinByPhone(
  payload
) {
  try {
    const response =
      await api.post(
        "/identity/nin/phone-search",
        payload
      );

    return unwrapResponse(
      response
    );
  } catch (error) {
    throw getApiError(error);
  }
}

/**
 * =========================================================
 * RECOVER NIN
 * =========================================================
 */
export async function recoverNin(
  payload
) {
  return recoverNinByPhone(
    payload
  );
}

/**
 * =========================================================
 * RECOVER NIN BY DEMOGRAPHICS
 * =========================================================
 */
export async function recoverNinByDemographics(
  payload
) {
  try {
    const response =
      await api.post(
        "/identity/nin/demographic-search",
        payload
      );

    return unwrapResponse(
      response
    );
  } catch (error) {
    throw getApiError(error);
  }
}

/**
 * =========================================================
 * GET NIN REQUEST
 * =========================================================
 */
export async function getNinRequest(
  requestId
) {
  if (!requestId) {
    throw new Error(
      "NIN request ID is required."
    );
  }

  try {
    const response =
      await api.get(
        `/identity/nin/${encodeURIComponent(
          requestId
        )}`
      );

    return unwrapResponse(
      response
    );
  } catch (error) {
    throw getApiError(error);
  }
}

/**
 * =========================================================
 * GET NIN STATUS
 * =========================================================
 */
export async function getNinStatus(
  requestId
) {
  return getNinRequest(
    requestId
  );
}

/**
 * =========================================================
 * GET NIN HISTORY
 * =========================================================
 */
export async function getNinHistory(
  params = {}
) {
  try {
    const response =
      await api.get(
        "/identity/nin/history",
        {
          params,
        }
      );

    return unwrapResponse(
      response
    );
  } catch (error) {
    throw getApiError(error);
  }
}

/**
 * =========================================================
 * DOWNLOAD NIN PDF
 * =========================================================
 */
export async function downloadNin(
  requestId
) {
  if (!requestId) {
    throw new Error(
      "NIN request ID is required."
    );
  }

  try {
    const response =
      await api.get(
        `/identity/nin/${encodeURIComponent(
          requestId
        )}/download`,
        {
          responseType:
            "arraybuffer",

          headers: {
            Accept:
              "application/pdf",
          },

          transformResponse: [
            (data) => data,
          ],
        }
      );

    return response;
  } catch (error) {
    throw getApiError(error);
  }
}

/**
 * =========================================================
 * GET NIN DOCUMENT METADATA
 * =========================================================
 */
export async function getNinDocument(
  requestId
) {
  if (!requestId) {
    throw new Error(
      "NIN request ID is required."
    );
  }

  try {
    const response =
      await api.get(
        `/identity/nin/${encodeURIComponent(
          requestId
        )}`
      );

    return unwrapResponse(
      response
    );
  } catch (error) {
    throw getApiError(error);
  }
}

/**
 * =========================================================
 * IPE CLEARANCE
 * =========================================================
 */

/**
 * GET IPE SERVICE
 */
export async function getIpeService() {
  try {
    const response =
      await api.get(
        "/identity/ipe/service"
      );

    return unwrapResponse(
      response
    );
  } catch (error) {
    throw getApiError(error);
  }
}

/**
 * SUBMIT IPE CLEARANCE
 */
export async function submitIpe(
  payload
) {
  try {
    const response =
      await api.post(
        "/identity/ipe",
        payload
      );

    return unwrapResponse(
      response
    );
  } catch (error) {
    throw getApiError(error);
  }
}

/**
 * GET IPE STATUS
 */
export async function getIpeStatus(
  requestId
) {
  if (!requestId) {
    throw new Error(
      "IPE request ID is required."
    );
  }

  try {
    const response =
      await api.get(
        `/identity/ipe/${encodeURIComponent(
          requestId
        )}`
      );

    return unwrapResponse(
      response
    );
  } catch (error) {
    throw getApiError(error);
  }
}

/**
 * GET IPE HISTORY
 */
export async function getIpeHistory(
  params = {}
) {
  try {
    const response =
      await api.get(
        "/identity/ipe/history",
        {
          params,
        }
      );

    return unwrapResponse(
      response
    );
  } catch (error) {
    throw getApiError(error);
  }
}

/**
 * =========================================================
 * EXPORT ERROR HELPER
 * =========================================================
 */
export {
  getApiError
};
