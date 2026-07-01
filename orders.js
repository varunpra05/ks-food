/* ============================================================
   KUMAR SNACKS — Orders Page Interaction Logic (orders.js)
   ============================================================ */

'use strict';

let ordersList = [];
let filteredOrders = [];
let activeOrder = null;
let currentFilter = 'all';
let searchQuery = '';

// Pagination state
const ITEMS_PER_PAGE = 5;
let currentPage = 1;

// --- INITIAL LOAD ---
document.addEventListener('DOMContentLoaded', () => {
  // 1. Load orders from localStorage
  loadOrdersFromStorage();

  // 2. Setup initial view routing
  const urlParams = new URLSearchParams(window.location.search);
  const sectionParam = urlParams.get('section');
  if (sectionParam) {
    showSection(sectionParam);
  } else {
    showSection('orders');
  }

  // 3. Setup window notifications badge count
  updateNotificationsBadge();
});

function loadOrdersFromStorage() {
  try {
    ordersList = JSON.parse(localStorage.getItem('ks_orders') || '[]');
  } catch (e) {
    console.error('Error loading ks_orders:', e);
    ordersList = [];
  }
  
  // Seed with default orders if absolutely empty, to match mockup preview if new user
  if (ordersList.length === 0) {
    ordersList = [
      {
        id: 'KS10078',
        customer: 'Ravi Patel',
        date: '25 May 2025 • 12:25 PM',
        total: 228,
        status: 'Preparing',
        deliveryMethod: 'Takeaway Pickup',
        phone: '+91 98765 43210',
        payment: 'Cash on Delivery',
        items: '🍔🍟',
        details: 'Classic Veg Burger (x1), Peri Peri French Fries (x1)'
      },
      {
        id: 'KS10065',
        customer: 'Ravi Patel',
        date: '23 May 2025 • 08:15 PM',
        total: 269,
        status: 'Delivered',
        deliveryMethod: 'Takeaway Pickup',
        phone: '+91 98765 43210',
        payment: 'Cash on Delivery',
        items: '🍕🥤',
        details: 'Cheese Burst Pizza (x1), Cold Drink (x1)'
      },
      {
        id: 'KS10050',
        customer: 'Ravi Patel',
        date: '20 May 2025 • 06:40 PM',
        total: 69,
        status: 'Cancelled',
        deliveryMethod: 'Takeaway Pickup',
        phone: '+91 98765 43210',
        payment: 'Cash on Delivery',
        items: '🌮',
        details: 'Cheese Dabeli (x1)'
      }
    ];
    localStorage.setItem('ks_orders', JSON.stringify(ordersList));
  }

  activeOrder = ordersList[0] || null;
}

