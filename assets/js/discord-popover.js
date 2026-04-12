document.addEventListener('DOMContentLoaded', () => {
  const buttons = Array.from(document.querySelectorAll('[data-discord-popover]'));

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(other => {
        if (other !== button) {
          other.classList.remove('is-open');
        }
      });

      button.classList.toggle('is-open');
    });
  });

  document.addEventListener('click', event => {
    if (!event.target.closest('[data-discord-popover]')) {
      buttons.forEach(button => button.classList.remove('is-open'));
    }
  });
});
