import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { PersistenceManager, validateSettings, DEFAULT_SETTINGS } from '../electron/persistence';

describe('Persistence and Validation', () => {
  let tempDir: string;
  let testConfigFile: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pixel-pet-test-'));
    testConfigFile = path.join(tempDir, 'config.json');
  });

  afterEach(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it('validates settings with valid data', () => {
    const valid = {
      petName: 'PixelNeko',
      character: 'neko',
      palette: 'lavender',
      size: 'large',
      accessory: 'beanie',
      position: { x: 200, y: 300 },
      alwaysOnTop: false,
      wandering: true,
      idleSleep: false,
      animationSpeed: 1.2,
      sound: true,
      startupLaunch: false,
      isHidden: false
    };

    const result = validateSettings(valid);
    expect(result.petName).toBe('PixelNeko');
    expect(result.character).toBe('neko');
    expect(result.palette).toBe('lavender');
    expect(result.size).toBe('large');
    expect(result.accessory).toBe('beanie');
    expect(result.position).toEqual({ x: 200, y: 300 });
    expect(result.alwaysOnTop).toBe(false);
    expect(result.sound).toBe(true);
    expect(result.animationSpeed).toBe(1.2);
  });

  it('falls back to defaults when corrupted or invalid values are supplied', () => {
    const invalid = {
      petName: '',
      character: 'dragon',
      palette: 'rainbow',
      size: 'giant',
      accessory: 'crown',
      position: { x: 'NaN', y: null },
      animationSpeed: 99
    };

    const result = validateSettings(invalid);
    expect(result.character).toBe(DEFAULT_SETTINGS.character);
    expect(result.palette).toBe(DEFAULT_SETTINGS.palette);
    expect(result.size).toBe(DEFAULT_SETTINGS.size);
    expect(result.accessory).toBe(DEFAULT_SETTINGS.accessory);
    expect(result.position).toBeNull();
    expect(result.animationSpeed).toBe(DEFAULT_SETTINGS.animationSpeed);
  });

  it('saves and reloads settings cleanly to disk', () => {
    const manager = new PersistenceManager(testConfigFile);
    expect(manager.getSettings().character).toBe('mochi');

    manager.save({ character: 'boo', palette: 'peach', petName: 'Spooky' });

    // Reload using fresh manager
    const manager2 = new PersistenceManager(testConfigFile);
    const loaded = manager2.getSettings();
    expect(loaded.character).toBe('boo');
    expect(loaded.palette).toBe('peach');
    expect(loaded.petName).toBe('Spooky');
  });

  it('recovers gracefully from corrupted JSON file and resets defaults', () => {
    // Write corrupted garbage to config file
    fs.writeFileSync(testConfigFile, '{ corrupted json :::: 1234 }', 'utf-8');

    const manager = new PersistenceManager(testConfigFile);
    const loaded = manager.getSettings();

    expect(loaded.character).toBe(DEFAULT_SETTINGS.character);
    expect(loaded.palette).toBe(DEFAULT_SETTINGS.palette);

    // Corrupted file should be backed up or overwritten with valid json
    const content = fs.readFileSync(testConfigFile, 'utf-8');
    expect(() => JSON.parse(content)).not.toThrow();
  });
});
