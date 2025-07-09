import React, { useState } from "react";
import FileUpload from '../../base/FileUpload/FileUpload'; // Import FileUpload
import type { UploadedFile } from '../../base/FileUpload/interfaces'; // Import UploadedFile
import "./ChatInputArea.scss";

interface ChatInputAreaProps {
  onSendMessage: (message: string, files: UploadedFile[]) => void; // Modified
  isSending?: boolean;
  placeholder?: string;
  onFilesChange?: (files: UploadedFile[]) => void; // New prop for external control
}

const ChatInputArea: React.FC<ChatInputAreaProps> = ({ onSendMessage, isSending = false, placeholder = "输入消息...", onFilesChange }) => {
  const [inputValue, setInputValue] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]); // State for uploaded files

  const handleFilesChange = (newFiles: UploadedFile[]) => {
    setFiles(newFiles);
    if (onFilesChange) {
      onFilesChange(newFiles); // Propagate changes if controlled
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() || files.length > 0) { // Allow sending message or files
      onSendMessage(inputValue.trim(), files);
      setInputValue("");
      setFiles([]); // Clear files after sending
    }
  };

  return (
    <form className="sender-container" onSubmit={handleSubmit}>
      {/* FileUpload component rendered above the input */}
      <FileUpload
        onFilesChange={handleFilesChange}
        value={files} // Pass current files to FileUpload
        disabled={isSending}
      />
      <div className="input-area-bottom"> {/* New div for input and button */}
        <input
          type="text"
          className="sender-input"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          aria-label="消息输入框"
          disabled={isSending}
        />
        <button type="submit" className="sender-button" disabled={isSending}>
          发送
        </button>
      </div>
    </form>
  );
};

export default ChatInputArea;
