'use strict';

const activeMode = 'ON';

chrome.action.onClicked.addListener(async (tab) => 
{
    const oldState = await chrome.action.getBadgeText({ tabId: tab.id });
    const newState = activeMode === oldState ? '' : activeMode;

    await chrome.action.setBadgeText(
    {
      tabId: tab.id,
      text: newState,
    });

    try
    {
      if (activeMode === newState)
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
    }).catch(err => chrome.runtime.lastError);
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

