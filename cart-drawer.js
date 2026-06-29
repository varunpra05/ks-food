/**
 * cart-drawer.js — Shared Premium Cart Drawer
 * Works across all pages: index, shop, product, about, contact
 * Injects the HTML, renders cart items, handles qty +/-, promo codes,
 * free-delivery progress, and checkout redirect.
 */
'use strict';

/* ── CONSTANTS ── */
const FREE_DELIVERY_MIN = 299;
const PROMO_CODES = {
  'KUMAR10':   { label: '10% Discount',      fn: (sub) => Math.round(sub * 0.10) },
  'WELCOME50': { label: '50% Welcome Off',   fn: (sub) => Math.round(sub * 0.50) },
  'FREE99':    { label: '₹99 Flat Off',      fn: ()    => 99 },
};

/* ── STATE ── */
let _cart   = JSON.parse(sessionStorage.getItem('ks_cart') || '[]');
let _promo  = { code: '', discount: 0, label: '' };

/* ── INJECT HTML ── */
(function injectCartHTML() {
  // Only inject if not already present
  if (document.getElementById('cart-sidebar')) return;

  const html = `
    <div class="cart-overlay" id="cart-overlay"></div>
    <aside class="cart-sidebar" id="cart-sidebar" aria-label="Shopping Cart">

      <!-- Header -->
      <div class="cart-sidebar__header">
        <div class="cart-header-icon">🛍️</div>
        <div class="cart-header-text">
          <h3 id="cart-drawer-title">Your Cart (0)</h3>
          <p id="cart-drawer-sub">Almost there! Add more yummy items.</p>
        </div>
        <button class="cart-close-btn" id="cart-close-btn" aria-label="Close cart">✕</button>
      </div>

      <!-- Items Scroll Area -->
      <div class="cart-sidebar__items" id="cart-items">
        <!-- Rendered by JS -->
      </div>

      <!-- Footer (hidden when empty) -->
      <div class="cart-sidebar__footer" id="cart-footer" style="display:none;">

        <!-- Promo Code -->
        <div class="cart-promo-block">
          <input class="cart-promo-input" id="cart-promo-input" type="text" placeholder="🏷️ Enter promo code"/>
          <button class="cart-promo-apply" id="cart-promo-apply">Apply</button>
        </div>

        <!-- Totals -->
        <div class="cart-totals-block">
          <div class="cart-totals-row">
            <span id="cart-subtotal-label">Subtotal (0 Items)</span>
            <span id="cart-subtotal-price">₹0</span>
          </div>
          <div class="cart-totals-row">
            <span>Delivery Charges</span>
            <span id="cart-delivery-text" class="free">FREE</span>
          </div>
          <div class="cart-totals-row" id="cart-promo-row" style="display:none;">
            <span id="cart-promo-label">Promo Discount</span>
            <span id="cart-promo-amount" class="save">-₹0</span>
          </div>
          <div class="cart-totals-row" id="cart-save-row" style="display:none;">
            <span>You Save</span>
            <span id="cart-save-amount" class="save">-₹0</span>
          </div>
        </div>

        <!-- Grand Total -->
        <div class="cart-grand-total">
          <span>Total Amount</span>
          <strong id="cart-total-price">₹0</strong>
        </div>

        <!-- Free Delivery Bar -->
        <div class="cart-free-delivery" id="cart-free-delivery-block">
          <div class="free-delivery-text">
            <span>👑</span>
            <span id="cart-free-delivery-text">Add items worth ₹299 more to unlock FREE delivery!</span>
          </div>
          <div class="free-delivery-bar">
            <div class="free-delivery-fill" id="cart-free-delivery-fill" style="width:0%"></div>
          </div>
        </div>

        <!-- Checkout Button -->
        <button class="btn-cart-checkout" id="checkout-btn">
          Proceed to Checkout
          <span class="checkout-arrow">→</span>
        </button>

        <!-- Trust Badges -->
        <div class="cart-trust-badges">
          <div class="trust-badge-item">
            <span>🛡️</span>
            <span>100% Secure Payments</span>
          </div>
          <div class="trust-badge-item">
            <span>🚚</span>
            <span>Fast Delivery At your doorstep</span>
          </div>
          <div class="trust-badge-item">
            <span>⭐</span>
            <span>Best Quality Guaranteed</span>
          </div>
        </div>

      </div><!-- /cart-footer -->
    </aside>
  `;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html.trim();
  document.body.appendChild(wrapper.firstElementChild); // overlay
  document.body.appendChild(wrapper.lastElementChild);  // sidebar

  // Wire events after injection
  _wireEvents();
})();

/* ── WIRE EVENTS ── */
function _wireEvents() {
  document.getElementById('cart-close-btn')?.addEventListener('click', closeCart);
  document.getElementById('cart-overlay')?.addEventListener('click', closeCart);

  document.getElementById('cart-promo-apply')?.addEventListener('click', () => {
    const code = (document.getElementById('cart-promo-input')?.value || '').trim().toUpperCase();
    _applyPromo(code);
  });
  document.getElementById('cart-promo-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('cart-promo-apply')?.click();
  });

  document.getElementById('checkout-btn')?.addEventListener('click', () => {
    if (_cart.length === 0) return;
    window.location.href = 'checkout.html';
  });
}

