(function () {
  if (window.self === window.top) return;
  document.documentElement.classList.add('candy-embedded');
  document.documentElement.style.setProperty('--candy-vh', window.innerHeight / 100 + 'px');
  var lastHeight = 0;
  function reportHeight() {
    var height = Math.ceil(Math.max(document.body.scrollHeight, document.body.getBoundingClientRect().height));
    if (height !== lastHeight) {
      lastHeight = height;
      window.parent.postMessage({ type: 'candy-embedded-height', height: height }, '*');
    }
  }
  window.addEventListener('load', reportHeight);
  window.addEventListener('resize', reportHeight);
  document.addEventListener('load', reportHeight, true);
  if ('ResizeObserver' in window) new ResizeObserver(reportHeight).observe(document.body);
  reportHeight();
})();
