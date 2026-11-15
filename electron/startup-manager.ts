import { app } from 'electron';

export class StartupManager {
  public static setStartup(enabled: boolean): boolean {
    try {
      if (app.isPackaged) {
        app.setLoginItemSettings({
          openAtLogin: enabled,
          path: process.execPath,
          args: ['--hidden']
        });
      } else {
        // In dev mode, don't pollute Windows startup registry with node/electron dev paths
        console.log(`[StartupManager] Dev mode: setting startup launch to ${enabled}`);
      }
      return true;
    } catch (err) {
      console.error('[StartupManager] Failed to update login item settings:', err);
      return false;
    }
  }

  public static isStartupEnabled(): boolean {
    try {
      const settings = app.getLoginItemSettings();
      return settings.openAtLogin;
    } catch (err) {
      console.error('[StartupManager] Failed to read login item settings:', err);
      return false;
    }
  }
}
