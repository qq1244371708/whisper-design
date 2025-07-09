import React, { useState } from "react";
import "./ChatInputArea.scss";

interface ChatInputAreaProps {
  onSendMessage: (message: string) => void;
  isSending?: boolean;
  placeholder?: string;
}

const ChatInputArea: React.FC<ChatInputAreaProps> = ({ onSendMessage, isSending = false, placeholder = "输入消息..." }) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <form className="sender-container" onSubmit={handleSubmit}>
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
    </form>
  );
};

export default ChatInputArea;
