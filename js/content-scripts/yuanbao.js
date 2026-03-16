setTimeout(() => {
  const query = window.__AI_QUERY_QUERY__;
  if (!query) return;

  const inputSelectors = [
    // 元宝特定选择器
    'textarea[placeholder*="输入"]',
    'textarea[placeholder*="问"]',
    'div[class*="input"] textarea',
    'div[class*="Input"] textarea',
    // 通用选择器
    'textarea',
    '[role="textbox"]',
    '[contenteditable="true"]',
    '.chat-input',
    '#chat-input',
    '.input-area',
    '[class*="editor"]',
    '[class*="Editor"]',
    '[class*="textarea"]',
    '[class*="Textarea"]'
  ];

  let inputElement = null;
  for (const selector of inputSelectors) {
    inputElement = document.querySelector(selector);
    if (inputElement) {
      // 确保不是搜索框
      const placeholder = inputElement.getAttribute('placeholder') || '';
      if (!placeholder.includes('搜索') && !placeholder.includes('search')) {
        break;
      }
    }
  }

  if (inputElement) {
    console.log('元宝 找到输入框:', inputElement);

    if (inputElement.getAttribute('contenteditable') === 'true') {
      inputElement.textContent = query;
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      inputElement.dispatchEvent(new Event('change', { bubbles: true }));
      inputElement.dispatchEvent(new Event('blur', { bubbles: true }));
    } else {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      nativeInputValueSetter.call(inputElement, query);
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      inputElement.dispatchEvent(new Event('change', { bubbles: true }));
      inputElement.dispatchEvent(new Event('blur', { bubbles: true }));
    }

    // 等待一小段时间确保输入生效
    setTimeout(() => {
      const sendButtonSelectors = [
        // 元宝特定选择器
        'button[class*="send"]',
        'button[class*="Send"]',
        'button[class*="submit"]',
        'button[class*="Submit"]',
        'button[aria-label*="发送"]',
        'button[aria-label*="Send"]',
        // 通用选择器
        'button[type="submit"]',
        '.send-button',
        '#send-button',
        '.submit-btn',
        'button svg[class*="send"]',
        'button svg[class*="Send"]',
        '[class*="icon-send"]',
        '[class*="icon-Send"]',
        'button:has(svg)',
        '[class*="send-icon"]',
        '[class*="Send-icon"]'
      ];

      let sendButton = null;
      for (const selector of sendButtonSelectors) {
        sendButton = document.querySelector(selector);
        if (sendButton) break;
      }

      if (sendButton) {
        console.log('元宝 找到发送按钮:', sendButton);
        // 多次点击确保触发
        sendButton.click();
        setTimeout(() => sendButton.click(), 100);
      } else {
        console.log('元宝 未找到发送按钮，尝试按Enter');
        if (inputElement.getAttribute('contenteditable') === 'true') {
          const enterEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            bubbles: true,
            cancelable: true,
            shiftKey: false
          });
          inputElement.dispatchEvent(enterEvent);
          setTimeout(() => inputElement.dispatchEvent(enterEvent), 100);
        } else {
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
      }
    }, 500);
  } else {
    console.log('元宝 未找到输入框');
  }
}, 1000);