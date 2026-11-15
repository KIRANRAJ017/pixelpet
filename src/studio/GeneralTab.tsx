import React, { useState } from 'react';
import { PetSettings } from '../types/settings';

interface GeneralTabProps {
  settings: PetSettings;
  onUpdate: (partial: Partial<PetSettings>) => void;
  onResetDefaults: () => void;
  onQuit: () => void;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({
  settings,
  onUpdate,
  onResetDefaults,
  onQuit
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="tab-pane">
      {/* Visibility */}
      <div className="setting-row">
        <div className="setting-info">
          <span className="setting-label">Show Desktop Pet</span>
          <span className="setting-desc">Keep pet active and visible on your desktop</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className={`btn ${settings.isHidden ? 'btn-warning' : 'btn-secondary'}`}
            style={{ fontSize: '11px', padding: '4px 10px' }}
            onClick={() => onUpdate({ isHidden: !settings.isHidden })}
          >
            {settings.isHidden ? '👁️ Show Pet' : '🙈 Hide Pet'}
          </button>
          <label className="switch">
            <input
              type="checkbox"
              checked={!settings.isHidden}
              onChange={(e) => onUpdate({ isHidden: !e.target.checked })}
            />
            <span className="slider" />
          </label>
        </div>
      </div>

      {settings.isHidden && (
        <div className="setting-block" style={{ backgroundColor: 'rgba(242, 198, 109, 0.1)', borderColor: 'rgba(242, 198, 109, 0.3)' }}>
          <div className="setting-info">
            <span className="setting-label" style={{ color: '#f2c66d' }}>🐾 Pet is currently hidden</span>
            <span className="setting-desc">Your pixel friend is hiding quietly. Click below to bring it back to your screen anytime!</span>
          </div>
          <button
            className="btn"
            style={{ backgroundColor: '#f2c66d', color: '#11100e', fontWeight: 'bold' }}
            onClick={() => onUpdate({ isHidden: false })}
          >
            ✨ Show Pet on Desktop
          </button>
        </div>
      )}

      {/* Windows Startup */}
      <div className="setting-row">
        <div className="setting-info">
          <span className="setting-label">Launch on Windows Startup</span>
          <span className="setting-desc">Automatically launch Pixel Pet when you sign in</span>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={settings.startupLaunch}
            onChange={(e) => onUpdate({ startupLaunch: e.target.checked })}
          />
          <span className="slider" />
        </label>
      </div>

      {/* App Version Info */}
      <div className="setting-block">
        <div className="setting-info">
          <span className="setting-label">Pixel Pet Version</span>
          <span className="setting-desc">Windows Desktop Edition</span>
        </div>
        <span className="version-badge">v{settings.version || '1.0.0'}</span>
      </div>

      {/* Restore Defaults */}
      <div className="setting-block warning-box">
        <div className="setting-info">
          <span className="setting-label">Reset Preferences</span>
          <span className="setting-desc">Restore character, color, behavior, and position to defaults</span>
        </div>
        {!confirmReset ? (
          <button
            className="btn btn-warning"
            onClick={() => setConfirmReset(true)}
          >
            Restore Default Settings
          </button>
        ) : (
          <div className="confirm-row">
            <span>Are you sure?</span>
            <button
              className="btn btn-danger"
              onClick={() => {
                onResetDefaults();
                setConfirmReset(false);
              }}
            >
              Yes, Reset
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setConfirmReset(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Quit Application */}
      <div className="setting-block danger-box">
        <div className="setting-info">
          <span className="setting-label">Exit Application</span>
          <span className="setting-desc">Completely close Pixel Pet and remove from background</span>
        </div>
        <button className="btn btn-danger" onClick={onQuit}>
          Quit Pixel Pet
        </button>
      </div>
    </div>
  );
};
