'use strict';

/* ─────────────────────────────────────────
   GLOBAL STATE VARIABLES (Declared above TDZ)
───────────────────────────────────────── */
let galleryItems = [];
let currentSlide = 0;
let selectedSizeName = '';
let selectedSizePrice = 0;
let qty = 1;
/* cart state managed by cart-drawer.js */

/* ─────────────────────────────────────────
   READ URL PARAM & LOAD PRODUCT
───────────────────────────────────────── */
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

const product = productId ? window.KS_DB.getById(productId) : null;

if (!product) {
  document.getElementById('product-not-found').style.display = 'block';
} else {
  populatePage(product);
}

/* ─────────────────────────────────────────
   POPULATE ALL PAGE SECTIONS
───────────────────────────────────────── */
function populatePage(p) {
  // Update page title & meta
  document.title = `${p.name} – Kumar Snacks`;
  document.querySelector('meta[name="description"]').setAttribute('content', (p.description || '').slice(0, 160));

  // Breadcrumb
  document.getElementById('bc-cat').textContent = capitalize(p.category);
  document.getElementById('bc-name').textContent = p.name;

  // Show all sections
  ['product-section','addons-section','details-section','reviews-section','similar-section']
    .forEach(id => { const el = document.getElementById(id); if (el) el.style.display = ''; });

  // --- GALLERY ---
  const gallery = [];
  if (p.uploadedVideo) {
    gallery.push({ type: 'video', url: p.uploadedVideo });
  }
  // Always start with the main product image
  gallery.push({ type: 'image', url: window.KS_DB.getProductImage(p) });
  
  if (p.gallery && Array.isArray(p.gallery) && p.gallery.length) {
    p.gallery.forEach(em => {
      const imgUrl = window.KS_DB.getFallbackImageByEmojiOrName(em, p.name);
      if (!gallery.some(item => item.url === imgUrl)) {
        gallery.push({ type: 'image', url: imgUrl });
      }
    });
  }
  setGallery(gallery);

  // Bestseller badge
  const bsBadge = document.getElementById('badge-bestseller');
  if (bsBadge) bsBadge.style.display = p.isBestseller ? '' : 'none';

  // --- PRODUCT INFO ---
  // VEG badge
  const vegBadge = document.getElementById('veg-badge');
  if (vegBadge) { vegBadge.style.display = p.isVeg ? 'inline-flex' : 'none'; }

  // Name
  setText('product-name', p.name);

  // Rating
  setText('rating-num', p.rating);
  setText('rating-count', `(${p.reviews} reviews)`);
  renderStars('stars-row', p.rating);

  // Description
  setText('product-desc', p.description || "Delicious snack cooked fresh to order using the finest ingredients and served warm.");

  // Meta
  setText('meta-delivery', p.deliveryTime || '20-30 mins');
  setText('meta-cal', `${p.calories || '—'} kcal`);

  // Prices
  setText('price-current', `₹${p.price}`);
  const oldEl = document.getElementById('price-old');
  const offEl = document.getElementById('price-off');
  if (p.originalPrice && p.originalPrice > p.price) {
    oldEl.textContent = `₹${p.originalPrice}`; oldEl.style.display = '';
  }
  if (p.discount) {
    offEl.textContent = `${p.discount}% OFF`; offEl.style.display = '';
  }

  // Sizes
  renderSizes(p);

  // Hype text
  const hype = Math.floor(Math.random() * 40) + 10;
  setText('hype-text', `${hype} people added in cart last 1 hour`);

  // Qty + cart
  setupQtyCart(p);

  // Wishlist
  setupWishlist(p);

  // --- ADD-ONS ---
  renderAddons(p);

  // --- COMBO ---
  if (p.combo) renderCombo(p);

  // --- DESCRIPTION TABS ---
  setText('desc-text', p.description || "Delicious snack cooked fresh to order using the finest ingredients and served warm.");
  renderDescTags(p.tags || []);
  renderIngredients(p.ingredients || []);
  renderNutrition(p.nutrition || {});

  // Delivery info
  setText('d-delivery', p.deliveryTime || '—');
  setText('d-packaging', p.packaging || 'Safe & Hygienic');
  setText('d-best', p.bestEnjoyedWith || '—');

  // --- REVIEWS ---
  renderReviews(p);

  // --- SIMILAR ---
  renderSimilar(p);

  // Reveal animations
  applyReveal();
}

/* ─────────────────────────────────────────
   GALLERY
───────────────────────────────────────── */

