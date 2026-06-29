/* ============================================================
   KUMAR SNACKS — About Us Page JavaScript (about.js)
   Features: Cart state management, Countdown, Sticky menu, Mobile Nav
   ============================================================ */

'use strict';

/* Cart, openCart, closeCart, addToCart, showToast → handled by cart-drawer.js */

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
   INITIALIZATION
────────────────────────────────────────── */
renderCart();
updateCartCount();

// Bind global removeFromCart to window object so inline onclick works
window.removeFromCart = removeFromCart;
