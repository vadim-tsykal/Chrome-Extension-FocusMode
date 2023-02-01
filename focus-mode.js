'use strict';

chrome.runtime.onMessage.addListener( request => 
{
  const frame = window.top === window ? "main window" : "frame window";

  if (request.inject)
  {
    log(`Inject request received in ${frame}`);
    injectFocusMode(log);
  }
  else if (request.eject && window.ejectFocusMode) 
  {
    log(`Eject request received in ${frame}`);
    ejectFocusMode();
  }

  function log()
  {
    if (request.debugMode) notifyFocusMode({ message: [...arguments] });
  }
})

function injectFocusMode(log)
{
  const marker = 'focus-mode-spot';
  const hidden = 'focus-mode-hide';

  function lightOn(e)
  {
    e.target.classList.add(marker);
  }

  function lightOff(e)
  {
    e.target.classList.remove(marker);    
  }

  function hideMe(e)
  {
    ignoreMe(e);

    e.target.setAttribute("style", "display:none");
    e.target.setAttribute("class", hidden);

    if (document.body === e.target)
    {
      notifyFocusMode({ hideFrame: true })
    }
  }

  function ignoreMe(e)
  {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  function eject()
  {
    document.body.removeEventListener("mouseover", lightOn);
    document.body.removeEventListener("mouseout", lightOff);
    document.body.removeEventListener("mousedown", hideMe, true);
    document.body.removeEventListener("click", ignoreMe, true);
  }

  document.body.addEventListener("mouseover", lightOn);
  document.body.addEventListener("mouseout", lightOff);
  document.body.addEventListener("mousedown", hideMe, true);
  document.body.addEventListener("click", ignoreMe, true);

  window.ejectFocusMode = eject;
}

function notifyFocusMode(obj)
{
  chrome.runtime.sendMessage(obj)
  .then( res => void chrome.runtime.lastError)
  .catch(err => void chrome.runtime.lastError);
}

