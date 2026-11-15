import React, { useEffect, useState } from 'react';

interface FoodSnackProps {
  onComplete: () => void;
  targetY?: number;
}

export const FoodSnack: React.FC<FoodSnackProps> = ({ onComplete }) => {
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimating(false);
      onComplete();
    }, 700);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!animating) return null;

  return (
    <div
      className="food-snack-drop"
      style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        pointerEvents: 'none'
      }}
    >
      <img
        src="./assets/food/apple.png"
        alt="Snack"
        style={{
          width: '32px',
          height: '32px',
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
};
