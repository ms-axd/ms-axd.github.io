(function () {
  const content = document.querySelector('article .post-content');

  if (!content) {
    return;
  }

  const headings = Array.from(content.querySelectorAll('h2, h3'));

  if (headings.length < 2) {
    return;
  }

  const usedIds = new Set();

  const getHeadingId = (heading, index) => {
    if (heading.id) {
      usedIds.add(heading.id);
      return heading.id;
    }

    const base = heading.textContent
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || `section-${index + 1}`;

    let id = base;
    let count = 2;

    while (usedIds.has(id)) {
      id = `${base}-${count}`;
      count += 1;
    }

    usedIds.add(id);
    heading.id = id;
    return id;
  };

  const map = document.createElement('nav');
  map.className = 'heading-map';
  map.setAttribute('aria-label', 'Post headings');

  const list = document.createElement('ol');
  map.appendChild(list);

  const items = headings.map((heading, index) => {
    const id = getHeadingId(heading, index);
    const item = document.createElement('li');
    const link = document.createElement('a');
    const label = heading.textContent.trim();

    link.href = `#${encodeURIComponent(id)}`;
    link.className = `heading-map__link heading-map__link--${heading.tagName.toLowerCase()}`;
    link.setAttribute('aria-label', label);
    link.title = label;

    link.addEventListener('click', (event) => {
      event.preventDefault();
      document.getElementById(id).scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      history.replaceState(null, '', `#${encodeURIComponent(id)}`);
    });

    item.appendChild(link);
    list.appendChild(item);

    return { heading, link };
  });

  document.body.appendChild(map);

  const setActive = (activeHeading) => {
    items.forEach(({ heading, link }) => {
      link.classList.toggle('is-active', heading === activeHeading);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);

    if (visible[0]) {
      setActive(visible[0].target);
    }
  }, {
    rootMargin: '-18% 0px -68% 0px',
    threshold: 0
  });

  headings.forEach((heading) => observer.observe(heading));
  setActive(headings[0]);
})();
