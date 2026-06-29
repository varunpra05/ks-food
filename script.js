'use strict';

/* ─────────────────────────────────────────
   CART
───────────────────────────────────────── */
let cart = JSON.parse(sessionStorage.getItem('ks_cart') || '[]');

function saveCart() { sessionStorage.setItem('ks_cart', JSON.stringify(cart)); }

function getEmoji(name = '') {
  const m = { pizza:'🍕', burger:'🍔', fries:'🍟', sandwich:'🥪',
               dabeli:'🌮', vada:'🍞', coke:'🥤', cheese:'🧀',
               combo:'🎉', garlic:'🥖', bread:'🥖', drink:'🥤' };
  const n = name.toLowerCase();
  for (const [k, v] of Object.entries(m)) if (n.includes(k)) return v;
  return '🍽️';
}

function addToCart(name, price, qty = 1) {
  const found = cart.find(i => i.name === name);
  if (found) found.qty += qty;
  else cart.push({ name, price: parseInt(price, 10), qty, emoji: getEmoji(name) });
  saveCart();
  renderCart();
  updateCartCount();
  showToast(`✅ ${name} added to cart!`);
  pulseCart();
}

function quickAddToCart(btn) { addToCart(btn.dataset.name, btn.dataset.price); }

function removeFromCart(idx) {
  cart.splice(idx, 1);
  saveCart();
  renderCart();
  updateCartCount();
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const footer    = document.getElementById('cart-footer');
  const emptyEl   = document.getElementById('cart-empty');
  if (!container) return;
  if (cart.length === 0) {
    container.innerHTML = ''; container.appendChild(emptyEl);
    emptyEl.style.display = 'flex'; footer.style.display = 'none'; return;
  }
  emptyEl.style.display = 'none'; footer.style.display = 'block';
  container.innerHTML = cart.map((item, idx) => `
    <div class="cart-item">
      <span class="cart-item__emoji">${item.emoji}</span>
      <div class="cart-item__info">
        <h4>${item.name}</h4>
        <span>₹${item.price} × ${item.qty}</span>
      </div>
      <span class="cart-item__price">₹${item.price * item.qty}</span>
      <button class="cart-item__remove" onclick="removeFromCart(${idx})">✕</button>
    </div>`).join('');
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('cart-total-price').textContent = `₹${total}`;
}

function updateCartCount() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById('cart-count');
  if (!badge) return;
  badge.textContent = total;
  badge.classList.toggle('visible', total > 0);
}

function pulseCart() {
  const btn = document.getElementById('cart-btn');
  if (!btn) return;
  btn.style.transform = 'scale(1.2)';
  setTimeout(() => btn.style.transform = '', 280);
}

/* ─────────────────────────────────────────
   CART SIDEBAR
───────────────────────────────────────── */
function openCart()  { document.getElementById('cart-sidebar').classList.add('open'); document.getElementById('cart-overlay').classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeCart() { document.getElementById('cart-sidebar').classList.remove('open'); document.getElementById('cart-overlay').classList.remove('active'); document.body.style.overflow = ''; }

document.getElementById('cart-btn')?.addEventListener('click', openCart);
document.getElementById('cart-close-btn')?.addEventListener('click', closeCart);
document.getElementById('cart-overlay')?.addEventListener('click', closeCart);
document.getElementById('checkout-btn')?.addEventListener('click', () => {
  showToast('🎉 Order placed! Thank you for choosing Kumar Snacks!');
  cart = []; saveCart(); renderCart(); updateCartCount(); closeCart();
});

/* ─────────────────────────────────────────
   TOAST
───────────────────────────────────────── */
let _toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
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
        <span class="product-card__emoji">${p.emoji}</span>
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

  // Scroll to products
  document.getElementById('bestsellers')?.scrollIntoView({ behavior: 'smooth' });

  // Update category tabs
  document.querySelectorAll('.cat-item').forEach(el => {
    el.classList.toggle('active', el.dataset.cat === cat);
  });
}

/* Category tabs */
document.querySelectorAll('.cat-item').forEach(item => {
  item.addEventListener('click', () => filterByCategory(item.dataset.cat));
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

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
renderCart();
updateCartCount();
