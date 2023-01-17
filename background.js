'use strict';

const focusMode = 'ON';
const debugMode = true;

chrome.action.onClicked.addListener(async (tab) => 
{
    const oldState = await chrome.action.getBadgeText({ tabId: tab.id });
    const newState = focusMode === oldState ? '' : focusMode;

    await chrome.action.setBadgeText(
    {
      tabId: tab.id,
      text: newState,
    });

    log(`Focus mode is ${newState || 'OFF'}`)

    try
    {
      if (focusMode === newState)
      {
        log(`Inject request broadcast`)
        await chrome.tabs.sendMessage(tab.id, { inject: true, debugMode })
      } 
      else
      {
        log(`Eject request broadcast`)
        await chrome.tabs.sendMessage(tab.id, { eject: true, debugMode })
      }
    }
    catch (err)
    {
      log(err);
      void chrome.runtime.lastError;
    }

    function log()
    {
      self.log("tabId", tab.id, tab.title?.slice(0,50), ...arguments);
    }
});

chrome.runtime.onMessage.addListener((request, sender) => 
{
  if (request.hideFrame) 
  {
    chrome.scripting.executeScript(
    {
      func: hideFrame,
      args: [request.hideFrame],
      target: { tabId: sender.tab.id }
    })
    .then( obj => void chrome.runtime.lastError)
    .catch(err => void chrome.runtime.lastError);
  }
  else if (request.message)
  {
    log(...request.message)
  }

  function log()
  {
    self.log("tabId", sender.tab.id, "frameId", sender.frameId, sender.tab.title?.slice(0,50), ...arguments)
  }
});

function hideFrame(id)
{
  const frame = document.activeElement;

  if (frame)
  {
    frame.classList.add('hide-element-in-focus-mode');
    frame.style.display = "none";
  }
}

function log()
{
  if (debugMode) console.log(...arguments)
}
