import { BrowserWindow, screen, app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { PersistenceManager, PetSettings } from './persistence';

const SIZE_DIMENSIONS = {
  small: { width: 96, height: 96 },
  normal: { width: 144, height: 144 },
  large: { width: 192, height: 192 }
};

export class WindowManager {
  private petWindow: BrowserWindow | null = null;
  private studioWindow: BrowserWindow | null = null;
  private persistence: PersistenceManager;
  private isQuitting: boolean = false;

  constructor(persistence: PersistenceManager) {
    this.persistence = persistence;
  }

  public getIconPath(): string {
    const isDev = !app.isPackaged;
    if (isDev) {
      const pIco = path.join(__dirname, '..', 'assets', 'app-icon.ico');
      if (fs.existsSync(pIco)) return pIco;
      return path.join(__dirname, '..', 'assets', 'app-icon.png');
    }
    const pIco = path.join(process.resourcesPath, 'assets', 'app-icon.ico');
    if (fs.existsSync(pIco)) return pIco;
    return path.join(process.resourcesPath, 'assets', 'app-icon.png');
  }

  public setQuitting(val: boolean): void {
    this.isQuitting = val;
  }

  public getPetWindow(): BrowserWindow | null {
    return this.petWindow;
  }

  public getStudioWindow(): BrowserWindow | null {
    return this.studioWindow;
  }

  public createPetWindow(): BrowserWindow {
    const settings = this.persistence.getSettings();
    const dims = SIZE_DIMENSIONS[settings.size] || SIZE_DIMENSIONS.normal;

    const initialPos = this.calculateInitialPosition(settings, dims.width, dims.height);
    const iconPath = this.getIconPath();

    this.petWindow = new BrowserWindow({
      width: dims.width,
      height: dims.height,
      x: initialPos.x,
      y: initialPos.y,
      frame: false,
      transparent: true,
      resizable: false,
      alwaysOnTop: settings.alwaysOnTop,
      skipTaskbar: false, // Visible in Windows bottom taskbar bar
      hasShadow: false,
      focusable: false, // Prevents stealing keyboard focus from active apps
      icon: iconPath,
      title: 'Pixel Pet',
      show: !settings.isHidden,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true
      }
    });

    this.petWindow.on('restore', () => {
      this.setPetVisible(true);
    });

    // Load pet window
    if (!app.isPackaged && process.env.VITE_DEV_SERVER_URL) {
      this.petWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}/pet.html`);
    } else {
      this.petWindow.loadFile(path.join(__dirname, '..', 'dist', 'pet.html'));
    }

    this.petWindow.on('closed', () => {
      this.petWindow = null;
    });

    return this.petWindow;
  }

  public createOrShowStudioWindow(): BrowserWindow {
    if (this.studioWindow && !this.studioWindow.isDestroyed()) {
      this.studioWindow.show();
      this.studioWindow.focus();
      return this.studioWindow;
    }

    this.studioWindow = new BrowserWindow({
      width: 520,
      height: 660,
      minWidth: 460,
      minHeight: 560,
      frame: true,
      title: 'Pixel Pet Studio',
      icon: this.getIconPath(),
      backgroundColor: '#121316',
      autoHideMenuBar: true,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true
      }
    });

    if (!app.isPackaged && process.env.VITE_DEV_SERVER_URL) {
      this.studioWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}/studio.html`);
    } else {
      this.studioWindow.loadFile(path.join(__dirname, '..', 'dist', 'studio.html'));
    }

    this.studioWindow.once('ready-to-show', () => {
      this.studioWindow?.show();
    });

    // Closing the studio window only hides it unless application is quitting
    this.studioWindow.on('close', (e) => {
      if (!this.isQuitting) {
        e.preventDefault();
        this.studioWindow?.hide();
      }
    });

    this.studioWindow.on('closed', () => {
      this.studioWindow = null;
    });

    return this.studioWindow;
  }

  public updatePetSize(size: 'small' | 'normal' | 'large'): void {
    if (!this.petWindow || this.petWindow.isDestroyed()) return;

    const dims = SIZE_DIMENSIONS[size] || SIZE_DIMENSIONS.normal;
    const currentBounds = this.petWindow.getBounds();

    // Adjust position so pet stays anchored near bottom
    const newY = currentBounds.y + (currentBounds.height - dims.height);
    const clamped = this.clampToBounds(currentBounds.x, newY, dims.width, dims.height);

    this.petWindow.setBounds({
      x: clamped.x,
      y: clamped.y,
      width: dims.width,
      height: dims.height
    });

    this.persistence.save({ position: { x: clamped.x, y: clamped.y }, size });
  }

  public setAlwaysOnTop(alwaysOnTop: boolean): void {
    if (this.petWindow && !this.petWindow.isDestroyed()) {
      this.petWindow.setAlwaysOnTop(alwaysOnTop, 'screen-saver');
    }
  }

  public movePet(dx: number, dy: number): { x: number; y: number } | null {
    if (!this.petWindow || this.petWindow.isDestroyed()) return null;

    const bounds = this.petWindow.getBounds();
    const targetX = bounds.x + dx;
    const targetY = bounds.y + dy;

    const clamped = this.clampToBounds(targetX, targetY, bounds.width, bounds.height);
    this.petWindow.setPosition(clamped.x, clamped.y);
    return clamped;
  }

  public setPetPosition(x: number, y: number): { x: number; y: number } | null {
    if (!this.petWindow || this.petWindow.isDestroyed()) return null;

    const bounds = this.petWindow.getBounds();
    const clamped = this.clampToBounds(x, y, bounds.width, bounds.height);
    this.petWindow.setPosition(clamped.x, clamped.y);
    this.persistence.save({ position: clamped });
    return clamped;
  }

  public resetPetPosition(): { x: number; y: number } {
    const settings = this.persistence.getSettings();
    const dims = SIZE_DIMENSIONS[settings.size] || SIZE_DIMENSIONS.normal;
    const primary = screen.getPrimaryDisplay();
    const workArea = primary.workArea;

    const x = workArea.x + workArea.width - dims.width - 40;
    const y = workArea.y + workArea.height - dims.height - 40;

    if (this.petWindow && !this.petWindow.isDestroyed()) {
      this.petWindow.setPosition(x, y);
    }
    this.persistence.save({ position: { x, y } });
    return { x, y };
  }

  public setPetVisible(visible: boolean): void {
    if (this.petWindow && !this.petWindow.isDestroyed()) {
      if (visible) {
        this.petWindow.show();
        const settings = this.persistence.getSettings();
        if (settings.alwaysOnTop) {
          this.petWindow.setAlwaysOnTop(true, 'screen-saver');
        }
        // Force refresh bounds to ensure Windows DWM repaints transparent surface
        const bounds = this.petWindow.getBounds();
        this.petWindow.setBounds(bounds);
      } else {
        this.petWindow.hide();
      }
    }
    this.persistence.save({ isHidden: !visible });

    // Notify Pet Studio and any open windows of new visibility state
    const updated = this.persistence.getSettings();
    const petWin = this.getPetWindow();
    const studioWin = this.getStudioWindow();
    if (petWin && !petWin.isDestroyed()) {
      petWin.webContents.send('settings:changed', updated);
    }
    if (studioWin && !studioWin.isDestroyed()) {
      studioWin.webContents.send('settings:changed', updated);
    }
  }

  public isPetVisible(): boolean {
    if (!this.petWindow || this.petWindow.isDestroyed()) return false;
    return this.petWindow.isVisible();
  }

  private calculateInitialPosition(settings: PetSettings, width: number, height: number): { x: number; y: number } {
    const displays = screen.getAllDisplays();
    const primary = screen.getPrimaryDisplay();

    if (settings.position) {
      // Validate saved position is within at least one connected display
      const isVisibleOnAnyDisplay = displays.some(display => {
        const wa = display.workArea;
        return (
          settings.position!.x >= wa.x - width &&
          settings.position!.x <= wa.x + wa.width &&
          settings.position!.y >= wa.y - height &&
          settings.position!.y <= wa.y + wa.height
        );
      });

      if (isVisibleOnAnyDisplay) {
        return this.clampToBounds(settings.position.x, settings.position.y, width, height);
      }
    }

    // Default: bottom-right of primary display workArea
    const wa = primary.workArea;
    const x = wa.x + wa.width - width - 40;
    const y = wa.y + wa.height - height - 40;
    return { x, y };
  }

  private clampToBounds(x: number, y: number, width: number, height: number): { x: number; y: number } {
    const displays = screen.getAllDisplays();
    // Find closest display to current coordinates
    let closestDisplay = screen.getPrimaryDisplay();
    let minDistance = Infinity;

    for (const d of displays) {
      const wa = d.workArea;
      const centerX = wa.x + wa.width / 2;
      const centerY = wa.y + wa.height / 2;
      const dist = Math.hypot(x - centerX, y - centerY);
      if (dist < minDistance) {
        minDistance = dist;
        closestDisplay = d;
      }
    }

    const wa = closestDisplay.workArea;
    const clampedX = Math.max(wa.x, Math.min(x, wa.x + wa.width - width));
    const clampedY = Math.max(wa.y, Math.min(y, wa.y + wa.height - height));

    return { x: clampedX, y: clampedY };
  }
}
