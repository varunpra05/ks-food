'use strict';

/* ─────────────────────────────────────────
   SECTION SWITCHING
───────────────────────────────────────── */
function showSection(name) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.getElementById(`section-${name}`)?.classList.add('active');

  document.querySelectorAll('.sn-link').forEach(l => l.classList.remove('active'));
  document.getElementById(`nav-${name}`)?.classList.add('active');

  const titles = { products: ['Products', 'Manage your product catalog'], add: ['Add / Edit Product', 'Fill in the details below'] };
  const [title, sub] = titles[name] || ['Admin', ''];
  document.getElementById('section-title').textContent = title;
  document.getElementById('section-sub').textContent = sub;

  if (name === 'products') { renderTable(); updateStats(); }
}

/* ─────────────────────────────────────────
   STATS
───────────────────────────────────────── */
function updateStats() {
  const all = window.KS_DB.getAll();
  document.getElementById('st-total').textContent = all.length;
  document.getElementById('st-bs').textContent   = all.filter(p => p.isBestseller).length;
  document.getElementById('st-cats').textContent  = [...new Set(all.map(p => p.category))].length;
  document.getElementById('st-veg').textContent   = all.filter(p => p.isVeg).length;
}

/* ─────────────────────────────────────────
   PRODUCT TABLE
───────────────────────────────────────── */
let _allProducts = [];

function renderTable(products) {
  _allProducts = products || window.KS_DB.getAll();
  const tbody = document.getElementById('product-table-body');
  const empty = document.getElementById('table-empty');
  if (!tbody) return;

  if (_allProducts.length === 0) {
    tbody.innerHTML = ''; empty.style.display = 'flex'; return;
  }
  empty.style.display = 'none';

  tbody.innerHTML = _allProducts.map(p => `
    <tr id="row-${p.id}">
      <td>
        <div class="pt-product">
          <div class="pt-emoji">${p.emoji}</div>
          <div>
            <div class="pt-name">${p.name}</div>
            <div class="pt-cat">${p.category} ${p.isVeg ? '• <span class="badge badge--veg">Veg</span>' : ''} ${p.isBestseller ? '• <span class="badge badge--bs">⭐ Bestseller</span>' : ''}</div>
          </div>
        </div>
      </td>
      <td><span class="badge badge--cat">${capitalize(p.category)}</span></td>
      <td>
        <strong>₹${p.price}</strong>
        ${p.originalPrice ? `<br><small style="color:#9CA3AF;text-decoration:line-through">₹${p.originalPrice}</small>` : ''}
        ${p.discount ? `<br><small style="color:#EF4444;font-weight:700">${p.discount}% OFF</small>` : ''}
      </td>
      <td>
        <div class="pt-rating">
          <span class="star-filled">★</span>
          ${p.rating}
          <span style="color:#9CA3AF;font-size:0.75rem">(${p.reviews})</span>
        </div>
      </td>
      <td>
        <span style="display:inline-flex;align-items:center;gap:5px;font-size:0.78rem;font-weight:600;color:${p.isBestseller ? '#065F46' : '#6B7280'}">
          <span style="width:8px;height:8px;border-radius:50%;background:${p.isBestseller ? '#10B981' : '#D1D5DB'};display:inline-block"></span>
          ${p.isBestseller ? 'Bestseller' : 'Active'}
        </span>
      </td>
      <td>
        <div class="action-btns">
          <a href="product.html?id=${p.id}" target="_blank" class="btn-view">View</a>
          <button class="btn-edit" onclick="editProduct(${p.id})">Edit</button>
          <button class="btn-del" onclick="openDeleteModal(${p.id}, '${p.name.replace(/'/g, "\\'")}')">Delete</button>
        </div>
      </td>
    </tr>`).join('');
}

/* ─────────────────────────────────────────
   SEARCH + FILTER
───────────────────────────────────────── */
function searchProducts(q) {
  if (!q) { renderTable(); return; }
  const all = window.KS_DB.getAll();
  renderTable(all.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase())));
}

function filterProducts() {
  const cat  = document.getElementById('cat-filter').value;
  const sort = document.getElementById('sort-filter').value;
  let all = window.KS_DB.getAll();

  if (cat)  all = all.filter(p => p.category === cat);

  if (sort === 'price-asc')  all.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') all.sort((a, b) => b.price - a.price);
  if (sort === 'rating')     all.sort((a, b) => b.rating - a.rating);
  if (sort === 'name')       all.sort((a, b) => a.name.localeCompare(b.name));

  renderTable(all);
}

/* ─────────────────────────────────────────
   ADD FORM
───────────────────────────────────────── */
function openAddForm() {
  clearForm();
  document.getElementById('form-title').textContent = 'Add New Product';
  document.getElementById('btn-save').textContent   = 'Save Product';
  document.getElementById('f-id').value             = '';
  document.getElementById('section-title').textContent = 'Add Product';
  document.getElementById('section-sub').textContent   = 'Fill in the details below';
}

