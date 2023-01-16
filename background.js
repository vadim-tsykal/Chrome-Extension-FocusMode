'use strict';

const focusMode = 'ON';

chrome.action.onClicked.addListener(async (tab) => 
{
    const oldState = await chrome.action.getBadgeText({ tabId: tab.id });
    const newState = focusMode === oldState ? '' : focusMode;

    await chrome.action.setBadgeText(
    {
      tabId: tab.id,
      text: newState,
    });

    try
    {
      if (focusMode === newState)
      {
        await chrome.tabs.sendMessage(tab.id, { inject: true })
      } 
      else
      {
        await chrome.tabs.sendMessage(tab.id, { eject: true })
      }
    }
    catch (err)
    {
      void chrome.runtime.lastError;
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

