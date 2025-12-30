// Constants are now stored in the filesystem at /etc/app-config.json.
// This module re-exports helpers for loading and using that config.

export type { AppConfig, Keybind } from './config/appConfig';
export { defaultAppConfig, loadAppConfig, CONFIG_PATH } from './config/appConfig';
