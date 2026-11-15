import { app } from 'electron';
import { PersistenceManager } from './persistence';
import { WindowManager } from './window-manager';
import { TrayManager } from './tray-manager';
import { registerIpcHandlers } from './ipc-handlers';

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  let persistence: PersistenceManager;
  let windowManager: WindowManager;
  let trayManager: TrayManager | null = null;

  app.on('second-instance', () => {
    // Focus or show existing instance
    if (windowManager) {
      windowManager.setPetVisible(true);
      windowManager.createOrShowStudioWindow();
    }
  });

  app.whenReady().then(() => {
    persistence = new PersistenceManager();
    windowManager = new WindowManager(persistence);

    trayManager = new TrayManager({
      onShowPet: () => windowManager.setPetVisible(true),
      onHidePet: () => windowManager.setPetVisible(false),
      onOpenStudio: () => windowManager.createOrShowStudioWindow(),
      onQuit: () => {
        windowManager.setQuitting(true);
        app.quit();
      },
      isPetVisible: () => windowManager.isPetVisible()
    });

    registerIpcHandlers(persistence, windowManager, () => trayManager);

    // Create the pet desktop window
    windowManager.createPetWindow();

    // Prevent closing pet from closing the app
    app.on('window-all-closed', () => {
      // On Windows desktop pet apps, keeping running in the background/system tray is expected
      // We only exit when explicit quit is invoked
    });
  });

  app.on('before-quit', () => {
    if (windowManager) {
      windowManager.setQuitting(true);
    }
    if (trayManager) {
      trayManager.destroy();
      trayManager = null;
    }
  });
}
