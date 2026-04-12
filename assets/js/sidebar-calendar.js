document.addEventListener('DOMContentLoaded', () => {
  const calendar = document.querySelector('[data-calendar]');

  if (!calendar) {
    return;
  }

  const title = calendar.querySelector('[data-calendar-title]');
  const grid = calendar.querySelector('[data-calendar-grid]');
  const prevButton = calendar.querySelector('[data-calendar-prev]');
  const nextButton = calendar.querySelector('[data-calendar-next]');
  const postDates = new Set((calendar.dataset.postDates || '').split(',').filter(Boolean));
  const today = new Date();
  let visibleDate = new Date(today.getFullYear(), today.getMonth(), 1);

  const toKey = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const render = () => {
    const year = visibleDate.getFullYear();
    const month = visibleDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPreviousMonth = new Date(year, month, 0).getDate();

    title.textContent = visibleDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    grid.innerHTML = '';

    for (let index = 0; index < 42; index += 1) {
      const cell = document.createElement('span');
      let dayNumber;
      let cellDate;

      if (index < startOffset) {
        dayNumber = daysInPreviousMonth - startOffset + index + 1;
        cellDate = new Date(year, month - 1, dayNumber);
        cell.classList.add('is-outside');
      } else if (index >= startOffset + daysInMonth) {
        dayNumber = index - startOffset - daysInMonth + 1;
        cellDate = new Date(year, month + 1, dayNumber);
        cell.classList.add('is-outside');
      } else {
        dayNumber = index - startOffset + 1;
        cellDate = new Date(year, month, dayNumber);
      }

      const key = toKey(cellDate);
      cell.textContent = dayNumber;
      cell.dataset.date = key;

      if (key === toKey(today)) {
        cell.classList.add('is-today');
      }

      if (postDates.has(key)) {
        cell.classList.add('has-post');
      }

      grid.appendChild(cell);
    }
  };

  prevButton.addEventListener('click', () => {
    visibleDate = new Date(visibleDate.getFullYear(), visibleDate.getMonth() - 1, 1);
    render();
  });

  nextButton.addEventListener('click', () => {
    visibleDate = new Date(visibleDate.getFullYear(), visibleDate.getMonth() + 1, 1);
    render();
  });

  render();
});
