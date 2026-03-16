setTimeout(() => {
  const query = window.__AI_QUERY_QUERY__;
  if (!query) return;

  const inputSelectors = [
    '.chat-input-editor',
    '[data-v-7cdbed25] .chat-input-editor',
    'div[contenteditable="true"][data-lexical-editor="true"]',
    'div[contenteditable="true"][role="textbox"]'
  ];

  let inputElement = null;
  for (const selector of inputSelectors) {
    inputElement = document.querySelector(selector);
    if (inputElement) break;
  }

  if (inputElement) {
    console.log('Kimi 找到输入框:', inputElement);

    // 使用execCommand方法设置文本（Lexical编辑器兼容）
    inputElement.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('insertText', false, query);

    // 触发事件确保框架检测到变化
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    inputElement.dispatchEvent(new Event('change', { bubbles: true }));

    console.log('Kimi 已设置文本:', query);

    // 等待一小段时间确保输入生效
    setTimeout(() => {
      let sendButton = null;

      // 基于实际HTML结构的发送按钮选择器
      const sendButtonSelectors = [
        '.send-button-container',
        '.send-button-container:not(.disabled)',
        '[data-v-ac7e8d7d].send-button-container',
        'svg[name="Send"]'
      ];

      for (const selector of sendButtonSelectors) {
        try {
          sendButton = document.querySelector(selector);
          if (sendButton) break;
        } catch (e) {
          // 忽略无效选择器
        }
      }

      // 尝试通过SVG找到父按钮
      if (!sendButton) {
        const svgElement = document.querySelector('svg[name="Send"]');
        if (svgElement) {
          sendButton = svgElement.closest('.send-button-container') || svgElement.parentElement;
        }
      }

      if (sendButton) {
        console.log('Kimi 找到发送按钮:', sendButton);
        // 多次点击确保触发
        sendButton.click();
        setTimeout(() => sendButton.click(), 100);
        setTimeout(() => sendButton.click(), 200);
      } else {
        console.log('Kimi 未找到发送按钮，尝试按Enter');
        // 在输入框上触发Enter键
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          bubbles: true,
          cancelable: true,
          shiftKey: false
        });
        inputElement.dispatchEvent(enterEvent);

        setTimeout(() => {
          inputElement.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            bubbles: true,
            cancelable: true,
            shiftKey: false
          }));
        }, 100);
      }
    }, 800);
  } else {
    console.log('Kimi 未找到输入框');
  }
}, 1500);