function setGallery(items) {
  galleryItems = items || [];
  currentSlide = 0;

  const thumbsEl = document.getElementById('gallery-thumbs');
  if (thumbsEl) {
    thumbsEl.innerHTML = galleryItems.map((item, i) => {
      let content = '';
      if (item.type === 'video') {
        content = `<span style="font-size:1.2rem;">🎥</span>`;
      } else if (item.type === 'image') {
        content = `<img src="${item.url}" style="width:100%; height:100%; object-fit:cover; border-radius:4px; display:block;"/>`;
      } else {
        content = `<span>${item.value || '🍔'}</span>`;
      }
      return `<div class="gallery__thumb ${i === 0 ? 'active' : ''}" data-idx="${i}" id="thumb-${i}" onclick="setGallerySlide(${i})">${content}</div>`;
    }).join('');
  }

  if (galleryItems.length > 0) {
    renderMainSlide(0);
  }
}

function renderMainSlide(idx) {
  const el = document.getElementById('gallery-main-img');
  if (!el) return;
  
  const item = galleryItems[idx];
  if (!item) return;
  
  let content = '';
  if (item.type === 'video') {
    content = `<video src="${item.url}" controls style="width:100%; height:100%; object-fit:contain; border-radius:12px; z-index:10; position:relative; background:#000; display:block; margin:0 auto;"></video>`;
  } else if (item.type === 'image') {
    content = `<img src="${item.url}" style="width:100%; height:100%; object-fit:cover; z-index:10; position:relative; display:block; border-radius:12px;"/>`;
  } else {
    content = `<div class="product-visual"><span class="pv__emoji">${item.value || '🍔'}</span><div class="pv__plate"></div></div>`;
  }
  
  el.innerHTML = content;
  document.querySelectorAll('.gallery__thumb').forEach((t, i) => t.classList.toggle('active', i === idx));
}

function setGallerySlide(idx) {
  if (galleryItems.length === 0) return;
  currentSlide = (idx + galleryItems.length) % galleryItems.length;
  renderMainSlide(currentSlide);
}

document.getElementById('gal-prev')?.addEventListener('click', () => setGallerySlide(currentSlide - 1));
document.getElementById('gal-next')?.addEventListener('click', () => setGallerySlide(currentSlide + 1));
setInterval(() => {
  if (galleryItems.length && galleryItems[currentSlide] && galleryItems[currentSlide].type !== 'video') {
    setGallerySlide(currentSlide + 1);
  }
}, 4000);

/* ─────────────────────────────────────────
   STARS RENDER
───────────────────────────────────────── */
function renderStars(containerId, rating) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= full) html += '<span class="star filled">★</span>';
    else if (i === full + 1 && half) html += '<span class="star half">★</span>';
    else html += '<span class="star">★</span>';
  }
  el.innerHTML = html;
}

/* ─────────────────────────────────────────
   SIZES
───────────────────────────────────────── */

function renderSizes(p) {
  const container = document.getElementById('size-options');
  if (!container || !p.sizes) return;
  const entries = Object.entries(p.sizes);
  if (entries.length === 0) return;

  selectedSizeName = entries[0][0];
  selectedSizePrice = entries[0][1];

  container.innerHTML = entries.map(([name, price], i) => `
    <label class="size-opt ${i === 0 ? 'active' : ''}" id="size-${i}" onclick="selectSize('${name}', ${price}, ${i})">
      <input type="radio" name="size" value="${name}" ${i === 0 ? 'checked' : ''}/>
      <span class="size-opt__name">${name}</span>
      <span class="size-opt__price">₹${price}</span>
    </label>`).join('');
}

function selectSize(name, price, idx) {
  selectedSizeName = name;
  selectedSizePrice = price;
  document.querySelectorAll('.size-opt').forEach((el, i) => el.classList.toggle('active', i === idx));
  document.getElementById('price-current').textContent = `₹${price}`;
}

/* ─────────────────────────────────────────
   QTY + CART
───────────────────────────────────────── */

function setupQtyCart(p) {
  const qtyEl = document.getElementById('qty-value');
  document.getElementById('qty-minus')?.addEventListener('click', () => {
    if (qty > 1) { qty--; if (qtyEl) qtyEl.textContent = qty; }
  });
  document.getElementById('qty-plus')?.addEventListener('click', () => {
    qty++; if (qtyEl) qtyEl.textContent = qty;
  });
  document.getElementById('add-to-cart-btn')?.addEventListener('click', () => {
    const price = selectedSizePrice || p.price;
    const name  = selectedSizeName ? `${p.name} (${selectedSizeName})` : p.name;
    addToCart(name, price, qty, p.emoji);
  });
}

