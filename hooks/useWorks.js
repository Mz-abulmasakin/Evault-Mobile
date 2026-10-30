// src/hooks/useWorks.js

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getIpeHistory,
  getIpeStatus,
  getNinHistory,
  getNinStatus,
} from "../api/identityApi";

/**
 * =========================================================
 * STATUS HELPERS
 * =========================================================
 */

function normalizeStatus(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}

function mapWorkStatus(value) {
  const status = normalizeStatus(value);

  if (
    [
      "SUCCESS",
      "SUCCESSFUL",
      "COMPLETED",
      "COMPLETE",
      "DONE",
      "VERIFIED",
      "APPROVED",
    ].includes(status)
  ) {
    return "completed";
  }

  if (
    [
      "PROCESSING",
      "IN_PROGRESS",
      "INPROGRESS",
      "WORKING",
      "ONGOING",
    ].includes(status)
  ) {
    return "ongoing";
  }

  if (
    [
      "FAILED",
      "FAILURE",
      "ERROR",
      "REJECTED",
      "CANCELLED",
      "CANCELED",
    ].includes(status)
  ) {
    return "failed";
  }

  return "submitted";
}

function getRawStatus(item) {
  return (
    item?.status ||
    item?.state ||
    item?.providerStatus ||
    item?.provider_status ||
    item?.result?.status ||
    item?.result?.state ||
    item?.data?.status ||
    item?.data?.state ||
    ""
  );
}

/**
 * =========================================================
 * REQUEST / DATE / VALUE HELPERS
 * =========================================================
 */

function getRequestId(item) {
  return (
    item?.requestId ??
    item?.request_id ??
    item?.id ??
    null
  );
}

function getUpdatedDate(item) {
  return (
    item?.updatedAt ??
    item?.updated_at ??
    item?.createdAt ??
    item?.created_at ??
    null
  );
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "—";
  }

  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * =========================================================
 * RESPONSE UNWRAPPING
 * =========================================================
 */

function unwrapArray(response) {
  if (!response) {
    return [];
  }

  const root =
    response?.data ??
    response;

  if (Array.isArray(root)) {
    return root;
  }

  if (Array.isArray(root?.data)) {
    return root.data;
  }

  if (Array.isArray(root?.requests)) {
    return root.requests;
  }

  if (Array.isArray(root?.items)) {
    return root.items;
  }

  if (Array.isArray(root?.history)) {
    return root.history;
  }

  if (Array.isArray(root?.results)) {
    return root.results;
  }

  return [];
}

function unwrapRequest(response) {
  if (!response) {
    return null;
  }

  const root =
    response?.data ??
    response;

  if (!root || typeof root !== "object") {
    return null;
  }

  if (
    root.request &&
    typeof root.request === "object"
  ) {
    return root.request;
  }

  if (
    root.data &&
    typeof root.data === "object" &&
    !Array.isArray(root.data)
  ) {
    if (root.data.request) {
      return root.data.request;
    }

    if (
      root.data.id ||
      root.data.requestId ||
      root.data.status ||
      root.data.state
    ) {
      return root.data;
    }
  }

  return root;
}

function mergeRefreshedRequest(
  original,
  response
) {
  const refreshed =
    unwrapRequest(response);

  if (
    !refreshed ||
    typeof refreshed !== "object"
  ) {
    return original;
  }

  return {
    ...original,
    ...refreshed,
  };
}

/**
 * =========================================================
 * IPE MAPPER
 * =========================================================
 */

function mapIpeWork(item) {
  const requestId =
    getRequestId(item);

  const rawStatus =
    getRawStatus(item);

  const result =
    item?.result &&
    typeof item.result === "object"
      ? item.result
      : {};

  const reference =
    item?.transaction_reference ??
    item?.transactionReference ??
    item?.provider_reference ??
    item?.providerReference ??
    requestId;

  const providerReference =
    item?.provider_reference ??
    item?.providerReference ??
    result?.providerReference ??
    result?.provider_reference ??
    null;

  const newTrackingId =
    result?.new_tracking_id ??
    item?.new_tracking_id ??
    null;

  return {
    id:
      requestId !== null
        ? `IPE-${requestId}`
        : `IPE-${Date.now()}`,

    requestId,

    service: "IPE",

    title: "IPE Clearance",

    category:
      "Identity / NIMC Service",

    status:
      mapWorkStatus(rawStatus),

    rawStatus,

    reference:
      String(reference || "—"),

    amount:
      formatAmount(item?.amount),

    date:
      formatDate(
        getUpdatedDate(item)
      ),

    updatedAt:
      getUpdatedDate(item),

    providerReference,

    newTrackingId,

    original: item,
  };
}

