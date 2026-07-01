/* ============================================================
   KUMAR SNACKS — Revamped Admin Dashboard Coordinator (admin.js)
   Persists catalog and order registries. Drives sidebar submenus,
   dynamic pagination grids, media uploads, and SHA-256 authentications.
   ============================================================ */

'use strict';

// Pagination variables
const ITEMS_PER_PAGE = 5;
let currentPage = 1;
let currentProducts = [];
let searchQuery = '';

// Shared database indicators
let currentUploadedImage = '';
let currentUploadedVideo = '';
let isSetupMode = false;
let _deleteId = null;

// Default Orders DB Configuration
let orders = JSON.parse(localStorage.getItem('ks_orders') || '[]');
if (orders.length === 0) {
  orders = [
    { id: 'ORD-5482', customer: 'Ravi Patel', date: '2026-06-29', total: 249, status: 'Delivered', items: '🍕', details: 'Veg Pizza (x1)' },
    { id: 'ORD-9821', customer: 'Meera Shah', date: '2026-06-29', total: 128, status: 'Pending', items: '🍔🍟', details: 'Aloo Tikki Burger (x1), French Fries (x1)' },
    { id: 'ORD-1209', customer: 'Amit Shah', date: '2026-06-28', total: 49, status: 'Delivered', items: '🌮', details: 'Cheese Dabeli (x1)' },
    { id: 'ORD-4432', customer: 'Priya Patel', date: '2026-06-28', total: 158, status: 'Shipped', items: '🍔🥤', details: 'Veg Burger (x1), Cold Drink (x1)' },
    { id: 'ORD-7651', customer: 'Anil Mehta', date: '2026-06-27', total: 80, status: 'Cancelled', items: '🍟🥤', details: 'French Fries (x1), Cold Drink (x1)' }
  ];
  localStorage.setItem('ks_orders', JSON.stringify(orders));
}

/* ─────────────────────────────────────────
   SECTION/VIEW ROUTING
───────────────────────────────────────── */
function showSection(name) {
  // Hide all sections, display target
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.getElementById(`section-${name}`)?.classList.add('active');

  // Sync sidebar active links
  document.querySelectorAll('.sn-link, .sn-sub-link').forEach(l => l.classList.remove('active'));
  
  // Highlight navigation triggers
  const subLink = document.getElementById(`nav-${name}`);
  if (subLink) {
    subLink.classList.add('active');
    // Highlight parent accordion trigger
    const parentDD = subLink.closest('.sidebar-dropdown');
    if (parentDD) {
      parentDD.querySelector('.dropdown-trigger')?.classList.add('active');
    }
  } else {
    document.getElementById(`nav-${name}`)?.classList.add('active');
  }

  // Set Topbar titles matching reference
  const titles = {
    dashboard: ['Dashboard Overview', 'Review sales performance metrics'],
    products: ['Products / All Products', 'Manage your snack catalog list'],
    add: ['Products / Add Product', 'Fill in product details and media uploads'],
    orders: ['Orders / All Orders', 'Manage and dispatch customer orders'],
    customers: ['Customers Management', 'Review client accounts'],
    coupons: ['Coupons & Offers', 'Create sales codes'],
    reviews: ['Reviews Panel', 'Moderate ratings'],
    banners: ['Banners Config', 'Configure landing marketing slides'],
    delivery: ['Delivery Rules', 'Set dispatch locations'],
    payments: ['Payments Gateways', 'Configure sandbox merchant IDs'],
    reports: ['Store Reports', 'Download CSV analytics'],
    settings: ['Settings', 'Change parameters']
  };
  const [title, sub] = titles[name] || ['Admin Dashboard', ''];
  document.getElementById('section-title').textContent = title;
  document.getElementById('section-sub').textContent = sub;

  // Refresh data list on navigation
  if (name === 'products') {
    applySearchFilter();
    updateStats();
  } else if (name === 'dashboard') {
    renderDashboard();
  } else if (name === 'orders') {
    renderOrders();
  }

  // Close mobile sidebar and backdrop overlay if open
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebar-overlay')?.classList.remove('active');
}

