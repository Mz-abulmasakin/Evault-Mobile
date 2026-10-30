// src/hooks/useBvn.js

import {
  useCallback,
  useState,
} from "react";

import {
  getBvnHistory,
  getBvnService,
  getBvnStatus,
  submitBvn as submitBvnApi,
} from "../api/bvnApi";

import {
  downloadBvnPdf,
} from "../utils/downloadBvnPdf";

/**
 * =========================================================
 * NORMALIZE BACKEND RESPONSE
 * =========================================================
 *
 * IMPORTANT:
 *
 * bvnApi.js ALREADY removes the Axios response wrapper.
 *
 * Therefore, if the backend returns:
 *
 * {
 *   success: true,
 *   message: "...",
 *   data: {...}
 * }
 *
 * we must NOT blindly replace the response with response.data.
 *
 * We preserve:
 * - success
 * - message
 * - data
 * - requestId
 * - status
 * - PDF information
 * - card type
 */

function normalizeResponse(response) {
    if (
        !response ||
        typeof response !== "object"
    ) {
        return response;
    }

    const nested =
        response?.data;

    const request =
        response?.request ??
        nested?.request ??
        null;

    const requestId =
        response?.requestId ??
        response?.request_id ??
        response?.id ??
        nested?.requestId ??
        nested?.request_id ??
        nested?.id ??
        request?.requestId ??
        request?.request_id ??
        request?.id ??
        null;

    const status =
        response?.status ??
        response?.requestStatus ??
        response?.request_status ??
        nested?.status ??
        nested?.requestStatus ??
        nested?.request_status ??
        request?.status ??
        null;

    /**
     * Preserve the COMPLETE provider/backend result.
     */
    const result = {
        ...response,
    };

    /**
     * Expose nested data fields at the top level as well.
     *
     * This means the modal can find:
     *
     * result.requestId
     * result.reference
     * result.has_pdf
     * result.pdf_base64
     *
     * while we ALSO preserve:
     *
     * result.success
     * result.message
     * result.data
     */
    if (
        nested &&
        typeof nested === "object" &&
        !Array.isArray(nested)
    ) {
        Object.assign(
            result,
            nested
        );
    }

    if (
        request &&
        typeof request === "object"
    ) {
        Object.assign(
            result,
            request
        );
    }

    if (requestId) {
        result.requestId =
            requestId;
    }

    if (status) {
        result.status =
            String(
                status
            ).toUpperCase();
    }

    /**
     * If the backend explicitly says success,
     * keep it.
     */
    if (
        response?.success === true ||
        nested?.success === true ||
        request?.success === true
    ) {
        result.success =
            true;
    }

    return result;
}

/**
 * =========================================================
 * HOOK
 * =========================================================
 */

