import React from 'react';
import type {MessageBubbleProps} from './interfaces'
import './MessageBubble.scss';

const MessageBubble: React.FC<MessageBubbleProps> = ({
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

export default MessageBubble;