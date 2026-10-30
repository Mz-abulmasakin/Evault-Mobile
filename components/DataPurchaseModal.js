// src/components/DataPurchaseModal.js

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useData } from "../hooks/useData";
import useWallet from "../hooks/useWallet";
import TransactionReceipt from "./TransactionReceipt";

// =====================================================
// NETWORKS
// =====================================================

const NETWORKS = [
  {
    id: "mtn",
    name: "MTN",
    short: "MTN",
    color: "#FFCC00",
    textColor: "#202020",
  },
  {
    id: "airtel",
    name: "Airtel",
    short: "A",
    color: "#E31E24",
    textColor: "#FFFFFF",
  },
  {
    id: "glo",
    name: "Glo",
    short: "G",
    color: "#159447",
    textColor: "#FFFFFF",
  },
  {
    id: "9mobile",
    name: "9mobile",
    short: "9",
    color: "#006B3F",
    textColor: "#FFFFFF",
  },
];

const COLORS = {
  primary: "#087443",
  primaryLight: "#EAF7EF",
  text: "#101828",
  secondary: "#667085",
  border: "#E4E7EC",
  background: "#F8FAFC",
  danger: "#B42318",
  dangerLight: "#FEF3F2",
  white: "#FFFFFF",
};

// =====================================================
// PRICE CONFIGURATION
// =====================================================

// 2% customer markup.
// The backend must use the same pricing rule when debiting
// the wallet so the amount displayed matches the amount charged.
const DATA_MARKUP_RATE = 0.02;

const formatMoney = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return "₦0.00";

  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// =====================================================
// GENERAL HELPERS
// =====================================================

const firstValue = (object, keys) => {
  if (!object || typeof object !== "object") {
    return undefined;
  }

  for (const key of keys) {
    const value = object[key];

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return undefined;
};

const toDisplayText = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value === "object") {
    return String(
      firstValue(value, [
        "name",
        "label",
        "title",
        "text",
        "value",
        "size",
        "type",
      ]) || ""
    ).trim();
  }

  return String(value).trim();
};

// Supports arrays and common API response wrappers such as:
// { data: [...] }, { plans: [...] }, { results: [...] }.
const unwrapPlans = (value, depth = 0) => {
  if (Array.isArray(value)) {
    return value.filter(
      (item) => item && typeof item === "object"
    );
  }

  if (
    !value ||
    typeof value !== "object" ||
    depth > 5
  ) {
    return [];
  }

  const possibleKeys = [
    "plans",
    "items",
    "results",
    "records",
    "packages",
    "bundles",
    "data",
    "result",
  ];

  for (const key of possibleKeys) {
    if (value[key] === undefined) continue;

    const extracted = unwrapPlans(
      value[key],
      depth + 1
    );

    if (extracted.length > 0) {
      return extracted;
    }
  }

  return [];
};

// =====================================================
// NETWORK HELPERS
// =====================================================

const normalizeNetwork = (value) => {
  if (value && typeof value === "object") {
    value = firstValue(value, [
      "name",
      "network",
      "network_name",
      "networkName",
      "operator",
      "code",
      "slug",
      "provider_name",
      "providerName",
    ]);
  }

  const name = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  if (name.includes("mtn")) return "mtn";

  if (name.includes("airtel")) {
    return "airtel";
  }

  if (
    name.includes("glo") ||
    name.includes("globacom")
  ) {
    return "glo";
  }

  if (
    name.includes("9mobile") ||
    name.includes("etisalat")
  ) {
    return "9mobile";
  }

  return "";
};

const getPlanNetwork = (plan) => {
  const provider = firstValue(plan, [
    "network",
    "network_name",
    "networkName",
    "plan_network",
    "planNetwork",
    "operator",
    "provider",
    "provider_name",
    "providerName",
    "service_name",
    "serviceName",
  ]);

  return normalizeNetwork(provider);
};

// =====================================================
// PLAN ID AND DISPLAY NAME
// =====================================================

const getPlanId = (plan) =>
  firstValue(plan, [
    "provider_plan_id",
    "providerPlanId",
    "networkdatasub_plan_id",
    "networkDataSubPlanId",
    "data_plan_id",
    "dataPlanId",
    "api_plan_id",
    "apiPlanId",
    "plan_id",
    "planId",
    "package_id",
    "packageId",
    "product_code",
    "productCode",
    "id",
  ]);

const getPlanName = (plan) => {
  return (
    toDisplayText(
      firstValue(plan, [
        "plan_name",
        "planName",
        "provider_plan_name",
        "providerPlanName",
        "bundle_name",
        "bundleName",
        "product_name",
        "productName",
        "title",
        "name",
        "plan",
        "description",
        "data_size",
        "dataSize",
        "size",
        "volume",
      ])
    ) || "Data bundle"
  );
};

// =====================================================
// PLAN PRICE WITH 2% MARKUP
// =====================================================

