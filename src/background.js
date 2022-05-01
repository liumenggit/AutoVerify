import axios from '@/popup/axios'

browser.contextMenus.create({
  id: 'ManualAddImgRule',
  title: '手动创建规则',
  contexts: ['all']
})

browser.contextMenus.onClicked.addListener(function (info, tab) {
  switch (info.menuItemId) {
    case 'ManualAddImgRule':
      sendMessageToContentScript({ cmd: 'ManualAddImgRule' })
      break
  }
})

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === 'getsetinfo') {
    sendResponse(localStorage.getItem('setinfo'))
  } else {
    return sendResponse(SendRequest(request))
  }
})

function sendMessageToContentScript (message, callback) {
  browser.tabs.query({
    active: true,
    currentWindow: true
  }).then(function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
      if (callback) callback(response)
    })
  })
}

function SendRequest (request) {
  return new Promise((resolve) => {
    axios.request({
      method: request.method,
      url: request.url,
      params: request.params,
      data: request.data
    })
      .then(function (response) {
        resolve(response)
      })
  })
}
