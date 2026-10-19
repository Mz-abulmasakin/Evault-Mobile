/**
 * =========================================================
 * eVAULT EDUCATION API
 * =========================================================
 */

import api from "../services/api";


/**
 * =========================================================
 * UNWRAP
 * =========================================================
 */

function unwrapResponse(
  response
) {
  return (
    response?.data?.data ??
    response?.data ??
    response ??
    null
  );
}


/**
 * =========================================================
 * ERROR
 * =========================================================
 */

export function getEducationApiError(
  error
) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Education request failed."
  );
}


/**
 * =========================================================
 * SERVICES
 * =========================================================
 */

export async function getEducationServices() {
  const response =
    await api.get(
      "/education/services"
    );

  return unwrapResponse(
    response
  );
}


/**
 * =========================================================
 * PRICE
 * =========================================================
 */

export async function getEducationPrice({
  serviceId,
  quantity = 1,
}) {
  const response =
    await api.post(
      "/education/price",
      {
        serviceId,
        quantity,
      }
    );

  return unwrapResponse(
    response
  );
}


/**
 * =========================================================
 * PURCHASE
 * =========================================================
 */

export async function purchaseEducation({
  serviceId,
  quantity = 1,
  transactionPin,
}) {
  const response =
    await api.post(
      "/education/purchase",
      {
        serviceId,
        quantity,
        transactionPin,
      }
    );

  return unwrapResponse(
    response
  );
}


export default {
  getEducationServices,
  getEducationPrice,
  purchaseEducation,
};