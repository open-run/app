export const DEFAULT_APP_URL = "https://open-run.vercel.app/";
export const DEFAULT_DEV_URL = "https://laughably-unblended-tiera.ngrok-free.dev/";

// Backward compatibility for existing imports.
export const URL = __DEV__ ? DEFAULT_DEV_URL : DEFAULT_APP_URL;
