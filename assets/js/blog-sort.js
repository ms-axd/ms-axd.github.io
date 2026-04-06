document.addEventListener('DOMContentLoaded', () => {
  const sortButtons = Array.from(document.querySelectorAll('[data-sort-order]'));
  const postsGrid = document.querySelector('[data-sortable-posts]');

  if (!sortButtons.length || !postsGrid) {
    return;
  }

  const getSortedCards = order => {
    const cards = Array.from(postsGrid.querySelectorAll('.post-card'));

    return cards.sort((left, right) => {
      const leftDate = Number(left.dataset.postDate || 0);
      const rightDate = Number(right.dataset.postDate || 0);

      if (order === 'oldest') {
        return leftDate - rightDate;
      }

      return rightDate - leftDate;
    });
  };

  const setActiveButton = activeOrder => {
    sortButtons.forEach(button => {
      const isActive = button.dataset.sortOrder === activeOrder;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const renderSortedCards = order => {
    const sortedCards = getSortedCards(order);
    sortedCards.forEach(card => postsGrid.appendChild(card));
    setActiveButton(order);
  };

  renderSortedCards('newest');

  sortButtons.forEach(button => {
    button.addEventListener('click', () => {
      renderSortedCards(button.dataset.sortOrder);
    });
  });
});