const parsePrice = (value) => {
  if (value && typeof value === "object") {
    value = firstValue(value, [
      "price",
      "amount",
      "value",
      "base_price",
      "basePrice",
    ]);
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const cleaned = String(value ?? "")
    .replace(/,/g, "")
    .replace(/[^\d.-]/g, "");

  const amount = Number(cleaned);

  return Number.isFinite(amount) ? amount : 0;
};

const getPlanPrice = (plan) => {
  /*
   * Prefer explicit provider/base costs.
   * When the response has only price/amount, use those as
   * the provider price and calculate the 2% customer markup.
   */
  const basePriceValue = firstValue(plan, [
    "provider_price",
    "providerPrice",
    "provider_amount",
    "providerAmount",
    "base_price",
    "basePrice",
    "cost_price",
    "costPrice",
    "original_price",
    "originalPrice",
    "price",
    "amount",
  ]);

  if (
    basePriceValue !== undefined &&
    basePriceValue !== null &&
    basePriceValue !== ""
  ) {
    const basePrice = parsePrice(basePriceValue);

    if (basePrice <= 0) return 0;

    return Math.round(
      (
        basePrice * (1 + DATA_MARKUP_RATE) +
        Number.EPSILON
      ) * 100
    ) / 100;
  }

  /*
   * If the API supplies only a customer/selling price,
   * use it as supplied instead of accidentally marking it
   * up again.
   */
  const suppliedCustomerPrice = firstValue(plan, [
    "customerPrice",
    "customer_price",
    "selling_price",
    "sellingPrice",
    "final_price",
    "finalPrice",
    "retail_price",
    "retailPrice",
  ]);

  return Math.max(0, parsePrice(suppliedCustomerPrice));
};

// =====================================================
// PLAN VALIDITY
// =====================================================

const getPlanValidity = (plan) =>
  toDisplayText(
    firstValue(plan, [
      "validity",
      "validity_period",
      "validityPeriod",
      "duration",
      "validity_days",
      "validityDays",
      "expiry",
      "duration_name",
      "durationName",
    ])
  );

// =====================================================
// PLAN TYPE / CATEGORY
// =====================================================

const getPlanCategory = (plan) => {
  if (!plan || typeof plan !== "object") {
    return "Data bundle";
  }

  /*
   * Search many possible provider fields. The type might
   * be contained in the plan name, description, product
   * name, category, package, or provider plan metadata.
   */
  const categoryFields = [
    "name",
    "title",
    "description",
    "details",
    "plan",
    "plan_name",
    "planName",
    "provider_plan_name",
    "providerPlanName",
    "plan_description",
    "planDescription",
    "plan_type",
    "planType",
    "plan_type_name",
    "planTypeName",
    "type",
    "category",
    "category_name",
    "categoryName",
    "bundle_type",
    "bundleType",
    "bundle_name",
    "bundleName",
    "product_name",
    "productName",
    "product_type",
    "productType",
    "product_code",
    "productCode",
    "service_name",
    "serviceName",
    "service_type",
    "serviceType",
    "data_type",
    "dataType",
    "validity",
    "package_name",
    "packageName",
    "plan_code",
    "planCode",
    "network_plan_name",
    "networkPlanName",
  ];

  const searchableText = categoryFields
    .map((key) => toDisplayText(plan[key]))
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[_-]+/g, " ");

  // Specific types should be checked before generic categories.
  if (searchableText.includes("tiktok")) {
    return "TikTok";
  }

  if (searchableText.includes("whatsapp")) {
    return "WhatsApp";
  }

  if (searchableText.includes("instagram")) {
    return "Instagram";
  }

  if (searchableText.includes("facebook")) {
    return "Facebook";
  }

  if (
    searchableText.includes("youtube") ||
    searchableText.includes("you tube")
  ) {
    return "YouTube";
  }

  if (
    searchableText.includes("night") ||
    searchableText.includes("midnight")
  ) {
    return "Night plan";
  }

  if (
    searchableText.includes("gifting") ||
    searchableText.includes("gift plan") ||
    searchableText.includes("gift bundle")
  ) {
    return "Gifting";
  }

  if (
    searchableText.includes("social") ||
    searchableText.includes("social bundle")
  ) {
    return "Social bundle";
  }

  if (
    searchableText.includes("corporate") ||
    searchableText.includes("cug")
  ) {
    return "Corporate";
  }

  if (
    searchableText.includes("sme") ||
    searchableText.includes("small business")
  ) {
    return "SME";
  }

  if (searchableText.includes("weekly")) {
    return "Weekly bundle";
  }

  if (searchableText.includes("monthly")) {
    return "Monthly bundle";
  }

  if (searchableText.includes("daily")) {
    return "Daily bundle";
  }

  const suppliedCategory = toDisplayText(
    firstValue(plan, [
      "plan_type_name",
      "planTypeName",
      "plan_type",
      "planType",
      "category_name",
      "categoryName",
      "category",
      "bundle_type",
      "bundleType",
      "product_type",
      "productType",
      "type",
    ])
  );

  if (suppliedCategory) {
    return suppliedCategory
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (character) =>
        character.toUpperCase()
      );
  }

  return "Data bundle";
};

