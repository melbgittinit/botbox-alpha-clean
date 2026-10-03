(() => {
  function freshness(timestamp, now = Date.now()) {
    const seconds = Number(timestamp);
    if (!timestamp || !Number.isFinite(seconds) || seconds <= 0) return 'empty';
    const age = now - seconds * 1000;
    if (age < 0) return 'empty';
    return age <= 86400000 ? 'current' : age <= 172800000 ? 'recent' : 'previous';
  }
  if (typeof module !== 'undefined') module.exports = { freshness };
  if (typeof document === 'undefined') return;
  function refresh() {
    const news = document.querySelector('[data-network-news]');
    if (!news) return;
    const state = freshness(news.dataset.publishedAt);
    const label = news.dataset[state + 'Label'];
    news.dataset.freshness = state;
    const status = news.querySelector('[data-news-status]');
    if (status) status.textContent = label;
    document.querySelectorAll('[data-network-masthead]').forEach(masthead => {
      masthead.dataset.newsFreshness = state;
      const labelNode = masthead.querySelector('.woc-live-orb__label');
      if (labelNode) labelNode.textContent = label;
    });
  }
  refresh();
  document.addEventListener('shopify:section:load', refresh);
  if (!window.wocNewsStatusTimer) window.wocNewsStatusTimer = setInterval(refresh, 60000);
})();
