document.addEventListener('DOMContentLoaded', () => {
  const tabs = Array.from(document.querySelectorAll('.category-tab'));
  const panels = Array.from(document.querySelectorAll('.category-panel'));

  if (!tabs.length || !panels.length) {
    return;
  }

  const activateTab = panelId => {
    tabs.forEach(tab => {
      const isActive = tab.dataset.categoryTarget === panelId;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    panels.forEach(panel => {
      panel.classList.toggle('is-active', panel.id === panelId);
    });
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const panelId = tab.dataset.categoryTarget;
      activateTab(panelId);
      if (panelId) {
        window.history.replaceState(null, '', `#${panelId.replace('category-panel-', '')}`);
      }
    });
  });

  const initialHash = window.location.hash.replace('#', '');
  const initialPanel = initialHash ? `category-panel-${initialHash}` : tabs[0].dataset.categoryTarget;
  activateTab(initialPanel);
});
