(function () {
  const button = document.querySelector('[data-post-top]');

  if (!button) {
    return;
  }

  const toggleButton = () => {
    button.classList.toggle('is-visible', window.scrollY > 360);
  };

  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  toggleButton();
  window.addEventListener('scroll', toggleButton, { passive: true });
})();
