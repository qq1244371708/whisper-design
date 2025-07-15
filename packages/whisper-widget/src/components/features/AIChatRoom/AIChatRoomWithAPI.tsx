import React, { useState, useEffect, useCallback } from 'react';
import type { IMessage, IChatConfig, UploadedFile } from '../../../types/chat';
import { chatService, userService, fileService } from '../../../services';
import ChatMessagesList from '../../composite/ChatMessagesList/ChatMessagesList';
import ChatInputArea from '../../composite/ChatInputArea/ChatInputArea';
import PromptSet from '../../composite/PromptSet/PromptSet';
import './AIChatRoom.scss';

interface AIChatRoomWithAPIProps {
  conversationId?: string;
  userId: string;
  config?: IChatConfig;
  conversationTitle?: string;
  placeholder?: string;
  onConversationChange?: (conversationId: string, title?: string) => void;
  onError?: (error: Error) => void;
}

const AIChatRoomWithAPI: React.FC<AIChatRoomWithAPIProps> = ({
  conversationId,
  userId,
  config,
  conversationTitle,
  placeholder = "输入消息...",
  onConversationChange,
  onError,
}) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isAITyping, setIsAITyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(conversationId);

  // 加载对话消息
  const loadMessages = useCallback(async (convId: string) => {
    if (!convId) return;

    setIsLoading(true);
    try {
      const conversation = await chatService.getConversationWithMessages(convId);
      setMessages(conversation.messages || []);
      // 通知父组件对话标题
      onConversationChange?.(convId, conversation.title);
    } catch (error) {
      console.error('Failed to load messages:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [onError, onConversationChange]);

  // 创建新对话
  const createNewConversation = useCallback(async (title?: string) => {
    try {
      const conversation = await chatService.createConversation({
        title: title || '新对话',
        userId,
      });
      setCurrentConversationId(conversation.id);
      setMessages([]);
      onConversationChange?.(conversation.id, conversation.title);
      return conversation.id;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      onError?.(error as Error);
      throw error;
    }
  }, [userId, onConversationChange, onError]);

  // 发送消息
  const handleSendMessage = async (message: string, files: UploadedFile[] = []) => {
    // 检查是否有内容或文件
    if (isSending || (!message.trim() && (!files || files.length === 0))) return;

    setIsSending(true);
    
    try {
      // 如果没有对话ID，先创建对话
      let convId = currentConversationId;
      if (!convId) {
        convId = await createNewConversation();
      }

      // 处理文件（如果有）
      let uploadedFiles: UploadedFile[] = [];
      if (files && files.length > 0) {
        try {
          // 检查是否有File对象需要上传
          const fileObjects = files.filter(f => f instanceof File) as File[];
          if (fileObjects.length > 0) {
            uploadedFiles = await fileService.uploadFiles({
              files: fileObjects,
              userId,
            });
          }

          // 如果files中已经包含UploadedFile对象，直接使用
          const existingFiles = files.filter(f => !(f instanceof File)) as UploadedFile[];
          uploadedFiles = [...uploadedFiles, ...existingFiles];
        } catch (fileError) {
          console.error('File upload failed:', fileError);
          // 继续发送消息，即使文件上传失败
          uploadedFiles = files.filter(f => !(f instanceof File)) as UploadedFile[];
        }
      }

      // 创建用户消息
      const userMessage: IMessage = {
        id: `temp-${Date.now()}`,
        content: message.trim() || (uploadedFiles.length > 0 ? `[发送了 ${uploadedFiles.length} 个文件]` : ''),
        sender: 'user',
        timestamp: Date.now(),
        files: uploadedFiles,
      };

      // 立即显示用户消息
      setMessages(prev => [...prev, userMessage]);

      // 发送消息到服务器
      const messageParams: any = {
        files: uploadedFiles,
      };

      // 只有在有文本内容时才添加content字段
      if (message.trim()) {
        messageParams.content = message.trim();
      }

      const sentMessage = await chatService.sendMessage(convId!, messageParams);

      // 更新用户消息为服务器返回的消息
      setMessages(prev => prev.map(msg =>
        msg.id === userMessage.id ? sentMessage : msg
      ));

      // 重新获取对话信息以更新标题（如果这是第一条消息）
      try {
        const updatedConversation = await chatService.getConversationWithMessages(convId!);
        if (updatedConversation.title) {
          onConversationChange?.(convId!, updatedConversation.title);
        }
      } catch (titleError) {
        console.error('Failed to update conversation title:', titleError);
      }

      // 准备AI聊天请求
      const chatMessages = [...messages, sentMessage].map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      // 显示AI正在输入
      setIsAITyping(true);

      try {
        // 发送到AI服务
        const aiResponse = await chatService.sendAIMessage(chatMessages, {
          model: config?.aiModel || 'gpt-3.5-turbo',
          temperature: 0.7,
          maxTokens: 1000,
        });

        console.log('AI Response:', aiResponse); // 调试日志

        // 验证AI响应内容
        if (!aiResponse?.content?.trim()) {
          console.error('AI响应内容为空:', aiResponse);
          throw new Error('AI服务返回了空的响应内容');
        }

        // 保存AI消息到服务器
        const savedAiMessage = await chatService.sendMessage(convId!, {
          content: aiResponse.content.trim(),
          sender: 'ai',
          type: 'ai',
        });

        // 添加AI消息到列表
        setMessages(prev => [...prev, savedAiMessage]);

      } catch (aiError) {
        console.error('AI response failed:', aiError);
        
        // 添加错误消息
        const errorMessage: IMessage = {
          id: `error-${Date.now()}`,
          content: '抱歉，AI服务暂时不可用，请稍后再试。',
          sender: 'ai',
          timestamp: Date.now(),
          isError: true,
        };
        
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsAITyping(false);
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      onError?.(error as Error);
      
      // 移除临时消息
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
    } finally {
      setIsSending(false);
    }
  };

  // 处理提示词点击
  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt, []);
  };

  // 监听conversationId变化
  useEffect(() => {
    if (conversationId && conversationId !== currentConversationId) {
      setCurrentConversationId(conversationId);
      loadMessages(conversationId);
    }
  }, [conversationId, currentConversationId, loadMessages]);

  // 初始化用户信息
  useEffect(() => {
    if (userId) {
      userService.setCurrentUserId(userId);
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-title">{conversationTitle || '加载中...'}</div>
        </div>
        <div className="chat-body">
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <span>加载对话中...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-title">{conversationTitle || '新对话'}</div>
        {currentConversationId && (
          <div className="chat-id">ID: {currentConversationId}</div>
        )}
      </div>
      <div className="chat-body">
        {messages.length === 0 ? (
          <PromptSet onPromptClick={handlePromptClick} />
        ) : (
          <ChatMessagesList 
            messages={messages} 
            {...(config && { config })}
            isAITyping={isAITyping}
          />
        )}
      </div>
      <div className="chat-footer">
        <ChatInputArea
          onSendMessage={handleSendMessage}
          placeholder={placeholder}
          disabled={isSending || isAITyping}
          showFileUpload={true}
        />
      </div>
    </div>
  );
};

export default AIChatRoomWithAPI;
