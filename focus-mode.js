'use strict';

function injectFocusMode()
{
  function lightUp(e)
  {
    e.preventDefault();
    e.stopImmediatePropagation();

    e.target.classList.add('element-in-current-focus');
  }

  function lightOff(e)
  {
    e.preventDefault();
    e.stopImmediatePropagation();    

    e.target.classList.remove('element-in-current-focus');    
  }

  function hideMe(e)
  {
    e.preventDefault();
    e.stopImmediatePropagation();    

    e.target.classList.add('hide-element-in-focus-mode');
    e.target.style.display = "none";

    if (document.body === e.target)
    {
      chrome.runtime.sendMessage({ hideFrame: true })
      .then( obj => void chrome.runtime.lastError)
      .catch(err => void chrome.runtime.lastError);
    }
  }

  function eject()
  {
    document.body.removeEventListener("mouseover", lightUp);
    document.body.removeEventListener("mouseout", lightOff);
    document.body.removeEventListener("click", hideMe,true);    
  }

  document.body.addEventListener("mouseover", lightUp);
  document.body.addEventListener("mouseout", lightOff);
  document.body.addEventListener("click", hideMe,true);

  window.ejectFocusMode = eject;
}

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
    if (request.debugMode) notifyFocusMode(...arguments);
  }
})

function notifyFocusMode()
{
  chrome.runtime.sendMessage({ message: [...arguments] })
  .then( obj => void chrome.runtime.lastError)
  .catch(err => void chrome.runtime.lastError);
}

