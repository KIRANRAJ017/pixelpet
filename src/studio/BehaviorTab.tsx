import React, { useState } from 'react';
import { PetSettings } from '../types/settings';

interface BehaviorTabProps {
  settings: PetSettings;
  onUpdate: (partial: Partial<PetSettings>) => void;
  onResetPosition: () => void;
}

export const BehaviorTab: React.FC<BehaviorTabProps> = ({
  settings,
  onUpdate,
  onResetPosition
}) => {
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleReset = () => {
    onResetPosition();
    setResetMessage('Pet repositioned to bottom-right!');
    setTimeout(() => setResetMessage(null), 3000);
  };

  return (
    <div className="tab-pane">
      {/* Toggles */}
      <div className="setting-row">
        <div className="setting-info">
          <span className="setting-label">Always on Top</span>
          <span className="setting-desc">Keep your pet floating above regular application windows</span>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={settings.alwaysOnTop}
            onChange={(e) => onUpdate({ alwaysOnTop: e.target.checked })}
          />
          <span className="slider" />
        </label>
      </div>

      <div className="setting-row">
        <div className="setting-info">
          <span className="setting-label">Automatic Wandering</span>
          <span className="setting-desc">Allow pet to take occasional gentle strolls across screen</span>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={settings.wandering}
            onChange={(e) => onUpdate({ wandering: e.target.checked })}
          />
          <span className="slider" />
        </label>
      </div>

      <div className="setting-row">
        <div className="setting-info">
          <span className="setting-label">Sleep When Idle</span>
          <span className="setting-desc">Pet takes a quiet nap when left undisturbed</span>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={settings.idleSleep}
            onChange={(e) => onUpdate({ idleSleep: e.target.checked })}
          />
          <span className="slider" />
        </label>
      </div>

      <div className="setting-row">
        <div className="setting-info">
          <span className="setting-label">Sound Effects</span>
          <span className="setting-desc">Soft retro audio cues on pet interactions and snacks</span>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={settings.sound}
            onChange={(e) => onUpdate({ sound: e.target.checked })}
          />
          <span className="slider" />
        </label>
      </div>

      {/* Animation Speed Slider */}
      <div className="setting-block">
        <div className="slider-header">
          <div className="setting-info">
            <span className="setting-label">Animation Speed</span>
            <span className="setting-desc">Tempo of animations and movements</span>
          </div>
          <span className="slider-value">{settings.animationSpeed.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="1.5"
          step="0.1"
          className="range-input"
          value={settings.animationSpeed}
          onChange={(e) => onUpdate({ animationSpeed: parseFloat(e.target.value) })}
        />
        <div className="range-ticks">
          <span>0.5x Calm</span>
          <span>1.0x Normal</span>
          <span>1.5x Energetic</span>
        </div>
      </div>

      {/* Reset Position Button */}
      <div className="setting-block reset-box">
        <div className="setting-info">
          <span className="setting-label">Reposition Pet</span>
          <span className="setting-desc">Send your pet back to the standard bottom-right corner</span>
        </div>
        <button className="btn btn-secondary" onClick={handleReset}>
          Reset Position
        </button>
        {resetMessage && <span className="status-success">{resetMessage}</span>}
      </div>
    </div>
  );
};
