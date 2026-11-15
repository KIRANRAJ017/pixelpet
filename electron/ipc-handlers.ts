import { ipcMain, app, Menu } from 'electron';
import { PersistenceManager, PetSettings } from './persistence';
import { WindowManager } from './window-manager';
import { TrayManager } from './tray-manager';
import { StartupManager } from './startup-manager';

export function registerIpcHandlers(
  persistence: PersistenceManager,
  windowManager: WindowManager,
  trayManager: () => TrayManager | null
): void {
  // Settings Get
  ipcMain.handle('settings:get', async () => {
    return persistence.getSettings();
  });

  // Settings Update
  ipcMain.handle('settings:update', async (_event, partial: Partial<PetSettings>) => {
    const prev = persistence.getSettings();
    const updated = persistence.save(partial);

    // Apply immediate changes
    if (partial.size && partial.size !== prev.size) {
      windowManager.updatePetSize(partial.size);
    }

    if (typeof partial.alwaysOnTop === 'boolean' && partial.alwaysOnTop !== prev.alwaysOnTop) {
      windowManager.setAlwaysOnTop(partial.alwaysOnTop);
    }

    if (typeof partial.isHidden === 'boolean' && partial.isHidden !== prev.isHidden) {
      windowManager.setPetVisible(!partial.isHidden);
      trayManager()?.updateMenu();
    }

    if (typeof partial.startupLaunch === 'boolean' && partial.startupLaunch !== prev.startupLaunch) {
      StartupManager.setStartup(partial.startupLaunch);
    }

    // Broadcast update to all windows
    const petWin = windowManager.getPetWindow();
    const studioWin = windowManager.getStudioWindow();
    if (petWin && !petWin.isDestroyed()) {
      petWin.webContents.send('settings:changed', updated);
    }
    if (studioWin && !studioWin.isDestroyed()) {
      studioWin.webContents.send('settings:changed', updated);
    }

    return updated;
  });

  // Settings Reset
  ipcMain.handle('settings:reset', async () => {
    const updated = persistence.reset();
    windowManager.updatePetSize(updated.size);
    windowManager.setAlwaysOnTop(updated.alwaysOnTop);
    windowManager.resetPetPosition();
    windowManager.setPetVisible(true);
    StartupManager.setStartup(false);

    trayManager()?.updateMenu();

    const petWin = windowManager.getPetWindow();
    const studioWin = windowManager.getStudioWindow();
    if (petWin && !petWin.isDestroyed()) {
      petWin.webContents.send('settings:changed', updated);
    }
    if (studioWin && !studioWin.isDestroyed()) {
      studioWin.webContents.send('settings:changed', updated);
    }

    return updated;
  });

  // Pet Movement
  ipcMain.handle('pet:move', async (_event, { dx, dy }: { dx: number; dy: number }) => {
    return windowManager.movePet(dx, dy);
  });

  ipcMain.handle('pet:set-position', async (_event, { x, y }: { x: number; y: number }) => {
    return windowManager.setPetPosition(x, y);
  });

  ipcMain.handle('pet:reset-position', async () => {
    return windowManager.resetPetPosition();
  });

  // Studio Window
  ipcMain.on('studio:open', () => {
    windowManager.createOrShowStudioWindow();
  });

  ipcMain.on('studio:close', () => {
    const studio = windowManager.getStudioWindow();
    if (studio && !studio.isDestroyed()) {
      studio.hide();
    }
  });

  // Pet Visibility
  ipcMain.on('pet:hide', () => {
    windowManager.setPetVisible(false);
    trayManager()?.updateMenu();
  });

  ipcMain.on('pet:show', () => {
    windowManager.setPetVisible(true);
    trayManager()?.updateMenu();
  });

  // Quit
  ipcMain.on('app:quit', () => {
    windowManager.setQuitting(true);
    app.quit();
  });

  // Pet Actions forwarded from menus/studio to pet window
  ipcMain.on('pet:action', (_event, action: string) => {
    const petWin = windowManager.getPetWindow();
    if (petWin && !petWin.isDestroyed()) {
      petWin.webContents.send('pet:trigger-action', action);
    }
  });

  // Native context menu that never clips or gets cut off by window boundaries
  ipcMain.on('pet:show-context-menu', (_event, { isSleeping }: { isSleeping: boolean }) => {
    const petWin = windowManager.getPetWindow();
    if (!petWin || petWin.isDestroyed()) return;

    const contextMenu = Menu.buildFromTemplate([
      {
        label: '🍎  Feed',
        click: () => {
          petWin.webContents.send('pet:trigger-action', 'feed');
        }
      },
      {
        label: '✨  Pet / Interact',
        click: () => {
          petWin.webContents.send('pet:trigger-action', 'pet');
        }
      },
      {
        label: '🎨  Customize',
        click: () => {
          windowManager.createOrShowStudioWindow();
        }
      },
      {
        label: isSleeping ? '☀️  Wake' : '💤  Sleep',
        click: () => {
          petWin.webContents.send('pet:trigger-action', 'toggle-sleep');
        }
      },
      { type: 'separator' },
      {
        label: '⚙️  Settings',
        click: () => {
          windowManager.createOrShowStudioWindow();
        }
      },
      {
        label: '👁️  Hide Pet',
        click: () => {
          windowManager.setPetVisible(false);
          trayManager()?.updateMenu();
        }
      },
      { type: 'separator' },
      {
        label: '✕  Quit Pixel Pet',
        click: () => {
          windowManager.setQuitting(true);
          app.quit();
        }
      }
    ]);

    contextMenu.popup({ window: petWin });
  });
}
