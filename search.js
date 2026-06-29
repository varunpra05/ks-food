/**
 * search.js — Kumar Snacks Search Page
 * Handles: URL query, live suggestions, filtering (category, price, offers, rating),
 * sorting, product card rendering, and cart integration.
 */
'use strict';

/* ── CONSTANTS ── */
const POPULAR_SEARCHES = [
  'Vadapav', 'Cheese Vadapav', 'Masala Vadapav',
  'Jain Vadapav', 'Peri Peri Vadapav', 'Double Tikki Vadapav',
  'Combo Offers', 'Burger', 'Pizza', 'Fries'
];

const CAT_EMOJIS = {
  pizza: '🍕', burger: '🍔', sandwich: '🥪',
  fries: '🍟', dabeli: '🌮', vada: '🍞',
  combo: '🎉', beverage: '🥤', 'garlic bread': '🥖',
  all: '🍽️'
};

const MAX_PRICE = 500;

/* ── STATE ── */
let _allProducts    = [];
let _searchQuery    = '';
let _activeCategory = 'all';
let _priceMin       = 0;
let _priceMax       = MAX_PRICE;
let _filterRating   = 0;
let _filterOff20    = false;
let _filterCombo    = false;
let _filterVeg      = false;
let _sortMode       = 'relevance';
let _wishlist       = JSON.parse(localStorage.getItem('ks_wishlist') || '[]');

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  _allProducts = window.KS_DB ? window.KS_DB.getAll() : [];

  // Read URL query param
  const params = new URLSearchParams(window.location.search);
  _searchQuery = (params.get('q') || '').trim();

  // Pre-fill the search input
  const inputEl = document.getElementById('search-input');
  if (inputEl && _searchQuery) {
    inputEl.value = _searchQuery;
    document.getElementById('search-clear-btn').style.display = '';
  }

  // Build UI
  _buildPopularSearches();
  _buildCategoryFilters();
  _buildCategoryTabs();
  _updateOfferCounts();
  _updateRatingCounts();
  applyFilters();

  // Search input live updates
  inputEl?.addEventListener('input', _onSearchInput);
  inputEl?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      _searchQuery = inputEl.value.trim();
      const clearBtn = document.getElementById('search-clear-btn');
      clearBtn.style.display = _searchQuery ? '' : 'none';
      hideSuggestions();
      applyFilters();
      _updateURL();
    }
    if (e.key === 'Escape') hideSuggestions();
  });

  document.getElementById('search-clear-btn')?.addEventListener('click', () => {
    inputEl.value = '';
    _searchQuery = '';
    document.getElementById('search-clear-btn').style.display = 'none';
    hideSuggestions();
    applyFilters();
    _updateURL();
    inputEl.focus();
  });

  // Close suggestions on outside click
  document.addEventListener('click', (e) => {
    if (!document.getElementById('search-bar-wrap')?.contains(e.target)) hideSuggestions();
  });

  // Scroll
  window.addEventListener('scroll', () => {
    document.getElementById('header')?.classList.toggle('scrolled', window.scrollY > 30);
    document.getElementById('scroll-top-btn')?.classList.toggle('visible', window.scrollY > 400);
  });
  document.getElementById('scroll-top-btn')?.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );

  // Sort select
  document.getElementById('sort-select')?.addEventListener('change', (e) => {
    _sortMode = e.target.value;
    applyFilters();
  });

  // Countdown
  _startCountdown();
});

/* ── SEARCH INPUT ── */
function _onSearchInput(e) {
  const val = e.target.value.trim();
  const clearBtn = document.getElementById('search-clear-btn');
  clearBtn.style.display = val ? '' : 'none';
  _showSuggestions(val);
}

