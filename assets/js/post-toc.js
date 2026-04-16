(function () {
  const toc = document.querySelector('[data-post-toc]');
  const tocList = document.querySelector('[data-post-toc-list]');
  const postContent = document.querySelector('.post-content');

  if (!toc || !tocList || !postContent) {
    return;
  }

  const headings = Array.from(postContent.querySelectorAll('h2, h3')).filter((heading) => {
    return heading.textContent.trim().length > 0;
  });

  if (headings.length < 2) {
    return;
  }

  const slugCounts = new Map();

  headings.forEach((heading) => {
    if (!heading.id) {
      const baseSlug = heading.textContent
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9_-]/g, '')
        .replace(/^-+|-+$/g, '') || 'section';
      const count = slugCounts.get(baseSlug) || 0;
      slugCounts.set(baseSlug, count + 1);
      heading.id = count ? `${baseSlug}-${count + 1}` : baseSlug;
    }

    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent.trim();
    link.className = `post-toc__link post-toc__link--${heading.tagName.toLowerCase()}`;
    tocList.appendChild(link);
  });

  toc.hidden = false;

  const links = Array.from(tocList.querySelectorAll('a'));
  const setActive = (id) => {
    links.forEach((link) => {
      link.classList.toggle('is-active', link.hash === `#${id}`);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);

    if (visible[0]) {
      setActive(visible[0].target.id);
    }
  }, {
    rootMargin: '-18% 0px -68% 0px',
    threshold: 0.1
  });

  headings.forEach((heading) => observer.observe(heading));
  setActive(headings[0].id);
})();
