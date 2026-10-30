 // src/hooks/useNin.js

import {
  useCallback,
  useState,
} from "react";

import {
  getNinHistory,
  getNinService,
  getNinStatus,
  recoverNinByDemographics as recoverNinByDemographicsApi,
  recoverNinByPhone as recoverNinByPhoneApi,
  submitNin as submitNinApi,
} from "../api/identityApi";

import {
  downloadNinPdf,
} from "../utils/downloadNinPdf";


// ============================================================
// RESPONSE HELPERS
// ============================================================

function unwrapData(response) {
  return (
    response?.data?.data ??
    response?.data ??
    response ??
    null
  );
}


function getRequestId(data) {
  return (
    data?.requestId ??
    data?.id ??
    data?.request?.requestId ??
    data?.request?.id ??
    data?.data?.requestId ??
    data?.data?.id ??
    null
  );
}


function normalizeRequest(data) {
  if (
    !data ||
    typeof data !== "object"
  ) {
    return data;
  }

  const requestId =
    getRequestId(data);

  if (!requestId) {
    return data;
  }

  return {
    ...data,
    requestId,
  };
}


// ============================================================
// HOOK
// ============================================================

export function useNin() {
  const [
    services,
    setServices,
  ] = useState(null);

  const [
    request,
    setRequest,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    servicesLoading,
    setServicesLoading,
  ] = useState(false);

  const [
    checkingStatus,
    setCheckingStatus,
  ] = useState(false);

  const [
    downloading,
    setDownloading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);


  // ==========================================================
  // LOAD NIN SERVICES
  // ==========================================================

  const loadServices =
    useCallback(
      async () => {
        setServicesLoading(true);
        setError(null);

        try {
          const data =
            unwrapData(
              await getNinService()
            );

          setServices(data);

          return data;
        } catch (err) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Unable to load NIN service.";

          setError(message);

          throw err;
        } finally {
          setServicesLoading(false);
        }
      },
      []
    );


  // ==========================================================
  // SUBMIT NIN VERIFICATION
  // ==========================================================

  const submitNin =
    useCallback(
      async (payload) => {
        setLoading(true);
        setError(null);

        try {
          const data =
            normalizeRequest(
              unwrapData(
                await submitNinApi(
                  payload
                )
              )
            );

          setRequest(data);

          return data;
        } catch (err) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Unable to submit NIN verification.";

          setError(message);

          throw err;
        } finally {
          setLoading(false);
        }
      },
      []
    );


  // ==========================================================
  // RECOVER NIN BY PHONE
  // ==========================================================
  //
  // THIS WAS MISSING.
  //
  // NinRecoveryModal calls:
  //
  // recoverNinByPhone(...)
  //
  // so the hook MUST expose it.
  // ==========================================================

  const recoverNinByPhone =
    useCallback(
      async (payload) => {
        setLoading(true);
        setError(null);

        try {
          console.log(
            "[useNin] recoverNinByPhone payload:",
            payload
          );

          const data =
            normalizeRequest(
              unwrapData(
                await recoverNinByPhoneApi(
                  payload
                )
              )
            );

          console.log(
            "[useNin] recoverNinByPhone response:",
            data
          );

          setRequest(data);

          return data;
        } catch (err) {
          console.error(
            "[useNin] recoverNinByPhone error:",
            err
          );

          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Unable to recover NIN by phone number.";

          setError(message);

          throw err;
        } finally {
          setLoading(false);
        }
      },
      []
    );


  // ==========================================================
  // RECOVER NIN BY DEMOGRAPHICS
  // ==========================================================

  const recoverNinByDemographics =
    useCallback(
      async (payload) => {
        setLoading(true);
        setError(null);

        try {
          const data =
            normalizeRequest(
              unwrapData(
                await recoverNinByDemographicsApi(
                  payload
                )
              )
            );

          setRequest(data);

          return data;
        } catch (err) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Unable to recover NIN using demographic information.";

          setError(message);

          throw err;
        } finally {
          setLoading(false);
        }
      },
      []
    );


  // ==========================================================
  // CHECK NIN STATUS
  // ==========================================================

  const checkStatus =
    useCallback(
      async (requestId) => {
        if (!requestId) {
          throw new Error(
            "NIN request ID is required."
          );
        }

        setCheckingStatus(true);
        setError(null);

        try {
          const data =
            normalizeRequest(
              unwrapData(
                await getNinStatus(
                  requestId
                )
              )
            );

          setRequest(data);

          return data;
        } catch (err) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Unable to check NIN status.";

          setError(message);

          throw err;
        } finally {
          setCheckingStatus(false);
        }
      },
      []
    );


  // ==========================================================
  // GET NIN HISTORY
  // ==========================================================

  const getHistory =
    useCallback(
      async () => {
        setLoading(true);
        setError(null);

        try {
          return unwrapData(
            await getNinHistory()
          );
        } catch (err) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Unable to load NIN history.";

          setError(message);

          throw err;
        } finally {
          setLoading(false);
        }
      },
      []
    );


  // ==========================================================
  // DOWNLOAD NIN PDF
  // ==========================================================

  const downloadNin =
    useCallback(
      async (
        requestId,
        options = {}
      ) => {
        if (!requestId) {
          throw new Error(
            "NIN request ID is required."
          );
        }

        setDownloading(true);
        setError(null);

        try {
          return await downloadNinPdf(
            requestId,
            options
          );
        } catch (err) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Unable to download NIN slip.";

          setError(message);

          throw err;
        } finally {
          setDownloading(false);
        }
      },
      []
    );


  // ==========================================================
  // RESET
  // ==========================================================

  const reset =
    useCallback(
      () => {
        setServices(null);
        setRequest(null);
        setLoading(false);
        setServicesLoading(false);
        setCheckingStatus(false);
        setDownloading(false);
        setError(null);
      },
      []
    );


  // ==========================================================
  // RETURN
  // ==========================================================

  return {
    services,
    request,

    loading,
    servicesLoading,
    checkingStatus,
    downloading,

    error,

    loadServices,

    submitNin,

    recoverNinByPhone,
    recoverNinByDemographics,

    checkStatus,

    getHistory,

    downloadNin,

    reset,
  };
}


export default useNin;