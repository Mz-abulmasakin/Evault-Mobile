/**
 * =========================================================
 * eVAULT CABLE TV API
 * =========================================================
 */

import api from "../services/api";

/**
 * =========================================================
 * RESPONSE HELPER
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
 * ERROR HELPER
 * =========================================================
 */

export function getCableApiError(
  error
) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Cable TV request failed."
  );
}

/**
 * =========================================================
 * SERVICE
 * =========================================================
 */

export async function getCableService() {
  const response =
    await api.get(
      "/cable/service"
    );

  return unwrapResponse(
    response
  );
}

/**
 * =========================================================
 * PROVIDERS
 * =========================================================
 */

export async function getCableProviders() {
  const response =
    await api.get(
      "/cable/providers"
    );

  return unwrapResponse(
    response
  );
}

/**
 * =========================================================
 * COMPATIBILITY ALL PLANS
 * =========================================================
 */

export async function getCablePlans() {
  const response =
    await api.get(
      "/cable/plans"
    );

  return unwrapResponse(
    response
  );
}

/**
 * =========================================================
 * COMPATIBILITY PLANS BY PROVIDER
 * =========================================================
 *
 * Real VTUGATE plans come from smartcard verification.
 */

export async function getCablePlansByProvider(
  providerId
) {
  if (
    providerId === null ||
    providerId === undefined ||
    providerId === ""
  ) {
    throw new Error(
      "Cable service ID is required."
    );
  }

  const response =
    await api.get(
      `/cable/plans/${providerId}`
    );

  return unwrapResponse(
    response
  );
}

/**
 * =========================================================
 * VERIFY CABLE SMARTCARD
 * =========================================================
 */

export async function verifyCableSmartcard({
  providerId,
  serviceId,
  phone,
  smartCardNumber,
}) {
  const normalizedServiceId =
    Number(
      serviceId ??
        providerId
    );

  const normalizedPhone =
    String(
      phone ?? ""
    )
      .replace(
        /\s+/g,
        ""
      )
      .trim();

  const normalizedSmartcard =
    String(
      smartCardNumber ?? ""
    )
      .replace(
        /\D/g,
        ""
      )
      .trim();

  if (
    !Number.isInteger(
      normalizedServiceId
    ) ||
    normalizedServiceId <= 0
  ) {
    throw new Error(
      "A valid cable service ID is required."
    );
  }

  if (
    !/^0\d{10}$/.test(
      normalizedPhone
    )
  ) {
    throw new Error(
      "Enter a valid 11-digit Nigerian phone number."
    );
  }

  if (
    !normalizedSmartcard
  ) {
    throw new Error(
      "Smartcard number is required."
    );
  }

  const response =
    await api.post(
      "/cable/verify",
      {
        serviceId:
          normalizedServiceId,

        phone:
          normalizedPhone,

        smartCardNumber:
          normalizedSmartcard,
      }
    );

  return unwrapResponse(
    response
  );
}

/**
 * =========================================================
 * PURCHASE CABLE
 * =========================================================
 */

export async function purchaseCable({
  transactionPin,
  serviceId,
  phone,
  smartCardNumber,
  amount,
  planCode,
  planName,
}) {
  const normalizedServiceId =
    Number(serviceId);

  const normalizedPhone =
    String(
      phone ?? ""
    )
      .replace(
        /\s+/g,
        ""
      )
      .trim();

  const normalizedSmartcard =
    String(
      smartCardNumber ?? ""
    )
      .replace(
        /\D/g,
        ""
      )
      .trim();

  const normalizedAmount =
    Number(amount);

  const normalizedPlanCode =
    String(
      planCode ?? ""
    ).trim();

  const normalizedPlanName =
    String(
      planName ?? ""
    ).trim();

  const normalizedPin =
    String(
      transactionPin ?? ""
    )
      .replace(
        /\D/g,
        ""
      )
      .slice(
        0,
        4
      );

  if (
    !/^\d{4}$/.test(
      normalizedPin
    )
  ) {
    throw new Error(
      "Your transaction PIN must be exactly 4 digits."
    );
  }

  if (
    !Number.isInteger(
      normalizedServiceId
    ) ||
    normalizedServiceId <= 0
  ) {
    throw new Error(
      "A valid cable service ID is required."
    );
  }

  if (
    !/^0\d{10}$/.test(
      normalizedPhone
    )
  ) {
    throw new Error(
      "Enter a valid 11-digit Nigerian phone number."
    );
  }

  if (
    !normalizedSmartcard
  ) {
    throw new Error(
      "Smartcard number is required."
    );
  }

  if (
    !Number.isFinite(
      normalizedAmount
    ) ||
    normalizedAmount <= 0
  ) {
    throw new Error(
      "Invalid cable plan amount."
    );
  }

  if (
    !normalizedPlanCode ||
    !normalizedPlanName
  ) {
    throw new Error(
      "Cable plan information is incomplete."
    );
  }

  const response =
    await api.post(
      "/cable/purchase",
      {
        transactionPin:
          normalizedPin,

        serviceId:
          normalizedServiceId,

        phone:
          normalizedPhone,

        smartCardNumber:
          normalizedSmartcard,

        amount:
          normalizedAmount,

        planCode:
          normalizedPlanCode,

        planName:
          normalizedPlanName,
      }
    );

  return unwrapResponse(
    response
  );
}

/**
 * =========================================================
 * TRANSACTION STATUS
 * =========================================================
 */

export async function getCableTransactionStatus({
  transactionId,
  externalReference,
  reference,
}) {
  const response =
    await api.post(
      "/cable/status",
      {
        transactionId,

        externalReference,

        reference,
      }
    );

  return unwrapResponse(
    response
  );
}

/**
 * =========================================================
 * HISTORY
 * =========================================================
 */

export async function getCableHistory(
  params = {}
) {
  const response =
    await api.get(
      "/cable/history",
      {
        params,
      }
    );

  return unwrapResponse(
    response
  );
}

/**
 * =========================================================
 * STATISTICS
 * =========================================================
 */

export async function getCableStatistics() {
  const response =
    await api.get(
      "/cable/stats"
    );

  return unwrapResponse(
    response
  );
}

/**
 * =========================================================
 * DEFAULT
 * =========================================================
 */

export default {
  getCableService,

  getCableProviders,

  getCablePlans,

  getCablePlansByProvider,

  verifyCableSmartcard,

  purchaseCable,

  getCableTransactionStatus,

  getCableHistory,

  getCableStatistics,
};