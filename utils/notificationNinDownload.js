
/**
 * =========================================================
 * eVAULT NIN NOTIFICATION DOWNLOAD HELPER
 * =========================================================
 *
 * IMPORTANT:
 * This helper deliberately does NOT assume that the
 * notification API puts metadata in one exact location.
 *
 * It searches the notification object recursively because
 * the notification hook may normalize/wrap the backend
 * response differently.
 * =========================================================
 */

import { downloadNinPdf } from "./downloadNinPdf";


/**
 * =========================================================
 * BASIC HELPERS
 * =========================================================
 */

function isObject(value) {
  return (
    value !== null &&
    typeof value === "object"
  );
}


function parseJson(value) {
  if (
    typeof value !== "string"
  ) {
    return value;
  }

  const trimmed =
    value.trim();

  if (
    !trimmed
  ) {
    return value;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}


function firstNonEmpty(values) {
  for (
    const value of values
  ) {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return String(value).trim();
    }
  }

  return null;
}


/**
 * =========================================================
 * RECURSIVE OBJECT WALK
 * =========================================================
 */

function walkObject(
  value,
  visitor,
  seen = new Set()
) {
  if (
    value === null ||
    value === undefined
  ) {
    return;
  }

  const parsed =
    parseJson(value);

  if (
    parsed !== value
  ) {
    walkObject(
      parsed,
      visitor,
      seen
    );

    return;
  }

  if (
    !isObject(value)
  ) {
    return;
  }

  if (
    seen.has(value)
  ) {
    return;
  }

  seen.add(value);

  visitor(value);

  for (
    const key of Object.keys(value)
  ) {
    const child =
      value[key];

    if (
      child === null ||
      child === undefined
    ) {
      continue;
    }

    if (
      typeof child === "object"
    ) {
      walkObject(
        child,
        visitor,
        seen
      );
    } else if (
      typeof child === "string"
    ) {
      const parsedChild =
        parseJson(child);

      if (
        parsedChild !== child &&
        typeof parsedChild === "object"
      ) {
        walkObject(
          parsedChild,
          visitor,
          seen
        );
      }
    }
  }
}


/**
 * =========================================================
 * FIND VALUE BY KEY
 * =========================================================
 */

function findValuesByKey(
  notification,
  wantedKeys
) {
  const values = [];

  const normalizedKeys =
    new Set(
      wantedKeys.map(
        (key) =>
          String(key)
            .trim()
            .toLowerCase()
      )
    );

  walkObject(
    notification,
    (object) => {
      for (
        const key of Object.keys(object)
      ) {
        const normalizedKey =
          String(key)
            .trim()
            .toLowerCase();

        if (
          normalizedKeys.has(
            normalizedKey
          )
        ) {
          const value =
            object[key];

          if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
          ) {
            values.push(value);
          }
        }
      }
    }
  );

  return values;
}


/**
 * =========================================================
 * METADATA
 * =========================================================
 */

export function getNotificationMetadata(
  notification
) {
  const candidates = [];

  walkObject(
    notification,
    (object) => {
      for (
        const key of [
          "metadata",
          "meta",
          "payload",
        ]
      ) {
        if (
          object[key] !== undefined &&
          object[key] !== null
        ) {
          const parsed =
            parseJson(
              object[key]
            );

          if (
            isObject(parsed)
          ) {
            candidates.push(
              parsed
            );
          }
        }
      }
    }
  );

  for (
    const candidate of candidates
  ) {
    if (
      Object.keys(candidate).length > 0
    ) {
      return candidate;
    }
  }

  return {};
}


/**
 * =========================================================
 * NIN REQUEST IDENTIFIER
 * =========================================================
 *
 * Priority:
 *
 * 1. requestId
 * 2. identityRequestId
 * 3. transactionReference
 * 4. providerReference
 * =========================================================
 */

export function getNinDownloadIdentifier(
  notification
) {
  const requestIds =
    findValuesByKey(
      notification,
      [
        "requestId",
        "request_id",
        "ninRequestId",
        "nin_request_id",
        "identityRequestId",
        "identity_request_id",
      ]
    );

  const requestId =
    firstNonEmpty(
      requestIds
    );

  if (
    requestId
  ) {
    return {
      value: requestId,
      kind: "requestId",
    };
  }


  const transactionReferences =
    findValuesByKey(
      notification,
      [
        "transactionReference",
        "transaction_reference",
      ]
    );

  const transactionReference =
    firstNonEmpty(
      transactionReferences
    );

  if (
    transactionReference
  ) {
    return {
      value:
        transactionReference,
      kind:
        "transactionReference",
    };
  }


  const providerReferences =
    findValuesByKey(
      notification,
      [
        "providerReference",
        "provider_reference",
      ]
    );

  const providerReference =
    firstNonEmpty(
      providerReferences
    );

  if (
    providerReference
  ) {
    return {
      value:
        providerReference,
      kind:
        "providerReference",
    };
  }


  return null;
}


