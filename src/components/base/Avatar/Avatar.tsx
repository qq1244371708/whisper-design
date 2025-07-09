import React from 'react';
import './Avatar.scss';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'small' | 'medium' | 'large';
  shape?: 'circle' | 'square';
}

const Avatar: React.FC<AvatarProps> = React.memo(({ src, alt, size = 'medium', shape = 'circle' }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`avatar avatar--${size} avatar--${shape}`}
    />
  );
}); // Wrapped with React.memo

export default Avatar;
