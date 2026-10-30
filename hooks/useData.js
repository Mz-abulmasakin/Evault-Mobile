/**
 * =========================================================
 * eVAULT DATA HOOK
 * =========================================================
 */

import {
  useCallback,
  useState,
} from "react";

import {
  buyData as buyDataApi,
  getDataPlans as getDataPlansApi,
} from "../api/dataApi";

import {
  getPlansForNetwork as filterPlansByNetwork,
  normalizeDataPlans,
} from "../utils/dataPlanUtils";

/**
 * =========================================================
 * RESPONSE HELPER
 * =========================================================
 */

function unwrapData(
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

function getErrorMessage(
  error,
  fallback
) {
  return (
    error?.response
      ?.data?.message ||
    error?.message ||
    fallback
  );
}

/**
 * =========================================================
 * HOOK
 * =========================================================
 */

export function useData() {
  const [
    plans,
    setPlans,
  ] = useState([]);

  const [
    loadingPlans,
    setLoadingPlans,
  ] = useState(false);

  const [
    purchasing,
    setPurchasing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);

  /**
   * -------------------------------------------------------
   * LOAD ALL PLANS
   * -------------------------------------------------------
   */

  const loadPlans =
    useCallback(
      async (
        network = null
      ) => {
        setLoadingPlans(
          true
        );

        setError(
          null
        );

        try {
          const response =
            await getDataPlansApi(
              network
            );

          const data =
            unwrapData(
              response
            );

          const loadedPlans =
            normalizeDataPlans(
              data?.plans ??
                data?.data ??
                data ??
                []
            );

          setPlans(
            loadedPlans
          );

          return loadedPlans;
        } catch (
          err
        ) {
          const message =
            getErrorMessage(
              err,
              "Unable to load data plans."
            );

          setError(
            message
          );

          throw err;
        } finally {
          setLoadingPlans(
            false
          );
        }
      },
      []
    );

  /**
   * -------------------------------------------------------
   * FILTER CURRENT PLANS BY NETWORK
   * -------------------------------------------------------
   *
   * This supports the existing DataPurchaseModal.
   */

  const getPlansForNetwork =
    useCallback(
      (
        network
      ) => {
        return filterPlansByNetwork(
          plans,
          network
        );
      },
      [
        plans,
      ]
    );

  /**
   * -------------------------------------------------------
   * BUY DATA
   * -------------------------------------------------------
   */

  const buyData =
    useCallback(
      async (
        payload
      ) => {
        setPurchasing(
          true
        );

        setError(
          null
        );

        try {
          const response =
            await buyDataApi(
              payload
            );

          const data =
            unwrapData(
              response
            );

          return data;
        } catch (
          err
        ) {
          const message =
            getErrorMessage(
              err,
              "Unable to complete data purchase."
            );

          setError(
            message
          );

          throw err;
        } finally {
          setPurchasing(
            false
          );
        }
      },
      []
    );

  /**
   * -------------------------------------------------------
   * CLEAR ERROR
   * -------------------------------------------------------
   */

  const clearError =
    useCallback(
      () => {
        setError(
          null
        );
      },
      []
    );

  return {
    plans,

    loadingPlans,

    purchasing,

    error,

    loadPlans,

    getPlansForNetwork,

    buyData,

    clearError,
  };
}

export default useData;