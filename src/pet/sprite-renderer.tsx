import React from 'react';
import { Character, Palette, PetSize, Accessory, SIZE_DIMENSIONS } from '../types/settings';
import { PetState } from '../types/pet';

interface SpriteRendererProps {
  character: Character;
  palette: Palette;
  state: PetState;
  accessory: Accessory;
  frame: number;
  size: PetSize;
  flipX?: boolean;
  className?: string;
}

export const SpriteRenderer: React.FC<SpriteRendererProps> = ({
  character,
  palette,
  state,
  accessory,
  frame,
  size,
  flipX = false,
  className = ''
}) => {
  const dims = SIZE_DIMENSIONS[size] || SIZE_DIMENSIONS.normal;
  const characterSize = 32 * dims.spriteScale;

  // Asset paths
  const petSpritePath = `./assets/pets/${character}/${palette}/${state}.png`;
  const accessorySpritePath = accessory !== 'none'
    ? `./assets/accessories/${accessory}/${character}_${state}.png`
    : null;

  // Frame offset in pixels: each frame is 32px logically, scaled to characterSize
  const frameOffset = -(frame % 4) * characterSize;

  return (
    <div
      className={`sprite-container ${className}`}
      style={{
        width: `${characterSize}px`,
        height: `${characterSize}px`,
        position: 'relative',
        overflow: 'hidden',
        transform: flipX ? 'scaleX(-1)' : 'none',
        transition: 'transform 0.1s ease',
        imageRendering: 'pixelated'
      }}
    >
      {/* Pet base spritesheet */}
      <img
        src={petSpritePath}
        alt={`${character} ${state}`}
        draggable={false}
        style={{
          position: 'absolute',
          top: 0,
          left: `${frameOffset}px`,
          width: `${characterSize * 4}px`,
          height: `${characterSize}px`,
          imageRendering: 'pixelated',
          pointerEvents: 'none',
          userSelect: 'none'
        }}
      />

      {/* Accessory overlay spritesheet */}
      {accessorySpritePath && (
        <img
          src={accessorySpritePath}
          alt={`${accessory} on ${character}`}
          draggable={false}
          style={{
            position: 'absolute',
            top: 0,
            left: `${frameOffset}px`,
            width: `${characterSize * 4}px`,
            height: `${characterSize}px`,
            imageRendering: 'pixelated',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        />
      )}
    </div>
  );
};
