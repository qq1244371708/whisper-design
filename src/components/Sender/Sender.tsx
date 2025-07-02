import React, { useState } from "react";
import "@/components/Sender/Sender.scss";

interface SenderProps {
  onSend: (message: string) => void;
}

const Sender: React.FC<SenderProps> = ({ onSend }) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSend(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <form className="sender-container" onSubmit={handleSubmit}>
      <input
        type="text"
        className="sender-input"
        placeholder="输入消息..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        aria-label="消息输入框"
      />
      <button type="submit" className="sender-button">
        发送
      </button>
    </form>
  );
};

export default Sender;
