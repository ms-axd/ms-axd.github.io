// Reading progress gauge: fills as the reader scrolls through the post content.
(function () {
  var bar = document.querySelector('[data-read-progress]');
  var content = document.querySelector('.post-content');
  if (!bar || !content) return;

  var ticking = false;

  function update() {
    ticking = false;
    var top = content.getBoundingClientRect().top + window.scrollY;
    var height = content.offsetHeight;
    if (height <= 0) { bar.style.width = '0%'; return; }
    // how far the viewport bottom has travelled through the content
    var seen = window.scrollY + window.innerHeight - top;
    var ratio = seen / height;
    if (ratio < 0) ratio = 0;
    if (ratio > 1) ratio = 1;
    bar.style.width = (ratio * 100).toFixed(1) + '%';
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
})();
