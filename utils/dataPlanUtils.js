
/**
 * =========================================================
 * eVAULT DATA PLAN UTILITIES
 * =========================================================
 *
 * Frontend only.
 *
 * IMPORTANT:
 * The backend has already applied the 2% markup.
 *
 * NEVER calculate:
 *
 *     price * 1.02
 *
 * here.
 * =========================================================
 */


/**
 * =========================================================
 * BASIC OBJECT CHECK
 * =========================================================
 */

function isObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}


/**
 * =========================================================
 * NORMALIZE NETWORK
 * =========================================================
 */

export function normalizeNetwork(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  /*
   * NetworkDataSub may return:
   *
   * {
   *   id: 1,
   *   name: "MTN",
   *   code: "mtn"
   * }
   *
   * Handle that here.
   */
  if (
    isObject(value)
  ) {
    const candidates = [
      value.name,
      value.network,
      value.network_name,
      value.networkName,
      value.code,
      value.slug,
      value.label,
      value.title,
      value.operator,
    ];

    for (
      const candidate of candidates
    ) {
      const normalized =
        normalizeNetwork(
          candidate
        );

      if (
        normalized
      ) {
        return normalized;
      }
    }

    return "";
  }

  const network =
    String(value)
      .trim()
      .toUpperCase();

  if (!network) {
    return "";
  }

  if (
    network === "9 MOBILE" ||
    network === "9 MOBILE NG" ||
    network === "9MOBILE NG" ||
    network === "ETISALAT" ||
    network.includes("9MOBILE") ||
    network.includes("9 MOBILE")
  ) {
    return "9MOBILE";
  }

  if (
    network.includes("AIRTEL")
  ) {
    return "AIRTEL";
  }

  if (
    network.includes("GLO")
  ) {
    return "GLO";
  }

  if (
    network.includes("MTN")
  ) {
    return "MTN";
  }

  return network;
}


/**
 * =========================================================
 * GET NETWORK FROM PLAN
 * =========================================================
 *
 * This is deliberately tolerant.
 *
 * If `network` is missing but the plan is:
 *
 *   MTN Gifting 1GB
 *
 * we can still identify it as MTN.
 * =========================================================
 */

