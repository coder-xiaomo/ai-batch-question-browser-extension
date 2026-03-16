setTimeout(() => {
  const query = window.__AI_QUERY_QUERY__;
  if (!query) return;

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
    inputElement.value = query;
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    inputElement.dispatchEvent(new Event('change', { bubbles: true }));

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
      inputElement.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        bubbles: true,
        cancelable: true
      }));
    }
  }
}, 1000);