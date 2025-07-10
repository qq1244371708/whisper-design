import React from 'react';
import './Button.scss';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  isCircle?: boolean; // New prop for circular buttons
  className?: string; // Additional CSS classes
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  variant = 'primary',
  disabled = false,
  type = 'button',
  isCircle = false,
  className = '',
}) => {
  const buttonClass = isCircle ? 'button--circle' : `button--${variant}`;
  const fullClassName = `button ${buttonClass} ${className}`.trim();

  return (
    <button type={type} className={fullClassName} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
