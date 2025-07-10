import React from 'react';
import './Button.scss';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  isCircle?: boolean; // New prop for circular buttons
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  variant = 'primary',
  disabled = false,
  type = 'button',
  isCircle = false,
}) => {
  const buttonClass = isCircle ? 'button--circle' : `button--${variant}`;

  return (
    <button
      type={type}
      className={`button ${buttonClass}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;