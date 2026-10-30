/**
 * =========================================================
 * eVAULT CABLE TV HOOK
 * =========================================================
 */

import {
  useCallback,
  useState,
} from "react";

import {
  getCableProviders,
  getCablePlans,
  getCablePlansByProvider,
  verifyCableSmartcard,
  purchaseCable,
  getCableTransactionStatus,
  getCableHistory,
  getCableStatistics,
  getCableApiError,
} from "../api/cableApi";

/**
 * =========================================================
 * PROVIDER ID HELPER
 * =========================================================
 */

function getProviderId(
  provider
) {
  return (
    provider?.serviceId ??
    provider?.service_id ??
    provider?.providerId ??
    provider?.provider_id ??
    provider?.id ??
    null
  );
}

/**
 * =========================================================
 * NORMALIZE PLAN
 * =========================================================
 */

function normalizePlan(
  plan,
  serviceId = null
) {
  if (
    !plan ||
    typeof plan !== "object"
  ) {
    return null;
  }

  const code =
    plan?.code ??
    plan?.planCode ??
    plan?.plan_code ??
    "";

  const name =
    plan?.name ??
    plan?.planName ??
    plan?.plan_name ??
    plan?.title ??
    "";

  const price =
    Number(
      plan?.price ??
        plan?.amount ??
        0
    );

  return {
    ...plan,

    id:
      plan?.id ??
      code ??
      name,

    planId:
      plan?.planId ??
      plan?.plan_id ??
      code,

    code:

      String(
        code
      ).trim(),

    planCode:

      String(
        code
      ).trim(),

    name:

      String(
        name
      ).trim(),

    planName:

      String(
        name
      ).trim(),

    price:
      Number.isFinite(
        price
      )
        ? price
        : 0,

    amount:
      Number.isFinite(
        price
      )
        ? price
        : 0,

    serviceId:
      plan?.serviceId ??
      plan?.service_id ??
      serviceId,

    providerId:
      plan?.providerId ??
      plan?.provider_id ??
      serviceId,
  };
}

/**
 * =========================================================
 * HOOK
 * =========================================================
 */

