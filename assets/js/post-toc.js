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

  let ticking = false;

  const updateActiveHeading = () => {
    const marker = Math.min(window.innerHeight * 0.32, 220);
    let activeHeading = headings[0];

    headings.forEach((heading) => {
      if (heading.getBoundingClientRect().top <= marker) {
        activeHeading = heading;
      }
    });

    setActive(activeHeading.id);
    ticking = false;
  };

  const requestActiveUpdate = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateActiveHeading);
    }
  };

  window.addEventListener('scroll', requestActiveUpdate, { passive: true });
  window.addEventListener('resize', requestActiveUpdate);
  updateActiveHeading();
})();
