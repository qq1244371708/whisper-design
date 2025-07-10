import React from 'react';
import type { MessageBubbleProps } from './interfaces';
import './MessageBubble.scss';

const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({ id, content, sender, type = 'text', isLoading }) => {
  const renderContent = () => {
    switch (type) {
      case 'image':
        return <img src={content as string} alt="" />;
      case 'code':
        return <pre><code>{content as string}</code></pre>;
      case 'text':
      default:
        return <p>{content}</p>;
    }
  };

  return (
    <div className={`message-bubble ${sender} message-bubble--${type}`} key={id}>
      {renderContent()}
      {isLoading && <span className="loading-indicator">...</span>} {/* Simple loading indicator */}
    </div>
  );
});

export default MessageBubble;