/**
 * =========================================================
 * COLLECT ALL TEXT
 * =========================================================
 */

function getAllNotificationText(
  notification
) {
  const values = [];

  walkObject(
    notification,
    (object) => {
      for (
        const key of [
          "title",
          "message",
          "description",
          "body",
          "text",
          "name",
          "type",
          "identityType",
          "identity_type",
        ]
      ) {
        const value =
          object[key];

        if (
          value !== undefined &&
          value !== null &&
          typeof value !== "object"
        ) {
          values.push(
            String(value)
          );
        }
      }
    }
  );

  return values
    .join(" ")
    .toLowerCase();
}


/**
 * =========================================================
 * IS NIN NOTIFICATION
 * =========================================================
 */

export function isNinNotification(
  notification
) {
  const text =
    getAllNotificationText(
      notification
    );

  return (
    text.includes("nin") ||
    text.includes(
      "national identification"
    )
  );
}


/**
 * =========================================================
 * SUCCESSFUL NIN NOTIFICATION
 * =========================================================
 */

export function isSuccessfulNinNotification(
  notification
) {
  if (
    !isNinNotification(
      notification
    )
  ) {
    return false;
  }

  const text =
    getAllNotificationText(
      notification
    );


  const failedWords = [
    "failed",
    "failure",
    "refunded",
    "refund",
    "could not",
    "unable",
    "unsuccessful",
    "cancelled",
    "canceled",
  ];


  if (
    failedWords.some(
      (word) =>
        text.includes(word)
    )
  ) {
    return false;
  }


  const successWords = [
    "successful",
    "successfully",
    "completed",
    "complete",
    "verified",
    "verification successful",
    "validation successful",
  ];


  return successWords.some(
    (word) =>
      text.includes(word)
  );
}


/**
 * =========================================================
 * SHOULD SHOW DOWNLOAD BUTTON
 * =========================================================
 */

export function shouldShowNinDownload(
  notification
) {
  const successful =
    isSuccessfulNinNotification(
      notification
    );

  if (
    !successful
  ) {
    return false;
  }

  const identifier =
    getNinDownloadIdentifier(
      notification
    );

  /**
   * TEMPORARY IMPORTANT LOG
   *
   * This tells us exactly what the app sees.
   */
  console.log(
    "NIN DOWNLOAD UI CHECK:",
    {
      successful,
      identifier,
      notificationId:
        notification?.id,
      title:
        notification?.title,
      message:
        notification?.message,
      description:
        notification?.description,
      metadata:
        notification?.metadata,
      data:
        notification?.data,
    }
  );

  return Boolean(
    identifier
  );
}


/**
 * =========================================================
 * PDF STATE
 * =========================================================
 */

export function getNinPdfState(
  notification
) {
  if (
    !isSuccessfulNinNotification(
      notification
    )
  ) {
    return "unknown";
  }

  const values =
    findValuesByKey(
      notification,
      [
        "downloadAvailable",
        "download_available",
      ]
    );

  if (
    values.some(
      (value) =>
        value === true ||
        value === "true"
    )
  ) {
    return "available";
  }

  if (
    values.some(
      (value) =>
        value === false ||
        value === "false"
    )
  ) {
    return "unavailable";
  }

  return "unknown";
}


/**
 * =========================================================
 * NO PDF ATTACHED
 * =========================================================
 *
 * For the current eVault NIN architecture, a successful
 * NIN notification should continue showing the download
 * action. The backend is the authority for document
 * availability.
 * =========================================================
 */

export function shouldShowNoPdfAttached() {
  return false;
}


/**
 * =========================================================
 * DOWNLOAD FROM NOTIFICATION
 * =========================================================
 */

export async function downloadNinFromNotification(
  notification
) {
  if (
    !isSuccessfulNinNotification(
      notification
    )
  ) {
    throw new Error(
      "This notification does not contain a successful NIN verification."
    );
  }


  const identifier =
    getNinDownloadIdentifier(
      notification
    );


  if (
    !identifier
  ) {
    throw new Error(
      "The successful NIN notification does not contain a request reference."
    );
  }


  const fileName =
    identifier.kind ===
    "requestId"
      ? `NIN-${identifier.value}.pdf`
      : "NIN-Slip.pdf";


  console.log(
    "NIN NOTIFICATION DOWNLOAD:",
    {
      identifier,
      fileName,
    }
  );


  return downloadNinPdf(
    identifier.value,
    {
      fileName,
    }
  );
}


/**
 * =========================================================
 * DEFAULT EXPORT
 * =========================================================
 */

export default {
  getNotificationMetadata,
  getNinDownloadIdentifier,
  isNinNotification,
  isSuccessfulNinNotification,
  shouldShowNinDownload,
  getNinPdfState,
  shouldShowNoPdfAttached,
  downloadNinFromNotification,
};
