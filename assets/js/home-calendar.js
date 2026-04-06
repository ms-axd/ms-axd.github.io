document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('mini-calendar-grid');
  const todayNumber = document.getElementById('calendar-today-number');
  const todayLabel = document.getElementById('calendar-today-label');
  const currentMonth = document.getElementById('calendar-current-month');
  const currentWeekday = document.getElementById('calendar-current-weekday');

  if (!grid || !todayNumber || !todayLabel || !currentMonth || !currentWeekday) {
    return;
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  const weekdayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

  todayNumber.textContent = String(day).padStart(2, '0');
  todayLabel.textContent = `${year}.${String(month + 1).padStart(2, '0')}.${String(day).padStart(2, '0')}`;
  currentMonth.textContent = `${year}년 ${month + 1}월`;
  currentWeekday.textContent = weekdayNames[now.getDay()];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const totalCells = 42;

  grid.innerHTML = '';

  for (let i = 0; i < totalCells; i += 1) {
    const cell = document.createElement('span');
    let value;

    if (i < firstDay) {
      value = prevMonthDays - firstDay + i + 1;
      cell.classList.add('is-outside');
    } else if (i >= firstDay + daysInMonth) {
      value = i - (firstDay + daysInMonth) + 1;
      cell.classList.add('is-outside');
    } else {
      value = i - firstDay + 1;
      if (value === day) {
        cell.classList.add('is-today');
      }
    }

    cell.textContent = value;
    grid.appendChild(cell);
  }
});
