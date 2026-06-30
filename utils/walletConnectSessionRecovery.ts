import AsyncStorage from "@react-native-async-storage/async-storage";

const RECOVERABLE_ERROR_PATTERNS = [
  ["missing or invalid", "record was recently deleted", "session"],
  ["no matching key"],
] as const;

const WALLETCONNECT_STORAGE_KEY_PATTERNS = [
  "walletconnect",
  "wc@2",
  "appkit",
  "reown",
  "wagmi",
  "w3m",
  "recentwallet",
] as const;

export const RECOVERED_WALLETCONNECT_SESSION_MESSAGE = "지갑 연결 세션을 정리했어요. 다시 시도해 주세요.";

function stringifyError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error != null && typeof error === "object") {
    const maybeError = error as {
      cause?: unknown;
      message?: unknown;
      reason?: unknown;
      shortMessage?: unknown;
    };
    const parts = [maybeError.message, maybeError.shortMessage, maybeError.reason, maybeError.cause]
      .filter((value): value is string => typeof value === "string" && value.length > 0);

    if (parts.length > 0) {
      return parts.join(" ");
    }
  }

  try {
    return JSON.stringify(error) ?? String(error);
  } catch {
    return String(error);
  }
}

export function isRecoverableWalletConnectSessionError(error: unknown): boolean {
  const normalizedError = stringifyError(error).toLowerCase();

  return RECOVERABLE_ERROR_PATTERNS.some((patterns) =>
    patterns.every((pattern) => normalizedError.includes(pattern))
  );
}

function isWalletConnectSessionStorageKey(key: string): boolean {
  const normalizedKey = key.toLowerCase();

  return WALLETCONNECT_STORAGE_KEY_PATTERNS.some((pattern) => normalizedKey.includes(pattern));
}

export async function clearWalletConnectSessionStorage(): Promise<string[]> {
  const keys = await AsyncStorage.getAllKeys();
  const walletConnectKeys = keys.filter(isWalletConnectSessionStorageKey);

  if (walletConnectKeys.length > 0) {
    await AsyncStorage.multiRemove(walletConnectKeys);
  }

  return walletConnectKeys;
}

export async function recoverWalletConnectSession(error: unknown): Promise<boolean> {
  if (!isRecoverableWalletConnectSessionError(error)) {
    return false;
  }

  try {
    await clearWalletConnectSessionStorage();
    return true;
  } catch {
    return false;
  }
}

export function getWalletConnectSessionErrorMessage(error: unknown, recovered: boolean): string {
  if (recovered) {
    return RECOVERED_WALLETCONNECT_SESSION_MESSAGE;
  }

  return error instanceof Error ? error.message : "Failed to connect wallet";
}
