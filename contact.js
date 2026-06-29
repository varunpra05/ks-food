/* ============================================================
   KUMAR SNACKS — Contact Page JavaScript (contact.js)
   Features: Message form validation, Countdown, Sidebar Cart, Mobile Nav
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
