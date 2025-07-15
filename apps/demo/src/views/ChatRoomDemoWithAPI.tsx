import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AIChatRoomWithAPI,
  ConversationListWithAPI,
  apiClient,
} from '@whisper-design/widget';
import '@whisper-design/widget/styles';

const ChatRoomDemoWithAPI: React.FC = () => {
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const [userId] = useState('demo-user-123'); // 模拟用户ID
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // 用于强制刷新对话列表
  const [activeConversationTitle, setActiveConversationTitle] = useState<string>('新对话');

  // 检查BFF服务连接状态
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await apiClient.healthCheck();
        setIsConnected(true);
        setError(null);
      } catch (err) {
        setIsConnected(false);
        setError('无法连接到BFF服务，请确保whisper-core服务正在运行 (http://localhost:3001)');
        console.error('BFF connection failed:', err);
      }
    };

    checkConnection();
    
    // 定期检查连接状态
    const interval = setInterval(checkConnection, 30000); // 每30秒检查一次
    
    return () => clearInterval(interval);
  }, []);

  const handleSelectConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
    setActiveConversationTitle('加载中...');
  }, []);

  const handleNewConversation = useCallback(() => {
    setActiveConversationId(undefined); // 清除当前选择，让AIChatRoomWithAPI创建新对话
    setActiveConversationTitle('新对话');
  }, []);

  const handleConversationChange = useCallback((conversationId: string, title?: string) => {
    setActiveConversationId(conversationId);
    if (title) {
      setActiveConversationTitle(title);
    }
    // 触发对话列表刷新，以防新对话没有在列表中显示
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleError = useCallback((error: Error) => {
    setError(error.message);
    console.error('Chat error:', error);
    // 3秒后清除错误
    setTimeout(() => setError(null), 3000);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 缓存配置对象，避免不必要的重新渲染
  const chatConfig = useMemo(() => ({
    userAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=用户',
    aiAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=robot',
    theme: 'light' as const,
    aiModel: 'gpt-3.5-turbo',
  }), []);

  // 缓存样式对象
  const leftPanelStyle = useMemo(() => ({
    width: '320px',
    minWidth: '320px',
    height: '100vh',
    borderRight: '1px solid #e1e5e9',
    backgroundColor: '#f8f9fa',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    overflow: 'hidden' as const
  }), []);

  const rightPanelStyle = useMemo(() => ({
    flex: 1,
    height: '100vh',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    overflow: 'hidden' as const
  }), []);

  if (!isConnected) {
    return (
      <div style={{ 
        display: 'flex', 
        height: '100vh', 
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          padding: '40px',
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔌</div>
          <h2 style={{ color: '#ff4d4f', marginBottom: '16px' }}>服务连接失败</h2>
          <p style={{ color: '#666', marginBottom: '24px', lineHeight: '1.6' }}>
            {error}
          </p>
          <div style={{ 
            padding: '16px', 
            backgroundColor: '#f6f8fa', 
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>启动步骤：</h4>
            <ol style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
              <li>确保在项目根目录</li>
              <li>运行: <code style={{ background: '#e1e4e8', padding: '2px 6px', borderRadius: '3px' }}>cd packages/whisper-core</code></li>
              <li>运行: <code style={{ background: '#e1e4e8', padding: '2px 6px', borderRadius: '3px' }}>pnpm dev</code></li>
              <li>等待服务启动在 http://localhost:3001</li>
            </ol>
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            重新检查连接
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* 错误提示 */}
      {error && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#ff4d4f',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '6px',
          zIndex: 1000,
          maxWidth: '400px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{error}</span>
            <button 
              onClick={clearError}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                marginLeft: '12px',
                fontSize: '16px'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* 连接状态指示器 */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        backgroundColor: isConnected ? '#52c41a' : '#ff4d4f',
        color: 'white',
        borderRadius: '20px',
        fontSize: '12px',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: 'white',
          marginRight: '8px'
        }}></div>
        {isConnected ? 'BFF服务已连接' : 'BFF服务断开'}
      </div>

      {/* 左侧对话列表 */}
      <div style={leftPanelStyle}>
        <ConversationListWithAPI
          key={refreshKey}
          userId={userId}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onError={handleError}
        />
      </div>

      {/* 右侧聊天区域 */}
      <div style={rightPanelStyle}>
        <AIChatRoomWithAPI
          conversationId={activeConversationId}
          userId={userId}
          config={chatConfig}
          conversationTitle={activeConversationTitle}
          onConversationChange={handleConversationChange}
          onError={handleError}
        />
      </div>
    </div>
  );
};

export default ChatRoomDemoWithAPI;
