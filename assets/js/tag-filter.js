document.addEventListener('DOMContentLoaded', () => {
  const buttons = Array.from(document.querySelectorAll('[data-tag-filter]'));
  const posts = Array.from(document.querySelectorAll('[data-tag-posts] .post-card'));
  const emptyState = document.querySelector('[data-tag-empty]');

  if (!buttons.length || !posts.length) {
    return;
  }

  const normalizeTags = value => value.split(',').map(tag => tag.trim()).filter(Boolean);

  const applyFilter = tag => {
    let visibleCount = 0;

    posts.forEach(post => {
      const postTags = normalizeTags(post.dataset.tags || '');
      const isVisible = tag === '*' || postTags.includes(tag);
      post.hidden = !isVisible;
      if (isVisible) {
        visibleCount += 1;
      }
    });

    buttons.forEach(button => {
      button.classList.toggle('is-active', button.dataset.tagFilter === tag);
    });

    if (emptyState) {
      emptyState.hidden = visibleCount > 0;
    }
  };

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const tag = button.dataset.tagFilter;
      applyFilter(tag);

      if (tag !== '*') {
        window.history.replaceState(null, '', `#${encodeURIComponent(tag)}`);
      } else {
        window.history.replaceState(null, '', window.location.pathname);
      }
    });
  });

  const initialTag = decodeURIComponent(window.location.hash.replace('#', ''));
  const initialButton = buttons.find(button => button.dataset.tagFilter === initialTag);
  applyFilter(initialButton ? initialButton.dataset.tagFilter : '*');
});
