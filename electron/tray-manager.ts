import { Tray, Menu, nativeImage, app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

export interface TrayCallbacks {
  onShowPet: () => void;
  onHidePet: () => void;
  onOpenStudio: () => void;
  onQuit: () => void;
  isPetVisible: () => boolean;
}

export class TrayManager {
  private tray: Tray | null = null;
  private callbacks: TrayCallbacks;

  constructor(callbacks: TrayCallbacks) {
    this.callbacks = callbacks;
    this.init();
  }

  private getIconPath(): string {
    const isDev = !app.isPackaged;
    const baseDir = isDev ? path.join(__dirname, '..', 'assets') : path.join(process.resourcesPath, 'assets');
    const trayPng = path.join(baseDir, 'tray-icon.png');
    if (fs.existsSync(trayPng)) {
      return trayPng;
    }
    return path.join(baseDir, 'app-icon.ico');
  }

  private init(): void {
    try {
      const iconPath = this.getIconPath();
      const image = nativeImage.createFromPath(iconPath);
      this.tray = new Tray(image.isEmpty() ? nativeImage.createEmpty() : image);
      this.tray.setToolTip('Pixel Pet - Desktop Companion');

      this.updateMenu();

      this.tray.on('click', () => {
        // Left click restores pet if hidden AND opens Pet Studio
        this.callbacks.onShowPet();
        this.callbacks.onOpenStudio();
        this.updateMenu();
      });

      this.tray.on('double-click', () => {
        if (this.callbacks.isPetVisible()) {
          this.callbacks.onHidePet();
        } else {
          this.callbacks.onShowPet();
        }
      });
    } catch (err) {
      console.error('[TrayManager] Failed to initialize tray:', err);
    }
  }

  public updateMenu(): void {
    if (!this.tray) return;

    const petVisible = this.callbacks.isPetVisible();
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Pixel Pet',
        enabled: false
      },
      { type: 'separator' },
      {
        label: petVisible ? 'Hide Pet' : 'Show Pet',
        click: () => {
          if (petVisible) {
            this.callbacks.onHidePet();
          } else {
            this.callbacks.onShowPet();
          }
          this.updateMenu();
        }
      },
      {
        label: 'Open Pet Studio',
        click: () => this.callbacks.onOpenStudio()
      },
      {
        label: 'Settings',
        click: () => this.callbacks.onOpenStudio()
      },
      { type: 'separator' },
      {
        label: 'Quit Pixel Pet',
        click: () => this.callbacks.onQuit()
      }
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  public destroy(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}
