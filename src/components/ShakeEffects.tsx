import React from 'react';

export type ShakeReactionPhase = 'none' | 'confused' | 'angry';

interface ShakeEffectsProps {
  phase: ShakeReactionPhase;
  scale: number; // 2 for small (64px), 3 for normal (96px), 4 for large (128px)
}

export const ShakeEffects: React.FC<ShakeEffectsProps> = ({ phase, scale }) => {
  if (phase === 'none') {
    return null;
  }

  // Size ratio: small=0.67, normal=1.0, large=1.33
  const ratio = scale / 3;

  // Star orbit positioning: always clearly above the head
  const orbitTop = -16 * ratio;
  const orbitWidth = 48 * ratio;
  const orbitHeight = 18 * ratio;

  // Small, cute exclamation marks scale based on pet size
  const exclamationScale = scale === 2 ? 0.65 : scale === 3 ? 0.82 : 1.0;
  const exclamationTop = 4 * ratio;
  const exclamationLeft = -16 * exclamationScale;

  return (
    <div
      className="shake-effects-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 50
      }}
    >
      {/* PHASE 1: Confused Orbiting Pixel Stars (Clearly visible above head across all colors and sizes) */}
      {phase === 'confused' && (
        <div
          className="orbiting-stars-wrapper"
          style={{
            position: 'absolute',
            top: `${orbitTop}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${orbitWidth}px`,
            height: `${orbitHeight}px`,
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.85))'
          }}
        >
          {/* Star 1 - Bright golden yellow with high-contrast pixel outline */}
          <div className="orbit-star star-1">
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
            >
              <rect x="3" y="0" width="4" height="10" fill="#18191E" />
              <rect x="0" y="3" width="10" height="4" fill="#18191E" />
              <rect x="4" y="1" width="2" height="8" fill="#FFD700" />
              <rect x="1" y="4" width="8" height="2" fill="#FFD700" />
              <rect x="3" y="3" width="4" height="4" fill="#FFF566" />
              <rect x="4" y="4" width="2" height="2" fill="#FFFFFF" />
            </svg>
          </div>

          {/* Star 2 - Bright pale diamond star */}
          <div className="orbit-star star-2">
            <svg
              width="9"
              height="9"
              viewBox="0 0 9 9"
              style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
            >
              <rect x="3" y="0" width="3" height="9" fill="#18191E" />
              <rect x="0" y="3" width="9" height="3" fill="#18191E" />
              <rect x="3" y="1" width="3" height="7" fill="#F2C66D" />
              <rect x="1" y="3" width="7" height="3" fill="#F2C66D" />
              <rect x="3" y="3" width="3" height="3" fill="#FFFFFF" />
            </svg>
          </div>

          {/* Star 3 - Golden sparkle */}
          <div className="orbit-star star-3">
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
            >
              <rect x="3" y="0" width="4" height="10" fill="#18191E" />
              <rect x="0" y="3" width="10" height="4" fill="#18191E" />
              <rect x="4" y="1" width="2" height="8" fill="#FFC53D" />
              <rect x="1" y="4" width="8" height="2" fill="#FFC53D" />
              <rect x="3" y="3" width="4" height="4" fill="#FFF566" />
              <rect x="4" y="4" width="2" height="2" fill="#FFFFFF" />
            </svg>
          </div>
        </div>
      )}

      {/* PHASE 2: Angry Exclamation Marks (Small, retro, to the LEFT of the head) */}
      {phase === 'angry' && (
        <div
          className="angry-exclamation-wrapper"
          style={{
            position: 'absolute',
            top: `${exclamationTop}px`,
            left: `${exclamationLeft}px`,
            transform: `scale(${exclamationScale})`,
            transformOrigin: 'bottom right'
          }}
        >
          <svg
            width="20"
            height="16"
            viewBox="0 0 20 16"
            style={{
              imageRendering: 'pixelated',
              shapeRendering: 'crispEdges',
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.85))'
            }}
          >
            {/* Mark 1 (left) */}
            <rect x="1" y="2" width="2" height="6" fill="#FF3B30" stroke="#5C0000" strokeWidth="0.8" />
            <rect x="1" y="10" width="2" height="2" fill="#FF3B30" stroke="#5C0000" strokeWidth="0.8" />

            {/* Mark 2 (center, slightly taller) */}
            <rect x="6" y="0" width="2" height="7" fill="#FF453A" stroke="#5C0000" strokeWidth="0.8" />
            <rect x="6" y="9" width="2" height="2" fill="#FF453A" stroke="#5C0000" strokeWidth="0.8" />

            {/* Mark 3 (right) */}
            <rect x="11" y="2" width="2" height="5" fill="#FF3B30" stroke="#5C0000" strokeWidth="0.8" />
            <rect x="11" y="10" width="2" height="2" fill="#FF3B30" stroke="#5C0000" strokeWidth="0.8" />
          </svg>
        </div>
      )}
    </div>
  );
};
