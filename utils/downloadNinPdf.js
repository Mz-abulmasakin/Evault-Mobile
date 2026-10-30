// utils/downloadNinPdf.js

import * as FileSystemLegacy from "expo-file-system/legacy";
import { Alert, Platform } from "react-native";
import { downloadNin } from "../api/identityApi";

// =========================================================
// HELPERS
// =========================================================

function getHeaderValue(headers, key) {
  if (!headers) return null;

  if (typeof headers.get === "function") {
    return (
      headers.get(key) ||
      headers.get(key.toLowerCase()) ||
      null
    );
  }

  const target = key.toLowerCase();

  for (const headerKey of Object.keys(headers)) {
    if (headerKey.toLowerCase() === target) {
      return headers[headerKey];
    }
  }

  return null;
}

// =========================================================
// CONVERT THE API RESPONSE INTO PDF BYTES
// =========================================================

async function getBinaryBytes(data) {
  // ArrayBuffer response
  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  }

  // Typed array response
  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(
      data.buffer,
      data.byteOffset,
      data.byteLength
    );
  }

  // Browser Blob response
  if (
    typeof Blob !== "undefined" &&
    data instanceof Blob
  ) {
    return new Uint8Array(
      await data.arrayBuffer()
    );
  }

  // Base64 or binary-string response
  if (typeof data === "string") {
    let value = data.trim();

    value = value.replace(
      /^data:application\/pdf;base64,/i,
      ""
    );

    // Support a raw PDF binary string as well.
    if (value.startsWith("%PDF-")) {
      const bytes = new Uint8Array(value.length);

      for (let i = 0; i < value.length; i += 1) {
        bytes[i] = value.charCodeAt(i) & 0xff;
      }

      return bytes;
    }

    value = value.replace(/\s/g, "");

    if (typeof globalThis.atob !== "function") {
      throw new Error(
        "This device cannot decode the PDF response."
      );
    }

    const binary = globalThis.atob(value);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
  }

  throw new Error(
    "The NIN PDF response is not binary data."
  );
}

// =========================================================
// VALIDATE PDF
// =========================================================

function isPdfBytes(bytes) {
  if (!bytes || bytes.length < 5) {
    return false;
  }

  return (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  );
}

// =========================================================
// BASE64 CONVERSION FOR NATIVE STORAGE
// =========================================================

function bytesToBase64(bytes) {
  const chunkSize = 0x8000;
  let binary = "";

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(
      i,
      Math.min(i + chunkSize, bytes.length)
    );

    binary += String.fromCharCode(...chunk);
  }

  return globalThis.btoa(binary);
}

// =========================================================
// SAFE FILE NAME
// =========================================================

function makeSafeFileName(identifier, requestedName) {
  let fileName =
    requestedName || `NIN-${identifier}.pdf`;

  fileName = String(fileName)
    .replace(/[\\/:*?"<>|]/g, "-")
    .trim();

  if (!fileName.toLowerCase().endsWith(".pdf")) {
    fileName += ".pdf";
  }

  return fileName;
}

// =========================================================
// WEB DOWNLOAD
// =========================================================

function downloadInBrowser(bytes, fileName) {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined"
  ) {
    throw new Error(
      "The browser download environment is unavailable."
    );
  }

  if (
    typeof Blob === "undefined" ||
    typeof URL === "undefined" ||
    typeof URL.createObjectURL !== "function"
  ) {
    throw new Error(
      "Your browser does not support downloading this PDF."
    );
  }

  console.log(
    "[NIN DOWNLOAD] Starting browser PDF download:",
    fileName
  );

  // Create a real PDF Blob from the validated PDF bytes.
  const pdfBlob = new Blob(
    [bytes],
    { type: "application/pdf" }
  );

  const objectUrl = URL.createObjectURL(pdfBlob);

  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = fileName;
  link.style.display = "none";
  link.setAttribute("aria-hidden", "true");

  document.body.appendChild(link);

  try {
    // Start the browser's normal file-download process.
    link.click();
  } finally {
    link.remove();
  }

  // Allow the browser time to begin processing the download.
  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 60000);

  console.log(
    "[NIN DOWNLOAD] Browser download initiated successfully."
  );

  return {
    uri: objectUrl,
    fileUri: objectUrl,
    fileName,
    size: bytes.length,
    public: true,
    shared: false,
    downloadMethod: "browser",
  };
}

// =========================================================
// ANDROID PUBLIC DOWNLOAD DIRECTORY
// =========================================================