export function useBvn() {
    const [
        service,
        setService,
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
        serviceLoading,
        setServiceLoading,
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

    /**
     * =====================================================
     * LOAD BVN SERVICE
     * =====================================================
     */

    const loadService =
        useCallback(
            async () => {
                setServiceLoading(
                    true
                );

                setError(
                    null
                );

                try {
                    const response =
                        await getBvnService();

                    const data =
                        normalizeResponse(
                            response
                        );

                    setService(
                        data
                    );

                    return data;
                } catch (
                    err
                ) {
                    const message =
                        err?.response
                            ?.data?.message ||
                        err?.message ||
                        "Unable to load BVN service.";

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
     * =====================================================
     * SUBMIT BVN
     * =====================================================
     */

    const submitBvn =
        useCallback(
            async (
                payload
            ) => {
                setLoading(
                    true
                );

                setError(
                    null
                );

                try {
                    console.log(
                        "BVN HOOK SUBMIT PAYLOAD:",
                        {
                            ...payload,
                            bvn:
                                payload?.bvn
                                    ? `******${String(
                                          payload.bvn
                                      ).slice(-4)}`
                                    : undefined,
                            transactionPin:
                                payload?.transactionPin
                                    ? "****"
                                    : undefined,
                        }
                    );

                    const response =
                        await submitBvnApi(
                            payload
                        );

                    console.log(
                        "BVN HOOK API RESPONSE:",
                        response
                    );

                    const data =
                        normalizeResponse(
                            response
                        );

                    console.log(
                        "BVN HOOK NORMALIZED RESPONSE:",
                        {
                            success:
                                data?.success,

                            message:
                                data?.message,

                            requestId:
                                data?.requestId,

                            status:
                                data?.status,

                            reference:
                                data?.reference ??
                                data?.providerReference,

                            cardType:
                                data?.cardType ??
                                data?.card_type,

                            hasPdf:
                                data?.hasPdf ??
                                data?.has_pdf ??
                                false,

                            pdfBase64Length:
                                typeof data?.pdf_base64 ===
                                "string"
                                    ? data
                                          .pdf_base64
                                          .length
                                    : 0,
                        }
                    );

                    /**
                     * Store the complete normalized
                     * result.
                     */
                    setRequest(
                        data
                    );

                    return data;
                } catch (
                    err
                ) {
                    const message =
                        err?.response
                            ?.data?.message ||
                        err?.message ||
                        "Unable to validate BVN.";

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
     * =====================================================
     * CHECK BVN STATUS
     * =====================================================
     */

    const checkStatus =
        useCallback(
            async (
                requestId
            ) => {
                if (
                    !requestId
                ) {
                    throw new Error(
                        "BVN request ID is required."
                    );
                }

                setCheckingStatus(
                    true
                );

                setError(
                    null
                );

                try {
                    const response =
                        await getBvnStatus(
                            requestId
                        );

                    console.log(
                        "BVN STATUS API RESPONSE:",
                        response
                    );

                    const data =
                        normalizeResponse(
                            response
                        );

                    console.log(
                        "BVN STATUS NORMALIZED:",
                        {
                            success:
                                data?.success,

                            status:
                                data?.status,

                            requestId:
                                data?.requestId,

                            hasPdf:
                                data?.hasPdf ??
                                data?.has_pdf ??
                                false,

                            pdfBase64Length:
                                typeof data?.pdf_base64 ===
                                "string"
                                    ? data
                                          .pdf_base64
                                          .length
                                    : 0,
                        }
                    );

                    setRequest(
                        data
                    );

                    return data;
                } catch (
                    err
                ) {
                    const message =
                        err?.response
                            ?.data?.message ||
                        err?.message ||
                        "Unable to check BVN status.";

                    setError(
                        message
                    );

                    throw err;
                } finally {
                    setCheckingStatus(
                        false
                    );
                }
            },
            []
        );

    /**
     * =====================================================
     * BVN HISTORY
     * =====================================================
     */

    const getHistory =
        useCallback(
            async () => {
                setLoading(
                    true
                );

                setError(
                    null
                );

                try {
                    const response =
                        await getBvnHistory();

                    return normalizeResponse(
                        response
                    );
                } catch (
                    err
                ) {
                    const message =
                        err?.response
                            ?.data?.message ||
                        err?.message ||
                        "Unable to load BVN history.";

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
     * =====================================================
     * DOWNLOAD BVN PDF
     * =====================================================
     */

    const downloadBvn =
        useCallback(
            async (
                requestId
            ) => {
                if (
                    !requestId
                ) {
                    throw new Error(
                        "BVN request ID is required."
                    );
                }

                setDownloading(
                    true
                );

                setError(
                    null
                );

                try {
                    return await downloadBvnPdf(
                        requestId
                    );
                } catch (
                    err
                ) {
                    const message =
                        err?.response
                            ?.data?.message ||
                        err?.message ||
                        "Unable to download BVN slip.";

                    setError(
                        message
                    );

                    throw err;
                } finally {
                    setDownloading(
                        false
                    );
                }
            },
            []
        );

    /**
     * =====================================================
     * RESET
     * =====================================================
     */

    const reset =
        useCallback(
            () => {
                setService(
                    null
                );

                setRequest(
                    null
                );

                setLoading(
                    false
                );

                setServiceLoading(
                    false
                );

                setCheckingStatus(
                    false
                );

                setDownloading(
                    false
                );

                setError(
                    null
                );
            },
            []
        );

    return {
        service,
        request,

        loading,
        serviceLoading,
        checkingStatus,
        downloading,

        error,

        loadService,
        submitBvn,
        checkStatus,
        getHistory,
        downloadBvn,
        reset,
    };
}

export default useBvn;