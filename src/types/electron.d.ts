import { PixelPetAPI } from '../../electron/preload';

declare global {
  interface Window {
    pixelPetAPI: PixelPetAPI;
  }
}
