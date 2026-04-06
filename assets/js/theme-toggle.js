// 다크 모드 토글 기능
document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.querySelector('.theme-toggle');
  const body = document.body;
  
  // 로컬 스토리지에서 테마 설정 불러오기
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    if (themeToggle) {
      themeToggle.textContent = '☀️';
    }
  } else if (savedTheme === 'light') {
    body.classList.remove('dark-mode');
    if (themeToggle) {
      themeToggle.textContent = '🌙';
    }
  } else {
    // 시스템 설정 따르기
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      body.classList.add('dark-mode');
      if (themeToggle) {
        themeToggle.textContent = '☀️';
      }
    } else {
      if (themeToggle) {
        themeToggle.textContent = '🌙';
      }
    }
  }
  
  // 토글 버튼 클릭 이벤트
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      body.classList.toggle('dark-mode');
      
      if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        themeToggle.textContent = '☀️';
      } else {
        localStorage.setItem('theme', 'light');
        themeToggle.textContent = '🌙';
      }
    });
  }
});