/* ─────────────────────────────────────────
   WISHLIST
───────────────────────────────────────── */
function setupWishlist(p) {
  let wishlisted = false;
  const btn = document.getElementById('btn-wishlist');
  btn?.addEventListener('click', () => {
    wishlisted = !wishlisted;
    btn.classList.toggle('active', wishlisted);
    btn.innerHTML = wishlisted
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="#e11d48" stroke="#e11d48" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
      : `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
    showToast(wishlisted ? '❤️ Added to Wishlist!' : '💔 Removed from Wishlist');
  });
}

/* ─────────────────────────────────────────
   ADD-ONS
───────────────────────────────────────── */
function renderAddons(p) {
  const container = document.getElementById('addons-list');
  if (!container || !p.addons) return;
  container.innerHTML = p.addons.map((a, i) => `
    <div class="addon-card" id="addon-${i}">
      <div class="addon-card__img"><span>${a.emoji || '🍽️'}</span></div>
      <p class="addon-card__name">${a.name}</p>
      <p class="addon-card__price">₹${a.price}</p>
      <button class="addon-add-btn" onclick="addToCart('${a.name.replace(/'/g,"\\'")}', ${a.price}, 1, '${a.emoji || '🍽️'}')">+</button>
    </div>`).join('');
}

/* ─────────────────────────────────────────
   COMBO
───────────────────────────────────────── */
function renderCombo(p) {
  const c = p.combo;
  if (!c) return;
  setText('combo-name', c.name);
  setText('combo-price', `₹${c.price}`);
  setText('combo-old', `₹${c.originalPrice || ''}`);
  const off = c.originalPrice ? Math.round((1 - c.price / c.originalPrice) * 100) : 0;
  setText('combo-off', off ? `${off}% off` : '');
  const visual = document.getElementById('combo-visual');
  if (visual && p.addons) {
    visual.innerHTML = (p.addons.slice(0, 3).map(a => a.emoji)).join(' ');
  }
  document.getElementById('add-combo-btn')?.addEventListener('click', () => {
    addToCart(c.name, c.price, 1, '🎉');
  });
}

/* ─────────────────────────────────────────
   DESCRIPTION TABS
───────────────────────────────────────── */
function renderDescTags(tags) {
  const el = document.getElementById('desc-tags');
  if (el) el.innerHTML = tags.map(t => `<span class="desc-tag">${t}</span>`).join('');
}
function renderIngredients(ings) {
  const el = document.getElementById('ing-list');
  if (el) el.innerHTML = ings.map(i => `<li>${i}</li>`).join('');
}
function renderNutrition(nut) {
  const tbody = document.getElementById('nut-body');
  if (!tbody) return;
  const labels = { calories: 'Calories', fat: 'Total Fat', carbs: 'Carbohydrates', protein: 'Protein', sodium: 'Sodium', fibre: 'Fibre' };
  tbody.innerHTML = Object.entries(nut).map(([k, v]) =>
    `<tr><td>${labels[k] || k}</td><td>${v}</td></tr>`).join('');
}

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`panel-${tab.dataset.tab}`)?.classList.add('active');
  });
});

/* ─────────────────────────────────────────
   REVIEWS
───────────────────────────────────────── */
function renderReviews(p) {
  const section = document.getElementById('reviews-section');
  if (!section) return;

  setText('rev-count-label', `(${p.reviews})`);
  setText('big-rating', p.rating);
  setText('big-sub', `Based on ${p.reviews} reviews`);
  renderStars('big-stars', p.rating);

  // Fake distribution based on rating
  const fives = Math.round(p.reviews * 0.66);
  const fours = Math.round(p.reviews * 0.21);
  const threes= Math.round(p.reviews * 0.08);
  const twos  = Math.round(p.reviews * 0.03);
  const ones  = p.reviews - fives - fours - threes - twos;

  setTimeout(() => {
    setBar('bar-5', 'cnt-5', fives, p.reviews);
    setBar('bar-4', 'cnt-4', fours, p.reviews);
    setBar('bar-3', 'cnt-3', threes, p.reviews);
    setBar('bar-2', 'cnt-2', twos, p.reviews);
    setBar('bar-1', 'cnt-1', ones, p.reviews);
  }, 400);

  const colorMap = { orange: 'rv-orange', pink: 'rv-pink', green: 'rv-green', purple: 'rv-purple' };
  const cards = document.getElementById('review-cards');
  if (cards && p.customerReviews) {
    cards.innerHTML = p.customerReviews.map((r, i) => `
      <div class="review-card" id="rv-${i}">
        <div class="review-card__header">
          <div class="reviewer-avatar ${colorMap[r.color] || 'rv-orange'}">${r.avatar || r.name[0]}</div>
          <div class="rv-meta">
            <strong>${r.name}</strong>
            <div class="rv-stars">${'⭐'.repeat(r.rating)}</div>
          </div>
          <span class="rv-date">${r.date}</span>
        </div>
        <p class="rv-text">${r.text}</p>
      </div>`).join('');
  }
}

function setBar(barId, cntId, count, total) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  const bar = document.getElementById(barId);
  const cnt = document.getElementById(cntId);
  if (bar) bar.style.width = pct + '%';
  if (cnt) cnt.textContent = count;
}

/* ─────────────────────────────────────────
   SIMILAR PRODUCTS
───────────────────────────────────────── */
function renderSimilar(p) {
  const container = document.getElementById('similar-slider');
  if (!container) return;

  const all = window.KS_DB.getAll();
  const similar = all.filter(x => x.id !== p.id && (x.category === p.category || x.isBestseller)).slice(0, 6);

  container.innerHTML = similar.map(s => `
    <div class="sim-card" onclick="window.location.href='product.html?id=${s.id}'" style="cursor:pointer">
      <button class="sim-wish" onclick="event.stopPropagation(); this.textContent = this.textContent==='♡'?'♥':'♡'; this.style.color = this.textContent==='♥'?'#e11d48':''">♡</button>
      <div class="sim-card__img">
        <img src="${window.KS_DB.getProductImage(s)}" alt="${s.name}" style="width:100%; height:100%; object-fit:cover; border-radius:8px; display:block;"/>
      </div>
      <div class="sim-card__body">
        <h3>${s.name}</h3>
        <p class="sim-price">₹${s.price}</p>
        <button class="btn-sim-add" onclick="event.stopPropagation(); addToCart('${s.name.replace(/'/g,"\\'")}', ${s.price}, 1, '${s.emoji}')">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          Add
        </button>
      </div>
    </div>`).join('');

  // Slider scroll
  document.getElementById('sim-prev')?.addEventListener('click', () => container.scrollBy({ left: -220, behavior: 'smooth' }));
  document.getElementById('sim-next')?.addEventListener('click', () => container.scrollBy({ left:  220, behavior: 'smooth' }));
}

/* Cart, addToCart, removeCartItem, renderCart, updateBadge,
   openCart, closeCart, showToast → handled by cart-drawer.js */

window.addEventListener('scroll', () => {
  document.getElementById('header')?.classList.toggle('scrolled', window.scrollY > 30);
  document.getElementById('scroll-top-btn')?.classList.toggle('visible', window.scrollY > 400);
});
document.getElementById('scroll-top-btn')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* Countdown */
let cdSec = 2 * 3600 + 45 * 60 + 30;
function tickCD() {
  if (cdSec < 0) cdSec = 3 * 3600;
  const h = Math.floor(cdSec / 3600);
  const m = Math.floor((cdSec % 3600) / 60);
  const s = cdSec % 60;
  const hEl = document.getElementById('cd-h'); if (hEl) hEl.textContent = String(h).padStart(2,'0');
  const mEl = document.getElementById('cd-m'); if (mEl) mEl.textContent = String(m).padStart(2,'0');
  const sEl = document.getElementById('cd-s'); if (sEl) sEl.textContent = String(s).padStart(2,'0');
  cdSec--;
}
tickCD(); setInterval(tickCD, 1000);

/* Mobile Nav */
const burgerBtn = document.getElementById('burger-btn');
const mobileNav = document.getElementById('mobile-nav');
burgerBtn?.addEventListener('click', () => { const o = mobileNav.classList.toggle('open'); burgerBtn.classList.toggle('open', o); });

/* Footer newsletter */
document.getElementById('footer-nl-form')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('footer-nl-email')?.value.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('⚠️ Enter a valid email'); return; }
  showToast('🎉 Subscribed!'); this.reset();
});

/* ─────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────── */
function applyReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.style.opacity='1'; e.target.style.transform='translateY(0)'; obs.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.addon-card, .sim-card, .review-card, .trust-item, .delivery-row, .meta-badge')
    .forEach((el, i) => {
      el.style.opacity='0'; el.style.transform='translateY(20px)';
      el.style.transition=`opacity 0.45s ease ${i*0.06}s, transform 0.45s ease ${i*0.06}s`;
      obs.observe(el);
    });
}

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

/* ─────────────────────────────────────────
   EXPORT INTERACTIVE FUNCTIONS TO WINDOW
───────────────────────────────────────── */
window.selectSize = selectSize;
window.setGallerySlide = setGallerySlide;
window.removeCartItem = removeCartItem;
window.addToCart = addToCart;

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
renderCart();
updateBadge();
