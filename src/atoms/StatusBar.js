// atoms/StatusBar.js — ステータスバー表示
let _timer = null;

export function setStatus(msg, autoClear = 0) {
  const el = document.getElementById('status');
  if (!el) return;
  el.textContent = msg;
  el.style.opacity = '1';
  if (_timer) clearTimeout(_timer);
  if (autoClear > 0) {
    _timer = setTimeout(() => { el.style.opacity = '0'; }, autoClear);
  }
}