// Used for size-based sorting only.
const getSizeInMB = (name) => {
  const text = String(name || "").toLowerCase();

  const tb = text.match(/(\d+(?:\.\d+)?)\s*tb\b/);
  if (tb) return Number(tb[1]) * 1000000;

  const gb = text.match(/(\d+(?:\.\d+)?)\s*gb\b/);
  if (gb) return Number(gb[1]) * 1000;

  const mb = text.match(/(\d+(?:\.\d+)?)\s*mb\b/);
  if (mb) return Number(mb[1]);

  return Number.MAX_SAFE_INTEGER;
};

// =====================================================
// WALLET
// =====================================================

const getWalletBalance = (wallet) => {
  if (
    typeof wallet === "number" ||
    typeof wallet === "string"
  ) {
    const amount = Number(wallet);
    return Number.isFinite(amount) ? amount : null;
  }

  const value = firstValue(wallet, [
    "available_balance",
    "availableBalance",
    "balance",
    "wallet_balance",
    "walletBalance",
    "ledger_balance",
    "ledgerBalance",
  ]);

  if (value === undefined) return null;

  const amount = Number(value);

  return Number.isFinite(amount) ? amount : null;
};

// =====================================================
// COMPONENT
// =====================================================

export default function DataPurchaseModal({
  visible,
  onClose,
  onSuccess,
}) {
  const {
    plans,
    loadingPlans = false,
    error,
    loadPlans,
    buyData,
    clearError,
  } = useData();

  const {
    wallet,
    loading: walletLoading,
    refresh: refreshWallet,
  } = useWallet();

  const [step, setStep] = useState(1);
  const [network, setNetwork] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [transactionPin, setTransactionPin] = useState("");
  const [searchText, setSearchText] = useState("");
  const [localError, setLocalError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const mountedRef = useRef(true);
  const wasVisibleRef = useRef(false);

  const balance = useMemo(
    () => getWalletBalance(wallet),
    [wallet]
  );

  const allPlans = useMemo(
    () => unwrapPlans(plans),
    [plans]
  );

  /*
   * Keep plans returned by the selected-network request even
   * when the backend omits their network field. If a plan
   * explicitly identifies a different network, exclude it.
   */
  const networkPlans = useMemo(() => {
    if (!network) return [];

    return allPlans
      .filter((plan) => {
        const planNetwork = getPlanNetwork(plan);

        if (
          planNetwork &&
          planNetwork !== network.id
        ) {
          return false;
        }

        return getPlanPrice(plan) > 0;
      })
      .sort((a, b) => {
        const sizeDifference =
          getSizeInMB(getPlanName(a)) -
          getSizeInMB(getPlanName(b));

        if (sizeDifference !== 0) {
          return sizeDifference;
        }

        return getPlanPrice(a) - getPlanPrice(b);
      });
  }, [allPlans, network]);

  const displayedPlans = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) return networkPlans;

    return networkPlans.filter((plan) => {
      const text = [
        getPlanName(plan),
        getPlanCategory(plan),
        getPlanValidity(plan),
        getPlanNetwork(plan),
      ]
        .join(" ")
        .toLowerCase();

      return (
        text.includes(query) ||
        String(getPlanPrice(plan)).includes(query)
      );
    });
  }, [networkPlans, searchText]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (visible && !wasVisibleRef.current) {
      wasVisibleRef.current = true;

      setLocalError("");
      setSearchText("");

      if (typeof refreshWallet === "function") {
        Promise.resolve(refreshWallet()).catch(() => {});
      }
    }

    if (!visible) {
      wasVisibleRef.current = false;
    }
  }, [visible]); // Open-time refresh only; prevents repeated refresh loops.

  const closeModal = useCallback(() => {
    if (processing) return;

    setStep(1);
    setNetwork(null);
    setPhoneNumber("");
    setSelectedPlan(null);
    setTransactionPin("");
    setSearchText("");
    setLocalError("");
    setReceiptVisible(false);
    setReceiptData(null);

    if (typeof clearError === "function") {
      clearError();
    }

    if (typeof onClose === "function") {
      onClose();
    }
  }, [processing, clearError, onClose]);

  const chooseNetwork = useCallback(
    (item) => {
      setNetwork(item);
      setSelectedPlan(null);
      setPhoneNumber("");
      setTransactionPin("");
      setSearchText("");
      setLocalError("");
      setStep(2);

      if (typeof clearError === "function") {
        clearError();
      }

      if (typeof loadPlans === "function") {
        Promise.resolve(loadPlans(item.id)).catch((err) => {
          console.warn(
            "DATA PLAN LOAD ERROR:",
            err?.response?.data ||
              err?.message ||
              err
          );
        });
      }
    },
    [clearError, loadPlans]
  );

  const continueToPlans = () => {
    const phone = phoneNumber.replace(/\D/g, "");

    if (!/^0[789]\d{9}$/.test(phone)) {
      setLocalError(
        "Enter a valid 11-digit Nigerian phone number, e.g. 08012345678."
      );
      return;
    }

    setPhoneNumber(phone);
    setLocalError("");
    setSearchText("");
    setStep(3);
  };

  const retryPlans = () => {
    setLocalError("");

    if (
      typeof loadPlans === "function" &&
      network
    ) {
      Promise.resolve(loadPlans(network.id)).catch((err) => {
        console.warn(
          "DATA PLAN RETRY ERROR:",
          err?.response?.data ||
            err?.message ||
            err
        );
      });
    }
  };

  const choosePlan = (plan) => {
    const planId = getPlanId(plan);

    if (
      planId === undefined ||
      planId === null ||
      String(planId).trim() === ""
    ) {
      setLocalError(
        "This plan is missing its provider ID. Please reload the plans."
      );
      return;
    }

    setSelectedPlan(plan);
    setTransactionPin("");
    setLocalError("");
    setStep(4);
  };

  const handlePurchase = async () => {
    if (processing) return;

    if (!network || !selectedPlan) {
      setLocalError("Select a network and a data plan.");
      return;
    }

    const phone = phoneNumber.replace(/\D/g, "");

    if (!/^0[789]\d{9}$/.test(phone)) {
      setLocalError("Enter a valid 11-digit Nigerian phone number.");
      return;
    }

    if (!/^\d{4}$/.test(transactionPin)) {
      setLocalError("Enter your 4-digit transaction PIN.");
      return;
    }

    const amount = getPlanPrice(selectedPlan);
    const dataPlanId = getPlanId(selectedPlan);

    if (amount <= 0) {
      setLocalError(
        "This plan has no valid price. Please select another plan."
      );
      return;
    }

    if (
      dataPlanId === undefined ||
      dataPlanId === null ||
      String(dataPlanId).trim() === ""
    ) {
      setLocalError(
        "The selected plan has no valid provider ID."
      );
      return;
    }

    if (balance !== null && amount > balance) {
      setLocalError(
        `Insufficient balance. You need ${formatMoney(amount)}, but your available balance is ${formatMoney(balance)}.`
      );
      return;
    }

    setProcessing(true);
    setLocalError("");

    try {
      const result = await buyData({
        network: network.id,
        phoneNumber: phone,
        dataPlanId,
        transactionPin,
      });

      if (!mountedRef.current) return;

      if (!result || result.success === false) {
        throw new Error(
          result?.message ||
            result?.error ||
            "The data purchase could not be completed."
        );
      }

      const backendData =
        result?.data?.transaction ||
        result?.transaction ||
        result?.data ||
        result;

      const reference =
        backendData?.reference ||
        backendData?.transactionReference ||
        backendData?.transaction_reference ||
        result?.reference ||
        result?.transactionReference ||
        result?.transaction_reference ||
        result?.transactionId ||
        result?.transaction_id ||
        "";

      /*
       * amount is the same 2%-marked-up price shown in the
       * modal. The backend must apply matching pricing when
       * charging the wallet.
       */
      const receipt = {
        ...result,
        id: backendData?.id || result?.id || null,
        type: "DATA",
        service: "Data",
        title: "Data Purchase Successful",
        description: `${network.name} data - ${getPlanName(selectedPlan)}`,
        amount,
        deductedAmount: amount,
        network: network.name,
        phoneNumber: phone,
        phone_number: phone,
        recipient: phone,
        planName: getPlanName(selectedPlan),
        plan_name: getPlanName(selectedPlan),
        dataPlan: getPlanName(selectedPlan),
        validity: getPlanValidity(selectedPlan),
        category: getPlanCategory(selectedPlan),
        reference,
        transactionReference: reference,
        status:
          backendData?.status ||
          result?.status ||
          "SUCCESS",
        createdAt:
          backendData?.createdAt ||
          backendData?.created_at ||
          result?.createdAt ||
          result?.created_at ||
          new Date().toISOString(),
        transaction: {
          ...backendData,
          amount,
          deductedAmount: amount,
          reference,
          status:
            backendData?.status ||
            result?.status ||
            "SUCCESS",
          network: network.name,
          phoneNumber: phone,
          planName: getPlanName(selectedPlan),
        },
      };

      setReceiptData(receipt);
      setReceiptVisible(true);
      setTransactionPin("");

      if (typeof refreshWallet === "function") {
        Promise.resolve(refreshWallet()).catch(() => {});
      }

      if (typeof onSuccess === "function") {
        onSuccess(receipt);
      }
    } catch (err) {
      if (mountedRef.current) {
        setLocalError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Unable to complete data purchase. Please try again."
        );
      }
    } finally {
      if (mountedRef.current) {
        setProcessing(false);
      }
    }
  };

  const closeReceipt = () => {
    setReceiptVisible(false);
    setReceiptData(null);
    setStep(1);
    setNetwork(null);
    setPhoneNumber("");
    setSelectedPlan(null);
    setTransactionPin("");
    setSearchText("");

    if (typeof onClose === "function") {
      onClose();
    }
  };

  // =====================================================
  // SHARED DISPLAY COMPONENTS
  // =====================================================

  const renderHeader = (
    title,
    subtitle,
    backAction
  ) => (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
      </View>

      <TouchableOpacity
        onPress={backAction || closeModal}
        disabled={processing}
        style={styles.headerButton}
        accessibilityLabel={backAction ? "Go back" : "Close data purchase"}
      >
        <Ionicons
          name={backAction ? "arrow-back" : "close"}
          size={21}
          color={COLORS.text}
        />
      </TouchableOpacity>
    </View>
  );

  const renderProgress = () => (
    <View style={styles.progressRow}>
      {[1, 2, 3, 4].map((item) => (
        <View
          key={item}
          style={[
            styles.progressSegment,
            item <= step && styles.progressSegmentActive,
          ]}
        />
      ))}
    </View>
  );

  const renderError = () => {
    const message =
      localError ||
      (typeof error === "string"
        ? error
        : error?.message || "");

    if (!message) return null;

    return (
      <View style={styles.errorBox}>
        <Ionicons
          name="alert-circle-outline"
          size={19}
          color={COLORS.danger}
        />

        <Text style={styles.errorText}>{message}</Text>

        <TouchableOpacity
          onPress={() => {
            setLocalError("");

            if (typeof clearError === "function") {
              clearError();
            }
          }}
          accessibilityLabel="Dismiss error"
        >
          <Ionicons
            name="close"
            size={18}
            color={COLORS.danger}
          />
        </TouchableOpacity>
      </View>
    );
  };

  // =====================================================
  // STEP 1: NETWORK
  // =====================================================

  const renderNetworkStep = () => (
    <>
      {renderHeader(
        "Buy Data",
        "Choose your mobile network."
      )}

      <View style={styles.balanceCard}>
        <View>
          <Text style={styles.mutedLabel}>
            Available wallet balance
          </Text>

          <Text style={styles.balanceAmount}>
            {walletLoading
              ? "Checking..."
              : balance === null
                ? "Unavailable"
                : formatMoney(balance)}
          </Text>
        </View>

        <View style={styles.balanceIcon}>
          <Ionicons
            name="wallet-outline"
            size={24}
            color={COLORS.primary}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        Select a network
      </Text>

      <Text style={styles.sectionSubtitle}>
        Choose the network you want to buy data for.
      </Text>

      <View style={styles.networkGrid}>
        {NETWORKS.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => chooseNetwork(item)}
            activeOpacity={0.8}
            style={styles.networkCard}
          >
            <View
              style={[
                styles.networkLogo,
                { backgroundColor: item.color },
              ]}
            >
              <Text
                style={[
                  styles.networkLogoText,
                  { color: item.textColor },
                ]}
              >
                {item.short}
              </Text>
            </View>

            <Text style={styles.networkName}>
              {item.name}
            </Text>

            <Text style={styles.networkCaption}>
              Data bundles
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.trustStrip}>
        <Ionicons
          name="shield-checkmark-outline"
          size={18}
          color={COLORS.primary}
        />

        <Text style={styles.trustText}>
          Secure wallet payment
        </Text>

        <View style={styles.trustDivider} />

        <Ionicons
          name="flash-outline"
          size={18}
          color="#D97706"
        />

        <Text style={styles.trustText}>
          Fast delivery
        </Text>
      </View>
    </>
  );

  // =====================================================
  // STEP 2: RECIPIENT PHONE
  // =====================================================

  const renderPhoneStep = () => (
    <>
      {renderHeader(
        "Recipient number",
        "Enter the phone number that will receive the data.",
        () => setStep(1)
      )}

      {network && (
        <View style={styles.selectedNetworkCard}>
          <View
            style={[
              styles.networkLogoSmall,
              { backgroundColor: network.color },
            ]}
          >
            <Text
              style={[
                styles.networkLogoTextSmall,
                { color: network.textColor },
              ]}
            >
              {network.short}
            </Text>
          </View>

          <View style={styles.flexOne}>
            <Text style={styles.selectedNetworkName}>
              {network.name}
            </Text>

            <Text style={styles.mutedLabel}>
              Selected network
            </Text>
          </View>

          <TouchableOpacity onPress={() => setStep(1)}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.inputLabel}>Phone number</Text>

      <View style={styles.inputContainer}>
        <Ionicons
          name="call-outline"
          size={20}
          color={COLORS.secondary}
        />

        <TextInput
          value={phoneNumber}
          onChangeText={(value) => {
            setPhoneNumber(
              value.replace(/\D/g, "").slice(0, 11)
            );
            setLocalError("");
          }}
          placeholder="08012345678"
          placeholderTextColor="#98A2B3"
          keyboardType="phone-pad"
          maxLength={11}
          style={styles.input}
          autoFocus
        />

        {phoneNumber.length === 11 && (
          <Ionicons
            name="checkmark-circle"
            size={21}
            color={COLORS.primary}
          />
        )}
      </View>

      <Text style={styles.helperText}>
        Double-check the number. Data sent to the wrong number may not be reversible.
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={continueToPlans}
      >
        <Text style={styles.primaryButtonText}>
          View data plans
        </Text>

        <Ionicons
          name="arrow-forward"
          size={18}
          color={COLORS.white}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => setStep(1)}
      >
        <Text style={styles.secondaryButtonText}>
          Back
        </Text>
      </TouchableOpacity>
    </>
  );

  // =====================================================
  // PLAN CARD
  // =====================================================

  const renderPlanCard = (plan, index) => {
    const id = getPlanId(plan);
    const name = getPlanName(plan);
    const amount = getPlanPrice(plan);
    const validity = getPlanValidity(plan);
    const category = getPlanCategory(plan);

    const canPurchase =
      id !== undefined &&
      id !== null &&
      String(id).trim() !== "";

    return (
      <TouchableOpacity
        key={`${String(id ?? name)}-${index}`}
        activeOpacity={0.8}
        disabled={!canPurchase}
        onPress={() => choosePlan(plan)}
        style={[
          styles.planCard,
          !canPurchase && styles.planCardDisabled,
        ]}
      >
        <View style={styles.planIcon}>
          <Ionicons
            name="wifi-outline"
            size={23}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.planInfo}>
          <Text style={styles.planName}>
            {name}
          </Text>

          <View style={styles.planMetaRow}>
            <Text style={styles.categoryBadge}>
              {category}
            </Text>

            {!!validity && (
              <Text style={styles.validityText}>
                {validity}
              </Text>
            )}
          </View>

          {!canPurchase && (
            <Text style={styles.unavailableText}>
              Plan ID unavailable
            </Text>
          )}
        </View>

        <View style={styles.planPriceContainer}>
          <Text style={styles.planPrice}>
            {formatMoney(amount)}
          </Text>

          <Ionicons
            name={
              canPurchase
                ? "chevron-forward"
                : "alert-circle-outline"
            }
            size={19}
            color={
              canPurchase
                ? "#98A2B3"
                : "#D92D20"
            }
          />
        </View>
      </TouchableOpacity>
    );
  };

  // =====================================================
  // STEP 3: DATA PLANS
  // =====================================================

  const renderPlansStep = () => (
    <>
      {renderHeader(
        `${network?.name || ""} data plans`,
        "Find a bundle that suits your needs.",
        () => setStep(2)
      )}

      <View style={styles.recipientCard}>
        <View style={styles.recipientIcon}>
          <Ionicons
            name="phone-portrait-outline"
            size={20}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.flexOne}>
          <Text style={styles.mutedLabel}>
            Recipient
          </Text>

          <Text style={styles.recipientNumber}>
            {phoneNumber}
          </Text>
        </View>

        <TouchableOpacity onPress={() => setStep(2)}>
          <Text style={styles.changeText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.planHeading}>
        <Text style={styles.sectionTitle}>
          Available bundles
        </Text>

        <Text style={styles.planCount}>
          {loadingPlans
            ? "Loading..."
            : `${networkPlans.length} plans`}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={19}
          color={COLORS.secondary}
        />

        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search TikTok, WhatsApp, 1GB..."
          placeholderTextColor="#98A2B3"
          style={styles.searchInput}
          returnKeyType="search"
        />

        {!!searchText && (
          <TouchableOpacity
            onPress={() => setSearchText("")}
          >
            <Ionicons
              name="close-circle"
              size={19}
              color="#98A2B3"
            />
          </TouchableOpacity>
        )}
      </View>

      {!loadingPlans && networkPlans.length > 0 && (
        <View style={styles.markupNote}>
          <Ionicons
            name="pricetag-outline"
            size={15}
            color={COLORS.primary}
          />

          <Text style={styles.markupNoteText}>
            Prices include a 2% service markup.
          </Text>
        </View>
      )}

      {loadingPlans ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text style={styles.stateTitle}>
            Loading available plans
          </Text>

          <Text style={styles.stateText}>
            Checking the latest bundles for {network?.name}.
          </Text>
        </View>
      ) : displayedPlans.length > 0 ? (
        <View style={styles.planList}>
          {displayedPlans.map(renderPlanCard)}
        </View>
      ) : (
        <View style={styles.stateContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="cube-outline"
              size={30}
              color={COLORS.secondary}
            />
          </View>

          <Text style={styles.stateTitle}>
            {searchText
              ? "No matching plans"
              : "No plans to display"}
          </Text>

          <Text style={styles.stateText}>
            {searchText
              ? "Try a different search term."
              : "No priced bundles were found in the response for this network. Reload the plans to try again."}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={retryPlans}
          >
            <Ionicons
              name="refresh-outline"
              size={18}
              color={COLORS.primary}
            />

            <Text style={styles.retryText}>
              Reload plans
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => setStep(2)}
      >
        <Text style={styles.secondaryButtonText}>
          Back to recipient
        </Text>
      </TouchableOpacity>
    </>
  );

  // =====================================================
  // STEP 4: CONFIRMATION AND PIN
  // =====================================================

  const renderConfirmationStep = () => {
    const amount = selectedPlan
      ? getPlanPrice(selectedPlan)
      : 0;

    return (
      <>
        {renderHeader(
          "Confirm purchase",
          "Check your details before paying.",
          () => {
            setTransactionPin("");
            setStep(3);
          }
        )}

        <View style={styles.confirmCard}>
          <View style={styles.confirmNetworkRow}>
            <View
              style={[
                styles.networkLogoSmall,
                {
                  backgroundColor:
                    network?.color || COLORS.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.networkLogoTextSmall,
                  {
                    color:
                      network?.textColor || COLORS.white,
                  },
                ]}
              >
                {network?.short}
              </Text>
            </View>

            <View style={styles.flexOne}>
              <Text style={styles.confirmPlanName}>
                {selectedPlan
                  ? getPlanName(selectedPlan)
                  : "Data bundle"}
              </Text>

              <Text style={styles.mutedLabel}>
                {network?.name} · {getPlanCategory(selectedPlan)}
              </Text>
            </View>

            <Text style={styles.confirmPrice}>
              {formatMoney(amount)}
            </Text>
          </View>

          {!!getPlanValidity(selectedPlan) && (
            <View style={styles.confirmDetailRow}>
              <Text style={styles.detailLabel}>
                Validity
              </Text>

              <Text style={styles.detailValue}>
                {getPlanValidity(selectedPlan)}
              </Text>
            </View>
          )}

          <View style={styles.confirmDetailRow}>
            <Text style={styles.detailLabel}>
              Recipient
            </Text>

            <Text style={styles.detailValue}>
              {phoneNumber}
            </Text>
          </View>

          <View style={styles.confirmDetailRow}>
            <Text style={styles.detailLabel}>
              Network
            </Text>

            <Text style={styles.detailValue}>
              {network?.name}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Total payable
            </Text>

            <Text style={styles.totalAmount}>
              {formatMoney(amount)}
            </Text>
          </View>

          <Text style={styles.markupSummary}>
            Includes 2% service markup.
          </Text>
        </View>

        <View style={styles.balanceRow}>
          <View style={styles.balanceIconSmall}>
            <Ionicons
              name="wallet-outline"
              size={20}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.flexOne}>
            <Text style={styles.mutedLabel}>
              Available balance
            </Text>

            <Text style={styles.balanceRowAmount}>
              {walletLoading
                ? "Checking..."
                : balance === null
                  ? "Unavailable"
                  : formatMoney(balance)}
            </Text>
          </View>
        </View>

        <Text style={styles.inputLabel}>
          Transaction PIN
        </Text>

        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={COLORS.secondary}
          />

          <TextInput
            value={transactionPin}
            onChangeText={(value) => {
              setTransactionPin(
                value.replace(/\D/g, "").slice(0, 4)
              );
              setLocalError("");
            }}
            placeholder="Enter 4-digit PIN"
            placeholderTextColor="#98A2B3"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            style={styles.input}
            autoFocus
          />

          <Text style={styles.pinCount}>
            {transactionPin.length}/4
          </Text>
        </View>

        <Text style={styles.helperText}>
          Your PIN authorizes this wallet payment. Never share it with anyone.
        </Text>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            (
              processing ||
              transactionPin.length !== 4
            ) && styles.buttonDisabled,
          ]}
          onPress={handlePurchase}
          disabled={
            processing ||
            transactionPin.length !== 4
          }
        >
          {processing ? (
            <>
              <ActivityIndicator color={COLORS.white} />

              <Text style={styles.primaryButtonText}>
                Processing...
              </Text>
            </>
          ) : (
            <>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={COLORS.white}
              />

              <Text style={styles.primaryButtonText}>
                Pay {formatMoney(amount)}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            setTransactionPin("");
            setStep(3);
          }}
          disabled={processing}
        >
          <Text style={styles.secondaryButtonText}>
            Choose another plan
          </Text>
        </TouchableOpacity>
      </>
    );
  };

  // =====================================================
  // MODAL
  // =====================================================

  return (
    <>
      <Modal
        visible={visible && !receiptVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />

            {renderProgress()}
            {renderError()}

            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {step === 1 && renderNetworkStep()}
              {step === 2 && renderPhoneStep()}
              {step === 3 && renderPlansStep()}
              {step === 4 && renderConfirmationStep()}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {receiptVisible && receiptData && (
        <TransactionReceipt
          visible={receiptVisible}
          transaction={receiptData}
          type="DATA"
          title="Data Purchase Successful"
          subtitle={`${getPlanName(selectedPlan)} has been purchased successfully.`}
          amount={receiptData.amount}
          network={receiptData.network}
          recipient={receiptData.phoneNumber}
          service="Data"
          dataPlan={receiptData.planName}
          validity={receiptData.validity}
          reference={receiptData.reference}
          status={receiptData.status}
          date={receiptData.createdAt}
          onDone={closeReceipt}
          onClose={closeReceipt}
        />
      )}
    </>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(16, 24, 40, 0.55)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
    maxHeight: "94%",
    minHeight: "72%",
    overflow: "hidden",
    paddingBottom: Platform.OS === "ios" ? 18 : 8,
  },
  modalHandle: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 8,
    backgroundColor: "#D0D5DD",
    marginTop: 10,
    marginBottom: 3,
  },
  progressRow: {
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 15,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 5,
    backgroundColor: "#EAECF0",
  },
  progressSegmentActive: {
    backgroundColor: COLORS.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
    paddingRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.secondary,
    marginTop: 4,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F4F7",
    borderRadius: 13,
  },
  content: {
    flexGrow: 0,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 13,
    padding: 11,
    backgroundColor: COLORS.dangerLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECDCA",
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.danger,
  },
  balanceCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 17,
    padding: 16,
    marginBottom: 23,
  },
  mutedLabel: {
    fontSize: 11,
    color: COLORS.secondary,
  },
  balanceAmount: {
    fontSize: 23,
    fontWeight: "800",
    color: COLORS.primary,
    marginTop: 4,
  },
  balanceIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D5F0DF",
    borderRadius: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.secondary,
    marginTop: 5,
  },
  networkGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 16,
  },
  networkCard: {
    width: "48%",
    minHeight: 125,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    marginBottom: 12,
    padding: 12,
  },
  networkLogo: {
    width: 47,
    height: 47,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  networkLogoText: {
    fontSize: 17,
    fontWeight: "900",
  },
  networkName: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 9,
  },
  networkCaption: {
    fontSize: 11,
    color: COLORS.secondary,
    marginTop: 3,
  },
  trustStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 13,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    backgroundColor: COLORS.background,
    marginTop: 3,
  },
  trustText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#475467",
  },
  trustDivider: {
    width: 1,
    height: 16,
    backgroundColor: "#D0D5DD",
    marginHorizontal: 5,
  },
  selectedNetworkCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderRadius: 15,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 23,
  },
  networkLogoSmall: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  networkLogoTextSmall: {
    fontSize: 15,
    fontWeight: "900",
  },
  selectedNetworkName: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 3,
  },
  flexOne: {
    flex: 1,
    marginLeft: 11,
  },
  changeText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#344054",
    marginBottom: 8,
    marginTop: 19,
  },
  inputContainer: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 13,
    backgroundColor: COLORS.white,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 15,
  },
  helperText: {
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.secondary,
    marginTop: 8,
  },
  primaryButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 15,
    marginTop: 20,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.white,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    marginTop: 3,
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.secondary,
  },
  recipientCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    marginBottom: 19,
  },
  recipientIcon: {
    width: 39,
    height: 39,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
  },
  recipientNumber: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 3,
  },
  planHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 11,
  },
  planCount: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    minHeight: 47,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 12,
  },
  markupNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  markupNoteText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: "600",
  },
  planList: {
    paddingBottom: 3,
  },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 11,
    minHeight: 78,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    marginBottom: 9,
  },
  planCardDisabled: {
    backgroundColor: "#F9FAFB",
    opacity: 0.85,
  },
  planIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 13,
  },
  planInfo: {
    flex: 1,
    minWidth: 0,
  },
  planName: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.text,
  },
  planMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  categoryBadge: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
    overflow: "hidden",
  },
  validityText: {
    fontSize: 10,
    color: COLORS.secondary,
  },
  unavailableText: {
    fontSize: 10,
    color: COLORS.danger,
    marginTop: 4,
  },
  planPriceContainer: {
    alignItems: "flex-end",
    gap: 7,
  },
  planPrice: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.text,
  },
  stateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  stateTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
    marginTop: 12,
  },
  stateText: {
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.secondary,
    textAlign: "center",
    marginTop: 6,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: "#F2F4F7",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#A6D9BA",
    backgroundColor: COLORS.primaryLight,
    marginTop: 15,
  },
  retryText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary,
  },
  confirmCard: {
    padding: 15,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  confirmNetworkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 14,
  },
  confirmPlanName: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 4,
  },
  confirmPrice: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.primary,
  },
  confirmDetailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 11,
  },
  detailLabel: {
    flex: 1,
    fontSize: 12,
    color: COLORS.secondary,
  },
  detailValue: {
    flex: 1.5,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 14,
    marginTop: 16,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },
  totalAmount: {
    fontSize: 21,
    fontWeight: "900",
    color: COLORS.primary,
  },
  markupSummary: {
    fontSize: 10,
    color: COLORS.secondary,
    marginTop: 7,
    textAlign: "right",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    marginTop: 13,
  },
  balanceIconSmall: {
    width: 39,
    height: 39,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
  },
  balanceRowAmount: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 3,
  },
  pinCount: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: "700",
  },
});