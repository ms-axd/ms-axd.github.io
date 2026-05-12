document.addEventListener('DOMContentLoaded', () => {
  const sortButton = document.querySelector('[data-sort-order]');
  const postsGrid = document.querySelector('[data-sortable-posts]');

  if (!sortButton || !postsGrid) {
    return;
  }

  let currentOrder = sortButton.dataset.sortOrder || 'newest';

  const getSortedCards = order => {
    const cards = Array.from(postsGrid.querySelectorAll('.post-card'));

    return cards.sort((left, right) => {
      const leftDate = Number(left.dataset.postDate || 0);
      const rightDate = Number(right.dataset.postDate || 0);
      const leftPostOrder = Number(left.dataset.postOrder || 0);
      const rightPostOrder = Number(right.dataset.postOrder || 0);

      if (leftDate !== rightDate) {
        return order === 'oldest' ? leftDate - rightDate : rightDate - leftDate;
      }

      return order === 'oldest'
        ? leftPostOrder - rightPostOrder
        : rightPostOrder - leftPostOrder;
    });
  };

  const updateButtonState = order => {
    const isNewest = order === 'newest';
    sortButton.dataset.sortOrder = order;
    sortButton.classList.toggle('is-active', isNewest);
    sortButton.setAttribute('aria-pressed', isNewest ? 'true' : 'false');
    sortButton.setAttribute('title', isNewest ? 'Newest first. Click for oldest first.' : 'Oldest first. Click for newest first.');
    sortButton.textContent = isNewest ? 'N' : 'O';
  };

  const renderSortedCards = order => {
    getSortedCards(order).forEach(card => postsGrid.appendChild(card));
    currentOrder = order;
    updateButtonState(order);
  };

  renderSortedCards(currentOrder);

  sortButton.addEventListener('click', () => {
    const nextOrder = currentOrder === 'newest' ? 'oldest' : 'newest';
    renderSortedCards(nextOrder);
  });
});
