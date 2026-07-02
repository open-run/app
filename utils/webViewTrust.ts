import { DEFAULT_APP_URL, DEFAULT_DEV_URL } from "@constants/index";

const trustedOpenRunOrigins = new Set([
  new URL(DEFAULT_APP_URL).origin,
  ...(__DEV__ ? [new URL(DEFAULT_DEV_URL).origin] : []),
]);

export function isAllowedWebViewNavigationUrl(url?: string) {
  if (!url || url === "about:blank") {
    return true;
  }

  return hasTrustedOpenRunOrigin(url);
}

function hasTrustedOpenRunOrigin(url: string) {
  try {
    return trustedOpenRunOrigins.has(new URL(url).origin);
  } catch {
    return false;
  }
}
