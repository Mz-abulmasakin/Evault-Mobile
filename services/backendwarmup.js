// src/services/backendWarmup.js

const HEALTH_URL =
  "https://evault-backend-lm13.onrender.com/api/v1/health";

let warmupPromise = null;

export function warmUpBackend() {
  if (warmupPromise) {
    return warmupPromise;
  }

  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 75000);

  warmupPromise = fetch(HEALTH_URL, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(
          `Backend health check failed: HTTP ${response.status}`
        );
      }

      const result = await response.json();

      console.log(
        "[EVAULT WARMUP] Backend response:",
        result
      );

      return true;
    })
    .catch((error) => {
      console.log(
        "[EVAULT WARMUP] Request failed:",
        error?.message || error
      );

      warmupPromise = null;
      return false;
    })
    .finally(() => {
      clearTimeout(timeoutId);
    });

  return warmupPromise;
}