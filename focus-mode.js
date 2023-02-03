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

  function mark(e)
  {
    if (window.top !== window || document.body !== e.target)
    {
      e.target.classList.add(marker)
    }
  }

  function unmark(e)
  {
    e.target.classList.remove(marker)
  }

  function hide(e)
  {
    ignore(e);

    if (window.top !== window || document.body !== e.target)
    {
      e.target.setAttribute("style", "display:none");
      e.target.setAttribute("class", hidden);

      if (document.body === e.target)
      {
        notifyFocusMode({ hideFrame: true })
      }
    }
  }

  function ignore(e)
  {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  function eject()
  {
    document.body.removeEventListener("mouseover", mark);
    document.body.removeEventListener("mouseout", unmark);
    document.body.removeEventListener("mousedown", hide, true);
    document.body.removeEventListener("click", ignore, true);
  }

  if (document.body)
  {
    document.body.addEventListener("mouseover", mark);
    document.body.addEventListener("mouseout", unmark);
    document.body.addEventListener("mousedown", hide, true);
    document.body.addEventListener("click", ignore, true);

    window.ejectFocusMode = eject;
  }
  else
  {
    log('This frame has no body and focus mode is useless.')
  }
}

function notifyFocusMode(obj)
{
  chrome.runtime.sendMessage(obj)
  .then( res => void chrome.runtime.lastError)
  .catch(err => void chrome.runtime.lastError);
}

