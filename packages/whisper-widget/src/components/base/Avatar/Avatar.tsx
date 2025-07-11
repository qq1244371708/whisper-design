import React from 'react';
import './Avatar.scss';

interface AvatarProps {
  src?: string; // Made optional for icon-only avatars
  alt: string;
  size?: 'small' | 'medium' | 'large';
  shape?: 'circle' | 'square';
  gradient?: 'primary' | 'secondary'; // New prop for gradient background
  children?: React.ReactNode; // Allow children for icon avatars
}

const Avatar: React.FC<AvatarProps> = React.memo(
  ({ src, alt, size = 'medium', shape = 'circle', gradient, children }) => {
    const gradientClass = gradient ? `avatar--${gradient}-gradient` : '';

    return (
      <div
        className={`avatar avatar--${size} avatar--${shape} ${gradientClass}`}
        role="img"
        aria-label={alt}
      >
        {src ? (
          <img src={src} alt={alt} />
        ) : (
          children // Render children (e.g., an icon) if no src is provided
        )}
      </div>
    );
  }
);

export default Avatar;
