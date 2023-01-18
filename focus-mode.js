'use strict';

chrome.runtime.onMessage.addListener( request => 
{
  const frame = window.top === window ? "main window" : "frame window";

  if (request.inject)
  {
    log(`Inject request received in ${frame}`);
    injectFocusMode();
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

function injectFocusMode()
{
  const marker = 'focus-mode-spot';
  const hidden = 'focus-mode-hide';

  function lightOn(e)
  {
    e.preventDefault();
    e.stopImmediatePropagation();

    e.target.classList.add(marker);
  }

  function lightOff(e)
  {
    e.preventDefault();
    e.stopImmediatePropagation();

    e.target.classList.remove(marker);    
  }

  function hideMe(e)
  {
    e.preventDefault();
    e.stopImmediatePropagation();    

    e.target.setAttribute("style", "display:none");
    e.target.setAttribute("class", hidden);

    if (document.body === e.target)
    {
      notifyFocusMode({ hideFrame: true })
    }
  }

  function eject()
  {
    document.body.removeEventListener("mouseover", lightOn);
    document.body.removeEventListener("mouseout", lightOff);
    document.body.removeEventListener("click", hideMe,true);
  }

  document.body.addEventListener("mouseover", lightOn);
  document.body.addEventListener("mouseout", lightOff);
  document.body.addEventListener("click", hideMe,true);

  window.ejectFocusMode = eject;
}

function notifyFocusMode(obj)
{
  chrome.runtime.sendMessage(obj)
  .then( res => void chrome.runtime.lastError)
  .catch(err => void chrome.runtime.lastError);
}

