import React, { useEffect, useState, useRef, useCallback } from 'react';
import { PetSettings, DEFAULT_SETTINGS } from '../types/settings';
import { PetState } from '../types/pet';
import { PetStateMachine } from '../pet/state-machine';
import { WanderController } from '../pet/wanderer';
import { SpriteRenderer } from '../pet/sprite-renderer';
import { ContextMenu } from '../components/ContextMenu';
import { FoodSnack } from '../components/FoodSnack';
import { soundSynth } from '../pet/audio-synthesizer';

export const PetApp: React.FC = () => {
  const [settings, setSettings] = useState<PetSettings>(DEFAULT_SETTINGS);
  const [state, setState] = useState<PetState>('idle');
  const [frame, setFrame] = useState<number>(0);
  const [flipX, setFlipX] = useState<boolean>(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [feeding, setFeeding] = useState<boolean>(false);

  const stateMachineRef = useRef<PetStateMachine | null>(null);
  const wandererRef = useRef<WanderController | null>(null);
  const dragStartRef = useRef<{ screenX: number; screenY: number; isDragging: boolean } | null>(null);

  // Initialize settings and state machine
  useEffect(() => {
    let sm: PetStateMachine;

    const init = async () => {
      let initialSettings = DEFAULT_SETTINGS;
      if (window.pixelPetAPI) {
        try {
          initialSettings = await window.pixelPetAPI.getSettings();
        } catch (err) {
          console.error('Failed to get initial settings:', err);
        }
      }
      setSettings(initialSettings);

      sm = new PetStateMachine({
        idleSleepEnabled: initialSettings.idleSleep,
        wanderingEnabled: initialSettings.wandering,
        animationSpeed: initialSettings.animationSpeed,
        onStateChange: (newState, oldState) => {
          setState(newState);
          setFrame(0);

          // Audio triggers
          if (initialSettings.sound) {
            if (newState === 'happy') soundSynth.playHappy();
            else if (newState === 'surprised') soundSynth.playSurprised();
            else if (newState === 'eat') soundSynth.playEat();
            else if (newState === 'wake') soundSynth.playWake();
            else if (newState === 'land') soundSynth.playLand();
          }

          // Handle wandering start/stop
          if (newState === 'walk') {
            wandererRef.current?.startWander();
          } else if (oldState === 'walk') {
            wandererRef.current?.stop();
          }
        }
      });
      stateMachineRef.current = sm;

      // Initialize Wanderer
      wandererRef.current = new WanderController({
        speed: initialSettings.animationSpeed,
        onStep: async (dx, dy) => {
          setFlipX(dx < 0);
          if (window.pixelPetAPI) {
            return window.pixelPetAPI.movePet(dx, dy);
          }
          return null;
        },
        onFinish: () => {
          if (stateMachineRef.current?.getState() === 'walk') {
            stateMachineRef.current.transitionTo('idle', true);
          }
        }
      });
    };

    init();

    // Listen to IPC settings updates
    const unsubscribeSettings = window.pixelPetAPI?.onSettingsChanged((updated) => {
      setSettings(updated);
      if (stateMachineRef.current) {
        stateMachineRef.current.idleSleepEnabled = updated.idleSleep;
        stateMachineRef.current.wanderingEnabled = updated.wandering;
        stateMachineRef.current.animationSpeed = updated.animationSpeed;
      }
      if (wandererRef.current) {
        wandererRef.current.setSpeed(updated.animationSpeed);
      }
    });

    // Listen to IPC remote pet triggers
    const unsubscribeTriggers = window.pixelPetAPI?.onTriggerPetAction((action) => {
      if (!stateMachineRef.current) return;
      if (action === 'feed') {
        setFeeding(true);
        stateMachineRef.current.handleFeed();
      } else if (action === 'pet') {
        stateMachineRef.current.handleClick();
      } else if (action === 'toggle-sleep') {
        stateMachineRef.current.toggleSleep();
      }
    });

    return () => {
      unsubscribeSettings?.();
      unsubscribeTriggers?.();
      sm?.destroy();
      wandererRef.current?.stop();
    };
  }, []);

  // Frame tick animation loop
  useEffect(() => {
    const baseFrameInterval = 200; // ms per frame
    const intervalTime = Math.max(80, Math.round(baseFrameInterval / Math.max(0.5, settings.animationSpeed)));

    const timer = setInterval(() => {
      setFrame((prev) => (prev + 1) % 4);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [settings.animationSpeed]);

  // Mouse interaction: Click vs Drag
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Only handle left clicks for drag/click
    if (e.button !== 0) return;

    dragStartRef.current = {
      screenX: e.screenX,
      screenY: e.screenY,
      isDragging: false
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStartRef.current) return;

    const dx = e.screenX - dragStartRef.current.screenX;
    const dy = e.screenY - dragStartRef.current.screenY;
    const dist = Math.hypot(dx, dy);

    if (!dragStartRef.current.isDragging && dist > 4) {
      dragStartRef.current.isDragging = true;
      stateMachineRef.current?.handleStartDrag();
    }

    if (dragStartRef.current.isDragging) {
      if (window.pixelPetAPI) {
        window.pixelPetAPI.movePet(dx, dy);
      }
      dragStartRef.current.screenX = e.screenX;
      dragStartRef.current.screenY = e.screenY;
    }
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragStartRef.current) return;

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    if (dragStartRef.current.isDragging) {
      stateMachineRef.current?.handleEndDrag();
      if (settings.sound) {
        soundSynth.playLand();
      }
    } else {
      // Registered as click
      stateMachineRef.current?.handleClick();
    }

    dragStartRef.current = null;
  }, [settings.sound]);

  // Context Menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.pixelPetAPI?.showContextMenu) {
      window.pixelPetAPI.showContextMenu({ isSleeping: state === 'sleep' });
    } else {
      setMenuPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleFeed = () => {
    setFeeding(true);
    stateMachineRef.current?.handleFeed();
  };

  const handlePet = () => {
    stateMachineRef.current?.handleClick();
  };

  const handleCustomize = () => {
    window.pixelPetAPI?.openStudio();
  };

  const handleToggleSleep = () => {
    stateMachineRef.current?.toggleSleep();
  };

  const handleSettings = () => {
    window.pixelPetAPI?.openStudio();
  };

  const handleHide = () => {
    window.pixelPetAPI?.hidePet();
  };

  const handleQuit = () => {
    window.pixelPetAPI?.quitApp();
  };

  return (
    <div
      className="pet-window-root"
      onContextMenu={handleContextMenu}
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        overflow: 'hidden'
      }}
    >
      {/* Falling snack animation */}
      {feeding && (
        <FoodSnack
          onComplete={() => {
            setFeeding(false);
          }}
        />
      )}

      {/* Main interactive pet character */}
      <div
        className="pet-interactive-area"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          cursor: state === 'dragged' ? 'grabbing' : 'grab',
          touchAction: 'none'
        }}
      >
        <SpriteRenderer
          character={settings.character}
          palette={settings.palette}
          state={state}
          accessory={settings.accessory}
          frame={frame}
          size={settings.size}
          flipX={flipX}
        />
      </div>

      {/* Compact context menu */}
      {menuPos && (
        <ContextMenu
          x={menuPos.x}
          y={menuPos.y}
          isSleeping={state === 'sleep'}
          onFeed={handleFeed}
          onPet={handlePet}
          onCustomize={handleCustomize}
          onToggleSleep={handleToggleSleep}
          onSettings={handleSettings}
          onHide={handleHide}
          onQuit={handleQuit}
          onClose={() => setMenuPos(null)}
        />
      )}
    </div>
  );
};
