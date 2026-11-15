export type Character = 'mochi' | 'neko' | 'boo';
export type Palette = 'mint' | 'lavender' | 'peach';
export type PetSize = 'small' | 'normal' | 'large';
export type Accessory = 'none' | 'beanie' | 'party_hat';

export interface PetPosition {
  x: number;
  y: number;
}

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
  animationSpeed: number; // 0.5 to 1.5, normal 1.0
  sound: boolean;
  startupLaunch: boolean;
  isHidden: boolean;
  version: string;
}

export const SIZE_DIMENSIONS: Record<PetSize, { width: number; height: number; spriteScale: number }> = {
  small: { width: 96, height: 96, spriteScale: 2 },   // 32*2 = 64px character in 96px frame
  normal: { width: 144, height: 144, spriteScale: 3 }, // 32*3 = 96px character in 144px frame
  large: { width: 192, height: 192, spriteScale: 4 }   // 32*4 = 128px character in 192px frame
};

export const DEFAULT_SETTINGS: PetSettings = {
  petName: 'Mochi',
  character: 'mochi',
  palette: 'mint',
  size: 'normal',
  accessory: 'none',
  position: null, // null means initial bottom-right
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
