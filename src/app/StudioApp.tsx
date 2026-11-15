import React, { useState, useEffect } from 'react';
import { PetSettings, DEFAULT_SETTINGS } from '../types/settings';
import { AppearanceTab } from '../studio/AppearanceTab';
import { BehaviorTab } from '../studio/BehaviorTab';
import { GeneralTab } from '../studio/GeneralTab';

type Tab = 'appearance' | 'behavior' | 'general';

export const StudioApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('appearance');
  const [settings, setSettings] = useState<PetSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const fetchSettings = async () => {
      if (window.pixelPetAPI) {
        try {
          const s = await window.pixelPetAPI.getSettings();
          setSettings(s);
        } catch (err) {
          console.error('Failed to get settings:', err);
        }
      }
    };

    fetchSettings();

    const unsubscribe = window.pixelPetAPI?.onSettingsChanged((updated) => {
      setSettings(updated);
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  const handleUpdate = async (partial: Partial<PetSettings>) => {
    if (window.pixelPetAPI) {
      try {
        const updated = await window.pixelPetAPI.updateSettings(partial);
        setSettings(updated);
      } catch (err) {
        console.error('Failed to update settings:', err);
      }
    } else {
      setSettings((prev) => ({ ...prev, ...partial }));
    }
  };

  const handleResetPosition = async () => {
    if (window.pixelPetAPI) {
      await window.pixelPetAPI.resetPosition();
    }
  };

  const handleResetDefaults = async () => {
    if (window.pixelPetAPI) {
      const reset = await window.pixelPetAPI.resetSettings();
      setSettings(reset);
    }
  };

  const handleQuit = () => {
    if (window.pixelPetAPI) {
      window.pixelPetAPI.quitApp();
    }
  };

  return (
    <div className="studio-app-root">
      {/* App Header */}
      <header className="studio-header">
        <div className="header-title-row">
          <div className="header-badge">
            <span className="dot" />
            <h1 className="header-title">Pixel Pet Studio</h1>
          </div>
          <span className="header-pet-name">{settings.petName}</span>
        </div>

        {/* Tab Navigation */}
        <nav className="tab-nav">
          <button
            className={`tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            Appearance
          </button>
          <button
            className={`tab-btn ${activeTab === 'behavior' ? 'active' : ''}`}
            onClick={() => setActiveTab('behavior')}
          >
            Behavior
          </button>
          <button
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="studio-content">
        {activeTab === 'appearance' && (
          <AppearanceTab
            settings={settings}
            onUpdate={handleUpdate}
          />
        )}
        {activeTab === 'behavior' && (
          <BehaviorTab
            settings={settings}
            onUpdate={handleUpdate}
            onResetPosition={handleResetPosition}
          />
        )}
        {activeTab === 'general' && (
          <GeneralTab
            settings={settings}
            onUpdate={handleUpdate}
            onResetDefaults={handleResetDefaults}
            onQuit={handleQuit}
          />
        )}
      </main>
    </div>
  );
};