export function getPlanNetwork(plan) {
  if (!plan) {
    return "";
  }

  const directCandidates = [
    plan.network,
    plan.network_name,
    plan.networkName,
    plan.operator,
    plan.network_code,
    plan.networkCode,
  ];

  for (
    const candidate of directCandidates
  ) {
    const normalized =
      normalizeNetwork(
        candidate
      );

    if (
      normalized
    ) {
      return normalized;
    }
  }

  /*
   * Fallback to plan name.
   */
  const text = [
    plan.name,
    plan.plan_name,
    plan.planName,
    plan.title,
    plan.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toUpperCase();

  if (
    text.includes("AIRTEL")
  ) {
    return "AIRTEL";
  }

  if (
    text.includes("9MOBILE") ||
    text.includes("9 MOBILE") ||
    text.includes("ETISALAT")
  ) {
    return "9MOBILE";
  }

  if (
    text.includes("GLO")
  ) {
    return "GLO";
  }

  if (
    text.includes("MTN")
  ) {
    return "MTN";
  }

  return "";
}


/**
 * =========================================================
 * GET PROVIDER PLAN ID
 * =========================================================
 */

export function getDataPlanProviderId(
  plan
) {
  if (
    !plan ||
    typeof plan !== "object"
  ) {
    return null;
  }

  const candidates = [
    plan.provider_plan_id,
    plan.providerPlanId,

    plan.plan_id,
    plan.planId,

    plan.data_plan_id,
    plan.dataPlanId,

    plan.api_plan_id,
    plan.apiPlanId,

    plan.id,
  ];

  const found =
    candidates.find(
      value =>
        value !== undefined &&
        value !== null &&
        value !== ""
    );

  return (
    found ?? null
  );
}


/**
 * =========================================================
 * GET INTERNAL PLAN ID
 * =========================================================
 */

export function getDataPlanInternalId(
  plan
) {
  if (
    !plan ||
    typeof plan !== "object"
  ) {
    return null;
  }

  return (
    plan.id ??
    null
  );
}


/**
 * =========================================================
 * GET CUSTOMER PRICE
 * =========================================================
 *
 * Backend has already added 2%.
 * =========================================================
 */

export function getPlanAmount(
  plan
) {
  if (
    !plan ||
    typeof plan !== "object"
  ) {
    return 0;
  }

  const candidates = [
    plan.customerPrice,
    plan.customer_price,
    plan.price,
    plan.amount,
  ];

  for (
    const candidate of candidates
  ) {
    if (
      isObject(candidate)
    ) {
      const nestedCandidates = [
        candidate.customerPrice,
        candidate.customer_price,
        candidate.price,
        candidate.amount,
        candidate.value,
      ];

      for (
        const nested of nestedCandidates
      ) {
        const number =
          Number(nested);

        if (
          Number.isFinite(
            number
          )
        ) {
          return number;
        }
      }

      continue;
    }

    const number =
      Number(candidate);

    if (
      Number.isFinite(number)
    ) {
      return number;
    }
  }

  return 0;
}


/**
 * =========================================================
 * GET PROVIDER PRICE
 * ========================================================= */

export function getProviderPrice(
  plan
) {
  if (
    !plan ||
    typeof plan !== "object"
  ) {
    return 0;
  }

  const candidates = [
    plan.providerPrice,
    plan.provider_price,
    plan.api_price,
    plan.apiPrice,
    plan.cost,
  ];

  for (
    const candidate of candidates
  ) {
    if (
      isObject(candidate)
    ) {
      const nested =
        getProviderPrice(
          candidate
        );

      if (
        nested > 0
      ) {
        return nested;
      }

      continue;
    }

    const number =
      Number(candidate);

    if (
      Number.isFinite(number)
    ) {
      return number;
    }
  }

  return 0;
}


/**
 * =========================================================
 * GET PLAN SIZE
 * ========================================================= */

export function getPlanSize(
  plan
) {
  if (
    !plan ||
    typeof plan !== "object"
  ) {
    return "";
  }

  const candidates = [
    plan.data_size,
    plan.dataSize,
    plan.size,
    plan.volume,
    plan.data,
  ];

  for (
    const candidate of candidates
  ) {
    if (
      candidate !== undefined &&
      candidate !== null &&
      String(candidate).trim()
    ) {
      return String(
        candidate
      ).trim();
    }
  }

  /*
   * Fallback to name.
   */
  return (
    getPlanName(
      plan
    )
  );
}


/**
 * =========================================================
 * GET PLAN VALIDITY
 * ========================================================= */

export function getPlanValidity(
  plan
) {
  if (
    !plan ||
    typeof plan !== "object"
  ) {
    return "";
  }

  const value =
    plan.validity ??
    plan.duration ??
    "";

  if (
    isObject(value)
  ) {
    const candidates = [
      value.name,
      value.label,
      value.description,
      value.duration,
      value.validity,
      value.value,
      value.days,
    ];

    for (
      const candidate of candidates
    ) {
      if (
        candidate !== undefined &&
        candidate !== null &&
        String(candidate).trim()
      ) {
        return String(
          candidate
        );
      }
    }

    return "";
  }

  return String(
    value
  );
}


/**
 * =========================================================
 * GET PLAN NAME
 * ========================================================= */

export function getPlanName(
  plan
) {
  if (
    !plan ||
    typeof plan !== "object"
  ) {
    return "Data Plan";
  }

  const candidates = [
    plan.plan_name,
    plan.name,
    plan.planName,
    plan.title,
    plan.description,
    plan.data_size,
  ];

  for (
    const candidate of candidates
  ) {
    if (
      candidate !== undefined &&
      candidate !== null &&
      String(candidate).trim()
    ) {
      return String(
        candidate
      ).trim();
    }
  }

  return "Data Plan";
}


/**
 * =========================================================
 * NORMALIZE ONE PLAN
 * ========================================================= */

export function normalizeDataPlan(
  plan
) {
  if (
    !plan ||
    typeof plan !== "object"
  ) {
    return null;
  }

  const providerPlanId =
    getDataPlanProviderId(
      plan
    );

  /*
   * A plan without an ID cannot be purchased.
   */
  if (
    providerPlanId ===
      null ||
    providerPlanId ===
      undefined
  ) {
    return null;
  }

  const amount =
    getPlanAmount(
      plan
    );

  /*
   * We still keep the plan even when amount is 0,
   * so we can see it in diagnostics instead of silently
   * throwing it away.
   */
  const network =
    getPlanNetwork(
      plan
    );

  return {
    ...plan,

    /*
     * Canonical provider ID.
     */
    providerPlanId,

    provider_plan_id:
      providerPlanId,

    dataPlanId:
      providerPlanId,

    data_plan_id:
      providerPlanId,

    planId:
      providerPlanId,

    /*
     * Display fields.
     */
    name:
      getPlanName(
        plan
      ),

    network,

    data_size:
      getPlanSize(
        plan
      ),

    validity:
      getPlanValidity(
        plan
      ),

    /*
     * Customer price.
     */
    amount,

    price:
      amount,

    customerPrice:
      amount,
  };
}


/**
 * =========================================================
 * NORMALIZE ALL PLANS
 * ========================================================= */

export function normalizeDataPlans(
  plans
) {
  if (
    !Array.isArray(plans)
  ) {
    console.log(
      "DATA PLAN UTILS: Expected array but received:",
      typeof plans
    );

    return [];
  }

  const normalized =
    plans
      .map(
        normalizeDataPlan
      )
      .filter(Boolean);

  console.log(
    "DATA PLAN UTILS NORMALIZED:",
    {
      received:
        plans.length,

      normalized:
        normalized.length,

      sample:
        normalized
          .slice(
            0,
            5
          )
          .map(
            plan => ({
              providerPlanId:
                plan.providerPlanId,

              network:
                plan.network,

              name:
                plan.name,

              amount:
                plan.amount,
            })
          ),
    }
  );

  return normalized;
}


/**
 * =========================================================
 * FILTER BY NETWORK
 * ========================================================= */

export function getPlansForNetwork(
  plans,
  network
) {
  const normalizedPlans =
    normalizeDataPlans(
      plans
    );

  const target =
    normalizeNetwork(
      network
    );

  if (!target) {
    return normalizedPlans;
  }

  const filtered =
    normalizedPlans.filter(
      plan =>
        getPlanNetwork(
          plan
        ) === target
    );

  console.log(
    "DATA PLAN NETWORK FILTER:",
    {
      target,

      total:
        normalizedPlans.length,

      matched:
        filtered.length,
    }
  );

  return filtered;
}


/**
 * =========================================================
 * MAIN DATA PLAN
 * ========================================================= */

export function isMainDataPlan(
  plan
) {
  if (!plan) {
    return false;
  }

  const text = [
    plan.name,
    plan.plan_name,
    plan.planName,
    plan.title,
    plan.description,
    plan.plan_type,
    plan.planType,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const excludedTerms = [
    "social",
    "night",
    "youtube",
    "instagram",
    "whatsapp",
    "facebook",
    "tiktok",
    "gaming",
  ];

  return !excludedTerms.some(
    term =>
      text.includes(term)
  );
}


/**
 * =========================================================
 * NORMALIZE DATA SIZE
 * ========================================================= */

export function normalizeDataSize(
  value
) {
  return String(
    value || ""
  )
    .trim()
    .toLowerCase()
    .replace(
      /\s+/g,
      ""
    )
    .replace(
      "gigabytes",
      "gb"
    )
    .replace(
      "gigabyte",
      "gb"
    )
    .replace(
      "megabytes",
      "mb"
    )
    .replace(
      "megabyte",
      "mb"
    );
}


/**
 * =========================================================
 * CHEAPEST PLAN BY SIZE
 * ========================================================= */

export function getCheapestPlansBySize(
  plans
) {
  const grouped = {};

  normalizeDataPlans(
    plans
  ).forEach(
    plan => {

      const size =
        normalizeDataSize(
          getPlanSize(
            plan
          )
        );

      if (!size) {
        return;
      }

      const current =
        grouped[size];

      if (
        !current ||
        getPlanAmount(
          plan
        ) <
          getPlanAmount(
            current
          )
      ) {
        grouped[size] =
          plan;
      }
    }
  );

  return Object.values(
    grouped
  );
}
