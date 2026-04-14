(function () {
  const toc = document.querySelector('[data-post-toc]');
  const listHost = toc?.querySelector('[data-post-toc-list]');
  const content = document.querySelector('.post-content');

  if (!toc || !listHost || !content) {
    return;
  }

  const headings = Array.from(content.querySelectorAll('h2, h3, h4'));
  if (!headings.length) {
    toc.remove();
    return;
  }

  const slugCounts = new Map();
  const slugify = (text) => {
    const base = text
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9°¡-ÆR\s-]/g, '')
      .replace(/\s+/g, '-');
    const count = slugCounts.get(base) || 0;
    slugCounts.set(base, count + 1);
    return count ? `${base}-${count}` : base;
  };

  const list = document.createElement('ol');
  list.className = 'post-toc__items';
  const linkRefs = new Map();

  headings.forEach((heading) => {
    if (!heading.id) {
      heading.id = slugify(heading.textContent || 'section');
    }
    const depth = Number(heading.tagName.replace('H', ''));
    const item = document.createElement('li');
    item.dataset.depth = depth.toString();

    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent || heading.id;
    item.appendChild(link);

    list.appendChild(item);
    linkRefs.set(heading.id, link);
  });

  listHost.appendChild(list);
  toc.hidden = false;

  const updateActive = (activeId) => {
    linkRefs.forEach((link, id) => {
      link.classList.toggle('is-active', id === activeId);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.target.offsetTop - b.target.offsetTop);
      if (visible[0]) {
        updateActive(visible[0].target.id);
      }
    },
    {
      rootMargin: '-20% 0px -65% 0px',
      threshold: [0, 1]
    }
  );

  headings.forEach((heading) => observer.observe(heading));

  // Highlight the first heading by default in case IntersectionObserver hasn't fired yet.
  updateActive(headings[0].id);
})();