/* ── PUBLIC: openCart / closeCart ── */
function openCart() {
  document.getElementById('cart-sidebar')?.classList.add('open');
  document.getElementById('cart-overlay')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-sidebar')?.classList.remove('open');
  document.getElementById('cart-overlay')?.classList.remove('active');
  document.body.style.overflow = '';
}

/* ── RENDER ── */
function renderCart() {
  const container = document.getElementById('cart-items');
  const footer    = document.getElementById('cart-footer');
  if (!container) return;

  const totalQty = _cart.reduce((s, i) => s + i.qty, 0);

  // Update header
  const titleEl = document.getElementById('cart-drawer-title');
  const subEl   = document.getElementById('cart-drawer-sub');
  if (titleEl) titleEl.textContent = `Your Cart (${totalQty})`;
  if (subEl) subEl.textContent = _cart.length === 0 ? 'Add some delicious items!' : 'Almost there! Add more yummy items.';

  // Empty state
  if (_cart.length === 0) {
    footer.style.display = 'none';
    container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty__icon">🛒</div>
        <p>Your cart is empty!</p>
        <span>Explore our delicious menu and add items</span>
        <a href="shop.html" class="btn-shop-now" onclick="closeCart()">Shop Now →</a>
      </div>`;
    return;
  }

  footer.style.display = '';

  // Render items
  container.innerHTML = _cart.map((item, idx) => {
    // Try to find product in DB for image
    const dbProduct = (typeof window.KS_DB !== 'undefined')
      ? window.KS_DB.getAll().find(p => item.name.startsWith(p.name) || p.name === item.name)
      : null;

    const imgUrl = (typeof window.KS_DB !== 'undefined')
      ? window.KS_DB.getFallbackImageByEmojiOrName(item.emoji, item.name)
      : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60';
    const thumbContent = `<img src="${imgUrl}" alt="${item.name}"/>`;

    const desc = dbProduct ? (dbProduct.description || '').slice(0, 40) : '';

    return `
      <div class="cart-item" id="cart-item-${idx}">
        <div class="cart-item__thumb">${thumbContent}</div>
        <div class="cart-item__info">
          <h4>${item.name}</h4>
          ${desc ? `<div class="cart-item__desc">${desc}${desc.length >= 40 ? '…' : ''}</div>` : ''}
          <div class="cart-item__qty-row">
            <button class="qty-btn" onclick="cartQtyChange(${idx}, -1)" aria-label="Decrease">−</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn" onclick="cartQtyChange(${idx}, +1)" aria-label="Increase">+</button>
          </div>
        </div>
        <div class="cart-item__right">
          <span class="cart-item__price">₹${item.price * item.qty}</span>
          <button class="cart-item__remove" onclick="cartRemoveItem(${idx})" aria-label="Remove item">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </div>`;
  }).join('');

  _updateTotals();
}

/* ── TOTALS ── */
function _updateTotals() {
  const subtotal   = _cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalQty   = _cart.reduce((s, i) => s + i.qty, 0);
  const delivery   = subtotal >= FREE_DELIVERY_MIN ? 0 : 0; // Always free per site policy
  const promoDisc  = _promo.discount;
  const total      = Math.max(0, subtotal - promoDisc + delivery);

  // Labels
  const subLabelEl = document.getElementById('cart-subtotal-label');
  if (subLabelEl) subLabelEl.textContent = `Subtotal (${totalQty} Item${totalQty !== 1 ? 's' : ''})`;

  _setText('cart-subtotal-price', `₹${subtotal}`);
  _setText('cart-total-price',    `₹${total}`);

  // Delivery
  const deliveryEl = document.getElementById('cart-delivery-text');
  if (deliveryEl) {
    if (delivery === 0) {
      deliveryEl.textContent = 'FREE';
      deliveryEl.className = 'free';
    } else {
      deliveryEl.textContent = `₹${delivery}`;
      deliveryEl.className = '';
    }
  }

  // Promo row
  const promoRow = document.getElementById('cart-promo-row');
  if (promoDisc > 0 && promoRow) {
    promoRow.style.display = '';
    _setText('cart-promo-label',  `Promo (${_promo.code})`);
    _setText('cart-promo-amount', `-₹${promoDisc}`);
  } else if (promoRow) {
    promoRow.style.display = 'none';
  }

  // You Save row
  const saveRow = document.getElementById('cart-save-row');
  if (promoDisc > 0 && saveRow) {
    saveRow.style.display = '';
    _setText('cart-save-amount', `-₹${promoDisc}`);
  } else if (saveRow) {
    saveRow.style.display = 'none';
  }

  // Free delivery progress bar
  const freeBlock = document.getElementById('cart-free-delivery-block');
  const freeText  = document.getElementById('cart-free-delivery-text');
  const freeFill  = document.getElementById('cart-free-delivery-fill');
  if (freeBlock && freeText && freeFill) {
    const pct = Math.min(100, Math.round((subtotal / FREE_DELIVERY_MIN) * 100));
    freeFill.style.width = `${pct}%`;
    if (subtotal >= FREE_DELIVERY_MIN) {
      freeText.innerHTML = '🎉 You\'ve unlocked <strong>FREE Delivery!</strong>';
    } else {
      const remaining = FREE_DELIVERY_MIN - subtotal;
      freeText.innerHTML = `👑 Add items worth <strong>₹${remaining}</strong> more to unlock FREE delivery!`;
    }
  }
}

/* ── PUBLIC: Cart Mutation Functions ── */
function cartQtyChange(idx, delta) {
  if (!_cart[idx]) return;
  _cart[idx].qty = Math.max(1, _cart[idx].qty + delta);
  _saveCart();
  renderCart();
  _updateBadge();
}

function cartRemoveItem(idx) {
  _cart.splice(idx, 1);
  _saveCart();
  renderCart();
  _updateBadge();
}

function addToCart(name, price, qty = 1, emoji = '🍽️') {
  const existing = _cart.find(i => i.name === name);
  if (existing) {
    existing.qty += qty;
  } else {
    _cart.push({ name, price: parseInt(price, 10), qty, emoji: emoji || _getEmoji(name) });
  }
  _saveCart();
  renderCart();
  _updateBadge();
  _showToast(`✅ ${name} added to cart!`);
  _pulseCartBtn();
}

function removeCartItem(idx) { cartRemoveItem(idx); }

/* ── PROMO ── */
function _applyPromo(code) {
  const feedbackEl = document.getElementById('cart-promo-input');
  if (!code) {
    if (feedbackEl) { feedbackEl.style.borderColor = '#ef4444'; setTimeout(() => feedbackEl.style.borderColor = '', 1500); }
    _showToast('⚠️ Enter a promo code first!');
    return;
  }

  if (PROMO_CODES[code]) {
    const subtotal = _cart.reduce((s, i) => s + i.price * i.qty, 0);
    _promo.code     = code;
    _promo.discount = PROMO_CODES[code].fn(subtotal);
    _promo.label    = PROMO_CODES[code].label;
    _showToast(`🎉 ${_promo.label} applied!`);
    if (feedbackEl) { feedbackEl.style.borderColor = '#10b981'; feedbackEl.disabled = true; }
  } else {
    _promo = { code: '', discount: 0, label: '' };
    _showToast('❌ Invalid promo code');
    if (feedbackEl) { feedbackEl.style.borderColor = '#ef4444'; setTimeout(() => feedbackEl.style.borderColor = '', 1500); }
  }
  renderCart();
}

/* ── BADGE ── */
function _updateBadge() {
  const total = _cart.reduce((s, i) => s + i.qty, 0);
  // Handles both id="cart-count" (index/shop) and class-based
  const badges = [...document.querySelectorAll('#cart-count, .cart-count, #cart-badge')];
  badges.forEach(b => {
    b.textContent = total;
    b.classList.toggle('visible', total > 0);
  });
}

function updateCartCount() { _updateBadge(); }
function updateBadge() { _updateBadge(); }

/* ── INTERNAL HELPERS ── */
function _saveCart() { sessionStorage.setItem('ks_cart', JSON.stringify(_cart)); }

function _showToast(msg) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._tt);
  el._tt = setTimeout(() => el.classList.remove('show'), 3000);
}

function showToast(msg) { _showToast(msg); }

function _pulseCartBtn() {
  const btn = document.querySelector('#cart-btn, .cart-btn');
  if (!btn) return;
  btn.style.transform = 'scale(1.2)';
  setTimeout(() => btn.style.transform = '', 280);
}

function _getEmoji(name = '') {
  const m = { pizza:'🍕', burger:'🍔', fries:'🍟', sandwich:'🥪',
               dabeli:'🌮', vada:'🍞', coke:'🥤', cheese:'🧀',
               combo:'🎉', garlic:'🥖', bread:'🥖', drink:'🥤' };
  const n = name.toLowerCase();
  for (const [k, v] of Object.entries(m)) if (n.includes(k)) return v;
  return '🍽️';
}

function _setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ── WIRE CART BTN ── */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#cart-btn')?.addEventListener('click', openCart);

  // Legacy compat: if page has cart-btn with old class
  document.querySelectorAll('.cart-btn').forEach(btn => {
    btn.addEventListener('click', openCart);
  });

  // Initial render
  renderCart();
  _updateBadge();
});

/* ── EXPOSE GLOBALS (for inline onclick handlers) ── */
window.openCart        = openCart;
window.closeCart       = closeCart;
window.addToCart       = addToCart;
window.removeCartItem  = removeCartItem;
window.cartRemoveItem  = cartRemoveItem;
window.cartQtyChange   = cartQtyChange;
window.renderCart      = renderCart;
window.updateCartCount = updateCartCount;
window.updateBadge     = updateBadge;
window.showToast       = showToast;
