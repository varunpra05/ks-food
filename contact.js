/* ============================================================
   KUMAR SNACKS — Contact Page JavaScript (contact.js)
   Features: Message form validation, Countdown, Sidebar Cart, Mobile Nav
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────
   CART STATE (sessionStorage mapping)
────────────────────────────────────────── */
let cart = JSON.parse(sessionStorage.getItem('ks_cart') || '[]');

function saveCart() {
  sessionStorage.setItem('ks_cart', JSON.stringify(cart));
}

function getCartEmoji(name) {
  const map = {
    'pizza': '🍕', 'burger': '🍔', 'fries': '🍟',
    'sandwich': '🥪', 'dabeli': '🌮', 'vada': '🍞',
    'combo': '🎉', 'drink': '🥤'
  };
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(map)) {
    if (lower.includes(key)) return emoji;
  }
  return '🍽️';
}

function addToCart(name, price, qty = 1, emoji = '🍽️') {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ name, price: parseInt(price, 10), qty, emoji: emoji || getCartEmoji(name) });
  }
  saveCart();
  renderCart();
  updateCartCount();
  showToast(`✅ ${name} added to cart!`);
  animateCartBtn();
}

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
    container.innerHTML = '';
    container.appendChild(emptyEl);
    emptyEl.style.display = 'flex';
    footer.style.display  = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  footer.style.display  = 'block';

  let html = '';
  cart.forEach((item, idx) => {
    html += `
      <div class="cart-item">
        <span class="cart-item__emoji">${item.emoji}</span>
        <div class="cart-item__info">
          <h4>${item.name}</h4>
          <span>₹${item.price} × ${item.qty}</span>
        </div>
        <span class="cart-item__price">₹${item.price * item.qty}</span>
        <button class="cart-item__remove" onclick="removeFromCart(${idx})" aria-label="Remove">✕</button>
      </div>`;
  });
  container.innerHTML = html;

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  document.getElementById('cart-total-price').textContent = `₹${total}`;
}

function updateCartCount() {
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  const badge = document.getElementById('cart-count');
  if (!badge) return;
  badge.textContent = total;
  if (total > 0) {
    badge.classList.add('visible');
  } else {
    badge.classList.remove('visible');
  }
}

function animateCartBtn() {
  const btn = document.getElementById('cart-btn');
  if (!btn) return;
  btn.style.transform = 'scale(1.2)';
  setTimeout(() => { btn.style.transform = ''; }, 300);
}

/* ──────────────────────────────────────────
   CART SIDEBAR TOGGLE
────────────────────────────────────────── */
function openCart() {
  document.getElementById('cart-sidebar').classList.add('open');
  document.getElementById('cart-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cart-sidebar').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('cart-btn')?.addEventListener('click', openCart);
document.getElementById('cart-close-btn')?.addEventListener('click', closeCart);
document.getElementById('cart-overlay')?.addEventListener('click', closeCart);

document.getElementById('checkout-btn')?.addEventListener('click', () => {
  showToast('🎉 Order placed! Thank you for choosing Kumar Snacks!');
  cart = [];
  saveCart();
  renderCart();
  updateCartCount();
  closeCart();
});

/* ──────────────────────────────────────────
   TOAST
────────────────────────────────────────── */
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}

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

mobileNav?.querySelectorAll('.mobile-nav__link').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    burgerBtn?.classList.remove('open');
    burgerBtn?.setAttribute('aria-expanded', false);
  });
});

/* ──────────────────────────────────────────
   CONTACT MSG FORM SUBMISSION
────────────────────────────────────────── */
document.getElementById('contact-msg-form')?.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const nameVal = document.getElementById('m-name').value.trim();
  const emailVal = document.getElementById('m-email').value.trim();
  const phoneVal = document.getElementById('m-phone').value.trim();
  const subjectVal = document.getElementById('m-subject').value;
  const messageVal = document.getElementById('m-message').value.trim();
  
  let valid = true;
  
  // Basic validation helpers
  const nameInput = document.getElementById('m-name');
  const emailInput = document.getElementById('m-email');
  const phoneInput = document.getElementById('m-phone');
  const subjectInput = document.getElementById('m-subject');
  const messageInput = document.getElementById('m-message');
  
  // Clear error classes
  [nameInput, emailInput, phoneInput, subjectInput, messageInput].forEach(inp => {
    inp?.classList.remove('error');
  });

  if (!nameVal) { nameInput?.classList.add('error'); valid = false; }
  if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) { emailInput?.classList.add('error'); valid = false; }
  if (!phoneVal || !/^\+?[0-9\s\-]{8,15}$/.test(phoneVal)) { phoneInput?.classList.add('error'); valid = false; }
  if (!subjectVal) { subjectInput?.classList.add('error'); valid = false; }
  if (!messageVal || messageVal.length < 10) { messageInput?.classList.add('error'); valid = false; }

  if (!valid) {
    showToast('⚠️ Please correct the highlighted errors');
    return;
  }
  
  showToast(`🎉 Message Sent! We will get back to you, ${nameVal}!`);
  this.reset();
});

/* ──────────────────────────────────────────
   MAP INTERACTION
────────────────────────────────────────── */
document.querySelectorAll('.map-landmark').forEach(landmark => {
  landmark.addEventListener('click', () => {
    const label = landmark.querySelector('.landmark-name')?.textContent || 'Landmark';
    showToast(`📍 Selected landmark: ${label}`);
  });
});

/* ──────────────────────────────────────────
   INITIALIZATION
────────────────────────────────────────── */
renderCart();
updateCartCount();

window.removeFromCart = removeFromCart;