function toggleSidebarDropdown(id) {
  const content = document.getElementById(id);
  if (!content) return;
  const isOpen = content.classList.toggle('open');
  const trigger = content.previousElementSibling;
  if (trigger) {
    trigger.classList.toggle('active', isOpen);
  }
}

/* ─────────────────────────────────────────
   DASHBOARD SCREEN
───────────────────────────────────────── */
function renderDashboard() {
  const allProducts = window.KS_DB.getAll();
  const activeCount = allProducts.filter(p => p.status !== 'inactive').length;
  
  // Update stats summary counts
  document.getElementById('dash-orders-count').textContent = orders.length;

  // Render recent orders table list
  const recentOrdersTbody = document.getElementById('dash-recent-orders-tbody');
  if (recentOrdersTbody) {
    const recent = orders.slice(0, 4);
    recentOrdersTbody.innerHTML = recent.map(o => `
      <tr>
        <td><strong>#${o.id}</strong></td>
        <td>${o.customer}</td>
        <td>${o.date}</td>
        <td><strong>₹${o.total}</strong></td>
        <td><span class="status-badge ${o.status === 'Delivered' ? 'status-badge--active' : 'status-badge--inactive'}">${o.status}</span></td>
      </tr>
    `).join('');
  }

  // Render Bestsellers panel list
  const bestsellersEl = document.getElementById('dash-bestsellers-list');
  if (bestsellersEl) {
    const topRated = [...allProducts].sort((a, b) => b.rating - a.rating).slice(0, 4);
    bestsellersEl.innerHTML = topRated.map(p => `
      <div class="bs-item">
        <span class="bs-item__icon">${p.emoji}</span>
        <div class="bs-item__info">
          <h5>${p.name}</h5>
          <span>Category: ${p.category} • ⭐ ${p.rating}</span>
        </div>
        <div class="bs-item__sales">${p.reviews} reviews</div>
      </div>
    `).join('');
  }
}

/* ─────────────────────────────────────────
   ORDERS SECTION
───────────────────────────────────────── */
function renderOrders(filterList = null) {
  const list = filterList || orders;
  const tbody = document.getElementById('orders-table-body');
  const empty = document.getElementById('orders-empty');
  
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'flex';
    return;
  }
  empty.style.display = 'none';

  tbody.innerHTML = list.map(o => `
    <tr>
      <td><strong>#${o.id}</strong></td>
      <td>${o.customer}</td>
      <td><span style="font-size:1.3rem;">${o.items}</span></td>
      <td>
        <span style="font-size:0.8rem; color:var(--text-dark); font-weight: 700; display:block; margin-bottom:4px;">${o.details || 'Snacks Order'}</span>
        ${o.address ? `
          <div class="order-admin-info" style="margin-top: 6px; padding: 8px 10px; background: #f9fafb; border-radius: 8px; font-size: 0.76rem; border: 1px solid #e5e7eb; color:#4b5563; line-height: 1.4;">
            <div style="margin-bottom: 2px;">📧 <strong>Email:</strong> ${o.email}</div>
            <div style="margin-bottom: 2px;">📞 <strong>Phone:</strong> ${o.phone}</div>
            <div style="margin-bottom: 2px;">📍 <strong>Deliver to:</strong> ${o.address}</div>
            <div>🚚 <strong>Ship via:</strong> ${o.deliveryMethod || 'Standard'}</div>
          </div>
        ` : `<div style="font-size:0.75rem; color:#9ca3af; font-style:italic;">Old checkout order (No contact/shipping info)</div>`}
      </td>
      <td>${o.date}</td>
      <td><strong>₹${o.total}</strong></td>
      <td>
        <span class="status-badge ${o.status === 'Delivered' || o.status === 'Completed' ? 'status-badge--active' : 'status-badge--inactive'}">${o.status}</span>
      </td>
      <td>
        <select onchange="updateOrderStatus('${o.id}', this.value)" style="padding: 4px 8px; border-radius: 4px; border: 1.5px solid var(--border); font-size: 0.78rem;">
          <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
          <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
          <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
    </tr>
  `).join('');
}

