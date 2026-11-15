import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export interface PetPosition {
  x: number;
  y: number;
}

export type Character = 'mochi' | 'neko' | 'boo';
export type Palette = 'mint' | 'lavender' | 'peach';
export type PetSize = 'small' | 'normal' | 'large';
export type Accessory = 'none' | 'beanie' | 'party_hat';

export interface PetSettings {
  petName: string;
  character: Character;
  palette: Palette;
  size: PetSize;
  accessory: Accessory;
  position: PetPosition | null;
  alwaysOnTop: boolean;
  wandering: boolean;
  idleSleep: boolean;
  animationSpeed: number;
  sound: boolean;
  startupLaunch: boolean;
  isHidden: boolean;
  version: string;
}

export const DEFAULT_SETTINGS: PetSettings = {
  petName: 'Mochi',
  character: 'mochi',
  palette: 'mint',
  size: 'normal',
  accessory: 'none',
  position: null,
  alwaysOnTop: true,
  wandering: true,
  idleSleep: true,
  animationSpeed: 1.0,
  sound: false,
  startupLaunch: false,
  isHidden: false,
  version: '1.0.0'
};

export function validateSettings(data: unknown): PetSettings {
  if (!data || typeof data !== 'object') {
    return { ...DEFAULT_SETTINGS };
  }

  const s = data as Partial<PetSettings>;

  const validCharacters: Character[] = ['mochi', 'neko', 'boo'];
  const validPalettes: Palette[] = ['mint', 'lavender', 'peach'];
  const validSizes: PetSize[] = ['small', 'normal', 'large'];
  const validAccessories: Accessory[] = ['none', 'beanie', 'party_hat'];

  const character = validCharacters.includes(s.character as Character) ? (s.character as Character) : DEFAULT_SETTINGS.character;
  const palette = validPalettes.includes(s.palette as Palette) ? (s.palette as Palette) : DEFAULT_SETTINGS.palette;
  const size = validSizes.includes(s.size as PetSize) ? (s.size as PetSize) : DEFAULT_SETTINGS.size;
  const accessory = validAccessories.includes(s.accessory as Accessory) ? (s.accessory as Accessory) : DEFAULT_SETTINGS.accessory;

  let position: PetPosition | null = null;
  if (s.position && typeof s.position.x === 'number' && typeof s.position.y === 'number' && !isNaN(s.position.x) && !isNaN(s.position.y)) {
    position = { x: Math.round(s.position.x), y: Math.round(s.position.y) };
  }

  const speed = typeof s.animationSpeed === 'number' && s.animationSpeed >= 0.5 && s.animationSpeed <= 2.0
    ? s.animationSpeed
    : DEFAULT_SETTINGS.animationSpeed;

  return {
    petName: typeof s.petName === 'string' && s.petName.trim().length > 0 ? s.petName.trim().slice(0, 24) : DEFAULT_SETTINGS.petName,
    character,
    palette,
    size,
    accessory,
    position,
    alwaysOnTop: typeof s.alwaysOnTop === 'boolean' ? s.alwaysOnTop : DEFAULT_SETTINGS.alwaysOnTop,
    wandering: typeof s.wandering === 'boolean' ? s.wandering : DEFAULT_SETTINGS.wandering,
    idleSleep: typeof s.idleSleep === 'boolean' ? s.idleSleep : DEFAULT_SETTINGS.idleSleep,
    animationSpeed: speed,
    sound: typeof s.sound === 'boolean' ? s.sound : DEFAULT_SETTINGS.sound,
    startupLaunch: typeof s.startupLaunch === 'boolean' ? s.startupLaunch : DEFAULT_SETTINGS.startupLaunch,
    isHidden: typeof s.isHidden === 'boolean' ? s.isHidden : DEFAULT_SETTINGS.isHidden,
    version: DEFAULT_SETTINGS.version
  };
}

export class PersistenceManager {
  private configPath: string;
  private currentSettings: PetSettings;

  constructor(customPath?: string) {
    if (customPath) {
      this.configPath = customPath;
    } else {
      const userDataDir = app ? app.getPath('userData') : path.join(process.cwd(), '.config');
      if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
      }
      this.configPath = path.join(userDataDir, 'config.json');
    }
    this.currentSettings = this.load();
  }

  public getConfigPath(): string {
    return this.configPath;
  }

  public getSettings(): PetSettings {
    return { ...this.currentSettings };
  }

  public load(): PetSettings {
    try {
      if (fs.existsSync(this.configPath)) {
        const raw = fs.readFileSync(this.configPath, 'utf-8');
        const parsed = JSON.parse(raw);
        this.currentSettings = validateSettings(parsed);
        return this.currentSettings;
      }
    } catch (err) {
      console.warn('Failed to read config or JSON corrupted, restoring defaults:', err);
      // Backup corrupted config for safety
      try {
        if (fs.existsSync(this.configPath)) {
          fs.renameSync(this.configPath, `${this.configPath}.corrupted.${Date.now()}`);
        }
      } catch {
        // ignore backup error
      }
    }

    this.currentSettings = { ...DEFAULT_SETTINGS };
    this.save(this.currentSettings);
    return this.currentSettings;
  }

  public save(settings: Partial<PetSettings>): PetSettings {
    try {
      const merged = validateSettings({ ...this.currentSettings, ...settings });
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write atomically using temporary file to prevent partial writes
      const tempPath = `${this.configPath}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(merged, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.configPath);

      this.currentSettings = merged;
      return this.currentSettings;
    } catch (err) {
      console.error('Error saving settings:', err);
      return this.currentSettings;
    }
  }

  public reset(): PetSettings {
    this.currentSettings = { ...DEFAULT_SETTINGS };
    this.save(this.currentSettings);
    return this.currentSettings;
  }
}
