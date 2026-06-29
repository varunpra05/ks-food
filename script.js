'use strict';

/* ─────────────────────────────────────────
   QUICK ADD (inline onclick compatibility)
   cart-drawer.js provides addToCart globally
───────────────────────────────────────── */
function quickAddToCart(btn) {
  if (typeof addToCart === 'function') {
    addToCart(btn.dataset.name, btn.dataset.price);
  }
}

/* ─────────────────────────────────────────
   COUNTDOWN
───────────────────────────────────────── */
let cdSec = 45 * 60 + 20;
function tick() {
  if (cdSec < 0) cdSec = 3600 * 2;
  const h = Math.floor(cdSec / 3600);
  const m = Math.floor((cdSec % 3600) / 60);
  const s = cdSec % 60;
  const hEl = document.getElementById('cd-h');
  const mEl = document.getElementById('cd-m');
  const sEl = document.getElementById('cd-s');
  if (hEl) hEl.textContent = String(h).padStart(2, '0');
  if (mEl) mEl.textContent = String(m).padStart(2, '0');
  if (sEl) sEl.textContent = String(s).padStart(2, '0');
  cdSec--;
}
tick(); setInterval(tick, 1000);

/* ─────────────────────────────────────────
   SCROLL FX
───────────────────────────────────────── */
window.addEventListener('scroll', () => {
  document.getElementById('header')?.classList.toggle('scrolled', window.scrollY > 30);
  document.getElementById('scroll-top-btn')?.classList.toggle('visible', window.scrollY > 400);
});
document.getElementById('scroll-top-btn')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ─────────────────────────────────────────
   MOBILE NAV
───────────────────────────────────────── */
const burgerBtn = document.getElementById('burger-btn');
const mobileNav = document.getElementById('mobile-nav');
burgerBtn?.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  burgerBtn.classList.toggle('open', open);
  burgerBtn.setAttribute('aria-expanded', open);
});

/* ─────────────────────────────────────────
   RENDER PRODUCTS FROM DATABASE
───────────────────────────────────────── */
function renderProductCard(p) {
  return `
    <div class="product-card" id="prod-${p.id}" onclick="goToProduct(${p.id})" style="cursor:pointer" title="View ${p.name}">
      <div class="product-card__img">
        <img src="${window.KS_DB.getProductImage(p)}" alt="${p.name}" loading="lazy"/>
        ${p.isBestseller ? '<span class="product-card__badge-bs">⭐ Bestseller</span>' : ''}
        <span class="product-card__badge">⭐ ${p.rating}</span>
        ${p.isVeg ? '<span class="veg-dot-sm" title="Vegetarian"></span>' : ''}
      </div>
      <div class="product-card__body">
        <h3>${p.name}</h3>
        <div class="product-card__price-row">
          <span class="product-card__price">₹${p.price}</span>
          ${p.discount ? `<span class="product-card__off">${p.discount}% OFF</span>` : ''}
        </div>
        <div class="product-card__actions">
          <button class="btn-add" onclick="event.stopPropagation(); addToCart('${p.name.replace(/'/g, "\\'")}', ${p.price})">Add to Cart</button>
          <button class="btn-qty" onclick="event.stopPropagation(); addToCart('${p.name.replace(/'/g, "\\'")}', ${p.price})">+</button>
        </div>
      </div>
    </div>`;
}

function goToProduct(id) {
  window.location.href = `product.html?id=${id}`;
}

function renderAllProducts(products) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  if (!products || products.length === 0) {
    grid.innerHTML = '<p style="color:#777;padding:20px;">No products found.</p>';
    return;
  }
  grid.innerHTML = products.map(renderProductCard).join('');
  applyReveal(grid.querySelectorAll('.product-card'));
}

function filterByCategory(cat) {
  const all = window.KS_DB.getAll();
  const filtered = cat === 'all' ? all : all.filter(p => p.category === cat);
  renderAllProducts(filtered);
  document.getElementById('bestsellers')?.scrollIntoView({ behavior: 'smooth' });
  document.querySelectorAll('.cat-item').forEach(el => {
    el.classList.toggle('active', el.dataset.cat === cat);
  });
}

/* Category tabs */
document.querySelectorAll('.cat-item').forEach(item => {
  item.addEventListener('click', () => filterByCategory(item.dataset.cat));
});

/* View All Links */
document.getElementById('bs-view-all')?.addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = 'shop.html';
});
document.getElementById('combo-view-all')?.addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = 'shop.html';
});

/* Initial render */
renderAllProducts(window.KS_DB?.getBestsellers() || []);

/* ─────────────────────────────────────────
   REVIEWS SLIDER
───────────────────────────────────────── */
const reviews = document.querySelectorAll('.review-card');
let curReview = 0;
function showReview(idx) {
  reviews.forEach(r => r.classList.remove('active'));
  curReview = (idx + reviews.length) % reviews.length;
  reviews[curReview]?.classList.add('active');
}
document.getElementById('review-next')?.addEventListener('click', () => showReview(curReview + 1));
document.getElementById('review-prev')?.addEventListener('click', () => showReview(curReview - 1));
setInterval(() => showReview(curReview + 1), 5000);

/* ─────────────────────────────────────────
   NEWSLETTER
───────────────────────────────────────── */
document.getElementById('newsletter-form')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('newsletter-email').value.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('⚠️ Please enter a valid email address'); return;
  }
  showToast('🎉 Thank you for subscribing!');
  this.reset();
});

/* ─────────────────────────────────────────
   DEAL CARDS
───────────────────────────────────────── */
(function highlightDeal() {
  const h = new Date().getHours();
  const id = h >= 7 && h < 11 ? 'deal-morning' :
             h >= 11 && h < 16 ? 'deal-afternoon' :
             h >= 16 && h < 20 ? 'deal-evening' : 'deal-night';
  const card = document.getElementById(id);
  if (card) { card.style.outline = '3px solid var(--primary)'; card.style.outlineOffset = '2px'; }
})();

document.querySelectorAll('.deal-card').forEach(card => {
  card.addEventListener('click', () => {
    const label = card.querySelector('strong')?.textContent || '';
    const pct   = card.querySelector('.deal-card__discount')?.textContent || '';
    showToast(`🎉 ${label} Deal: ${pct} applied!`);
  });
});

/* ─────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────── */
function applyReveal(els) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; obs.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  [...els].forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(22px)';
    el.style.transition = `opacity 0.45s ease ${i * 0.07}s, transform 0.45s ease ${i * 0.07}s`;
    obs.observe(el);
  });
}
applyReveal(document.querySelectorAll('.deal-card, .promo-card, .combo-card, .why-item, .cat-item'));
