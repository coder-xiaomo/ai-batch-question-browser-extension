/**
 * AI 批量查询助手 - 主逻辑文件
 */

document.addEventListener('DOMContentLoaded', async () => {
  // DOM 元素
  const queryInput = document.getElementById('queryInput');
  const charCount = document.getElementById('charCount');
  const clearBtn = document.getElementById('clearBtn');
  const toolsGrid = document.getElementById('toolsGrid');
  const selectAllBtn = document.getElementById('selectAllBtn');
  const deselectAllBtn = document.getElementById('deselectAllBtn');
  const queryBtn = document.getElementById('queryBtn');
  const historyBtn = document.getElementById('historyBtn');
  const historyPanel = document.getElementById('historyPanel');
  const historyList = document.getElementById('historyList');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const closeHistoryBtn = document.getElementById('closeHistoryBtn');

  // 状态
  let selectedTools = new Set();

  /**
   * 初始化应用
   */
  async function init() {
    // 渲染 AI 工具列表
    renderTools();

    // 加载保存的选中状态
    await loadSelectedTools();

    // 初始化 IndexedDB
    try {
      await historyStorage.init();
    } catch (error) {
      console.warn('IndexedDB 初始化失败，历史记录功能不可用:', error);
    }

    // 绑定事件
    bindEvents();
  }

  /**
   * 渲染 AI 工具列表
   */
  function renderTools() {
    toolsGrid.innerHTML = AI_TOOLS.map(tool => `
      <div class="tool-card" data-tool="${tool.id}">
        <div class="tool-icon">${tool.icon}</div>
        <div class="tool-info">
          <div class="tool-name">${tool.name}</div>
        </div>
        <div class="tool-checkbox">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12L10 17L20 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    `).join('');
  }

  /**
   * 加载保存的工具选中状态
   */
  async function loadSelectedTools() {
    try {
      // 检查 Chrome API 是否可用
      if (chrome && chrome.storage && chrome.storage.local) {
        const result = await chrome.storage.local.get(STORAGE_KEYS.SELECTED_TOOLS);
        const savedTools = result[STORAGE_KEYS.SELECTED_TOOLS] || DEFAULT_SELECTED_TOOLS;

        selectedTools = new Set(savedTools);
        updateToolsUI();
      } else {
        console.warn('Chrome storage API 不可用，使用默认工具');
        selectedTools = new Set(DEFAULT_SELECTED_TOOLS);
        updateToolsUI();
      }
    } catch (error) {
      console.error('加载工具选中状态失败:', error);
      selectedTools = new Set(DEFAULT_SELECTED_TOOLS);
      updateToolsUI();
    }
  }

  /**
   * 保存工具选中状态
   */
  async function saveSelectedTools() {
    try {
      // 检查 Chrome API 是否可用
      if (chrome && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({
          [STORAGE_KEYS.SELECTED_TOOLS]: Array.from(selectedTools)
        });
      } else {
        console.warn('Chrome storage API 不可用，无法保存工具选中状态');
      }
    } catch (error) {
      console.error('保存工具选中状态失败:', error);
    }
  }

  /**
   * 更新工具 UI 状态
   */
  function updateToolsUI() {
    const toolCards = toolsGrid.querySelectorAll('.tool-card');

    toolCards.forEach(card => {
      const toolId = card.dataset.tool;

      if (selectedTools.has(toolId)) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });
  }

  /**
   * 绑定事件处理
   */
  function bindEvents() {
    // 输入框事件
    queryInput.addEventListener('input', handleInputChange);
    queryInput.addEventListener('keydown', handleInputKeydown);

    // 清空按钮
    clearBtn.addEventListener('click', handleClearInput);

    // 工具选择
    toolsGrid.addEventListener('click', handleToolClick);

    // 全选/全不选
    selectAllBtn.addEventListener('click', handleSelectAll);
    deselectAllBtn.addEventListener('click', handleDeselectAll);

    // 查询按钮
    queryBtn.addEventListener('click', handleQuery);

    // 历史记录
    historyBtn.addEventListener('click', handleShowHistory);
    closeHistoryBtn.addEventListener('click', handleCloseHistory);
    clearHistoryBtn.addEventListener('click', handleClearHistory);
  }

  /**
   * 处理输入框内容变化
   */
  function handleInputChange() {
    const length = queryInput.value.length;
    charCount.textContent = `${length} 字符`;
  }

  /**
   * 处理输入框键盘事件
   */
  function handleInputKeydown(event) {
    // Ctrl+Enter 或 Cmd+Enter 触发查询
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleQuery();
    }
  }

  /**
   * 清空输入框
   */
  function handleClearInput() {
    queryInput.value = '';
    charCount.textContent = '0 字符';
    queryInput.focus();
  }

  /**
   * 处理工具点击
   */
  function handleToolClick(event) {
    const card = event.target.closest('.tool-card');

    if (!card) return;

    const toolId = card.dataset.tool;

    if (selectedTools.has(toolId)) {
      selectedTools.delete(toolId);
      card.classList.remove('selected');
    } else {
      selectedTools.add(toolId);
      card.classList.add('selected');
    }

    saveSelectedTools();
  }

  /**
   * 全选
   */
  function handleSelectAll() {
    AI_TOOLS.forEach(tool => selectedTools.add(tool.id));
    updateToolsUI();
    saveSelectedTools();
  }

  /**
   * 全不选
   */
  function handleDeselectAll() {
    selectedTools.clear();
    updateToolsUI();
    saveSelectedTools();
  }

  /**
   * 执行批量查询
   */
  async function handleQuery() {
    const query = queryInput.value.trim();

    if (!query) {
      showToast('请输入查询内容');
      queryInput.focus();
      return;
    }

    if (selectedTools.size === 0) {
      showToast('请至少选择一个 AI 工具');
      return;
    }

    // 获取选中的工具
    const toolsToOpen = AI_TOOLS.filter(tool => selectedTools.has(tool.id));

    // 批量打开标签页
    let openedCount = 0;

    // 先将查询内容复制到剪贴板，只需要复制一次
    try {
      await navigator.clipboard.writeText(query);
    } catch (error) {
      console.warn('复制到剪贴板失败:', error);
    }

    // 并行打开所有标签页
    const openTabPromises = toolsToOpen.map(async (tool, index) => {
      try {
        // 检查 Chrome API 是否可用
        if (chrome && chrome.tabs) {
          // 打开新标签页
          const tab = await chrome.tabs.create({
            url: tool.url,
            active: index === toolsToOpen.length - 1 // 最后一个标签页激活
          });

          // 等待标签页加载完成，然后注入脚本自动填充内容
          return new Promise((resolve) => {
            chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, updatedTab) {
              if (tabId === tab.id && changeInfo.status === 'complete') {
                // 移除监听器，避免重复执行
                chrome.tabs.onUpdated.removeListener(listener);

                // 检查 scripting API 是否可用
                if (chrome.scripting) {
                  // 注入脚本自动填充内容并发送
                  chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: (query) => {
                      // 等待页面完全加载
                      setTimeout(() => {
                        // 尝试不同的选择器来找到输入框
                        const inputSelectors = [
                          'textarea',
                          '[role="textbox"]',
                          '.chat-input',
                          '#chat-input',
                          '.input-area'
                        ];

                        let inputElement = null;
                        for (const selector of inputSelectors) {
                          inputElement = document.querySelector(selector);
                          if (inputElement) break;
                        }

                        if (inputElement) {
                          // 填充内容
                          inputElement.value = query;

                          // 触发输入事件
                          inputElement.dispatchEvent(new Event('input', { bubbles: true }));
                          inputElement.dispatchEvent(new Event('change', { bubbles: true }));

                          // 尝试找到发送按钮并点击
                          const sendButtonSelectors = [
                            'button[type="submit"]',
                            '.send-button',
                            '#send-button',
                            '.submit-btn',
                            '[aria-label*="发送"]',
                            '[aria-label*="Send"]'
                          ];

                          let sendButton = null;
                          for (const selector of sendButtonSelectors) {
                            sendButton = document.querySelector(selector);
                            if (sendButton) break;
                          }

                          if (sendButton) {
                            sendButton.click();
                          } else {
                            // 如果没有找到发送按钮，尝试按Enter键
                            inputElement.dispatchEvent(new KeyboardEvent('keydown', {
                              key: 'Enter',
                              code: 'Enter',
                              bubbles: true,
                              cancelable: true
                            }));
                          }
                        }
                      }, 1000); // 1秒延迟，确保页面完全加载
                    },
                    args: [query]
                  });
                } else {
                  console.warn('Chrome scripting API 不可用，无法自动填充内容');
                }
                resolve(true);
              }
            });
          });
        } else {
          console.warn('Chrome tabs API 不可用，无法打开标签页');
          return false;
        }
      } catch (error) {
        console.error(`打开 ${tool.name} 失败:`, error);
        return false;
      }
    });

    // 等待所有标签页打开完成
    const results = await Promise.all(openTabPromises);
    openedCount = results.filter(result => result).length;

    // 保存到历史记录
    try {
      await historyStorage.addRecord(query, Array.from(selectedTools));
    } catch (error) {
      console.warn('保存历史记录失败:', error);
    }

    // 显示提示
    showToast(`已打开 ${openedCount} 个 AI 工具，查询内容已复制到剪贴板`);

    // 关闭 popup（可选）
    // window.close();
  }

  /**
   * 显示历史记录面板
   */
  async function handleShowHistory() {
    historyPanel.classList.remove('hidden');

    try {
      const records = await historyStorage.getAllRecords();
      renderHistoryList(records);
    } catch (error) {
      console.error('加载历史记录失败:', error);
      historyList.innerHTML = `
        <div class="history-empty">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <p>暂无历史记录</p>
        </div>
      `;
    }
  }

  /**
   * 关闭历史记录面板
   */
  function handleCloseHistory() {
    historyPanel.classList.add('hidden');
  }

  /**
   * 渲染历史记录列表
   */
  function renderHistoryList(records) {
    if (records.length === 0) {
      historyList.innerHTML = `
        <div class="history-empty">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <p>暂无历史记录</p>
        </div>
      `;
      return;
    }

    historyList.innerHTML = records.map(record => {
      const toolColors = record.tools.map(toolId => {
        const tool = AI_TOOLS.find(t => t.id === toolId);
        return tool ? tool.color : '#ccc';
      });

      return `
        <div class="history-item" data-query="${escapeHtml(record.query)}" data-tools='${JSON.stringify(record.tools)}'>
          <div class="history-item-query">${escapeHtml(record.query)}</div>
          <div class="history-item-meta">
            <span>${historyStorage.formatTime(record.timestamp)}</span>
            <div class="history-item-tools">
              ${toolColors.map(color => `<span class="history-item-tool" style="background-color: ${color}"></span>`).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // 绑定点击事件
    historyList.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        const query = item.dataset.query;
        const tools = JSON.parse(item.dataset.tools);

        // 填充查询内容
        queryInput.value = query;
        charCount.textContent = `${query.length} 字符`;

        // 设置选中的工具
        selectedTools = new Set(tools);
        updateToolsUI();
        saveSelectedTools();

        // 关闭历史面板
        handleCloseHistory();

        // 聚焦输入框
        queryInput.focus();
      });
    });
  }

  /**
   * 清空历史记录
   */
  async function handleClearHistory() {
    if (!confirm('确定要清空所有历史记录吗？')) {
      return;
    }

    try {
      await historyStorage.clearAll();
      renderHistoryList([]);
      showToast('历史记录已清空');
    } catch (error) {
      console.error('清空历史记录失败:', error);
      showToast('清空失败，请重试');
    }
  }

  /**
   * 显示提示消息
   */
  function showToast(message) {
    // 移除已有的 toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // 触发重排后添加 show 类
    toast.offsetHeight;
    toast.classList.add('show');

    // 3秒后移除
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * HTML 转义
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 启动应用
  init();
});