export function useCable() {
  const [
    providers,
    setProviders,
  ] = useState([]);

  const [
    plans,
    setPlans,
  ] = useState([]);

  const [
    selectedProviderPlans,
    setSelectedProviderPlans,
  ] = useState([]);

  const [
    verification,
    setVerification,
  ] = useState(null);

  const [
    providersLoading,
    setProvidersLoading,
  ] = useState(false);

  const [
    plansLoading,
    setPlansLoading,
  ] = useState(false);

  const [
    verificationLoading,
    setVerificationLoading,
  ] = useState(false);

  const [
    purchaseLoading,
    setPurchaseLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /**
   * =======================================================
   * LOAD PROVIDERS
   * =======================================================
   */

  const loadProviders =
    useCallback(
      async () => {
        setProvidersLoading(
          true
        );

        setError("");

        try {
          const result =
            await getCableProviders();

          const list =
            Array.isArray(
              result
            )
              ? result
              : Array.isArray(
                  result?.data
                )
              ? result.data
              : [];

          const normalized =
            list
              .map(
                (provider) => ({
                  ...provider,

                  id:
                    provider?.id ??
                    provider?.serviceId ??
                    provider?.service_id ??
                    provider?.providerId ??
                    provider?.provider_id,

                  serviceId:
                    provider?.serviceId ??
                    provider?.service_id ??
                    provider?.id,

                  providerId:
                    provider?.providerId ??
                    provider?.provider_id ??
                    provider?.id,

                  name:
                    provider?.name ??
                    provider?.serviceName ??
                    provider?.service_name ??
                    provider?.tvName ??
                    provider?.tv_name ??
                    "Cable Provider",
                })
              )
              .filter(
                (provider) =>
                  getProviderId(
                    provider
                  ) !==
                  null
              );

          setProviders(
            normalized
          );

          return normalized;
        } catch (err) {
          const message =
            getCableApiError(
              err
            );

          setError(
            message
          );

          throw err;
        } finally {
          setProvidersLoading(
            false
          );
        }
      },
      []
    );

  /**
   * =======================================================
   * LOAD ALL PLANS
   * =======================================================
   *
   * VTUGATE does not provide an authoritative standalone
   * cable plan endpoint.
   *
   * Keep this function for compatibility.
   */

  const loadPlans =
    useCallback(
      async () => {
        setPlansLoading(
          true
        );

        setError("");

        try {
          const result =
            await getCablePlans();

          const list =
            Array.isArray(
              result
            )
              ? result
              : Array.isArray(
                  result?.data
                )
              ? result.data
              : [];

          const normalized =
            list
              .map(
                (plan) =>
                  normalizePlan(
                    plan
                  )
              )
              .filter(Boolean);

          setPlans(
            normalized
          );

          return normalized;
        } catch (err) {
          const message =
            getCableApiError(
              err
            );

          setError(
            message
          );

          throw err;
        } finally {
          setPlansLoading(
            false
          );
        }
      },
      []
    );

  /**
   * =======================================================
   * LOAD PLANS BY PROVIDER
   * =======================================================
   *
   * With VTUGATE, authoritative plans are returned directly
   * from smartcard verification.
   *
   * Therefore this does NOT call /cable/plans/:providerId
   * after verification.
   */

  const loadPlansByProvider =
    useCallback(
      async (
        providerId
      ) => {
        const existingPlans =
          selectedProviderPlans ||
          [];

        if (
          existingPlans.length >
          0
        ) {
          return existingPlans;
        }

        try {
          const result =
            await getCablePlansByProvider(
              providerId
            );

          const list =
            Array.isArray(
              result
            )
              ? result
              : Array.isArray(
                  result?.data
                )
              ? result.data
              : [];

          const normalized =
            list
              .map(
                (plan) =>
                  normalizePlan(
                    plan,
                    providerId
                  )
              )
              .filter(Boolean);

          setSelectedProviderPlans(
            normalized
          );

          return normalized;
        } catch (err) {
          /**
           * Do not break the verified flow if the compatibility
           * endpoint returns an empty list.
           *
           * VTUGATE plans are normally already in verification.
           */
          const message =
            getCableApiError(
              err
            );

          console.log(
            "CABLE COMPATIBILITY PLAN LOOKUP:",
            message
          );

          setSelectedProviderPlans(
            []
          );

          return [];
        }
      },
      [
        selectedProviderPlans,
      ]
    );

  /**
   * =======================================================
   * VERIFY SMARTCARD
   * =======================================================
   */

  const verifySmartcard =
    useCallback(
      async ({
        providerId,
        serviceId,
        phone,
        smartCardNumber,
      }) => {
        setVerificationLoading(
          true
        );

        setError("");

        try {
          const result =
            await verifyCableSmartcard(
              {
                providerId,

                serviceId,

                phone,

                smartCardNumber,
              }
            );

          setVerification(
            result
          );

          const data =
            result?.data ??
            result ??
            {};

          const rawPlans =
            data?.cable_plans ??
            data?.cablePlans ??
            result?.plans ??
            [];

          const normalizedPlans =
            Array.isArray(
              rawPlans
            )
              ? rawPlans
                  .map(
                    (plan) =>
                      normalizePlan(
                        plan,
                        serviceId ??
                          providerId
                      )
                  )
                  .filter(
                    Boolean
                  )
              : [];

          setSelectedProviderPlans(
            normalizedPlans
          );

          setPlans(
            normalizedPlans
          );

          return result;
        } catch (err) {
          const message =
            getCableApiError(
              err
            );

          setError(
            message
          );

          setVerification(
            null
          );

          setSelectedProviderPlans(
            []
          );

          throw err;
        } finally {
          setVerificationLoading(
            false
          );
        }
      },
      []
    );

  /**
   * =======================================================
   * BUY CABLE
   * =======================================================
   */

  const buyCable =
    useCallback(
      async (payload) => {
        setPurchaseLoading(
          true
        );

        setError("");

        try {
          const result =
            await purchaseCable(
              payload
            );

          return result;
        } catch (err) {
          const message =
            getCableApiError(
              err
            );

          setError(
            message
          );

          throw err;
        } finally {
          setPurchaseLoading(
            false
          );
        }
      },
      []
    );

  /**
   * =======================================================
   * TRANSACTION STATUS
   * =======================================================
   */

  const getTransactionStatus =
    useCallback(
      async (
        payload
      ) => {
        try {
          return await getCableTransactionStatus(
            payload
          );
        } catch (err) {
          setError(
            getCableApiError(
              err
            )
          );

          throw err;
        }
      },
      []
    );

  /**
   * =======================================================
   * HISTORY
   * =======================================================
   */

  const loadHistory =
    useCallback(
      async (
        params = {}
      ) => {
        try {
          return await getCableHistory(
            params
          );
        } catch (err) {
          setError(
            getCableApiError(
              err
            )
          );

          throw err;
        }
      },
      []
    );

  /**
   * =======================================================
   * STATISTICS
   * =======================================================
   */

  const loadStatistics =
    useCallback(
      async () => {
        try {
          return await getCableStatistics();
        } catch (err) {
          setError(
            getCableApiError(
              err
            )
          );

          throw err;
        }
      },
      []
    );

  /**
   * =======================================================
   * CLEAR
   * =======================================================
   */

  const clearError =
    useCallback(
      () => {
        setError("");
      },
      []
    );

  const clearVerification =
    useCallback(
      () => {
        setVerification(
          null
        );

        setSelectedProviderPlans(
          []
        );

        setPlans(
          []
        );
      },
      []
    );

  /**
   * =======================================================
   * RETURN
   * =======================================================
   */

  return {
    providers,

    plans,

    selectedProviderPlans,

    verification,

    providersLoading,

    plansLoading,

    verificationLoading,

    purchaseLoading,

    error,

    loadProviders,

    loadPlans,

    loadPlansByProvider,

    verifySmartcard,

    buyCable,

    getTransactionStatus,

    loadHistory,

    loadStatistics,

    clearError,

    clearVerification,
  };
}

export default useCable;