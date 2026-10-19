// src/hooks/useIpe.js

import {
    useCallback,
    useRef,
    useState,
} from "react";

import {
    getIpeHistory as getIpeHistoryApi,
    getIpeService,
    getIpeStatus as getIpeStatusApi,
    submitIpe as submitIpeApi,
} from "../api/identityApi";


export default function useIpe() {

  const [service, setService] =
    useState(null);

  const [request, setRequest] =
    useState(null);

  const [history, setHistory] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [serviceLoading, setServiceLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const pollingRef =
    useRef(null);


  /**
   * =======================================================
   * LOAD SERVICE
   * =======================================================
   */
  const loadService =
    useCallback(
      async () => {

        setServiceLoading(
          true
        );

        setError(null);

        try {

          const response =
            await getIpeService();

          const data =
            response?.data ||
            response;

          setService(
            data
          );

          return data;

        } catch (err) {

          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Unable to load IPE Clearance service.";

          setError(
            message
          );

          throw err;

        } finally {

          setServiceLoading(
            false
          );
        }
      },
      []
    );


  /**
   * =======================================================
   * SUBMIT
   * =======================================================
   */
  const submitIpe =
    useCallback(
      async ({
        trackingId,
        oldTrackingId,
        nin,
        fullName,
        phoneNumber,
        note,
        transactionPin,
        ownershipConfirmed,
      }) => {

        setLoading(
          true
        );

        setError(
          null
        );

        try {

          const response =
            await submitIpeApi({
              trackingId,
              oldTrackingId,
              nin,
              fullName,
              phoneNumber,
              note,
              transactionPin,
              ownershipConfirmed,
            });

          const data =
            response?.data ||
            response;

          setRequest(
            data
          );

          return data;

        } catch (err) {

          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Unable to submit IPE Clearance.";

          setError(
            message
          );

          throw err;

        } finally {

          setLoading(
            false
          );
        }
      },
      []
    );


  /**
   * =======================================================
   * CHECK STATUS
   * =======================================================
   */
  const checkStatus =
    useCallback(
      async (
        requestId
      ) => {

        if (!requestId) {
          throw new Error(
            "IPE request ID is required."
          );
        }

        const response =
          await getIpeStatusApi(
            requestId
          );

        const data =
          response?.data ||
          response;

        setRequest(
          data
        );

        return data;
      },
      []
    );


  /**
   * =======================================================
   * START POLLING
   * =======================================================
   */
  const startPolling =
    useCallback(
      (
        requestId,
        {
          interval = 15000,
          maxAttempts = 240,
          onUpdate,
          onSuccess,
          onFailed,
        } = {}
      ) => {

        stopPolling();

        let attempts = 0;

        const poll =
          async () => {

            attempts += 1;

            try {

              const data =
                await checkStatus(
                  requestId
                );

              onUpdate?.(
                data
              );


              if (
                data?.status ===
                "SUCCESS"
              ) {

                stopPolling();

                onSuccess?.(
                  data
                );

                return;
              }


              if (
                data?.status ===
                "FAILED"
              ) {

                stopPolling();

                onFailed?.(
                  data
                );

                return;
              }


              if (
                attempts >=
                maxAttempts
              ) {

                stopPolling();

                return;
              }


              pollingRef.current =
                setTimeout(
                  poll,
                  interval
                );

            } catch (err) {

              console.log(
                "IPE polling error:",
                err?.message
              );

              if (
                attempts <
                maxAttempts
              ) {

                pollingRef.current =
                  setTimeout(
                    poll,
                    interval
                  );
              }
            }
          };


        poll();
      },
      [
        checkStatus,
      ]
    );


  /**
   * =======================================================
   * STOP POLLING
   * =======================================================
   */
  const stopPolling =
    useCallback(
      () => {

        if (
          pollingRef.current
        ) {

          clearTimeout(
            pollingRef.current
          );

          pollingRef.current =
            null;
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
      async ({
        limit = 20,
        offset = 0,
      } = {}) => {

        try {

          const response =
            await getIpeHistoryApi({
              limit,
              offset,
            });

          const data =
            response?.data ||
            response;

          const items =
            Array.isArray(data)
              ? data
              : data?.requests ||
                data?.items ||
                [];

          setHistory(
            items
          );

          return items;

        } catch (err) {

          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Unable to load IPE history.";

          setError(
            message
          );

          throw err;
        }
      },
      []
    );


  /**
   * =======================================================
   * RESET
   * =======================================================
   */
  const reset =
    useCallback(
      () => {

        stopPolling();

        setRequest(
          null
        );

        setError(
          null
        );

      },
      [
        stopPolling,
      ]
    );


  return {
    service,
    request,
    history,

    loading,
    serviceLoading,

    error,

    loadService,

    submitIpe,

    checkStatus,

    startPolling,
    stopPolling,

    loadHistory,

    reset,
  };
}