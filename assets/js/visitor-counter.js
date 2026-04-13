document.addEventListener('DOMContentLoaded', () => {
  const totalElement = document.querySelector('[data-visitor-total]');
  const todayElement = document.querySelector('[data-visitor-today]');
  const yesterdayElement = document.querySelector('[data-visitor-yesterday]');

  if (!totalElement || !todayElement || !yesterdayElement) {
    return;
  }

  const namespace = 'ms-axd-github-io';
  const endpoint = 'https://api.countapi.xyz';
  const countedKey = 'ms-axd-visitor-counted-date';
  const dateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const formatDate = date => {
    const parts = dateFormatter.formatToParts(date).reduce((result, part) => {
      result[part.type] = part.value;
      return result;
    }, {});

    return `${parts.year}-${parts.month}-${parts.day}`;
  };
  const formatNumber = value => Number(value || 0).toLocaleString('en-US').replace(/,/g, ' ');
  const today = formatDate(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = formatDate(yesterdayDate);

  const setValue = (element, value) => {
    if (Number.isFinite(Number(value))) {
      element.textContent = formatNumber(value);
    }
  };

  const requestCount = async (action, key) => {
    const response = await fetch(`${endpoint}/${action}/${namespace}/${key}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Visitor counter request failed');
    }

    return response.json();
  };

  const getCount = async key => {
    try {
      const data = await requestCount('get', key);
      return data.value;
    } catch (error) {
      return 0;
    }
  };

  const getCountedDate = () => {
    try {
      return localStorage.getItem(countedKey);
    } catch (error) {
      return null;
    }
  };

  const setCountedDate = () => {
    try {
      localStorage.setItem(countedKey, today);
    } catch (error) {
      return null;
    }
  };

  const updateCounts = async () => {
    const hasCountedToday = getCountedDate() === today;

    if (!hasCountedToday) {
      const [totalData, todayData] = await Promise.all([
        requestCount('hit', 'total'),
        requestCount('hit', `day-${today}`),
      ]);

      setCountedDate();
      setValue(totalElement, totalData.value);
      setValue(todayElement, todayData.value);
    } else {
      const [totalValue, todayValue] = await Promise.all([
        getCount('total'),
        getCount(`day-${today}`),
      ]);

      setValue(totalElement, totalValue);
      setValue(todayElement, todayValue);
    }

    const yesterdayValue = await getCount(`day-${yesterday}`);
    setValue(yesterdayElement, yesterdayValue);
  };

  updateCounts().catch(() => {
    totalElement.textContent = '--';
    todayElement.textContent = '--';
    yesterdayElement.textContent = '--';
  });
});
