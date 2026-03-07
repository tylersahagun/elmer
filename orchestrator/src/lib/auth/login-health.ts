export type LoginRouteHealthInput = {
  status: number;
  contentType: string | null;
  body: string;
};

export type LoginRouteHealthResult = {
  ok: boolean;
  detail: string;
};

const FRAMEWORK_ERROR_MARKERS = [
  "Internal Server Error",
  "Application error",
  "Application error: a server-side exception has occurred",
];

const CLERK_SCRIPT_MARKERS = ["data-clerk-js-script", "clerk.browser.js"];
const CLERK_CONFIG_MARKERS = ["data-clerk-publishable-key", "@clerk/ui"];

export function evaluateLoginRouteHealth({
  status,
  contentType,
  body,
}: LoginRouteHealthInput): LoginRouteHealthResult {
  if (status < 200 || status >= 300) {
    return {
      ok: false,
      detail: `route returned status ${status}`,
    };
  }

  const normalizedContentType = (contentType || "").toLowerCase();
  if (!normalizedContentType.includes("text/html")) {
    return {
      ok: false,
      detail: `expected text/html response, received ${contentType || "unknown content type"}`,
    };
  }

  const errorMarker = FRAMEWORK_ERROR_MARKERS.find((marker) =>
    body.toLowerCase().includes(marker.toLowerCase()),
  );
  if (errorMarker) {
    return {
      ok: false,
      detail: `response body contains framework error marker: ${errorMarker}`,
    };
  }

  const hasClerkScriptMarker = CLERK_SCRIPT_MARKERS.some((marker) =>
    body.includes(marker),
  );
  if (!hasClerkScriptMarker) {
    return {
      ok: false,
      detail: "response body is missing Clerk script bootstrap markers",
    };
  }

  const hasClerkConfigMarker = CLERK_CONFIG_MARKERS.some((marker) =>
    body.includes(marker),
  );
  if (!hasClerkConfigMarker) {
    return {
      ok: false,
      detail: "response body is missing Clerk configuration markers",
    };
  }

  return {
    ok: true,
    detail: "status 200 and Clerk bootstrap markers present",
  };
}