function clearForm() {
  document.getElementById('product-form').reset();
  document.getElementById('f-id').value = '';
  document.getElementById('emoji-preview').textContent = '🍔';
  // Reset size rows
  document.getElementById('sizes-editor').innerHTML = sizeRowHTML('', '');
  document.getElementById('addons-editor').innerHTML = addonRowHTML('', '', '');
}

/* ─────────────────────────────────────────
   EDIT PRODUCT
───────────────────────────────────────── */
function editProduct(id) {
  const p = window.KS_DB.getById(id);
  if (!p) return;

  showSection('add');
  document.getElementById('form-title').textContent = `Edit: ${p.name}`;
  document.getElementById('btn-save').textContent   = 'Update Product';
  document.getElementById('section-title').textContent = 'Edit Product';

  // Fill basic fields
  document.getElementById('f-id').value             = p.id;
  document.getElementById('f-name').value           = p.name;
  document.getElementById('f-emoji').value          = p.emoji;
  document.getElementById('emoji-preview').textContent = p.emoji;
  document.getElementById('f-category').value       = p.category;
  document.getElementById('f-price').value          = p.price;
  document.getElementById('f-original-price').value = p.originalPrice || '';
  document.getElementById('f-discount').value       = p.discount || '';
  document.getElementById('f-rating').value         = p.rating || '';
  document.getElementById('f-reviews').value        = p.reviews || '';
  document.getElementById('f-calories').value       = p.calories || '';
  document.getElementById('f-delivery').value       = p.deliveryTime || '';
  document.getElementById('f-veg').checked          = !!p.isVeg;
  document.getElementById('f-bestseller').checked   = !!p.isBestseller;
  document.getElementById('f-description').value    = p.description || '';
  document.getElementById('f-tags').value           = (p.tags || []).join(', ');
  document.getElementById('f-best').value           = p.bestEnjoyedWith || '';
  document.getElementById('f-packaging').value      = p.packaging || '';

  // Sizes
  const sizesEl = document.getElementById('sizes-editor');
  if (p.sizes && Object.keys(p.sizes).length) {
    sizesEl.innerHTML = Object.entries(p.sizes).map(([n, v]) => sizeRowHTML(n, v)).join('');
  } else {
    sizesEl.innerHTML = sizeRowHTML('', '');
  }

  // Add-ons
  const addonsEl = document.getElementById('addons-editor');
  if (p.addons && p.addons.length) {
    addonsEl.innerHTML = p.addons.map(a => addonRowHTML(a.emoji || '', a.name, a.price)).join('');
  } else {
    addonsEl.innerHTML = addonRowHTML('', '', '');
  }

  // Combo
  if (p.combo) {
    document.getElementById('f-combo-name').value  = p.combo.name || '';
    document.getElementById('f-combo-price').value = p.combo.price || '';
    document.getElementById('f-combo-old').value   = p.combo.originalPrice || '';
  }
}

/* ─────────────────────────────────────────
   SIZE / ADDON ROW HELPERS
───────────────────────────────────────── */
function sizeRowHTML(name, price) {
  return `<div class="size-row">
    <input type="text" placeholder="Size name (e.g. Regular)" class="sz-name" value="${name}"/>
    <input type="number" placeholder="Price ₹" class="sz-price" min="1" value="${price}"/>
    <button type="button" class="sz-remove" onclick="removeSizeRow(this)">−</button>
  </div>`;
}
function addonRowHTML(emoji, name, price) {
  return `<div class="size-row">
    <input type="text" placeholder="Emoji" class="sz-emoji" maxlength="4" value="${emoji}" style="max-width:60px"/>
    <input type="text" placeholder="Item name" class="sz-name" value="${name}"/>
    <input type="number" placeholder="Price ₹" class="sz-price" min="0" value="${price}"/>
    <button type="button" class="sz-remove" onclick="removeSizeRow(this)">−</button>
  </div>`;
}
function addSizeRow()  { document.getElementById('sizes-editor').insertAdjacentHTML('beforeend', sizeRowHTML('', '')); }
function addAddonRow() { document.getElementById('addons-editor').insertAdjacentHTML('beforeend', addonRowHTML('', '', '')); }
function removeSizeRow(btn) { btn.closest('.size-row').remove(); }

/* Live emoji preview */
document.getElementById('f-emoji')?.addEventListener('input', function() {
  document.getElementById('emoji-preview').textContent = this.value || '?';
});

