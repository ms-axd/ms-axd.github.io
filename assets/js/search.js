let searchData = [];

function loadSearchData() {
  fetch('/search-data.json')
    .then(response => response.json())
    .then(data => {
      searchData = data;
    })
    .catch(error => console.log('Could not load search data:', error));
}

function performSearch(query) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const lowerQuery = query.toLowerCase();

  return searchData
    .filter(item => {
      const title = String(item.title || '').toLowerCase();
      const content = String(item.content || '').toLowerCase();
      const tags = Array.isArray(item.tags) ? item.tags : [];

      return title.includes(lowerQuery) ||
        content.includes(lowerQuery) ||
        tags.some(tag => String(tag).toLowerCase().includes(lowerQuery));
    })
    .slice(0, 10);
}

function displaySearchResults(results, container) {
  container.innerHTML = '';

  if (results.length === 0) {
    container.innerHTML = '<div class="search-result-empty">No results found.</div>';
    return;
  }

  results.forEach(result => {
    const resultItem = document.createElement('div');
    resultItem.className = 'search-result-item';
    resultItem.innerHTML = `
      <a href="${result.url}">
        <strong>${result.title}</strong>
        <small>${new Date(result.date).toLocaleDateString('ko-KR')}</small>
      </a>
    `;
    container.appendChild(resultItem);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadSearchData();

  document.querySelectorAll('.search-box').forEach(box => {
    const input = box.querySelector('input');
    const searchResults = box.querySelector('.search-results');

    if (!input || !searchResults) {
      return;
    }

    input.addEventListener('input', () => {
      const results = performSearch(input.value);
      displaySearchResults(results, searchResults);
      searchResults.style.display = input.value.length === 0 ? 'none' : 'block';
    });
  });

  document.addEventListener('click', event => {
    if (!event.target.closest('.search-box')) {
      document.querySelectorAll('.search-results').forEach(result => {
        result.style.display = 'none';
      });
    }
  });
});