function updateNotificationsBadge() {
  const badge = document.getElementById('noti-badge');
  if (!badge) return;
  const ongoing = ordersList.filter(o => {
    const st = (o.status || '').toLowerCase();
    return st === 'pending' || st === 'preparing' || st === 'ready';
  }).length;

  if (ongoing > 0) {
    badge.textContent = ongoing;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

// --- VIEW ROUTING ---
function showSection(name) {
  // Hide all sections
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  
  // Show active section
  const section = document.getElementById(`section-${name}`);
  if (section) section.classList.add('active');

  // Update Sidebar active state
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  const activeLink = Array.from(document.querySelectorAll('.sidebar-link')).find(l => {
    return l.getAttribute('onclick')?.includes(`'${name}'`);
  });
  if (activeLink) activeLink.classList.add('active');

  // Update Topbar Title
  const titles = {
    orders: 'Orders / My Orders',
    profile: 'Profile / Account Settings',
    addresses: 'Addresses / Delivery Locations',
    wishlist: 'Wishlist / Saved Items',
    support: 'Support / Contact Desk'
  };
  const titleEl = document.getElementById('section-title');
  if (titleEl) titleEl.textContent = titles[name] || 'Customer Dashboard';

  // Trigger specific panel render
  if (name === 'orders') {
    currentPage = 1;
    applyFilterAndSearch();
  }

  // Close mobile sidebar and backdrop overlay
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebar-overlay')?.classList.remove('active');
}

// --- SEARCH & FILTER LOGIC ---
function switchOrderTab(filter, btn) {
  currentFilter = filter;
  currentPage = 1;

  // Active styles
  document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
  btn.classList.add('active');

  applyFilterAndSearch();
}

function searchOrders(val) {
  searchQuery = val.toLowerCase().trim();
  currentPage = 1;
  applyFilterAndSearch();
}

function toggleFilterOptions() {
  showToast('⏳ Advanced filter options drawer toggled!');
}

function applyFilterAndSearch() {
  filteredOrders = ordersList.filter(o => {
    // 1. Status Filter
    const st = (o.status || 'Pending').toLowerCase();
    let statusMatch = true;
    if (currentFilter === 'ongoing') {
      statusMatch = (st === 'pending' || st === 'preparing' || st === 'ready' || st === 'shipped');
    } else if (currentFilter === 'completed') {
      statusMatch = (st === 'completed' || st === 'delivered');
    } else if (currentFilter === 'cancelled') {
      statusMatch = (st === 'cancelled');
    }

    // 2. Search Query Filter
    let searchMatch = true;
    if (searchQuery) {
      const idStr = String(o.id).toLowerCase();
      const detailsStr = String(o.details || '').toLowerCase();
      const custStr = String(o.customer || '').toLowerCase();
      searchMatch = idStr.includes(searchQuery) || detailsStr.includes(searchQuery) || custStr.includes(searchQuery);
    }

    return statusMatch && searchMatch;
  });

  renderOrdersLists();
}

// --- RENDER TABLES & MOBILE CARDS ---
function renderOrdersLists() {
  const tbody = document.getElementById('orders-table-body');
  const mobileContainer = document.getElementById('mobile-cards-container');
  const emptyState = document.getElementById('orders-empty');
  const paginationFooter = document.getElementById('pagination-footer');

  if (!tbody || !mobileContainer) return;

  if (filteredOrders.length === 0) {
    tbody.innerHTML = '';
    mobileContainer.innerHTML = '';
    emptyState.style.display = 'flex';
    paginationFooter.style.display = 'none';
    return;
  }
  
  emptyState.style.display = 'none';
  paginationFooter.style.display = 'flex';

  // Paginate items
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedList = filteredOrders.slice(startIndex, endIndex);

  // Update Pagination Info
  document.getElementById('showing-text').textContent = `Showing ${startIndex + 1} to ${endIndex} of ${totalItems} orders`;

  // Draw Pagination Controls
  const pagControls = document.getElementById('pagination-controls');
  if (pagControls) {
    let controlsHTML = `
      <button class="pg-btn ${currentPage === 1 ? 'disabled' : ''}" onclick="goToPage(${currentPage - 1})" aria-label="Previous">‹</button>
    `;
    for (let i = 1; i <= totalPages; i++) {
      controlsHTML += `
        <button class="pg-btn ${currentPage === i ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>
      `;
    }
    controlsHTML += `
      <button class="pg-btn ${currentPage === totalPages ? 'disabled' : ''}" onclick="goToPage(${currentPage + 1})" aria-label="Next">›</button>
    `;
    pagControls.innerHTML = controlsHTML;
  }

  // A. Render Desktop Table Rows
  tbody.innerHTML = paginatedList.map(o => {
    const st = (o.status || 'Pending').toLowerCase();
    
    // Parse order items inside string details e.g. "Classic Veg Burger (x1), Peri Peri French Fries (x1)"
    const parsedItems = parseDetailsString(o.details, o.items);

    return `
      <!-- Table Main row -->
      <tr class="table-main-row" id="row-${o.id}">
        <td><strong>#${o.id}</strong></td>
        <td>${o.date}</td>
        <td>${o.payment || 'Cash on Delivery'}</td>
        <td><span class="status-badge ${st}">${o.status}</span></td>
        <td><strong>₹${o.total}</strong></td>
        <td>
          <button class="btn-action-drop" onclick="toggleRowExpansion('${o.id}', this)" aria-label="Expand Order">▾</button>
        </td>
      </tr>
      <!-- Table Expanded Row containing items and details trigger -->
      <tr class="expanded-row" id="expanded-${o.id}">
        <td colspan="6" style="padding: 0;">
          <div class="expanded-card">
            <span class="expanded-title">${parsedItems.length} Items</span>
            <div class="expanded-items-list">
              ${parsedItems.map(item => `
                <div class="expanded-item">
                  <div class="expanded-item__info">
                    <div class="expanded-item__img">${item.emoji}</div>
                    <div>
                      <div class="expanded-item__name">${item.name}</div>
                      <div class="expanded-item__qty">Qty: ${item.qty}</div>
                    </div>
                  </div>
                  <div class="expanded-item__price">₹${item.price}</div>
                </div>
              `).join('')}
            </div>
            <div class="expanded-actions">
              <button class="btn-outline-details" onclick="openDetailsModal('${o.id}')">👁️ View Details</button>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // B. Render Mobile Cards
  mobileContainer.innerHTML = paginatedList.map(o => {
    const st = (o.status || 'Pending').toLowerCase();
    const parsedItems = parseDetailsString(o.details, o.items);

    return `
      <div class="order-mobile-card">
        <div class="mobile-card__header">
          <div>
            <span class="mobile-card__id">#${o.id}</span>
            <div class="mobile-card__date">${o.date}</div>
          </div>
          <span class="status-badge ${st}">${o.status}</span>
        </div>
        <div class="mobile-card__items">
          ${parsedItems.map(item => `
            <div class="mobile-card-item">
              <div class="mobile-card-item__info">
                <div class="mobile-card-item__img">${item.emoji}</div>
                <div class="mobile-card-item__name">${item.name}<span>(x${item.qty})</span></div>
              </div>
              <div class="mobile-card-item__price">₹${item.price}</div>
            </div>
          `).join('')}
        </div>
        <div class="mobile-card__footer">
          <div class="mobile-card__total">Total Amount: <strong>₹${o.total}</strong></div>
          <button class="btn-outline-details" onclick="openDetailsModal('${o.id}')">View Details</button>
        </div>
      </div>
    `;
  }).join('');
}

function goToPage(page) {
  currentPage = page;
  renderOrdersLists();
}

// Expand/Collapse table rows
function toggleRowExpansion(orderId, btn) {
  const targetRow = document.getElementById(`expanded-${orderId}`);
  if (!targetRow) return;

  const isExpanded = targetRow.classList.toggle('active');
  btn.classList.toggle('expanded', isExpanded);
}

// Parses string like "Classic Veg Burger (x1), Vada Pav (x2)" into item objects with icons and prices
function parseDetailsString(detailsStr = '', emojis = '🍽️') {
  if (!detailsStr) return [];
  const parts = detailsStr.split(', ');
  const emojiArr = Array.from(emojis);

  return parts.map((p, idx) => {
    // Match name and quantity
    const match = p.match(/(.+?)\s*\(x(\d+)\)/);
    const name = match ? match[1] : p;
    const qty = match ? parseInt(match[2], 10) : 1;
    const emoji = emojiArr[idx] || _getEmoji(name);

    // Approximate unit price lookup
    const price = _guessUnitPrice(name);

    return { name, qty, emoji, price };
  });
}

function _guessUnitPrice(name) {
  const n = name.toLowerCase();
  if (n.includes('burger')) return 79;
  if (n.includes('fries')) return 149;
  if (n.includes('pizza')) return 249;
  if (n.includes('dabeli')) return 49;
  if (n.includes('vada')) return 39;
  if (n.includes('sandwich')) return 119;
  if (n.includes('drink')) return 40;
  return 99; // Default fallback
}

function _getEmoji(name = '') {
  const m = { pizza:'🍕', burger:'🍔', dabeli:'🌮', vada:'🍞', coke:'🥤', cheese:'🧀',
               combo:'🎉', garlic:'🥖', bread:'🥖', drink:'🥤', fries:'🍟' };
  const n = name.toLowerCase();
  for (const [k, v] of Object.entries(m)) if (n.includes(k)) return v;
  return '🍽️';
}

// --- INTERACTIVE DETAILED TRACKING MODAL ---
function openDetailsModal(orderId) {
  const ord = ordersList.find(o => String(o.id) === String(orderId));
  if (!ord) return;
  activeOrder = ord;

  const modal = document.getElementById('details-modal');
  if (!modal) return;

  // 1. Draw Live Tracker Timeline
  const timelineEl = document.getElementById('modal-timeline');
  if (timelineEl) {
    const st = (ord.status || 'Pending').toLowerCase();
    const isCompleted = (st === 'completed' || st === 'delivered');
    const isReady = (st === 'ready' || isCompleted);
    const isPreparing = (st === 'preparing' || isReady);

    timelineEl.innerHTML = `
      <div class="timeline-step ${isCompleted ? 'completed' : (isReady ? 'active' : '')}">
        <div class="timeline-icon">${isCompleted ? '✓' : '🛵'}</div>
        <div class="timeline-info">
          <strong>Order Received &amp; Approved</strong>
          <p>Payment verified, and the kitchen staff has approved takeaway dispatch.</p>
        </div>
      </div>
      <div class="timeline-step ${isCompleted ? 'completed' : (isPreparing ? 'active' : '')}">
        <div class="timeline-icon">🍳</div>
        <div class="timeline-info">
          <strong>Preparing in Kitchen</strong>
          <p>Delicacies are being prepared with hygienic quality standards.</p>
        </div>
      </div>
      <div class="timeline-step ${isCompleted ? 'completed' : (isReady ? 'active' : '')}">
        <div class="timeline-icon">🛍️</div>
        <div class="timeline-info">
          <strong>Ready for Pickup / Takeaway</strong>
          <p>Your combo snack is packaged hot and fresh, waiting at the counter.</p>
        </div>
      </div>
      <div class="timeline-step ${isCompleted ? 'completed' : ''}">
        <div class="timeline-icon">✓</div>
        <div class="timeline-info">
          <strong>Takeaway Completed</strong>
          <p>Food bag collected counter-side. Thank you for ordering with us!</p>
        </div>
      </div>
    `;
  }

  // 2. Draw Receipt Meta details
  const metaEl = document.getElementById('modal-receipt-meta');
  if (metaEl) {
    metaEl.innerHTML = `
      <div class="modal-receipt-item">
        <span>Order Reference</span>
        <strong>#${ord.id}</strong>
      </div>
      <div class="modal-receipt-item">
        <span>Date &amp; Time</span>
        <strong>${ord.date}</strong>
      </div>
      <div class="modal-receipt-item">
        <span>Delivery Method</span>
        <strong>${ord.deliveryMethod || 'Takeaway Pickup'}</strong>
      </div>
      <div class="modal-receipt-item">
        <span>Contact Phone</span>
        <strong>${ord.phone || ''}</strong>
      </div>
    `;
  }

  // 3. Draw Receipt Invoice items
  const itemsTbody = document.getElementById('modal-receipt-items');
  if (itemsTbody) {
    const parsedItems = parseDetailsString(ord.details, ord.items);
    let itemsHTML = parsedItems.map(item => `
      <tr>
        <td><strong>${item.name}</strong></td>
        <td>₹${item.price}</td>
        <td>${item.qty}</td>
        <td><strong>₹${item.price * item.qty}</strong></td>
      </tr>
    `).join('');

    // Sum details card packaging & grand totals
    const subtotal = parsedItems.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
    const packaging = 15;
    const finalTotal = ord.total;

    itemsHTML += `
      <tr style="border-top: 1.5px solid var(--border);">
        <td colspan="3" style="text-align: right; color: var(--text-muted);">Subtotal</td>
        <td><strong>₹${subtotal}</strong></td>
      </tr>
      <tr>
        <td colspan="3" style="text-align: right; color: var(--text-muted);">Packaging Charges</td>
        <td><strong>₹${packaging}</strong></td>
      </tr>
      <tr style="border-top: 1.5px solid var(--border); font-size: 0.95rem;">
        <td colspan="3" style="text-align: right; color: var(--text-dark); font-weight: 800;">Grand Total</td>
        <td><strong style="color: var(--primary); font-size:1.15rem;">₹${finalTotal}</strong></td>
      </tr>
    `;
    itemsTbody.innerHTML = itemsHTML;
  }

  modal.classList.add('active');
}

function closeDetailsModal() {
  document.getElementById('details-modal')?.classList.remove('active');
}

// --- UTILITIES / TOAST / HELPERS ---
function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar && overlay) {
    const isOpen = sidebar.classList.toggle('open');
    overlay.classList.toggle('active', isOpen);
    
    // Add close listener to overlay
    overlay.onclick = () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    };
  }
}

function showToast(msg) {
  const toast = document.getElementById('orders-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 3500);
}

function showNotificationToast() {
  showToast('🔔 No new status updates. Check back in a few minutes!');
}

function submitTicket() {
  const subject = document.getElementById('ticket-subject').value;
  showToast(`🎫 Support ticket submitted successfully for "${subject}". Our staff will contact you shortly.`);
  document.getElementById('support-ticket-form').reset();
}

function handleLogout() {
  showToast('🚪 Logging out from Customer Panel...');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1200);
}

// Expose Globals
window.showSection = showSection;
window.switchOrderTab = switchOrderTab;
window.searchOrders = searchOrders;
window.toggleFilterOptions = toggleFilterOptions;
window.toggleRowExpansion = toggleRowExpansion;
window.openDetailsModal = openDetailsModal;
window.closeDetailsModal = closeDetailsModal;
window.toggleMobileSidebar = toggleMobileSidebar;
window.showNotificationToast = showNotificationToast;
window.submitTicket = submitTicket;
window.handleLogout = handleLogout;
window.goToPage = goToPage;
