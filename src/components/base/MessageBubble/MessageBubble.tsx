import React from 'react';
import type { MessageBubbleProps } from './interfaces';
import './MessageBubble.scss';

const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({ id, content, sender, type = 'text', isLoading, files }) => {
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

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'fas fa-file-pdf';
      case 'xlsx':
      case 'xls':
        return 'fas fa-file-excel';
      case 'docx':
      case 'doc':
        return 'fas fa-file-word';
      case 'pptx':
      case 'ppt':
        return 'fas fa-file-powerpoint';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'svg':
      case 'webp':
        return 'fas fa-file-image';
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
      case 'flv':
        return 'fas fa-file-video';
      case 'mp3':
      case 'wav':
      case 'flac':
      case 'aac':
        return 'fas fa-file-audio';
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return 'fas fa-file-archive';
      case 'txt':
      case 'md':
        return 'fas fa-file-alt';
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'html':
      case 'css':
      case 'scss':
      case 'json':
      case 'xml':
      case 'py':
      case 'java':
      case 'cpp':
      case 'c':
        return 'fas fa-file-code';
      default:
        return 'fas fa-file';
    }
  };

  return (
    <div className={`message-bubble ${sender} message-bubble--${type}`} key={id}>
      {renderContent()}
      {files && files.length > 0 && (
        <div className="file-attachments">
          {files.map((file) => (
            <div key={file.id} className="file-attachment">
              <div className="file-icon">
                <i className={getFileIcon(file.name)}></i>
              </div>
              <div className="file-info">
                <div className="file-name">{file.name}</div>
                <div className="file-size">{(file.size / 1024).toFixed(2)} KB</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {isLoading && <span className="loading-indicator">...</span>} {/* Simple loading indicator */}
    </div>
  );
});

export default MessageBubble;
