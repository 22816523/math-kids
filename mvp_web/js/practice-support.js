;(function (root, factory) {
  const api = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }

  root.PracticeSupport = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
  'use strict';

  function syncReplayButton(button, visible) {
    if (!button) return;
    button.hidden = !visible;
    button.style.display = visible ? '' : 'none';
  }

  function createPromptController(config) {
    const {
      questionBar,
      questionIcon,
      questionText,
      speakerButton,
      speak,
    } = config;

    let currentSpeech = '';
    let playingTimer = null;

    function triggerPlaybackState(text) {
      if (!speakerButton || !speakerButton.classList) return;
      if (playingTimer) clearTimeout(playingTimer);
      speakerButton.classList.add('is-playing');
      const duration = Math.max(1600, (text || '').length * 280);
      playingTimer = setTimeout(() => {
        if (speakerButton && speakerButton.classList) {
          speakerButton.classList.remove('is-playing');
        }
        playingTimer = null;
      }, duration);
    }

    function clearPlaybackState() {
      if (playingTimer) clearTimeout(playingTimer);
      if (speakerButton && speakerButton.classList) {
        speakerButton.classList.remove('is-playing');
      }
      playingTimer = null;
    }

    function replayPrompt() {
      if (!currentSpeech) return false;
      triggerPlaybackState(currentSpeech);
      speak(currentSpeech);
      return true;
    }

    function showPrompt(icon, text, options) {
      const settings = options || {};
      const speechText = settings.speechText ?? text ?? '';
      const autoSpeak = settings.autoSpeak !== false;
      const allowReplay = settings.allowReplay !== false && Boolean(speechText);

      if (questionBar) questionBar.style.display = 'flex';
      if (questionIcon) questionIcon.textContent = icon || '';
      if (questionText) questionText.textContent = text || '';

      currentSpeech = speechText;
      syncReplayButton(speakerButton, allowReplay);

      if (autoSpeak && speechText) {
        triggerPlaybackState(speechText);
        speak(speechText);
      }
    }

    function hidePrompt() {
      if (questionBar) questionBar.style.display = 'none';
      currentSpeech = '';
      clearPlaybackState();
      syncReplayButton(speakerButton, false);
    }

    if (speakerButton) {
      speakerButton.onclick = replayPrompt;
      syncReplayButton(speakerButton, false);
    }

    return {
      hidePrompt,
      replayPrompt,
      showPrompt,
    };
  }

  function getPointerDragPosition(config) {
    const viewportOffsetLeft = config.viewportOffsetLeft || 0;
    const viewportOffsetTop = config.viewportOffsetTop || 0;

    return {
      left: config.x + viewportOffsetLeft - config.rect.width / 2,
      top: config.y + viewportOffsetTop - config.rect.height / 2,
    };
  }

  return {
    createPromptController,
    getPointerDragPosition,
  };
});
