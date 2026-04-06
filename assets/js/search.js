// 검색 기능
let searchData = [];

function loadSearchData() {
  fetch('/search-data.json')
    .then(response => response.json())
    .then(data => {
      searchData = data;
    })
    .catch(error => console.log('검색 데이터를 로드할 수 없습니다:', error));
}

function performSearch(query) {
  if (!query || query.length === 0) {
    return [];
  }

  const lowerQuery = query.toLowerCase();
  const results = [];

  searchData.forEach(item => {
    if (
      item.title.toLowerCase().includes(lowerQuery) ||
      item.content.toLowerCase().includes(lowerQuery) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    ) {
      results.push(item);
    }
  });

  return results.slice(0, 10); // 최대 10개 결과 반환
}

function displaySearchResults(results, container) {
  container.innerHTML = '';

  if (results.length === 0) {
    container.innerHTML = '<div style="padding: 1rem; text-align: center; color: #999;">검색 결과가 없습니다.</div>';
    return;
  }

  results.forEach(result => {
    const resultItem = document.createElement('div');
    resultItem.className = 'search-result-item';
    resultItem.innerHTML = `
      <a href="${result.url}" style="text-decoration: none; color: inherit;">
        <strong>${result.title}</strong>
        <br>
        <small style="color: #999;">${new Date(result.date).toLocaleDateString('ko-KR')}</small>
      </a>
    `;
    container.appendChild(resultItem);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const searchBox = document.querySelector('.search-box input');
  const searchResults = document.querySelector('.search-results');

  loadSearchData();

  if (searchBox && searchResults) {
    searchBox.addEventListener('input', function() {
      const results = performSearch(this.value);
      displaySearchResults(results, searchResults);

      if (this.value.length === 0) {
        searchResults.style.display = 'none';
      } else {
        searchResults.style.display = 'block';
      }
    });

    // 외부 클릭 시 검색 결과 숨기기
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.search-box')) {
        searchResults.style.display = 'none';
      }
    });
  }
});
