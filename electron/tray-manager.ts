import { Tray, Menu, nativeImage, app, NativeImage } from 'electron';
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

  private getTrayImage(): NativeImage {
    const candidateDirs = [
      path.join(__dirname, '..', 'assets'),
      path.join(app.getAppPath(), 'assets'),
      path.join(process.resourcesPath, 'assets')
    ];

    const iconNames = ['tray-icon.ico', 'tray-icon.png', 'app-icon.ico', 'app-icon.png'];

    for (const dir of candidateDirs) {
      for (const name of iconNames) {
        try {
          const fullPath = path.join(dir, name);
          if (fs.existsSync(fullPath)) {
            const img = nativeImage.createFromPath(fullPath);
            if (!img.isEmpty()) {
              return name.endsWith('.ico') ? img : img.resize({ width: 16, height: 16 });
            }
          }
        } catch {
          // continue checking other candidates
        }
      }
    }

    // High contrast 16x16 fallback base64 pixel pet icon so tray NEVER appears blank
    return nativeImage.createFromBuffer(
      Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAZElEQVQ4T2NkoBAwUqifYdQASuP/T5T4PzK/gZGBkRFVnBGrmQy4FDEwMDKgK8ZnFprmf0SYj24CSbEBF8YYGuCWYMRlCUEbcGvEbgDOGsJmAE578BmC13Z8ZuGzA13wU2gAAI9eFhGz3n9vAAAAAElFTkSuQmCC',
        'base64'
      )
    );
  }

  private init(): void {
    try {
      const image = this.getTrayImage();
      this.tray = new Tray(image);
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
