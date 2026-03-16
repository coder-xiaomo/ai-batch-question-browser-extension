setTimeout(() => {
  const query = window.__AI_QUERY_QUERY__;
  if (!query) return;

  // 首先找到Slate编辑器
  const slateEditor = document.querySelector('[data-slate-editor="true"]');

  // 如果没找到Slate编辑器，尝试其他输入框
  let inputElement = slateEditor;
  if (!inputElement) {
    const allTextareas = document.querySelectorAll('textarea');
    const allContentEditables = document.querySelectorAll('[contenteditable="true"]');

    for (const el of allTextareas) {
      const rect = el.getBoundingClientRect();
      const placeholder = el.getAttribute('placeholder') || '';
      if (rect.top > 300 && !placeholder.includes('搜索') && !placeholder.includes('查找')) {
        inputElement = el;
        break;
      }
    }

    if (!inputElement) {
      for (const el of allContentEditables) {
        const rect = el.getBoundingClientRect();
        const placeholder = el.getAttribute('placeholder') || '';
        if (rect.top > 300 && !placeholder.includes('搜索') && !placeholder.includes('查找')) {
          inputElement = el;
          break;
        }
      }
    }
  }

  if (inputElement) {
    console.log('千问 找到输入框:', inputElement);

    if (inputElement.getAttribute('data-slate-editor') === 'true') {
      // Slate编辑器特定输入方法
      inputElement.focus();

      // 设置内容
      inputElement.innerHTML = `<p data-slate-node="element"><span data-slate-node="text">${query}</span></p>`;

      // 触发Slate需要的事件序列
      inputElement.dispatchEvent(new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: query
      }));

      inputElement.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        inputType: 'insertText',
        data: query
      }));

      // 模拟composition事件
      inputElement.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
      inputElement.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));

      // 设置光标位置到末尾
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(inputElement);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);

      // 触发键盘事件
      inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
      inputElement.dispatchEvent(new KeyboardEvent('keyup', { key: 'End', bubbles: true }));

    } else if (inputElement.getAttribute('contenteditable') === 'true') {
      inputElement.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('insertText', false, query);
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      // 普通textarea
      inputElement.focus();
      inputElement.value = query;
      inputElement.dispatchEvent(new Event('focus', { bubbles: true }));
      inputElement.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        inputType: 'insertText',
        data: query
      }));
      inputElement.dispatchEvent(new Event('change', { bubbles: true }));
      inputElement.dispatchEvent(new KeyboardEvent('keyup', {
        key: 'a',
        code: 'KeyA',
        bubbles: true
      }));
    }

    console.log('千问 已设置文本:', query);

    // 等待一小段时间确保输入生效
    setTimeout(() => {
      let sendButton = null;

      // 基于实际HTML结构的发送按钮选择器
      const sendButtonSelectors = [
        '.operateBtn-ehxNOr',
        '.operateBtn-ehxNOr:not(.disabled-qRQbX6)',
        '[class*="operateBtn"]',
        'span[data-icon-type="qwpcicon-sendChat"]',
        'span[data-icon-type="qwpcicon-sendChat"] svg',
        'button[class*="send"]',
        'button[class*="Send"]'
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
        const svgElement = document.querySelector('use[xlink:href="#qwpcicon-sendChat"]');
        if (svgElement) {
          sendButton = svgElement.closest('[class*="operateBtn"]') || svgElement.parentElement;
        }
      }

      if (sendButton) {
        console.log('千问 找到发送按钮:', sendButton);
        inputElement.focus();
        sendButton.click();
        setTimeout(() => sendButton.click(), 100);
        setTimeout(() => sendButton.click(), 200);
      } else {
        console.log('千问 未找到发送按钮，尝试按Enter');
        inputElement.focus();
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          bubbles: true,
          cancelable: true,
          shiftKey: false
        });
        inputElement.dispatchEvent(enterEvent);
        setTimeout(() => {
          inputElement.focus();
          inputElement.dispatchEvent(enterEvent);
        }, 100);
      }
    }, 200);
  } else {
    console.log('千问 未找到输入框');
  }
}, 1000);
