'use strict';

const focusMode = 'ON';
const debugMode = true;

chrome.action.onClicked.addListener(async (tab) => 
{
  try
  {
    const oldState = await chrome.action.getBadgeText({ tabId: tab.id });
    const newState = focusMode === oldState ? '' : focusMode;

    await chrome.action.setBadgeText(
    {
      tabId: tab.id,
      text: newState,
    });

    log(`Focus mode is ${newState || 'OFF'}`)

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
  }

  void chrome.runtime.lastError;

  function log()
  {
    self.log("tabId", tab.id, tab.title?.slice(0,50), ...arguments);
  }
});

chrome.runtime.onMessage.addListener((request, sender) => 
{
  if (request.message)
  {
    log(...request.message)
  }

  if (request.hide)
  {
    chrome.scripting.executeScript(
    {
      func: () => {if (window.hideInFocusMode) hideInFocusMode()},
      target: { tabId: sender.tab.id }
    })
    .then( res => ignore() )
    .catch(err => ignore(err) );
  }
  
  function ignore(err)
  {
    if (err) log(err);
    void chrome.runtime.lastError;
  }

  function log()
  {
    self.log("tabId", sender.tab.id, "frameId", sender.frameId, sender.tab.title?.slice(0,50), ...arguments)
  }
});

function log()
{
  if (debugMode) console.log(...arguments)
}
