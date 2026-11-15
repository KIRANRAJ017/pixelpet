import React, { useState, useEffect } from 'react';
import { PetSettings, Character, Palette, PetSize, Accessory } from '../types/settings';
import { SpriteRenderer } from '../pet/sprite-renderer';

interface AppearanceTabProps {
  settings: PetSettings;
  onUpdate: (partial: Partial<PetSettings>) => void;
}

export const AppearanceTab: React.FC<AppearanceTabProps> = ({ settings, onUpdate }) => {
  const [name, setName] = useState(settings.petName);
  const [previewFrame, setPreviewFrame] = useState(0);

  useEffect(() => {
    setName(settings.petName);
  }, [settings.petName]);

  // Preview animation tick
  useEffect(() => {
    const timer = setInterval(() => {
      setPreviewFrame((f) => (f + 1) % 4);
    }, 250);
    return () => clearInterval(timer);
  }, []);

  const handleNameBlur = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== settings.petName) {
      onUpdate({ petName: trimmed });
    } else {
      setName(settings.petName);
    }
  };

  const characters: { id: Character; label: string; desc: string }[] = [
    { id: 'mochi', label: 'Mochi', desc: 'Curious mint blob with tiny sprout' },
    { id: 'neko', label: 'Neko', desc: 'Playful cream cat with twitchy ears' },
    { id: 'boo', label: 'Boo', desc: 'Gentle lavender floating ghost' }
  ];

  const palettes: { id: Palette; label: string; colorHex: string }[] = [
    { id: 'mint', label: 'Mint', colorHex: '#4ade80' },
    { id: 'lavender', label: 'Lavender', colorHex: '#c084fc' },
    { id: 'peach', label: 'Peach', colorHex: '#fdba74' }
  ];

  const sizes: { id: PetSize; label: string; px: string }[] = [
    { id: 'small', label: 'Small', px: '64px' },
    { id: 'normal', label: 'Normal', px: '96px' },
    { id: 'large', label: 'Large', px: '128px' }
  ];

  const accessories: { id: Accessory; label: string; icon: string }[] = [
    { id: 'none', label: 'None', icon: '∅' },
    { id: 'beanie', label: 'Beanie', icon: '🧶' },
    { id: 'party_hat', label: 'Party Hat', icon: '🎉' }
  ];

  return (
    <div className="tab-pane">
      {/* Live Preview Box */}
      <div className="preview-card">
        <div className="preview-display">
          <SpriteRenderer
            character={settings.character}
            palette={settings.palette}
            state="idle"
            accessory={settings.accessory}
            frame={previewFrame}
            size="normal"
          />
        </div>
        <div className="preview-details">
          <div className="name-field-group">
            <label htmlFor="pet-name-input">Pet Name</label>
            <input
              id="pet-name-input"
              type="text"
              className="text-input"
              value={name}
              maxLength={20}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
              placeholder="Give your pet a name"
            />
          </div>
          <span className="preview-tagline">
            {settings.character.toUpperCase()} • {settings.palette.toUpperCase()} • {settings.size.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Character Selection */}
      <div className="section-group">
        <span className="section-title">Character</span>
        <div className="grid-3">
          {characters.map((c) => (
            <button
              key={c.id}
              className={`choice-card ${settings.character === c.id ? 'active' : ''}`}
              onClick={() => onUpdate({ character: c.id })}
            >
              <div className="card-thumb">
                <SpriteRenderer
                  character={c.id}
                  palette={settings.palette}
                  state="idle"
                  accessory="none"
                  frame={0}
                  size="small"
                />
              </div>
              <span className="card-title">{c.label}</span>
              <span className="card-desc">{c.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Color Palette Selection */}
      <div className="section-group">
        <span className="section-title">Color Palette</span>
        <div className="grid-3">
          {palettes.map((p) => (
            <button
              key={p.id}
              className={`choice-card palette-card ${settings.palette === p.id ? 'active' : ''}`}
              onClick={() => onUpdate({ palette: p.id })}
            >
              <span
                className="palette-swatch"
                style={{ backgroundColor: p.colorHex }}
              />
              <span className="card-title">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Size Selection */}
      <div className="section-group">
        <span className="section-title">Size</span>
        <div className="grid-3">
          {sizes.map((s) => (
            <button
              key={s.id}
              className={`choice-card ${settings.size === s.id ? 'active' : ''}`}
              onClick={() => onUpdate({ size: s.id })}
            >
              <span className="card-title">{s.label}</span>
              <span className="card-desc">{s.px} height</span>
            </button>
          ))}
        </div>
      </div>

      {/* Accessory Selection */}
      <div className="section-group">
        <span className="section-title">Accessory</span>
        <div className="grid-3">
          {accessories.map((a) => (
            <button
              key={a.id}
              className={`choice-card ${settings.accessory === a.id ? 'active' : ''}`}
              onClick={() => onUpdate({ accessory: a.id })}
            >
              <span className="acc-icon">{a.icon}</span>
              <span className="card-title">{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
