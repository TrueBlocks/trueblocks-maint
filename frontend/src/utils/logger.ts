/**
 * Wails logger utility - routes logging to Go backend via Wails
 * Output appears in the terminal where `wails dev` or the app is running
 * NEVER use console.log() - it won't show in production
 */

// Call backend logging methods
const AppAPI: any = (window as any).go?.app?.App || {};

export const logger = {
  debug: (message: string, data?: unknown) => {
    const msg = data ? `[DEBUG] ${message}: ${JSON.stringify(data)}` : `[DEBUG] ${message}`;
    if (AppAPI.LogDebug) {
      AppAPI.LogDebug(msg);
    } else {
      console.error('AppAPI.LogDebug not available yet');
    }
  },

  info: (message: string, data?: unknown) => {
    const msg = data ? `[INFO] ${message}: ${JSON.stringify(data)}` : `[INFO] ${message}`;
    if (AppAPI.LogInfo) {
      AppAPI.LogInfo(msg);
    } else {
      console.error('AppAPI.LogInfo not available yet');
    }
  },

  warn: (message: string, data?: unknown) => {
    const msg = data ? `[WARN] ${message}: ${JSON.stringify(data)}` : `[WARN] ${message}`;
    if (AppAPI.LogWarning) {
      AppAPI.LogWarning(msg);
    } else {
      console.error('AppAPI.LogWarning not available yet');
    }
  },

  error: (message: string, error?: unknown) => {
    let msg = message;
    if (error instanceof Error) {
      msg = `[ERROR] ${message} - ${error.message}`;
    } else if (error) {
      msg = `[ERROR] ${message}: ${JSON.stringify(error)}`;
    } else {
      msg = `[ERROR] ${message}`;
    }
    if (AppAPI.LogError) {
      AppAPI.LogError(msg);
    } else {
      console.error('AppAPI.LogError not available yet');
    }
  },
};

export default logger;

