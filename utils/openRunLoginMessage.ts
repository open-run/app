const LOGIN_NONCE_PATTERN = /^[A-Za-z0-9_-]{32,128}$/;
const EXPIRES_AT_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;

export function isOpenRunLoginMessage({
  message,
  nonce,
  address,
}: {
  message: string;
  nonce: string;
  address: string;
}) {
  if (!LOGIN_NONCE_PATTERN.test(nonce)) {
    return false;
  }

  const lines = message.split("\n");
  if (
    lines.length !== 5 ||
    lines[0] !== "OpenRun login" ||
    lines[1] !== "" ||
    lines[2] !== `Wallet: ${address}` ||
    lines[3] !== `Nonce: ${nonce}` ||
    !lines[4].startsWith("Expires At: ")
  ) {
    return false;
  }

  return EXPIRES_AT_PATTERN.test(lines[4].slice("Expires At: ".length));
}
