import React from 'react';
import type {BubbleProps} from './interfaces'
import '@/components/Bubble/Bubble.scss';

const Bubble: React.FC<BubbleProps> = ({
  avatar,
  content,
  footer,
  header,
  id,
  className = '',
  placement = 'start',
}) => {
  return (
    <div className={`bubble bubble--${placement} ${className}`} key={id}>
      {avatar && placement === 'start' && <div className="bubble-avatar">{avatar}</div>}
      <div className="bubble-content">
        {header && (
          <div className="bubble-header">
            {typeof header === 'function' ? header(content, { key: 'header' }) : header}
          </div>
        )}
        <div className="bubble-message">{content}</div>
        {footer && (
          <div className="bubble-footer">
            {typeof footer === 'function' ? footer(content, { key: 'footer' }) : footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bubble;