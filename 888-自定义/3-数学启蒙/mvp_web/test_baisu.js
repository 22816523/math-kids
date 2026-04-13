const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('baisu.html', 'utf8');
const js = fs.readFileSync('js/baisu-board.js', 'utf8');

const dom = new JSDOM(html, { runScripts: 'dangerously' });
const window = dom.window;

// setup globals
window.PracticeSupport = {
  createPromptController: () => ({ showPrompt:()=>{}, hidePrompt:()=>{} }),
  setupTimer: () => {}
};
window.speechSynthesis = { speak:()=>{}, cancel:()=>{} };
window.SpeechSynthesisUtterance = class {};

window.onerror = function(msg, url, line, col, error) {
  console.log('UNCAUGHT ERROR:', msg, 'at line', line);
};

try {
  // execute script
  const scriptEl = window.document.createElement('script');
  scriptEl.textContent = js;
  window.document.body.appendChild(scriptEl);

  // trigger boot
  const event = window.document.createEvent('Event');
  event.initEvent('DOMContentLoaded', true, true);
  window.document.dispatchEvent(event);

  // wait briefly for async
  setTimeout(() => {
    console.log('boardGrid length:', window.document.getElementById('boardGrid').innerHTML.length);
    console.log('boardWrapper display:', window.document.getElementById('boardWrapper').style.display);
    console.log('orderQuiz display:', window.document.getElementById('orderQuiz').style.display);
  }, 100);

} catch (e) {
  console.log('Caught exception:', e.stack);
}
