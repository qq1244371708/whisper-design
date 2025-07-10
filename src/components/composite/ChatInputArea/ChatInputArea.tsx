import React, { useState, useRef } from 'react';
import { v4 as uuid } from 'uuid';
import Button from '../../base/Button/Button';
import type { UploadedFile } from '../../base/FileUpload/interfaces';
import { getFileIcon, formatFileSize } from '../../../utils/file';
import './ChatInputArea.scss';

interface ChatInputAreaProps {
  onSendMessage: (message: string, files: UploadedFile[]) => void;
  isSending?: boolean;
  placeholder?: string;
  onFilesChange?: (files: UploadedFile[]) => void;
}

const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  onSendMessage,
  isSending = false,
  placeholder = '输入消息...',
  onFilesChange,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the hidden file input

  const handleFilesChange = (newFiles: UploadedFile[]) => {
    setFiles(newFiles);
    if (onFilesChange) {
      onFilesChange(newFiles);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() || files.length > 0) {
      onSendMessage(inputValue.trim(), files);
      setInputValue('');
      setFiles([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent); // Cast to FormEvent
    }
  };

  return (
    <form className="chat-input-area" onSubmit={handleSubmit}>
      <div className="input-container">
        <div className="input-toolbar">
          <Button isCircle onClick={() => fileInputRef.current?.click()} disabled={isSending}>
            <i className="fas fa-paperclip"></i>
          </Button>
        </div>

        {/* Hidden file input for FileUpload component */}
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*,.pdf,.xlsx,.docx"
          onChange={e => {
            const selectedFiles = Array.from(e.target.files || []);
            const uploadedFiles: UploadedFile[] = selectedFiles.map(file =>
              Object.assign(file, { id: uuid() })
            );
            // Append new files to existing files instead of replacing
            handleFilesChange([...files, ...uploadedFiles]);
            e.target.value = ''; // Clear input
          }}
          style={{ display: 'none' }}
        />

        {files.length > 0 && (
          <div className="file-list">
            {' '}
            {/* Display selected files here */}
            {files.map(file => (
              <div key={file.id} className="file-card">
                <span className="file-icon">
                  <i className={getFileIcon(file.name)}></i>
                </span>
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{formatFileSize(file.size)}</span>
                </div>
                <button
                  type="button"
                  className="file-remove-button"
                  onClick={() => handleFilesChange(files.filter(f => f.id !== file.id))}
                  disabled={isSending}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          className="message-input"
          placeholder={placeholder}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="消息输入框"
          disabled={isSending}
        />

        <div className="input-actions">
          <div className="input-hints">
            <i className="fas fa-lightbulb"></i> 按 Enter 发送，Shift + Enter 换行
          </div>
          <Button type="submit" variant="primary" disabled={isSending} onClick={() => {}}>
            <i className="fas fa-paper-plane"></i>
            发送
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ChatInputArea;
