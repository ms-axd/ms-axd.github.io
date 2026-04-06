document.addEventListener('DOMContentLoaded', () => {
  const sortSelect = document.querySelector('#post-sort');
  const postsGrid = document.querySelector('[data-sortable-posts]');

  if (!sortSelect || !postsGrid) {
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

  const renderSortedCards = order => {
    const sortedCards = getSortedCards(order);
    sortedCards.forEach(card => postsGrid.appendChild(card));
  };

  renderSortedCards(sortSelect.value);

  sortSelect.addEventListener('change', event => {
    renderSortedCards(event.target.value);
  });
});
