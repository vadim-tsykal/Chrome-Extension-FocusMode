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

  let elementInFocus;

  function isRoot(target)
  {
    return (window.top === window
        && (document.body === target || document.documentElement === target) )
  }

  function mark(e)
  {
    elementInFocus = isRoot(e.target) ? null : e.target;
    elementInFocus?.classList.add(marker);
  }

  function unmark(e)
  {
    e.target.classList.remove(marker)
  }

  function hide(e)
  {
    ignore(e);

    if (!isRoot(e.target))
    {
      e.target.setAttribute("style", "display:none");
      e.target.setAttribute("class", hidden);

      if (document.body === e.target || document.documentElement === e.target)
      {
        notifyFocusMode({ hide: true })
      }
    }
  }

  function hideElementInFocus()
  {
    if (elementInFocus)
    {
      elementInFocus.setAttribute("style", "display:none");
      elementInFocus.setAttribute("class", hidden);
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
    document.removeEventListener("mouseover", mark);
    document.removeEventListener("mouseout", unmark);
    document.removeEventListener("mousedown", hide, true);
    document.removeEventListener("click", ignore, true);

    window.ejectFocusMode = null;
    window.hideElementInFocus = null;
  }

  document.addEventListener("mouseover", mark);
  document.addEventListener("mouseout", unmark);
  document.addEventListener("mousedown", hide, true);
  document.addEventListener("click", ignore, true);

  window.ejectFocusMode = eject;
  window.hideElementInFocus = hideElementInFocus;
}

function notifyFocusMode(obj)
{
  chrome.runtime.sendMessage(obj)
  .then( res => void chrome.runtime.lastError)
  .catch(err => void chrome.runtime.lastError);
}