function _showSuggestions(query) {
  const box = document.getElementById('search-suggestions');
  if (!box) return;

  if (!query) { hideSuggestions(); return; }

  const q = query.toLowerCase();
  const matches = _allProducts
    .filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    .slice(0, 6);

  const popular = POPULAR_SEARCHES.filter(s => s.toLowerCase().includes(q)).slice(0, 4);

  if (matches.length === 0 && popular.length === 0) { hideSuggestions(); return; }

  let html = '';
  matches.forEach(p => {
    const bold = p.name.replace(new RegExp(`(${_escapeRegex(query)})`, 'gi'), '<strong>$1</strong>');
    html += `<div class="suggestion-item" onclick="selectSuggestion('${_esc(p.name)}')">
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <span>${bold}</span>
    </div>`;
  });
  popular.forEach(s => {
    if (!matches.find(p => p.name.toLowerCase() === s.toLowerCase())) {
      html += `<div class="suggestion-item" onclick="selectSuggestion('${_esc(s)}')">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
        <span>${s}</span>
      </div>`;
    }
  });

  box.innerHTML = html;
  box.classList.add('active');
}

function hideSuggestions() {
  document.getElementById('search-suggestions')?.classList.remove('active');
}

function selectSuggestion(name) {
  _searchQuery = name;
  const inputEl = document.getElementById('search-input');
  if (inputEl) inputEl.value = name;
  document.getElementById('search-clear-btn').style.display = '';
  hideSuggestions();
  applyFilters();
  _updateURL();
}

/* ── CATEGORY TABS ── */
function _buildCategoryTabs() {
  const products = _getBaseFiltered();
  const counts = _getCategoryCounts(products);
  const totalCount = products.length;

  const tabsEl = document.getElementById('category-tabs');
  if (!tabsEl) return;

  const allCategories = [...new Set(_allProducts.map(p => p.category))];

  const catImages = {
    all: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=60',
    pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&auto=format&fit=crop&q=60',
    burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&auto=format&fit=crop&q=60',
    sandwich: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=100&auto=format&fit=crop&q=60',
    dabeli: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=100&auto=format&fit=crop&q=60',
    vadapav: 'assets/vada_pav_real.jpg',
    garlicbread: 'assets/garlic_bread_real.jpg',
    fries: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=100&auto=format&fit=crop&q=60',
    drinks: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=100&auto=format&fit=crop&q=60'
  };

  let html = `<div class="cat-tab ${_activeCategory === 'all' ? 'active' : ''}" onclick="setCategoryTab('all')">
    <span class="cat-tab__emoji"><img src="${catImages.all}" alt="All"/></span>
    <div>
      <div>All Snacks</div>
      <div class="cat-tab__count">${totalCount} Items</div>
    </div>
  </div>`;

  allCategories.forEach(cat => {
    const cnt = counts[cat] || 0;
    if (cnt === 0) return;
    const imgUrl = catImages[cat] || catImages.all;
    const label = _capitalize(cat);
    html += `<div class="cat-tab ${_activeCategory === cat ? 'active' : ''}" onclick="setCategoryTab('${cat}')">
      <span class="cat-tab__emoji"><img src="${imgUrl}" alt="${label}"/></span>
      <div>
        <div>${label}</div>
        <div class="cat-tab__count">${cnt} Items</div>
      </div>
    </div>`;
  });

  tabsEl.innerHTML = html;
}

function setCategoryTab(cat) {
  _activeCategory = cat;

  // Update all checkbox in sidebar to match
  document.querySelectorAll('#filter-categories input[type="checkbox"]').forEach(cb => {
    cb.checked = (cb.value === cat || (cat === 'all' && cb.value === 'all'));
  });

  _buildCategoryTabs();
  applyFilters();
}

/* ── SIDEBAR CATEGORY CHECKBOXES ── */
function _buildCategoryFilters() {
  const allCategories = [...new Set(_allProducts.map(p => p.category))];
  const el = document.getElementById('filter-categories');
  if (!el) return;

  const totalCount = _allProducts.length;

  let html = `<div class="filter-check-item">
    <label>
      <input type="checkbox" id="cat-all" value="all" ${_activeCategory === 'all' ? 'checked' : ''} onchange="onCategoryCheck('all')"/>
      All Snacks
    </label>
    <span class="filter-check-count" id="cnt-all">${totalCount}</span>
  </div>`;

  allCategories.forEach(cat => {
    const cnt = _allProducts.filter(p => p.category === cat).length;
    html += `<div class="filter-check-item">
      <label>
        <input type="checkbox" id="cat-${cat}" value="${cat}" ${_activeCategory === cat ? 'checked' : ''} onchange="onCategoryCheck('${cat}')"/>
        ${_capitalize(cat)}
      </label>
      <span class="filter-check-count" id="cnt-cat-${cat}">${cnt}</span>
    </div>`;
  });

  // Recreate only the inner content (title stays)
  const titleEl = el.querySelector('.filter-section__title');
  el.innerHTML = '';
  if (titleEl) el.appendChild(titleEl);
  el.insertAdjacentHTML('beforeend', html);
}

