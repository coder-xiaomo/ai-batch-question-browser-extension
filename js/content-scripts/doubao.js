setTimeout(() => {
  const query = window.__AI_QUERY_QUERY__;
  if (!query) return;

  const inputSelectors = [
    'textarea[placeholder*="输入"]',
    'textarea[placeholder*="问"]',
    'div[class*="input"] textarea',
    'div[class*="Input"] textarea',
    'textarea',
    '[role="textbox"]',
    '[contenteditable="true"]'
  ];

  let inputElement = null;
  for (const selector of inputSelectors) {
    inputElement = document.querySelector(selector);
    if (inputElement) {
      const placeholder = inputElement.getAttribute('placeholder') || '';
      if (!placeholder.includes('搜索') && !placeholder.includes('search')) {
        break;
      }
    }
  }

  if (inputElement) {
    console.log('豆包 找到输入框:', inputElement);

    if (inputElement.getAttribute('contenteditable') === 'true') {
      inputElement.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('insertText', false, query);
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      nativeInputValueSetter.call(inputElement, query);
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      inputElement.dispatchEvent(new Event('change', { bubbles: true }));
    }

    console.log('豆包 已设置文本:', query);

    // 等待一小段时间确保输入生效
    setTimeout(() => {
      let sendButton = null;

      // 基于实际HTML结构的发送按钮选择器
      const sendButtonSelectors = [
        // 豆包特定选择器
        '#flow-end-msg-send',
        '[data-testid="chat_input_send_button"]',
        'button[data-testid="chat_input_send_button"]',
        '[class*="send-btn-wrapper"] button',
        // 通用选择器
        'button[class*="send"]',
        'button[class*="Send"]',
        'button[aria-label*="发送"]'
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
        const svgElement = document.querySelector('svg path[d*="M10.6254 20.3752"]');
        if (svgElement) {
          sendButton = svgElement.closest('button') || svgElement.parentElement;
        }
      }

      if (sendButton) {
        console.log('豆包 找到发送按钮:', sendButton);
        // 多次点击确保触发
        sendButton.click();
        setTimeout(() => sendButton.click(), 100);
        setTimeout(() => sendButton.click(), 200);
      } else {
        console.log('豆包 未找到发送按钮，尝试按Enter');
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          bubbles: true,
          cancelable: true,
          shiftKey: false
        });
        inputElement.dispatchEvent(enterEvent);
        setTimeout(() => inputElement.dispatchEvent(enterEvent), 100);
      }
    }, 500);
  } else {
    console.log('豆包 未找到输入框');
  }
}, 2000);