function updateOrderStatus(id, newStatus) {
  const o = orders.find(item => item.id === id);
  if (o) {
    o.status = newStatus;
    localStorage.setItem('ks_orders', JSON.stringify(orders));
    showToast(`📦 Order #${id} updated to ${newStatus}`);
    renderOrders();
  }
}

function searchOrders(val) {
  const query = val.toLowerCase().trim();
  const filtered = orders.filter(o => 
    o.customer.toLowerCase().includes(query) || 
    o.id.toLowerCase().includes(query) ||
    (o.details && o.details.toLowerCase().includes(query))
  );
  renderOrders(filtered);
}

/* ─────────────────────────────────────────
   PRODUCTS STATS
───────────────────────────────────────── */
function updateStats() {
  const all = window.KS_DB.getAll();
  const activeCount = all.filter(p => p.status !== 'inactive').length;
  const inactiveCount = all.filter(p => p.status === 'inactive').length;
  const categoriesCount = [...new Set(all.map(p => p.category))].length;

  document.getElementById('st-total').textContent   = all.length;
  document.getElementById('st-active').textContent  = activeCount;
  document.getElementById('st-inactive').textContent = inactiveCount;
  document.getElementById('st-cats').textContent    = categoriesCount;
}

/* ─────────────────────────────────────────
   PRODUCTS TABLE RENDERING
───────────────────────────────────────── */
function searchProducts(val) {
  searchQuery = val.toLowerCase().trim();
  applySearchFilter();
}

function applySearchFilter() {
  const all = window.KS_DB.getAll();
  currentProducts = all.filter(p => p.name.toLowerCase().includes(searchQuery) || p.category.toLowerCase().includes(searchQuery));
  currentPage = 1;
  renderTable();
}

function renderTable() {
  const tbody = document.getElementById('product-table-body');
  const empty = document.getElementById('table-empty');
  const countLabel = document.getElementById('table-showing-count');

  if (!tbody) return;

  const total = currentProducts.length;

  if (total === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'flex';
    countLabel.textContent = 'Showing 0 of 0 products';
    renderPagination(0);
    return;
  }
  empty.style.display = 'none';

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx   = Math.min(startIdx + ITEMS_PER_PAGE, total);
  const itemsToShow = currentProducts.slice(startIdx, endIdx);

  countLabel.textContent = `Showing ${startIdx + 1} to ${endIdx} of ${total} products`;

  tbody.innerHTML = itemsToShow.map(p => {
    // Check if custom uploaded image exists
    const imgHTML = p.uploadedImage 
      ? `<img src="${p.uploadedImage}" alt="${p.name}" />`
      : `<span style="font-size:1.6rem; line-height: 1;">${p.emoji}</span>`;

    const isFeatured = !!p.isFeatured;
    const stock = p.stock || 120;
    const status = p.status || 'active';
    const activeBadgeHTML = status === 'active' 
      ? `<span class="status-badge status-badge--active">Active</span>`
      : `<span class="status-badge status-badge--inactive">Inactive</span>`;

    return `
      <tr id="row-${p.id}">
        <td>
          <div class="pt-thumb-wrap">${imgHTML}</div>
        </td>
        <td>
          <div style="font-weight: 700; color: #0f172a;">${p.name}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">ID: #${p.id}</div>
        </td>
        <td><span class="status-badge status-badge--active" style="background:#f1f5f9; color:var(--text);">${capitalize(p.category)}</span></td>
        <td><strong>₹${p.price}</strong></td>
        <td><strong>${stock}</strong></td>
        <td>${activeBadgeHTML}</td>
        <td>
          <button class="btn-star ${isFeatured ? 'active' : ''}" onclick="toggleFeatured(${p.id}, this)">★</button>
        </td>
        <td>
          <div class="tr-actions">
            <button class="row-btn row-btn--edit" onclick="editProduct(${p.id})" title="Edit Product">✏️</button>
            <button class="row-btn row-btn--view" onclick="window.open('product.html?id=${p.id}')" title="View Product Page">👁️</button>
            <button class="row-btn row-btn--delete" onclick="openDeleteModal(${p.id}, '${p.name.replace(/'/g, "\\'")}')" title="Delete Product">🗑️</button>
          </div>
        </td>
      </tr>`;
  }).join('');

  renderPagination(total);
}

