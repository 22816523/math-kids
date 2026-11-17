const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createPromptController,
  getPointerDragPosition,
} = require('../js/practice-support.js');

function createElementStub() {
  return {
    textContent: '',
    hidden: false,
    style: {},
    onclick: null,
  };
}

test('showPrompt auto-speaks and keeps replay text available', () => {
  const spoken = [];
  const questionBar = createElementStub();
  const questionIcon = createElementStub();
  const questionText = createElementStub();
  const speakerButton = createElementStub();

  const prompt = createPromptController({
    questionBar,
    questionIcon,
    questionText,
    speakerButton,
    speak: (text) => spoken.push(text),
  });

  prompt.showPrompt('🎯', '第1题：现在是几点？', {
    speechText: '现在是几点？',
    autoSpeak: true,
  });

  assert.equal(questionBar.style.display, 'flex');
  assert.equal(questionIcon.textContent, '🎯');
  assert.equal(questionText.textContent, '第1题：现在是几点？');
  assert.equal(speakerButton.hidden, false);
  assert.deepEqual(spoken, ['现在是几点？']);

  speakerButton.onclick();

  assert.deepEqual(spoken, ['现在是几点？', '现在是几点？']);
});

test('hidePrompt clears replay state', () => {
  const speakerButton = createElementStub();
  const prompt = createPromptController({
    questionBar: createElementStub(),
    questionIcon: createElementStub(),
    questionText: createElementStub(),
    speakerButton,
    speak: () => {},
  });

  prompt.showPrompt('🧩', '把数字拖到正确的位置吧', {
    autoSpeak: false,
  });
  assert.equal(speakerButton.hidden, false);

  prompt.hidePrompt();

  assert.equal(speakerButton.hidden, true);
  assert.equal(prompt.replayPrompt(), false);
});

test('getPointerDragPosition uses rendered size and viewport offsets', () => {
  const position = getPointerDragPosition({
    x: 240,
    y: 320,
    rect: { width: 67.2, height: 67.2 },
    viewportOffsetLeft: 12,
    viewportOffsetTop: 24,
  });

  assert.equal(position.left, 218.4);
  assert.equal(position.top, 310.4);
});
