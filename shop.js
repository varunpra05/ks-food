/* ============================================================
   KUMAR SNACKS — Shop Catalog Page JavaScript (shop.js)
   Features: Multi-level sidebar filtering (Categories, Diet, Price, Sort),
   dynamic page rendering, pagination controls, shared cart mapping.
   ============================================================ */

'use strict';

// Catalog Constants
const ITEMS_PER_PAGE = 6;
let currentPage = 1;
let currentProducts = []; // Holds products after active filters
let activeCategory = 'all'; // Round filters category
let activePriceLimit = 300;

/* ──────────────────────────────────────────
   COUNTDOWN TIMER
────────────────────────────────────────── */
let cdSeconds = 2 * 3600 + 45 * 60 + 30;
function updateCountdown() {
  if (cdSeconds <= 0) { cdSeconds = 3 * 3600; }
  const h = Math.floor(cdSeconds / 3600);
  const m = Math.floor((cdSeconds % 3600) / 60);
  const s = cdSeconds % 60;
  
  const hEl = document.getElementById('cd-h');
  const mEl = document.getElementById('cd-m');
  const sEl = document.getElementById('cd-s');

  if (hEl) hEl.textContent = String(h).padStart(2, '0');
  if (mEl) mEl.textContent = String(m).padStart(2, '0');
  if (sEl) sEl.textContent = String(s).padStart(2, '0');
  
  cdSeconds--;
}
updateCountdown();
setInterval(updateCountdown, 1000);

/* ──────────────────────────────────────────
   STICKY HEADER & BACK TO TOP
────────────────────────────────────────── */
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  if (header) header.classList.toggle('scrolled', window.scrollY > 30);

  const scrollBtn = document.getElementById('scroll-top-btn');
  if (scrollBtn) scrollBtn.classList.toggle('visible', window.scrollY > 400);
});

document.getElementById('scroll-top-btn')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ──────────────────────────────────────────
   MOBILE NAVIGATION
────────────────────────────────────────── */
const burgerBtn  = document.getElementById('burger-btn');
const mobileNav  = document.getElementById('mobile-nav');

burgerBtn?.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  burgerBtn.classList.toggle('open', open);
  burgerBtn.setAttribute('aria-expanded', open);
});

/* ──────────────────────────────────────────
   FILTER LOGIC
────────────────────────────────────────── */
function initFilters() {
  const allProducts = window.KS_DB.getAll();

  // Draw Sidebar Category Filters dynamic list with counts
  const catList = document.getElementById('cat-checkbox-list');
  if (catList) {
    const catsMap = {};
    allProducts.forEach(p => {
      catsMap[p.category] = (catsMap[p.category] || 0) + 1;
    });

    let catHTML = '';
    Object.entries(catsMap).forEach(([cat, count]) => {
      catHTML += `
        <label class="filter-check-lbl">
          <input type="checkbox" name="category" value="${cat}" onchange="applyFilters()"/>
          <span style="text-transform: capitalize;">${cat}</span>
          <small>(${count})</small>
        </label>`;
    });
    catList.innerHTML = catHTML;
  }

  // Set initial diet counts
  const vegCount = allProducts.filter(p => p.isVeg).length;
  const jainCount = allProducts.filter(p => p.isJain || p.name.toLowerCase().includes('jain')).length;
  const spicyCount = allProducts.filter(p => p.isSpicy || p.description.toLowerCase().includes('spicy')).length;
  
  setText('cnt-veg', `(${vegCount})`);
  setText('cnt-jain', `(${jainCount})`);
  setText('cnt-spicy', `(${spicyCount})`);

  // Check URL query parameters for category
  const urlParams = new URLSearchParams(window.location.search);
  const catParam = urlParams.get('cat');
  if (catParam) {
    // Select the category button or filter check
    activeCategory = catParam;
    const catBtn = document.querySelector(`.h-cat-btn[data-cat="${catParam}"]`);
    if (catBtn) {
      document.querySelectorAll('.h-cat-btn').forEach(b => b.classList.remove('active'));
      catBtn.classList.add('active');
    }
  }

  applyFilters();
}