/* ─────────────────────────────────────────
   FORM SUBMIT (Add / Update)
───────────────────────────────────────── */
document.getElementById('product-form')?.addEventListener('submit', function(e) {
  e.preventDefault();

  // Validate required
  const name  = document.getElementById('f-name').value.trim();
  const emoji = document.getElementById('f-emoji').value.trim();
  const cat   = document.getElementById('f-category').value;
  const price = parseFloat(document.getElementById('f-price').value);
  const desc  = document.getElementById('f-description').value.trim();

  if (!name || !emoji || !cat || !price || !desc) {
    showToast('⚠️ Please fill all required fields'); return;
  }

  // Collect sizes
  const sizeRows = document.querySelectorAll('#sizes-editor .size-row');
  const sizes = {};
  sizeRows.forEach(row => {
    const n = row.querySelector('.sz-name')?.value.trim();
    const v = parseFloat(row.querySelector('.sz-price')?.value);
    if (n && v) sizes[n] = v;
  });
  if (Object.keys(sizes).length === 0) { sizes['Regular'] = price; }

  // Collect add-ons
  const addonRows = document.querySelectorAll('#addons-editor .size-row');
  const addons = [];
  addonRows.forEach(row => {
    const em = row.querySelector('.sz-emoji')?.value.trim() || '🍽️';
    const n  = row.querySelector('.sz-name')?.value.trim();
    const v  = parseFloat(row.querySelector('.sz-price')?.value) || 0;
    if (n) addons.push({ emoji: em, name: n, price: v });
  });

  // Tags
  const tags = document.getElementById('f-tags').value.split(',').map(t => t.trim()).filter(Boolean);

  // Combo
  const comboName  = document.getElementById('f-combo-name').value.trim();
  const comboPrice = parseFloat(document.getElementById('f-combo-price').value) || 0;
  const comboOld   = parseFloat(document.getElementById('f-combo-old').value) || 0;
  const combo = comboName ? { name: comboName, price: comboPrice, originalPrice: comboOld } : null;

  // Nutrition (from calories only for simplicity)
  const calories = parseInt(document.getElementById('f-calories').value) || 0;
  const nutrition = {
    calories: calories + ' kcal',
    fat:      Math.round(calories * 0.04) + 'g',
    carbs:    Math.round(calories * 0.13) + 'g',
    protein:  Math.round(calories * 0.025) + 'g',
    sodium:   Math.round(calories * 1.5) + 'mg',
    fibre:    Math.round(calories * 0.008) + 'g'
  };

  // Gallery
  const gallery = [emoji, '🥗', '🍅', '🧅', '🌿'];

  const productData = {
    name,
    emoji,
    category:      cat,
    price,
    originalPrice: parseFloat(document.getElementById('f-original-price').value) || 0,
    discount:      parseInt(document.getElementById('f-discount').value) || 0,
    rating:        parseFloat(document.getElementById('f-rating').value) || 4.5,
    reviews:       parseInt(document.getElementById('f-reviews').value) || 0,
    calories:      calories,
    deliveryTime:  document.getElementById('f-delivery').value.trim() || '20-30 mins',
    isVeg:         document.getElementById('f-veg').checked,
    isBestseller:  document.getElementById('f-bestseller').checked,
    description:   desc,
    sizes,
    addons,
    tags,
    combo,
    bestEnjoyedWith: document.getElementById('f-best').value.trim() || 'Cold Drink',
    packaging:     document.getElementById('f-packaging').value.trim() || 'Safe & Hygienic',
    nutrition,
    gallery,
    customerReviews: [
      { name: 'Happy Customer', avatar: 'H', color: 'orange', rating: 5, date: 'Recently', text: `Really loved the ${name}! Will order again.` }
    ]
  };

  const editId = document.getElementById('f-id').value;

  if (editId) {
    window.KS_DB.update(editId, productData);
    showToast(`✅ "${name}" updated successfully!`);
  } else {
    window.KS_DB.add(productData);
    showToast(`✅ "${name}" added successfully!`);
  }

  clearForm();
  showSection('products');
  updateStats();
});

/* ─────────────────────────────────────────
   DELETE
───────────────────────────────────────── */
let _deleteId = null;

function openDeleteModal(id, name) {
  _deleteId = id;
  document.getElementById('delete-name').textContent = name;
  document.getElementById('delete-modal').classList.add('active');
}
function closeDeleteModal() {
  _deleteId = null;
  document.getElementById('delete-modal').classList.remove('active');
}

document.getElementById('confirm-delete-btn')?.addEventListener('click', () => {
  if (!_deleteId) return;
  window.KS_DB.delete(_deleteId);
  showToast('🗑️ Product deleted');
  closeDeleteModal();
  renderTable();
  updateStats();
});

document.getElementById('delete-modal')?.addEventListener('click', function(e) {
  if (e.target === this) closeDeleteModal();
});

/* ─────────────────────────────────────────
   RESET DATA
───────────────────────────────────────── */
function resetData() {
  if (!confirm('Reset all products to default? This cannot be undone.')) return;
  window.KS_DB.reset();
  showToast('♻️ Products reset to default');
  renderTable();
  updateStats();
}

/* ─────────────────────────────────────────
   TOAST
───────────────────────────────────────── */
let _tt;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg; el.classList.add('show');
  clearTimeout(_tt); _tt = setTimeout(() => el.classList.remove('show'), 3500);
}

/* ─────────────────────────────────────────
   HELPER
───────────────────────────────────────── */
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
renderTable();
updateStats();
