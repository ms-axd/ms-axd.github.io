document.addEventListener('DOMContentLoaded', () => {
  const buttons = Array.from(document.querySelectorAll('[data-tag-filter]'));
  const posts = Array.from(document.querySelectorAll('[data-tag-posts] .post-card'));
  const emptyState = document.querySelector('[data-tag-empty]');
  const tagJumps = Array.from(document.querySelectorAll('[data-tag-jump]'));

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

    tagJumps.forEach(link => {
      link.classList.toggle('is-active', link.dataset.tagJump === tag);
    });

    if (emptyState) {
      emptyState.hidden = visibleCount > 0;
    }
  };

  const applyHashFilter = () => {
    const hashTag = decodeURIComponent(window.location.hash.replace('#', ''));
    const hasMatchingTag = buttons.some(button => button.dataset.tagFilter === hashTag) ||
      tagJumps.some(link => link.dataset.tagJump === hashTag);
    applyFilter(hasMatchingTag ? hashTag : '*');
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

  tagJumps.forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const tag = link.dataset.tagJump;
      applyFilter(tag);
      window.history.replaceState(null, '', `#${encodeURIComponent(tag)}`);
    });
  });

  window.addEventListener('hashchange', applyHashFilter);
  applyHashFilter();
});
