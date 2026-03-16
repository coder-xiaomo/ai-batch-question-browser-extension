// 后台脚本，处理扩展按钮点击事件
chrome.action.onClicked.addListener(() => {
  // 打开新标签页，加载popup.html
  chrome.tabs.create({
    url: chrome.runtime.getURL('popup.html'),
    active: true
  });
});