function renderPagination(totalItems) {
  const container = document.getElementById('table-pagination');
  if (!container) return;

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';
  // Prev Arrow
  html += `<button class="pg-btn ${currentPage === 1 ? 'disabled' : ''}" onclick="goToPage(${currentPage - 1})">‹</button>`;

  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="pg-btn ${currentPage === i ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }

  // Next Arrow
  html += `<button class="pg-btn ${currentPage === totalPages ? 'disabled' : ''}" onclick="goToPage(${currentPage + 1})">›</button>`;

  container.innerHTML = html;
}

function goToPage(p) {
  currentPage = p;
  renderTable();
}

function toggleFeatured(id, btn) {
  const p = window.KS_DB.getById(id);
  if (p) {
    p.isFeatured = !p.isFeatured;
    window.KS_DB.update(id, p);
    btn.classList.toggle('active', p.isFeatured);
    showToast(p.isFeatured ? `⭐ Added "${p.name}" to featured section` : `⭐ Removed "${p.name}" from featured section`);
  }
}

/* ─────────────────────────────────────────
   MEDIA PREVIEW HANDLERS
───────────────────────────────────────── */
function convertGoogleDriveLink(url) {
  if (!url || !url.includes('drive.google.com')) return url;
  try {
    let id = '';
    if (url.includes('/file/d/')) {
      id = url.split('/file/d/')[1].split('/')[0];
    } else if (url.includes('id=')) {
      id = url.split('id=')[1].split('&')[0];
    }
    if (id) {
      return `https://drive.google.com/uc?export=download&id=${id}`;
    }
  } catch (e) {
    console.error("Error parsing Google Drive link:", e);
  }
  return url;
}

function previewImageFile(input) {
  const file = input.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    currentUploadedImage = e.target.result;
    document.getElementById('img-preview-box').innerHTML = `<img src="${currentUploadedImage}" alt="Preview"/>`;
    document.getElementById('f-image-url').value = '';
  };
  reader.readAsDataURL(file);
}

function previewImageUrl(val) {
  const converted = convertGoogleDriveLink(val.trim());
  currentUploadedImage = converted;
  const previewBox = document.getElementById('img-preview-box');
  if (converted) {
    previewBox.innerHTML = `<img src="${converted}" alt="Preview"/>`;
  } else {
    previewBox.innerHTML = `<div class="upload-placeholder"><span class="up-icon">📂</span><strong>Click or drag image to upload</strong><p>PNG, JPG, WEBP up to 2MB</p></div>`;
  }
}

function previewVideoFile(input) {
  const file = input.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    currentUploadedVideo = e.target.result;
    document.getElementById('video-preview-box').innerHTML = `<video src="${currentUploadedVideo}" controls></video>`;
    document.getElementById('f-video-url').value = '';
  };
  reader.readAsDataURL(file);
}

function previewVideoUrl(val) {
  const converted = convertGoogleDriveLink(val.trim());
  currentUploadedVideo = converted;
  const previewBox = document.getElementById('video-preview-box');
  if (converted) {
    previewBox.innerHTML = `<video src="${converted}" controls></video>`;
  } else {
    previewBox.innerHTML = `<div class="upload-placeholder"><span class="up-icon">🎥</span><strong>Click or drag video to upload</strong><p>MP4 video up to 10MB</p></div>`;
  }
}

/* ─────────────────────────────────────────
   FORM PANEL ADD & EDIT
───────────────────────────────────────── */
function openAddForm() {
  clearForm();
  document.getElementById('form-title').textContent = 'Add New Product';
  document.getElementById('btn-save').textContent   = 'Save Product';
  document.getElementById('f-id').value             = '';
}

