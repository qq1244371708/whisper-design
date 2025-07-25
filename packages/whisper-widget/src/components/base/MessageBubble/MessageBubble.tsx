import React from 'react';
import type { MessageBubbleProps } from './interfaces';
import { getFileIcon, formatFileSize } from '../../../utils/file';
import './MessageBubble.scss';

const MessageBubble: React.FC<MessageBubbleProps> = React.memo(
  ({ id, content, sender, type = 'text', isLoading, files }) => {
    const renderContent = () => {
      switch (type) {
        case 'image':
          return <img src={content as string} alt="" />;
        case 'code':
          return (
            <pre>
              <code>{content as string}</code>
            </pre>
          );
        case 'text':
        default:
          return <p>{content}</p>;
      }
    };

    return (
      <div className={`message-bubble ${sender} message-bubble--${type}`} key={id}>
        {renderContent()}
        {files && files.length > 0 && (
          <div className="file-attachments">
            {files.map(file => (
              <div key={file.id} className="file-attachment">
                <div className="file-icon">
                  <i className={getFileIcon(file.name)}></i>
                </div>
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-size">{formatFileSize(file.size)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {isLoading && <span className="loading-indicator">...</span>}{' '}
        {/* Simple loading indicator */}
      </div>
    );
  }
);

export default MessageBubble;
