import * as FileSystemLegacy from "expo-file-system/legacy";
import { Alert, Platform } from "react-native";
import { downloadNin } from "../api/identityApi";

function getHeaderValue(headers, key) {
  if (!headers) return null;

  if (typeof headers.get === "function") {
    return headers.get(key) || headers.get(key.toLowerCase()) || null;
  }

  const target = key.toLowerCase();

  for (const headerKey of Object.keys(headers)) {
    if (headerKey.toLowerCase() === target) {
      return headers[headerKey];
    }
  }

  return null;
}

async function getBinaryBytes(data) {
  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  }

  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }

  if (typeof data === "string") {
    const base64 = data.replace(
      /^data:application\/pdf;base64,/,
      ""
    );

    const binary = globalThis.atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
  }

  throw new Error("The NIN PDF response is not binary data.");
}

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

function makeSafeFileName(identifier, requestedName) {
  let fileName = requestedName || `NIN-${identifier}.pdf`;

  fileName = String(fileName)
    .replace(/[\\/:*?"<>|]/g, "-")
    .trim();

  if (!fileName.toLowerCase().endsWith(".pdf")) {
    fileName += ".pdf";
  }

  return fileName;
}

async function saveToAndroidPublicDirectory(bytes, fileName) {
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
      typeof StorageAccessFramework.getUriForDirectoryInRoot ===
      "function"
    ) {
      initialDirectory =
        StorageAccessFramework.getUriForDirectoryInRoot(
          "Download"
        );
    }
  } catch (error) {
    console.log(
      "[NIN DOWNLOAD] Could not resolve Download folder root:",
      error?.message || error
    );
  }

  console.log(
    "[NIN DOWNLOAD] using Android Storage Access Framework"
  );

  console.log(
    "[NIN DOWNLOAD] opening public-folder picker..."
  );

  const permission =
    await StorageAccessFramework.requestDirectoryPermissionsAsync(
      initialDirectory || undefined
    );

  if (!permission?.granted) {
    throw new Error(
      "Folder permission was not granted. Please select a folder to save the NIN slip."
    );
  }

  const directoryUri = permission.directoryUri;

  if (!directoryUri) {
    throw new Error("No Android folder was selected.");
  }

  console.log(
    "[NIN DOWNLOAD] selected public directory:",
    directoryUri
  );

  const fileUri = await StorageAccessFramework.createFileAsync(
    directoryUri,
    fileName,
    "application/pdf"
  );

  console.log(
    "[NIN DOWNLOAD] PUBLIC PDF URI:",
    fileUri
  );

  const base64 = bytesToBase64(bytes);

  await FileSystemLegacy.writeAsStringAsync(
    fileUri,
    base64,
    {
      encoding: FileSystemLegacy.EncodingType.Base64,
    }
  );

  console.log(
    "[NIN DOWNLOAD] PUBLIC PDF WRITE COMPLETE"
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
    "[NIN DOWNLOAD] PUBLIC PDF VERIFIED"
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
    "[NIN DOWNLOAD] starting download for:",
    identifier
  );

  let response;

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

  console.log(
    "[NIN DOWNLOAD] content-type:",
    contentType
  );

  console.log(
    "[NIN DOWNLOAD] content-disposition:",
    contentDisposition
  );

  console.log(
    "[NIN DOWNLOAD] x-nin-request-id:",
    responseRequestId
  );

  const bytes = await getBinaryBytes(
    response?.data
  );

  console.log(
    "[NIN DOWNLOAD] byte length:",
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
    "[NIN DOWNLOAD] file name:",
    fileName
  );

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

  const saved =
    await saveToPrivateStorage(
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