/**
 * =========================================================
 * NIN MAPPER
 * =========================================================
 */

function mapNinWork(item) {
  const requestId =
    getRequestId(item);

  const rawStatus =
    getRawStatus(item);

  const result =
    item?.result &&
    typeof item.result === "object"
      ? item.result
      : {};

  const slipType =
    item?.slip_type ??
    item?.slipType ??
    result?.cardType ??
    result?.card_type ??
    "standard";

  const reference =
    item?.transaction_reference ??
    item?.transactionReference ??
    item?.provider_reference ??
    item?.providerReference ??
    requestId;

  const providerReference =
    item?.provider_reference ??
    item?.providerReference ??
    result?.providerReference ??
    result?.provider_reference ??
    null;

  return {
    id:
      requestId !== null
        ? `NIN-${requestId}`
        : `NIN-${Date.now()}`,

    requestId,

    service: "NIN",

    title: `NIN Validation • ${String(
      slipType
    ).replace(/_/g, " ")}`,

    category:
      "Identity Verification",

    status:
      mapWorkStatus(rawStatus),

    rawStatus,

    reference:
      String(reference || "—"),

    amount:
      formatAmount(item?.amount),

    date:
      formatDate(
        getUpdatedDate(item)
      ),

    updatedAt:
      getUpdatedDate(item),

    providerReference,

    slipType,

    original: item,
  };
}

/**
 * =========================================================
 * TERMINAL STATUS
 * =========================================================
 */

function isTerminalStatus(value) {
  const status =
    normalizeStatus(value);

  return [
    "SUCCESS",
    "SUCCESSFUL",
    "COMPLETED",
    "COMPLETE",
    "DONE",
    "VERIFIED",
    "APPROVED",
    "FAILED",
    "FAILURE",
    "ERROR",
    "REJECTED",
    "CANCELLED",
    "CANCELED",
  ].includes(status);
}

/**
 * =========================================================
 * REFRESH IPE STATUS
 * =========================================================
 *
 * This uses the REAL getIpeStatus() frontend API.
 *
 * No backend changes are made here.
 * =========================================================
 */

async function refreshIpeWorkStatus(
  items
) {
  if (!Array.isArray(items)) {
    return [];
  }

  return Promise.all(
    items.map(async (item) => {
      const currentStatus =
        getRawStatus(item);

      if (
        isTerminalStatus(
          currentStatus
        )
      ) {
        return item;
      }

      const requestId =
        getRequestId(item);

      if (
        requestId === null ||
        requestId === undefined
      ) {
        return item;
      }

      try {
        const response =
          await getIpeStatus(
            requestId
          );

        return mergeRefreshedRequest(
          item,
          response
        );
      } catch (error) {
        console.log(
          "[useWorks] IPE status refresh skipped:",
          error?.message ||
            "Unknown error"
        );

        return item;
      }
    })
  );
}

/**
 * =========================================================
 * REFRESH NIN STATUS
 * =========================================================
 *
 * NIN status endpoint reads the existing stored request
 * status. We do not invent or call a provider endpoint.
 * =========================================================
 */

async function refreshNinWorkStatus(
  items
) {
  if (!Array.isArray(items)) {
    return [];
  }

  return Promise.all(
    items.map(async (item) => {
      const currentStatus =
        getRawStatus(item);

      if (
        isTerminalStatus(
          currentStatus
        )
      ) {
        return item;
      }

      const requestId =
        getRequestId(item);

      if (
        requestId === null ||
        requestId === undefined
      ) {
        return item;
      }

      try {
        const response =
          await getNinStatus(
            requestId
          );

        return mergeRefreshedRequest(
          item,
          response
        );
      } catch (error) {
        console.log(
          "[useWorks] NIN status refresh skipped:",
          error?.message ||
            "Unknown error"
        );

        return item;
      }
    })
  );
}

/**
 * =========================================================
 * SORT WORKS
 * =========================================================
 */

function sortWorksNewestFirst(
  works
) {
  return [...works].sort(
    (a, b) => {
      const aTime = a?.updatedAt
        ? new Date(
            a.updatedAt
          ).getTime()
        : 0;

      const bTime = b?.updatedAt
        ? new Date(
            b.updatedAt
          ).getTime()
        : 0;

      return bTime - aTime;
    }
  );
}

/**
 * =========================================================
 * HOOK
 * =========================================================
 */

