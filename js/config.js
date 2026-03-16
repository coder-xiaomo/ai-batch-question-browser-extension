/**
 * AI 批量查询助手 - 配置文件
 * 定义支持的 AI 工具及其 URL 模板
 */

const AI_TOOLS = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    url: 'https://chat.deepseek.com/',
    color: '#0066ff',
    icon: 'D'
  },
  {
    id: 'yuanbao',
    name: '腾讯元宝',
    url: 'https://yuanbao.tencent.com/chat/',
    color: '#00c853',
    icon: '元'
  },
  {
    id: 'doubao',
    name: '豆包',
    url: 'https://www.doubao.com/chat/',
    color: '#ff6b6b',
    icon: '豆'
  },
  {
    id: 'kimi',
    name: 'Kimi',
    url: 'https://kimi.moonshot.cn/',
    color: '#6366f1',
    icon: 'K'
  },
  {
    id: 'qianwen',
    name: '千问',
    url: 'https://tongyi.aliyun.com/',
    color: '#ff4081',
    icon: '千'
  }
];

// 默认选中的工具
const DEFAULT_SELECTED_TOOLS = ['deepseek', 'kimi', 'doubao'];

// 存储键名
const STORAGE_KEYS = {
  SELECTED_TOOLS: 'ai_query_selected_tools',
  QUERY_HISTORY: 'ai_query_history'
};

// 历史记录配置
const HISTORY_CONFIG = {
  MAX_RECORDS: 100,        // 最大历史记录数
  MAX_QUERY_LENGTH: 500    // 存储时截断的查询文本长度
};

// 导出配置（兼容模块和非模块环境）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AI_TOOLS, DEFAULT_SELECTED_TOOLS, STORAGE_KEYS, HISTORY_CONFIG };
}
