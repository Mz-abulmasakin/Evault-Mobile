/**
 * =========================================================
 * eVAULT EDUCATION HOOK
 * =========================================================
 */

import {
  useCallback,
  useState,
} from "react";

import {
  getEducationServices,
  getEducationPrice,
  purchaseEducation,
} from "../api/educationApi";


export function useEducation() {
  const [
    services,
    setServices,
  ] = useState([]);


  const [
    pricing,
    setPricing,
  ] = useState(null);


  const [
    purchaseResult,
    setPurchaseResult,
  ] = useState(null);


  const [
    servicesLoading,
    setServicesLoading,
  ] = useState(false);


  const [
    pricingLoading,
    setPricingLoading,
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
   * LOAD SERVICES
   * =======================================================
   */

  const loadServices =
    useCallback(
      async () => {
        setServicesLoading(
          true
        );

        setError("");


        try {
          const result =
            await getEducationServices();


          const list =
            result?.services ??
            result?.data ??
            result ??
            [];


          const normalized =
            Array.isArray(list)
              ? list
              : [];


          setServices(
            normalized
          );


          return normalized;

        } catch (err) {

          const message =
            err?.response?.data
              ?.message ||
            err?.message ||
            "Unable to load examination result services.";


          setError(
            message
          );

          throw err;

        } finally {

          setServicesLoading(
            false
          );
        }
      },
      []
    );


  /**
   * =======================================================
   * PRICE
   * =======================================================
   */

  const loadPrice =
    useCallback(
      async ({
        serviceId,
        quantity = 1,
      }) => {
        setPricingLoading(
          true
        );

        setError("");


        try {
          const result =
            await getEducationPrice(
              {
                serviceId,
                quantity,
              }
            );


          setPricing(
            result
          );


          return result;

        } catch (err) {

          const message =
            err?.response?.data
              ?.message ||
            err?.message ||
            "Unable to retrieve examination PIN price.";


          setError(
            message
          );

          throw err;

        } finally {

          setPricingLoading(
            false
          );
        }
      },
      []
    );


  /**
   * =======================================================
   * PURCHASE
   * =======================================================
   */

  const buyEducationPin =
    useCallback(
      async ({
        serviceId,
        quantity = 1,
        transactionPin,
      }) => {
        setPurchaseLoading(
          true
        );

        setError("");

        setPurchaseResult(
          null
        );


        try {
          const result =
            await purchaseEducation(
              {
                serviceId,
                quantity,
                transactionPin,
              }
            );


          setPurchaseResult(
            result
          );


          return result;

        } catch (err) {

          const message =
            err?.response?.data
              ?.message ||
            err?.message ||
            "Examination Result PIN purchase failed.";


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


  const clearPurchase =
    useCallback(
      () => {
        setPurchaseResult(
          null
        );

        setPricing(
          null
        );

        setError("");
      },
      []
    );


  return {
    services,

    pricing,

    purchaseResult,

    servicesLoading,

    pricingLoading,

    purchaseLoading,

    error,

    loadServices,

    loadPrice,

    buyEducationPin,

    clearError,

    clearPurchase,
  };
}


export default useEducation;