function clearForm() {
  document.getElementById('product-form').reset();
  document.getElementById('f-id').value = '';
  document.getElementById('emoji-preview').textContent = '🍔';
  document.getElementById('sizes-editor').innerHTML = sizeRowHTML('', '');
  document.getElementById('addons-editor').innerHTML = addonRowHTML('', '', '');
  
  currentUploadedImage = '';
  currentUploadedVideo = '';
  document.getElementById('img-preview-box').innerHTML = `<div class="upload-placeholder"><span class="up-icon">📂</span><strong>Click or drag image to upload</strong><p>PNG, JPG, WEBP up to 2MB</p></div>`;
  document.getElementById('video-preview-box').innerHTML = `<div class="upload-placeholder"><span class="up-icon">🎥</span><strong>Click or drag video to upload</strong><p>MP4 video up to 10MB</p></div>`;
}

function editProduct(id) {
  const p = window.KS_DB.getById(id);
  if (!p) return;

  showSection('add');
  document.getElementById('form-title').textContent = `Edit: ${p.name}`;
  document.getElementById('btn-save').textContent   = 'Update Product';

  // Populate form fields
  document.getElementById('f-id').value             = p.id;
  document.getElementById('f-name').value           = p.name;
  document.getElementById('f-emoji').value          = p.emoji;
  document.getElementById('emoji-preview').textContent = p.emoji;
  document.getElementById('f-category').value       = p.category;
  document.getElementById('f-subcategory').value    = p.subcategory || '';
  
  document.getElementById('f-price').value          = p.price;
  document.getElementById('f-original-price').value = p.originalPrice || '';
  document.getElementById('f-discount').value       = p.discount || '';
  document.getElementById('f-stock').value          = p.stock || 120;
  document.getElementById('f-sku').value            = p.sku || `KS-SNK-${p.id}`;
  document.getElementById('f-status').value         = p.status || 'active';
  
  document.getElementById('f-featured').checked     = !!p.isFeatured;
  document.getElementById('f-veg').checked          = !!p.isVeg;
  document.getElementById('f-bestseller').checked   = !!p.isBestseller;
  
  document.getElementById('f-rating').value         = p.rating || '';
  document.getElementById('f-reviews').value        = p.reviews || '';
  document.getElementById('f-calories').value       = p.calories || '';
  document.getElementById('f-delivery').value       = p.deliveryTime || '';
  document.getElementById('f-best').value           = p.bestEnjoyedWith || '';
  document.getElementById('f-packaging').value      = p.packaging || '';
  document.getElementById('f-description').value    = p.description || '';
  document.getElementById('f-tags').value           = (p.tags || []).join(', ');

  // Sizes List
  const sizesEl = document.getElementById('sizes-editor');
  if (p.sizes && Object.keys(p.sizes).length) {
    sizesEl.innerHTML = Object.entries(p.sizes).map(([n, v]) => sizeRowHTML(n, v)).join('');
  } else {
    sizesEl.innerHTML = sizeRowHTML('', '');
  }

  // Addons List
  const addonsEl = document.getElementById('addons-editor');
  if (p.addons && p.addons.length) {
    addonsEl.innerHTML = p.addons.map(a => addonRowHTML(a.emoji || '', a.name, a.price)).join('');
  } else {
    addonsEl.innerHTML = addonRowHTML('', '', '');
  }

  // Combos
  if (p.combo) {
    document.getElementById('f-combo-name').value  = p.combo.name || '';
    document.getElementById('f-combo-price').value = p.combo.price || '';
    document.getElementById('f-combo-old').value   = p.combo.originalPrice || '';
  }

  // Load Media Uploads
  currentUploadedImage = p.uploadedImage || '';
  currentUploadedVideo = p.uploadedVideo || '';
  
  const imgPreview = document.getElementById('img-preview-box');
  const imgUrlInput = document.getElementById('f-image-url');
  if (currentUploadedImage) {
    imgPreview.innerHTML = `<img src="${currentUploadedImage}" alt="Preview"/>`;
    imgUrlInput.value = currentUploadedImage.startsWith('data:image') ? '' : currentUploadedImage;
  } else {
    imgPreview.innerHTML = `<div class="upload-placeholder"><span class="up-icon">📂</span><strong>Click or drag image to upload</strong><p>PNG, JPG, WEBP up to 2MB</p></div>`;
    imgUrlInput.value = '';
  }

  const videoPreview = document.getElementById('video-preview-box');
  const videoUrlInput = document.getElementById('f-video-url');
  if (currentUploadedVideo) {
    videoPreview.innerHTML = `<video src="${currentUploadedVideo}" controls></video>`;
    videoUrlInput.value = currentUploadedVideo.startsWith('data:video') ? '' : currentUploadedVideo;
  } else {
    videoPreview.innerHTML = `<div class="upload-placeholder"><span class="up-icon">🎥</span><strong>Click or drag video to upload</strong><p>MP4 video up to 10MB</p></div>`;
    videoUrlInput.value = '';
  }
}