async function saveToAndroidPublicDirectory(
  bytes,
  fileName
) {
  const StorageAccessFramework =
    FileSystemLegacy.StorageAccessFramework;

  if (!StorageAccessFramework) {
    throw new Error(
      "Android Storage Access Framework is unavailable in this Expo build."
    );
  }

  let initialDirectory = null;

  try {
    if (
      typeof StorageAccessFramework
        .getUriForDirectoryInRoot === "function"
    ) {
      initialDirectory =
        StorageAccessFramework.getUriForDirectoryInRoot(
          "Download"
        );
    }
  } catch (error) {
    console.log(
      "[NIN DOWNLOAD] Could not resolve Download folder:",
      error?.message || error
    );
  }

  const permission =
    await StorageAccessFramework
      .requestDirectoryPermissionsAsync(
        initialDirectory || undefined
      );

  if (!permission?.granted) {
    throw new Error(
      "Folder permission was not granted. Please select a folder to save the NIN slip."
    );
  }

  const directoryUri = permission.directoryUri;

  if (!directoryUri) {
    throw new Error(
      "No Android folder was selected."
    );
  }

  const fileUri =
    await StorageAccessFramework.createFileAsync(
      directoryUri,
      fileName,
      "application/pdf"
    );

  const base64 = bytesToBase64(bytes);

  await FileSystemLegacy.writeAsStringAsync(
    fileUri,
    base64,
    {
      encoding: FileSystemLegacy.EncodingType.Base64,
    }
  );

  const savedBase64 =
    await FileSystemLegacy.readAsStringAsync(
      fileUri,
      {
        encoding: FileSystemLegacy.EncodingType.Base64,
      }
    );

  if (!savedBase64 || savedBase64.length < 100) {
    throw new Error(
      "The saved NIN PDF could not be verified."
    );
  }

  console.log(
    "[NIN DOWNLOAD] Android PDF saved and verified."
  );

  return {
    uri: fileUri,
    fileUri,
    fileName,
    size: bytes.length,
    public: true,
    shared: false,
  };
}

// =========================================================
// IOS / NATIVE PRIVATE STORAGE
// =========================================================

async function saveToPrivateStorage(bytes, fileName) {
  if (!FileSystemLegacy.documentDirectory) {
    throw new Error(
      "Expo document storage is unavailable."
    );
  }

  const fileUri =
    `${FileSystemLegacy.documentDirectory}${fileName}`;

  const base64 = bytesToBase64(bytes);

  await FileSystemLegacy.writeAsStringAsync(
    fileUri,
    base64,
    {
      encoding: FileSystemLegacy.EncodingType.Base64,
    }
  );

  return {
    uri: fileUri,
    fileUri,
    fileName,
    size: bytes.length,
    public: false,
    shared: false,
  };
}

// =========================================================
// MAIN NIN PDF DOWNLOAD
// =========================================================

export async function downloadNinPdf(
  identifier,
  options = {}
) {
  if (!identifier) {
    throw new Error(
      "NIN download identifier is required."
    );
  }

  console.log(
    "[NIN DOWNLOAD] Starting download for:",
    identifier
  );

  let response;

  // Step 1: Get the PDF from your existing identity API.
  try {
    response = await downloadNin(identifier);
  } catch (error) {
    console.error(
      "[NIN DOWNLOAD] API request failed:",
      error?.response?.data ||
        error?.message ||
        error
    );

    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Unable to download the NIN slip."
    );
  }

  const contentType = getHeaderValue(
    response?.headers,
    "content-type"
  );

  const contentDisposition = getHeaderValue(
    response?.headers,
    "content-disposition"
  );

  const responseRequestId = getHeaderValue(
    response?.headers,
    "x-nin-request-id"
  );

  console.log("[NIN DOWNLOAD] Content-Type:", contentType);

  console.log(
    "[NIN DOWNLOAD] Content-Disposition:",
    contentDisposition
  );

  console.log(
    "[NIN DOWNLOAD] Request ID:",
    responseRequestId
  );

  // Step 2: Convert the response and validate the PDF.
  const bytes = await getBinaryBytes(
    response?.data
  );

  console.log(
    "[NIN DOWNLOAD] PDF byte length:",
    bytes.length
  );

  if (!isPdfBytes(bytes)) {
    throw new Error(
      "The server response is not a valid PDF file."
    );
  }

  const resolvedRequestId =
    responseRequestId || identifier;

  const fileName = makeSafeFileName(
    resolvedRequestId,
    options?.fileName
  );

  console.log(
    "[NIN DOWNLOAD] File name:",
    fileName
  );

  // Step 3: WEB — use the browser's native download.
  // Do not use Expo private file storage on web.
  if (Platform.OS === "web") {
    const saved = downloadInBrowser(
      bytes,
      fileName
    );

    return {
      success: true,
      identifier,
      requestId: resolvedRequestId,
      ...saved,
    };
  }

  // Step 4: ANDROID — preserve the existing folder picker.
  if (Platform.OS === "android") {
    const saved =
      await saveToAndroidPublicDirectory(
        bytes,
        fileName
      );

    Alert.alert(
      "NIN Slip Downloaded",
      `${fileName} has been saved successfully to the folder you selected.`
    );

    return {
      success: true,
      identifier,
      requestId: resolvedRequestId,
      ...saved,
    };
  }

  // Step 5: Other native platforms, including iOS.
  const saved = await saveToPrivateStorage(
    bytes,
    fileName
  );

  Alert.alert(
    "NIN Slip Saved",
    `${fileName} has been saved successfully.`
  );

  return {
    success: true,
    identifier,
    requestId: resolvedRequestId,
    ...saved,
  };
}

export default downloadNinPdf;