function onCategoryCheck(val) {
  _activeCategory = val;
  // Uncheck all others
  document.querySelectorAll('#filter-categories input[type="checkbox"]').forEach(cb => {
    cb.checked = cb.value === val;
  });
  _buildCategoryTabs();
  applyFilters();
}

/* ── PRICE RANGE ── */
function updatePriceRange() {
  const minEl = document.getElementById('price-min');
  const maxEl = document.getElementById('price-max');
  if (!minEl || !maxEl) return;

  let min = parseInt(minEl.value, 10);
  let max = parseInt(maxEl.value, 10);

  if (min > max) { [min, max] = [max, min]; }

  _priceMin = min;
  _priceMax = max;

  document.getElementById('price-min-label').textContent = min;
  document.getElementById('price-max-label').textContent = max;

  // Update fill bar
  const fillEl = document.getElementById('price-fill');
  if (fillEl) {
    const leftPct  = (min / MAX_PRICE) * 100;
    const rightPct = 100 - (max / MAX_PRICE) * 100;
    fillEl.style.left  = `${leftPct}%`;
    fillEl.style.right = `${rightPct}%`;
  }

  applyFilters();
}

/* ── OFFERS / COUNTS ── */
function _updateOfferCounts() {
  const off20 = _allProducts.filter(p => (p.discount || 0) >= 20).length;
  const combo = _allProducts.filter(p => p.category === 'combo').length;
  const veg   = _allProducts.filter(p => p.isVeg).length;
  _setText('cnt-off',   off20);
  _setText('cnt-combo', combo);
  _setText('cnt-veg',   veg);
}

function _updateRatingCounts() {
  const r3  = _allProducts.filter(p => p.rating >= 3).length;
  const r4  = _allProducts.filter(p => p.rating >= 4).length;
  const r45 = _allProducts.filter(p => p.rating >= 4.5).length;
  _setText('cnt-r3',  r3);
  _setText('cnt-r4',  r4);
  _setText('cnt-r45', r45);
}

/* ── MAIN FILTER + RENDER ── */
function applyFilters() {
  // Read filter values
  _filterOff20 = document.getElementById('filter-offer-20')?.checked || false;
  _filterCombo = document.getElementById('filter-offer-combo')?.checked || false;
  _filterVeg   = document.getElementById('filter-veg')?.checked || false;
  _filterRating= parseFloat(document.querySelector('input[name="filter-rating"]:checked')?.value || '0');
  _sortMode    = document.getElementById('sort-select')?.value || 'relevance';

  let results = _allProducts.slice();

  // 1. Search query filter
  if (_searchQuery) {
    const q = _searchQuery.toLowerCase();
    results = results.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }

  // 2. Category filter
  if (_activeCategory !== 'all') {
    results = results.filter(p => p.category === _activeCategory);
  }

  // 3. Price range
  results = results.filter(p => p.price >= _priceMin && p.price <= _priceMax);

  // 4. Offers
  if (_filterOff20) results = results.filter(p => (p.discount || 0) >= 20);
  if (_filterCombo) results = results.filter(p => p.category === 'combo');
  if (_filterVeg)   results = results.filter(p => p.isVeg);

  // 5. Rating
  if (_filterRating > 0) results = results.filter(p => (p.rating || 0) >= _filterRating);

  // 6. Sort
  results = _sortProducts(results, _sortMode);

  // Render
  _renderSearchHero(results);
  _renderGrid(results);
  _buildCategoryTabs();
}

function _getBaseFiltered() {
  if (!_searchQuery) return _allProducts;
  const q = _searchQuery.toLowerCase();
  return _allProducts.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.category || '').toLowerCase().includes(q) ||
    (p.description || '').toLowerCase().includes(q)
  );
}

