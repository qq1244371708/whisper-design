
import React from 'react';
import './PromptSet.scss';

// 定义一个接口，用于规定 prompt 对象的结构
interface IPrompt {
  title: string;
  content: string;
}

// 定义组件的 props 接口
interface PromptSetProps {
  onPromptClick: (prompt: string) => void;
}

// 预设的 prompts 数组
const prompts: IPrompt[] = [
  {
    title: '写一首关于春天的诗',
    content: '以“春风”为主题，描绘万物复苏的景象。',
  },
  {
    title: '给我推荐三部科幻电影',
    content: '要求是 2020 年以后上映的，并简要说明推荐理由。',
  },
  {
    title: '解释一下什么是“人工智能”',
    content: '用通俗易懂的语言，给我讲讲 AI 的基本概念。',
  },
  {
    title: '帮我制定一个健身计划',
    content: '目标是减脂增肌，每周锻炼三次，请给出详细安排。',
  },
];

const PromptSet: React.FC<PromptSetProps> = ({ onPromptClick }) => {
  return (
    <div className="prompt-set">
      <div className="welcome-message">
        <h1>欢迎使用 AI 聊天室</h1>
        <p>选择一个下面的提示，或直接开始提问</p>
      </div>
      <div className="prompts-grid">
        {prompts.map((prompt, index) => (
          <div
            key={index}
            className="prompt-card"
            onClick={() => onPromptClick(prompt.content)}
          >
            <h3 className="prompt-title">{prompt.title}</h3>
            <p className="prompt-content">{prompt.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromptSet;
