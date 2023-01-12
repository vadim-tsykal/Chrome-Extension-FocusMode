const activeMode = 'ON';

function injectFocusMode()
{
  function lightUp(e)
  {
    e.preventDefault();
    e.stopImmediatePropagation();

    e.target?.classList?.add('element-in-current-focus');
  }

  function lightOff(e)
  {
    e.preventDefault();
    e.stopImmediatePropagation();    

    e.target?.classList?.remove('element-in-current-focus');    
  }

  function hideMe(e)
  {
    e.preventDefault();
    e.stopImmediatePropagation();    

    e.target?.classList?.add('hide-element-in-focus-mode');
  }

  function eject()
  {
    document.body.removeEventListener("mouseover", lightUp);
    document.body.removeEventListener("mouseout", lightOff);
    document.body.removeEventListener("click", hideMe);    
  }

  document.body.addEventListener("mouseover", lightUp);
  document.body.addEventListener("mouseout", lightOff);
  document.body.addEventListener("click", hideMe);

  window.removeFocusModeListeners = eject;
}

function ejectFocusMode()
{
  if (window.removeFocusModeListeners)
  {
    window.removeFocusModeListeners();
    window.removeFocusModeListeners = null;
  }
}

chrome.action.onClicked.addListener(async (tab) => 
{
    const target = { tabId: tab.id, allFrames: true };
    const oldState = await chrome.action.getBadgeText({ tabId: tab.id });
    const newState = activeMode === oldState ? '' : activeMode;

    await chrome.action.setBadgeText(
    {
      tabId: tab.id,
      text: newState,
    });

    if (activeMode === newState)
    {
      await chrome.scripting.insertCSS(
      {
        files: ["focus-mode.css"],
        target
      });
      await chrome.scripting.executeScript(
      {
        func: injectFocusMode,
        target
      });
    } 
    else
    {
      await chrome.scripting.executeScript(
      {
        func: ejectFocusMode,
        target
      });
    }
});

/*
chrome.runtime.onInstalled.addListener(() => 
{
  chrome.action.setBadgeText(
  {
    text: "OFF",
  });
});
*/