function filterByHorizontalCat(cat, btn) {
  document.querySelectorAll('.h-cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeCategory = cat;
  applyFilters();
}

function updatePriceLabel(val) {
  activePriceLimit = parseInt(val, 10);
  const label = document.getElementById('price-label');
  if (label) {
    label.textContent = val === '300' ? '₹300+' : `₹${val}`;
  }
}

function clearAllFilters() {
  // Clear checkboxes
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
  // Clear price range slider
  const slider = document.getElementById('price-slider');
  if (slider) {
    slider.value = 300;
    updatePriceLabel(300);
  }
  // Clear round filter
  activeCategory = 'all';
  document.querySelectorAll('.h-cat-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.h-cat-btn[data-cat="all"]')?.classList.add('active');

  applyFilters();
}

function applyFilters() {
  let products = window.KS_DB.getAll();

  // 1. Horizontal Round Category Filter
  if (activeCategory !== 'all') {
    products = products.filter(p => p.category === activeCategory);
  }

  // 2. Sidebar Category Checklist Filter
  const selectedCats = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(cb => cb.value);
  if (selectedCats.length > 0) {
    products = products.filter(p => selectedCats.includes(p.category));
  }

  // 3. Price Limit Filter
  if (activePriceLimit < 300) {
    products = products.filter(p => p.price <= activePriceLimit);
  }

  // 4. Diet Type Checklist Filter
  const selectedDiets = Array.from(document.querySelectorAll('input[name="diet"]:checked')).map(cb => cb.value);
  if (selectedDiets.length > 0) {
    products = products.filter(p => {
      return selectedDiets.every(diet => {
        if (diet === 'veg') return p.isVeg;
        if (diet === 'jain') return p.isJain || p.name.toLowerCase().includes('jain');
        if (diet === 'spicy') return p.isSpicy || p.description.toLowerCase().includes('spicy');
        return true;
      });
    });
  }

  // 5. Best For Checklist Filter
  const selectedBestFor = Array.from(document.querySelectorAll('input[name="bestfor"]:checked')).map(cb => cb.value);
  if (selectedBestFor.length > 0) {
    products = products.filter(p => {
      return selectedBestFor.every(bf => {
        if (bf === 'bestseller') return p.isBestseller;
        if (bf === 'new') return p.isNew || p.id > 8; // Newly added items or high IDs
        if (bf === 'discount') return p.discount > 0 || (p.originalPrice && p.originalPrice > p.price);
        return true;
      });
    });
  }

  // 6. Sort By Selection
  const sortBy = document.getElementById('sort-select').value;
  if (sortBy === 'price-asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    products.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    products.sort((a, b) => b.rating - a.rating);
  }

  currentProducts = products;
  currentPage = 1;
  renderCatalog();
}

/* ──────────────────────────────────────────
   CATALOG RENDERING
────────────────────────────────────────── */
function renderCatalog() {
  const grid = document.getElementById('products-grid');
  const empty = document.getElementById('catalog-empty');
  const countLabel = document.getElementById('showing-count');

  if (!grid) return;

  const totalItems = currentProducts.length;

  if (totalItems === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    countLabel.textContent = 'Showing 0 of 0 products';
    renderPagination(0);
    return;
  }

  empty.style.display = 'none';

  // Calculate pages items
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx   = Math.min(startIdx + ITEMS_PER_PAGE, totalItems);
  const itemsToShow = currentProducts.slice(startIdx, endIdx);

  countLabel.textContent = `Showing ${startIdx + 1}-${endIdx} of ${totalItems} products`;

  let html = '';
  itemsToShow.forEach(p => {
    // Generate badge
    let badgeHTML = '';
    if (p.isBestseller) {
      badgeHTML = `<span class="prod-card__badge badge--bestseller">Bestseller</span>`;
    } else if (p.discount) {
      badgeHTML = `<span class="prod-card__badge badge--discount">${p.discount}% OFF</span>`;
    } else if (p.id > 8) {
      badgeHTML = `<span class="prod-card__badge badge--new">New</span>`;
    }

    // Old price
    const oldPriceHTML = (p.originalPrice && p.originalPrice > p.price)
      ? `<span class="price-old">₹${p.originalPrice}</span>`
      : '';

    html += `
      <div class="prod-card" onclick="window.location.href='product.html?id=${p.id}'">
        <button class="prod-card__wish" onclick="event.stopPropagation(); toggleWishlist(this, ${p.id})">♡</button>
        ${badgeHTML}
        <div class="prod-card__img-wrap">
          <img src="${window.KS_DB.getProductImage(p)}" alt="${p.name}" loading="lazy"/>
        </div>
        <div class="prod-card__body">
          <h3>${p.name}</h3>
          <div class="prod-card__rating">
            <span class="star-icon">★</span>
            <span>${p.rating}</span>
            <span class="review-count">(${p.reviews} reviews)</span>
          </div>
          <div class="prod-card__footer">
            <div class="price-wrap">
              <span class="price-current">₹${p.price}</span>
              ${oldPriceHTML}
            </div>
            <button class="add-cart-btn" onclick="event.stopPropagation(); addToCart('${p.name.replace(/'/g, "\\'")}', ${p.price}, 1, '${p.emoji}')">
              Add to Cart
            </button>
          </div>
        </div>
      </div>`;
  });
  grid.innerHTML = html;

  renderPagination(totalItems);
}

function renderPagination(totalItems) {
  const container = document.getElementById('pagination-controls');
  if (!container) return;

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';
  // Prev button
  html += `<button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" onclick="goToPage(${currentPage - 1})">‹</button>`;

  // Page index numbers
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${currentPage === i ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }

  // Next button
  html += `<button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" onclick="goToPage(${currentPage + 1})">›</button>`;

  container.innerHTML = html;
}

function goToPage(page) {
  currentPage = page;
  renderCatalog();
  window.scrollTo({ top: document.querySelector('.shop-main').offsetTop - 80, behavior: 'smooth' });
}

function toggleWishlist(btn, id) {
  const active = btn.classList.toggle('active');
  btn.textContent = active ? '♥' : '♡';
  showToast(active ? '❤️ Added to Wishlist!' : '💔 Removed from Wishlist');
}

/* ──────────────────────────────────────────
   HELPERS
────────────────────────────────────────── */
function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

/* ──────────────────────────────────────────
   INITIALIZATION
────────────────────────────────────────── */
initFilters();
renderCart();
updateCartCount();

window.removeFromCart = removeFromCart;
window.filterByHorizontalCat = filterByHorizontalCat;
window.toggleWishlist = toggleWishlist;
window.goToPage = goToPage;