/* ─────────────────────────────────────────
   FORM SUBMISSION LOGIC
───────────────────────────────────────── */
function submitProductForm() {
  const name  = document.getElementById('f-name').value.trim();
  const emoji = document.getElementById('f-emoji').value.trim();
  const cat   = document.getElementById('f-category').value;
  const price = parseFloat(document.getElementById('f-price').value);
  const desc  = document.getElementById('f-description').value.trim();

  if (!name || !emoji || !cat || !price || !desc) {
    showToast('⚠️ Please fill all required fields');
    return;
  }

  // Gather Sizes
  const sizeRows = document.querySelectorAll('#sizes-editor .size-row');
  const sizes = {};
  sizeRows.forEach(row => {
    const n = row.querySelector('.sz-name')?.value.trim();
    const v = parseFloat(row.querySelector('.sz-price')?.value);
    if (n && v) sizes[n] = v;
  });
  if (Object.keys(sizes).length === 0) { sizes['Regular'] = price; }

  // Gather Add-ons
  const addonRows = document.querySelectorAll('#addons-editor .size-row');
  const addons = [];
  addonRows.forEach(row => {
    const em = row.querySelector('.sz-emoji')?.value.trim() || '🍽️';
    const n  = row.querySelector('.sz-name')?.value.trim();
    const v  = parseFloat(row.querySelector('.sz-price')?.value) || 0;
    if (n) addons.push({ emoji: em, name: n, price: v });
  });

  const tags = document.getElementById('f-tags').value.split(',').map(t => t.trim()).filter(Boolean);
  const comboName  = document.getElementById('f-combo-name').value.trim();
  const comboPrice = parseFloat(document.getElementById('f-combo-price').value) || 0;
  const comboOld   = parseFloat(document.getElementById('f-combo-old').value) || 0;
  const combo = comboName ? { name: comboName, price: comboPrice, originalPrice: comboOld } : null;

  const calories = parseInt(document.getElementById('f-calories').value) || 0;
  const nutrition = {
    calories: calories + ' kcal',
    fat:      Math.round(calories * 0.04) + 'g',
    carbs:    Math.round(calories * 0.13) + 'g',
    protein:  Math.round(calories * 0.025) + 'g',
    sodium:   Math.round(calories * 1.5) + 'mg',
    fibre:    Math.round(calories * 0.008) + 'g'
  };

  const productData = {
    name,
    emoji,
    category:      cat,
    subcategory:   document.getElementById('f-subcategory').value,
    price,
    originalPrice: parseFloat(document.getElementById('f-original-price').value) || 0,
    discount:      parseInt(document.getElementById('f-discount').value) || 0,
    stock:         parseInt(document.getElementById('f-stock').value) || 120,
    sku:           document.getElementById('f-sku').value.trim() || `KS-SNK-${Date.now()}`,
    status:        document.getElementById('f-status').value,
    isFeatured:    document.getElementById('f-featured').checked,
    isVeg:         document.getElementById('f-veg').checked,
    isBestseller:  document.getElementById('f-bestseller').checked,
    rating:        parseFloat(document.getElementById('f-rating').value) || 4.5,
    reviews:       parseInt(document.getElementById('f-reviews').value) || 0,
    calories,
    deliveryTime:  document.getElementById('f-delivery').value.trim() || '20-30 mins',
    bestEnjoyedWith: document.getElementById('f-best').value.trim() || 'Cold Drink',
    packaging:     document.getElementById('f-packaging').value.trim() || 'Safe & Hygienic box',
    description:   desc,
    nutrition,
    tags,
    combo,
    uploadedImage: currentUploadedImage || '',
    uploadedVideo: currentUploadedVideo || '',
    gallery: [emoji, '🥗', '🍅', '🧅', '🌿'],
    customerReviews: [
      { name: 'Happy Customer', avatar: 'H', color: 'orange', rating: 5, date: 'Recently', text: `Loved the freshness and packaging of ${name}!` }
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
}

/* ─────────────────────────────────────────
   DELETE AND MODAL OPTIONS
───────────────────────────────────────── */
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
  showToast('🗑️ Product deleted successfully');
  closeDeleteModal();
  applySearchFilter();
  updateStats();
});