function _getCategoryCounts(products) {
  const counts = {};
  products.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
  return counts;
}

function _sortProducts(arr, mode) {
  const copy = [...arr];
  switch(mode) {
    case 'price-asc':  return copy.sort((a, b) => a.price - b.price);
    case 'price-desc': return copy.sort((a, b) => b.price - a.price);
    case 'rating':     return copy.sort((a, b) => (b.rating||0) - (a.rating||0));
    case 'name':       return copy.sort((a, b) => a.name.localeCompare(b.name));
    default: // relevance — bestsellers first, then by rating
      return copy.sort((a, b) => {
        if (a.isBestseller !== b.isBestseller) return a.isBestseller ? -1 : 1;
        return (b.rating||0) - (a.rating||0);
      });
  }
}

/* ── RENDER HEADER ── */
function _renderSearchHero(results) {
  const titleEl = document.getElementById('search-hero-title');
  const queryEl = document.getElementById('search-hero-query');
  const countEl = document.getElementById('search-hero-count');
  if (!titleEl) return;

  if (_searchQuery) {
    titleEl.innerHTML = `Search Results for `;
    if (queryEl) { queryEl.textContent = `"${_searchQuery}"`; titleEl.appendChild(queryEl); }
  } else {
    titleEl.textContent = 'All Products';
    if (queryEl) queryEl.textContent = '';
  }
  if (countEl) {
    countEl.textContent = results.length === 0
      ? 'No products match your search'
      : `We found ${results.length} result${results.length !== 1 ? 's' : ''} matching your search`;
  }
}