export function useWorks() {
  const [
    allWorks,
    setAllWorks,
  ] = useState([]);

  const [
    activeTab,
    setActiveTab,
  ] = useState("all");

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  /**
   * -------------------------------------------------------
   * LOAD WORK DATA
   * -------------------------------------------------------
   */

  const loadWorksData =
    useCallback(
      async ({
        initial = false,
      } = {}) => {
        if (initial) {
          setIsLoading(true);
        }

        try {
          const [
            ipeResult,
            ninResult,
          ] =
            await Promise.allSettled([
              getIpeHistory({
                limit: 50,
                offset: 0,
              }),

              getNinHistory(),
            ]);

          /**
           * =================================================
           * IPE HISTORY
           * =================================================
           */

          let ipeItems =
            ipeResult.status ===
            "fulfilled"
              ? unwrapArray(
                  ipeResult.value
                )
              : [];

          ipeItems =
            ipeItems.filter(
              (item) => {
                const provider =
                  String(
                    item?.provider ||
                      item?.provider_name ||
                      ""
                  ).toLowerCase();

                return (
                  provider ===
                  "instantipe"
                );
              }
            );

          ipeItems =
            await refreshIpeWorkStatus(
              ipeItems
            );

          /**
           * =================================================
           * NIN HISTORY
           * =================================================
           */

          let ninItems =
            ninResult.status ===
            "fulfilled"
              ? unwrapArray(
                  ninResult.value
                )
              : [];

          ninItems =
            ninItems.filter(
              (item) => {
                const provider =
                  String(
                    item?.provider ||
                      ""
                  ).toLowerCase();

                const validationType =
                  String(
                    item?.validation_type ??
                      item?.validationType ??
                      item?.result
                        ?.validationType ??
                      ""
                  ).toLowerCase();

                /**
                 * Only NetworkDataSub NIN
                 * validation belongs here.
                 *
                 * Phone recovery is intentionally
                 * excluded from the Works NIN
                 * validation list.
                 */

                return (
                  provider ===
                    "networkdatasub" &&
                  validationType !==
                    "phone"
                );
              }
            );

          ninItems =
            await refreshNinWorkStatus(
              ninItems
            );

          /**
           * =================================================
           * COMBINE
           * =================================================
           */

          const works = [
            ...ipeItems.map(
              mapIpeWork
            ),

            ...ninItems.map(
              mapNinWork
            ),
          ];

          setAllWorks(
            sortWorksNewestFirst(
              works
            )
          );
        } catch (error) {
          console.error(
            "[useWorks] Error loading service operations:",
            error
          );
        } finally {
          if (initial) {
            setIsLoading(false);
          }
        }
      },
      []
    );

  /**
   * -------------------------------------------------------
   * INITIAL LOAD
   * -------------------------------------------------------
   */

  useEffect(() => {
    loadWorksData({
      initial: true,
    });
  }, [loadWorksData]);

  /**
   * -------------------------------------------------------
   * AUTOMATIC REFRESH
   * -------------------------------------------------------
   *
   * Refresh every 15 seconds while WorksScreen is mounted.
   * -------------------------------------------------------
   */

  useEffect(() => {
    const interval =
      setInterval(() => {
        loadWorksData();
      }, 15000);

    return () =>
      clearInterval(interval);
  }, [loadWorksData]);

  /**
   * -------------------------------------------------------
   * FILTER
   * -------------------------------------------------------
   */

  const filteredWorks =
    useMemo(() => {
      if (activeTab === "all") {
        return allWorks;
      }

      if (
        activeTab ===
        "ongoing"
      ) {
        return allWorks.filter(
          (item) =>
            item?.status ===
              "submitted" ||
            item?.status ===
              "ongoing"
        );
      }

      if (
        activeTab ===
        "completed"
      ) {
        return allWorks.filter(
          (item) =>
            item?.status ===
            "completed"
        );
      }

      return allWorks;
    }, [
      activeTab,
      allWorks,
    ]);

  /**
   * -------------------------------------------------------
   * MANUAL REFRESH
   * -------------------------------------------------------
   */

  const refreshWorksList =
    useCallback(
      async () => {
        setIsRefreshing(true);

        try {
          await loadWorksData();
        } finally {
          setIsRefreshing(false);
        }
      },
      [loadWorksData]
    );

  return {
    filteredWorks,
    activeTab,
    setActiveTab,
    isLoading,
    isRefreshing,
    refreshWorksList,
  };
}

export default useWorks;