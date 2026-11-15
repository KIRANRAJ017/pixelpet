import React, { useEffect, useRef } from 'react';

export interface ContextMenuProps {
  x: number;
  y: number;
  isSleeping: boolean;
  onFeed: () => void;
  onPet: () => void;
  onCustomize: () => void;
  onToggleSleep: () => void;
  onSettings: () => void;
  onHide: () => void;
  onQuit: () => void;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  isSleeping,
  onFeed,
  onPet,
  onCustomize,
  onToggleSleep,
  onSettings,
  onHide,
  onQuit,
  onClose
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [onClose]);

  // Adjust menu position so it doesn't overflow pet window
  const stylePos: React.CSSProperties = {
    position: 'fixed',
    left: `${Math.max(4, Math.min(x, window.innerWidth - 130))}px`,
    top: `${Math.max(4, Math.min(y, window.innerHeight - 170))}px`,
    zIndex: 1000
  };

  return (
    <div ref={menuRef} className="pixel-context-menu" style={stylePos}>
      <button
        className="menu-item"
        onClick={() => {
          onFeed();
          onClose();
        }}
      >
        <span className="menu-icon">🍎</span>
        <span className="menu-text">Feed</span>
      </button>

      <button
        className="menu-item"
        onClick={() => {
          onPet();
          onClose();
        }}
      >
        <span className="menu-icon">✨</span>
        <span className="menu-text">Pet / Interact</span>
      </button>

      <button
        className="menu-item"
        onClick={() => {
          onCustomize();
          onClose();
        }}
      >
        <span className="menu-icon">🎨</span>
        <span className="menu-text">Customize</span>
      </button>

      <button
        className="menu-item"
        onClick={() => {
          onToggleSleep();
          onClose();
        }}
      >
        <span className="menu-icon">{isSleeping ? '☀️' : '💤'}</span>
        <span className="menu-text">{isSleeping ? 'Wake' : 'Sleep'}</span>
      </button>

      <div className="menu-separator" />

      <button
        className="menu-item"
        onClick={() => {
          onSettings();
          onClose();
        }}
      >
        <span className="menu-icon">⚙️</span>
        <span className="menu-text">Settings</span>
      </button>

      <button
        className="menu-item"
        onClick={() => {
          onHide();
          onClose();
        }}
      >
        <span className="menu-icon">👁️</span>
        <span className="menu-text">Hide Pet</span>
      </button>

      <div className="menu-separator" />

      <button
        className="menu-item quit"
        onClick={() => {
          onQuit();
          onClose();
        }}
      >
        <span className="menu-icon">✕</span>
        <span className="menu-text">Quit Pixel Pet</span>
      </button>
    </div>
  );
};