/* ── RENDER PRODUCT GRID ── */
function _renderGrid(products) {
  const grid = document.getElementById('results-grid');
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <div class="no-results__icon">🔍</div>
        <h2>No results found</h2>
        <p>We couldn't find any snacks matching "<strong>${_esc(_searchQuery)}</strong>".<br>Try different keywords or browse our full menu.</p>
        <a href="shop.html" class="btn-browse">Browse All Snacks</a>
      </div>`;
    return;
  }

  grid.innerHTML = products.map(_renderCard).join('');
}

function _renderCard(p) {
  const isWished = _wishlist.includes(p.id);
  const hasImage = !!p.uploadedImage;

  // Stars HTML
  const fullStars  = Math.round(p.rating || 0);
  const starsHtml  = '★'.repeat(Math.min(fullStars,5)) + '☆'.repeat(Math.max(0, 5-fullStars));

  // Badges
  let badges = '';
  if (p.isBestseller) badges += `<span class="badge badge--bestseller">Bestseller</span>`;
  if (p.discount >= 15) badges += `<span class="badge badge--off">${p.discount}% OFF</span>`;
  if (p.isNew) badges += `<span class="badge badge--new">New</span>`;

  // Price display
  const savings = p.originalPrice && p.originalPrice > p.price ? p.originalPrice - p.price : 0;

  return `
    <div class="result-card" id="rcard-${p.id}" onclick="goToProduct(${p.id})">
      <div class="result-card__img-wrap">
        <img src="${window.KS_DB.getProductImage(p)}" alt="${_esc(p.name)}" loading="lazy"/>
        <div class="result-card__badges">${badges}</div>
        <button class="result-card__wish ${isWished ? 'active' : ''}" id="wish-${p.id}"
          onclick="event.stopPropagation(); toggleWish(${p.id})" aria-label="Wishlist">
          ${isWished ? '♥' : '♡'}
        </button>
      </div>
      <div class="result-card__body">
        <div class="result-card__name">${_esc(p.name)}</div>
        <div class="result-card__stars">
          <span class="stars-filled">${starsHtml}</span>
          <span class="result-card__rating">${p.rating || ''}</span>
          <span class="result-card__reviews">(${p.reviews || 0})</span>
        </div>
        <div class="result-card__price-row">
          <span class="price-current">₹${p.price}</span>
          ${p.originalPrice && p.originalPrice > p.price
            ? `<span class="price-original">₹${p.originalPrice}</span>
               <span class="price-save">Save ₹${savings}</span>`
            : ''
          }
        </div>
        <button class="btn-add-to-cart" onclick="event.stopPropagation(); addToCart('${_esc(p.name)}', ${p.price}, 1, '${p.emoji || '🍽️'}')">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          Add to Cart
        </button>
      </div>
    </div>`;
}

function goToProduct(id) {
  window.location.href = `product.html?id=${id}`;
}

/* ── WISHLIST ── */
function toggleWish(id) {
  const idx = _wishlist.indexOf(id);
  if (idx >= 0) {
    _wishlist.splice(idx, 1);
    showToast('💔 Removed from wishlist');
  } else {
    _wishlist.push(id);
    showToast('❤️ Added to wishlist!');
  }
  localStorage.setItem('ks_wishlist', JSON.stringify(_wishlist));
  const btn = document.getElementById(`wish-${id}`);
  if (btn) {
    btn.textContent = _wishlist.includes(id) ? '♥' : '♡';
    btn.classList.toggle('active', _wishlist.includes(id));
  }
}

/* ── POPULAR SEARCHES ── */
function _buildPopularSearches() {
  const box = document.getElementById('popular-searches-box');
  if (!box) return;
  const title = box.querySelector('.popular-searches__title');
  let html = title ? title.outerHTML : '';
  POPULAR_SEARCHES.slice(0, 8).forEach(s => {
    html += `<div class="popular-search-item" onclick="selectSuggestion('${_esc(s)}')">
      <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      ${_esc(s)}
    </div>`;
  });
  box.innerHTML = html;
}

/* ── CLEAR FILTERS ── */
function clearAllFilters() {
  _activeCategory = 'all';
  _priceMin = 0;
  _priceMax = MAX_PRICE;
  _filterOff20 = false;
  _filterCombo = false;
  _filterVeg   = false;
  _filterRating = 0;
  _sortMode    = 'relevance';

  // Reset UI
  const minEl = document.getElementById('price-min');
  const maxEl = document.getElementById('price-max');
  if (minEl) minEl.value = 0;
  if (maxEl) maxEl.value = MAX_PRICE;
  updatePriceRange();

  document.getElementById('filter-offer-20').checked = false;
  document.getElementById('filter-offer-combo').checked = false;
  document.getElementById('filter-veg').checked = false;
  document.getElementById('rating-all').checked = true;
  document.getElementById('sort-select').value = 'relevance';

  // Reset category checkboxes
  document.querySelectorAll('#filter-categories input[type="checkbox"]').forEach(cb => {
    cb.checked = cb.value === 'all';
  });

  applyFilters();
  showToast('🔄 Filters cleared');
}

/* ── URL SYNC ── */
function _updateURL() {
  const url = new URL(window.location.href);
  if (_searchQuery) url.searchParams.set('q', _searchQuery);
  else url.searchParams.delete('q');
  history.replaceState({}, '', url.toString());
}

/* ── COUNTDOWN ── */
function _startCountdown() {
  let secs = 2 * 3600 + 45 * 60 + 30;
  function tick() {
    if (secs < 0) secs = 3 * 3600;
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const hEl = document.getElementById('cd-h'); if (hEl) hEl.textContent = String(h).padStart(2,'0');
    const mEl = document.getElementById('cd-m'); if (mEl) mEl.textContent = String(m).padStart(2,'0');
    const sEl = document.getElementById('cd-s'); if (sEl) sEl.textContent = String(s).padStart(2,'0');
    secs--;
  }
  tick(); setInterval(tick, 1000);
}

/* ── HELPERS ── */
function _setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function _capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function _esc(str) {
  return String(str).replace(/'/g, "\\'").replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ── EXPOSE GLOBALS ── */
window.applyFilters       = applyFilters;
window.setCategoryTab     = setCategoryTab;
window.onCategoryCheck    = onCategoryCheck;
window.updatePriceRange   = updatePriceRange;
window.clearAllFilters    = clearAllFilters;
window.selectSuggestion   = selectSuggestion;
window.hideSuggestions    = hideSuggestions;
window.toggleWish         = toggleWish;
window.goToProduct        = goToProduct;
