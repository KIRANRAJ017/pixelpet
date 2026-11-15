import { contextBridge, ipcRenderer } from 'electron';
import { PetSettings } from './persistence';

const api = {
  getSettings: (): Promise<PetSettings> => {
    return ipcRenderer.invoke('settings:get');
  },
  updateSettings: (settings: Partial<PetSettings>): Promise<PetSettings> => {
    return ipcRenderer.invoke('settings:update', settings);
  },
  resetSettings: (): Promise<PetSettings> => {
    return ipcRenderer.invoke('settings:reset');
  },
  movePet: (dx: number, dy: number): Promise<{ x: number; y: number } | null> => {
    return ipcRenderer.invoke('pet:move', { dx, dy });
  },
  setPetPosition: (x: number, y: number): Promise<{ x: number; y: number } | null> => {
    return ipcRenderer.invoke('pet:set-position', { x, y });
  },
  resetPosition: (): Promise<{ x: number; y: number }> => {
    return ipcRenderer.invoke('pet:reset-position');
  },
  openStudio: (): void => {
    ipcRenderer.send('studio:open');
  },
  closeStudio: (): void => {
    ipcRenderer.send('studio:close');
  },
  hidePet: (): void => {
    ipcRenderer.send('pet:hide');
  },
  showPet: (): void => {
    ipcRenderer.send('pet:show');
  },
  quitApp: (): void => {
    ipcRenderer.send('app:quit');
  },
  onSettingsChanged: (callback: (settings: PetSettings) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, updated: PetSettings) => {
      callback(updated);
    };
    ipcRenderer.on('settings:changed', handler);
    return () => {
      ipcRenderer.removeListener('settings:changed', handler);
    };
  },
  onTriggerPetAction: (callback: (action: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, action: string) => {
      callback(action);
    };
    ipcRenderer.on('pet:trigger-action', handler);
    return () => {
      ipcRenderer.removeListener('pet:trigger-action', handler);
    };
  },
  sendPetAction: (action: string): void => {
    ipcRenderer.send('pet:action', action);
  },
  showContextMenu: (opts: { isSleeping: boolean }): void => {
    ipcRenderer.send('pet:show-context-menu', opts);
  }
};

contextBridge.exposeInMainWorld('pixelPetAPI', api);

export type PixelPetAPI = typeof api;