document.getElementById('delete-modal')?.addEventListener('click', function(e) {
  if (e.target === this) closeDeleteModal();
});

/* ─────────────────────────────────────────
   ACCORDION ROW BUILDERS
───────────────────────────────────────── */
function sizeRowHTML(name, price) {
  return `<div class="size-row">
    <input type="text" placeholder="Size (e.g. Regular)" class="sz-name" value="${name}"/>
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
/* Custom additions */
function addAddonRow() { document.getElementById('addons-editor').insertAdjacentHTML('beforeend', addonRowHTML('', '', '')); }
function removeSizeRow(btn) { btn.closest('.size-row').remove(); }

document.getElementById('f-emoji')?.addEventListener('input', function() {
  document.getElementById('emoji-preview').textContent = this.value || '?';
});

/* ─────────────────────────────────────────
   RESET DATA
───────────────────────────────────────── */
function resetData() {
  if (!confirm('Reset all products to default? This cannot be undone.')) return;
  window.KS_DB.reset();
  showToast('♻️ Products reset to default');
  applySearchFilter();
  updateStats();
}

/* ─────────────────────────────────────────
   ADMIN SECURITY / AUTHENTICATION (SETUP & LOGIN)
───────────────────────────────────────── */
const DEFAULT_UN_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'; // "admin"
const DEFAULT_PW_HASH = '3559f13e73b22cfd89d6c3c54d1933d13264ee1612fb8ebcf7925e0c529d48b7'; // "developer"

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function toggleSetupMode(e) {
  if (e) e.preventDefault();
  isSetupMode = !isSetupMode;
  
  const subtitleEl = document.getElementById('login-subtitle');
  const logoEmojiEl = document.getElementById('login-logo-emoji');
  const lblUserEl = document.getElementById('lbl-username');
  const lblPassEl = document.getElementById('lbl-password');
  const btnSubmitEl = document.getElementById('btn-login-submit');
  const toggleLinkEl = document.getElementById('setup-mode-toggle');
  
  document.getElementById('l-username').value = '';
  document.getElementById('l-password').value = '';
  document.getElementById('login-error').style.display = 'none';

  if (isSetupMode) {
    if (subtitleEl) subtitleEl.textContent = 'Setup Admin Security';
    if (logoEmojiEl) logoEmojiEl.textContent = '⚙️';
    if (lblUserEl) lblUserEl.textContent = 'Choose New Username';
    if (lblPassEl) lblPassEl.textContent = 'Choose New Password';
    if (btnSubmitEl) btnSubmitEl.textContent = 'Save & Secure Dashboard';
    if (toggleLinkEl) toggleLinkEl.textContent = '🔑 Back to Unlock Login';
  } else {
    if (subtitleEl) subtitleEl.textContent = 'Admin Security Portal';
    if (logoEmojiEl) logoEmojiEl.textContent = '🔒';
    if (lblUserEl) lblUserEl.textContent = 'Username';
    if (lblPassEl) lblPassEl.textContent = 'Password';
    if (btnSubmitEl) btnSubmitEl.textContent = 'Unlock Dashboard';
    if (toggleLinkEl) toggleLinkEl.textContent = '⚙️ Setup Custom Admin Login';
  }
}

async function handleAdminAuthSubmit(e) {
  e.preventDefault();
  const userVal = document.getElementById('l-username').value.trim();
  const passVal = document.getElementById('l-password').value;
  const errorEl = document.getElementById('login-error');

  const uHash = await sha256(userVal);
  const pHash = await sha256(passVal);

  if (isSetupMode) {
    localStorage.setItem('ks_admin_un_hash', uHash);
    localStorage.setItem('ks_admin_pw_hash', pHash);
    showToast('💾 Credentials saved locally! Please login.');
    toggleSetupMode();
  } else {
    const expectedUnHash = localStorage.getItem('ks_admin_un_hash') || DEFAULT_UN_HASH;
    const expectedPwHash = localStorage.getItem('ks_admin_pw_hash') || DEFAULT_PW_HASH;

    if (uHash === expectedUnHash && pHash === expectedPwHash) {
      sessionStorage.setItem('ks_admin_auth', 'true');
      errorEl.style.display = 'none';
      document.getElementById('login-screen').style.opacity = '0';
      setTimeout(() => {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'flex';
        renderDashboard();
      }, 400);
      showToast('🔑 Welcome back, Admin!');
    } else {
      errorEl.style.display = 'block';
      errorEl.style.animation = 'none';
      errorEl.offsetHeight; // trigger reflow
      errorEl.style.animation = '';
    }
  }
}

function handleAdminLogout() {
  if (confirm('Lock dashboard and logout?')) {
    sessionStorage.removeItem('ks_admin_auth');
    window.location.reload();
  }
}

function toggleLoginPassword() {
  const input = document.getElementById('l-password');
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
}

function checkAdminAuth() {
  const isAuth = sessionStorage.getItem('ks_admin_auth') === 'true';
  const loginScreen = document.getElementById('login-screen');
  const dashboard = document.getElementById('admin-dashboard');

  if (isAuth) {
    loginScreen.style.display = 'none';
    dashboard.style.display = 'flex';
    renderDashboard();
  } else {
    loginScreen.style.display = 'flex';
    dashboard.style.display = 'none';
  }
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

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

/* ─────────────────────────────────────────
   INIT & EXPORTS
───────────────────────────────────────── */
checkAdminAuth();

window.previewImageFile = previewImageFile;
window.previewImageUrl = previewImageUrl;
window.previewVideoFile = previewVideoFile;
window.previewVideoUrl = previewVideoUrl;
window.handleAdminAuthSubmit = handleAdminAuthSubmit;
window.handleAdminLogout = handleAdminLogout;
window.toggleLoginPassword = toggleLoginPassword;
window.toggleSetupMode = toggleSetupMode;

window.showSection = showSection;
window.toggleSidebarDropdown = toggleSidebarDropdown;
window.submitProductForm = submitProductForm;
window.editProduct = editProduct;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.toggleFeatured = toggleFeatured;
window.goToPage = goToPage;
window.addSizeRow = addSizeRow;
window.addAddonRow = addAddonRow;
window.removeSizeRow = removeSizeRow;
window.updateOrderStatus = updateOrderStatus;
window.searchProducts = searchProducts;
window.searchOrders = searchOrders;
window.resetData = resetData;

function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  let overlay = document.getElementById('sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'sidebar-overlay';
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
  }
  const isOpen = sidebar.classList.toggle('open');
  overlay.classList.toggle('active', isOpen);
}
window.toggleMobileSidebar = toggleMobileSidebar;
