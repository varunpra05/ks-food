/* ============================================================
   KUMAR SNACKS — Orders Page Interaction Logic (orders.js)
   ============================================================ */

'use strict';

let ordersList = [];
let activeOrder = null;

// Sticky Header & Back to top
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  if (header) header.classList.toggle('scrolled', window.scrollY > 30);

  const scrollBtn = document.getElementById('scroll-top-btn');
  if (scrollBtn) scrollBtn.classList.toggle('visible', window.scrollY > 400);
});

document.getElementById('scroll-top-btn')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Mobile Burger Toggle
const burgerBtn = document.getElementById('burger-btn');
const mobileNav = document.getElementById('mobile-nav');
burgerBtn?.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  burgerBtn.classList.toggle('open', open);
  burgerBtn.setAttribute('aria-expanded', open);
  
  const overlay = document.getElementById('mobile-nav-overlay');
  if (overlay) overlay.classList.toggle('active', open);
});

// Tab Switcher
function switchOrderTab(tabName) {
  // Update Active Button Style
  const buttons = document.querySelectorAll('.order-tab-btn');
  buttons.forEach(btn => btn.classList.remove('active'));

  // Get index matching the tabName
  let tabIndex = 0;
  if (tabName === 'track') tabIndex = 0;
  else if (tabName === 'status') tabIndex = 1;
  else if (tabName === 'details') tabIndex = 2;
  else if (tabName === 'support') tabIndex = 3;

  if (buttons[tabIndex]) {
    buttons[tabIndex].classList.add('active');
  }

  // Update Visible Panel
  const panels = document.querySelectorAll('.order-view-panel');
  panels.forEach(p => p.style.display = 'none');

  const activePanel = document.getElementById(`panel-${tabName}`);
  if (activePanel) {
    activePanel.style.display = 'block';
  }

  // Render content
  if (tabName === 'track') {
    renderTrackPanel();
  } else if (tabName === 'status') {
    renderStatusPanel();
  } else if (tabName === 'details') {
    renderDetailsPanel();
  }
}

// 1. Render Track All Orders Panel
function renderTrackPanel() {
  const container = document.getElementById('orders-list-container');
  if (!container) return;

  if (ordersList.length === 0) {
    container.innerHTML = `
      <div class="orders-empty-state">
        <span class="empty-icon">🍽️</span>
        <h3>No orders placed yet</h3>
        <p>Hungry? Place your first order and satisfy your cravings!</p>
        <a href="shop.html" class="btn btn--primary">Order Food Now</a>
      </div>
    `;
    return;
  }

  let html = '';
  ordersList.forEach((ord) => {
    // Determine status badge class
    let badgeClass = 'status-pending';
    const st = (ord.status || 'Pending').toLowerCase();
    if (st === 'preparing') badgeClass = 'status-preparing';
    else if (st === 'ready') badgeClass = 'status-ready';
    else if (st === 'completed' || st === 'delivered') badgeClass = 'status-completed';
    else if (st === 'cancelled') badgeClass = 'status-cancelled';

    html += `
      <div class="order-list-card">
        <div class="order-card-header">
          <div>
            <span class="order-id">#${ord.id}</span>
            <span class="order-date">Placed: ${ord.date || ''}</span>
          </div>
          <span class="order-status-badge ${badgeClass}">${ord.status || 'Pending'}</span>
        </div>
        <div class="order-card-body">
          <div class="order-items-summary">
            <strong>Items:</strong> ${ord.items || 'Delicious Fast Food Combo'}
          </div>
          <div>
            <span class="order-total-price">₹${ord.total || 0}</span>
            <button class="order-action-btn" onclick="viewSpecificOrderDetails('${ord.id}')">View Details</button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// 2. Render Live Status Tracker Panel
function renderStatusPanel() {
  const container = document.getElementById('status-tracker-container');
  if (!container) return;

  if (!activeOrder) {
    container.innerHTML = `
      <div class="orders-empty-state">
        <span class="empty-icon">🚚</span>
        <h3>No active tracker</h3>
        <p>Please select an order from "Track All Orders" list to view its live status.</p>
        <button class="btn btn--primary" onclick="switchOrderTab('track')">View My Orders</button>
      </div>
    `;
    return;
  }

  const st = (activeOrder.status || 'Pending').toLowerCase();
  
  // Step checks
  const isPending = true;
  const isPreparing = (st === 'preparing' || st === 'ready' || st === 'completed' || st === 'delivered');
  const isReady = (st === 'ready' || st === 'completed' || st === 'delivered');
  const isCompleted = (st === 'completed' || st === 'delivered');

  container.innerHTML = `
    <div class="status-meta">
      <div><strong>Order ID:</strong> #${activeOrder.id}</div>
      <div><strong>Method:</strong> ${activeOrder.deliveryMethod || 'Takeaway Pickup'}</div>
      <div><strong>Customer:</strong> ${activeOrder.customer || ''}</div>
    </div>

    <div class="timeline">
      <div class="timeline-step ${isCompleted ? 'completed' : (isReady ? 'active' : '')}">
        <div class="timeline-icon">${isCompleted ? '✓' : '🛵'}</div>
        <div class="timeline-content">
          <h3>Order Received &amp; Approved</h3>
          <p>Your payment is verified and the kitchen staff has approved your order.</p>
          <span class="timeline-time">${activeOrder.date || ''}</span>
        </div>
      </div>

      <div class="timeline-step ${isCompleted ? 'completed' : (isPreparing ? 'active' : '')}">
        <div class="timeline-icon">🍳</div>
        <div class="timeline-content">
          <h3>Preparing in Kitchen</h3>
          <p>Our chef is preparing your fresh Fast Food delicacies with hygienic care.</p>
        </div>
      </div>

      <div class="timeline-step ${isCompleted ? 'completed' : (isReady ? 'active' : '')}">
        <div class="timeline-icon">🛍️</div>
        <div class="timeline-content">
          <h3>Ready for Pickup / Takeaway</h3>
          <p>Your combo meal has been packaged hot and fresh, ready at our shop counter.</p>
        </div>
      </div>

      <div class="timeline-step ${isCompleted ? 'completed' : ''}">
        <div class="timeline-icon">✓</div>
        <div class="timeline-content">
          <h3>Order Completed</h3>
          <p>Snack box was successfully collected. Enjoy your meal!</p>
        </div>
      </div>
    </div>
  `;
}

// 3. Render Order Details Panel
function renderDetailsPanel() {
  const container = document.getElementById('details-view-container');
  if (!container) return;

  if (!activeOrder) {
    container.innerHTML = `
      <div class="orders-empty-state">
        <span class="empty-icon">📝</span>
        <h3>No order selected</h3>
        <p>Please select an order from "Track All Orders" list to view its complete receipt statement.</p>
        <button class="btn btn--primary" onclick="switchOrderTab('track')">View My Orders</button>
      </div>
    `;
    return;
  }

  // Load items parse
  let detailsHTML = '';
  if (activeOrder.details && Array.isArray(activeOrder.details)) {
    activeOrder.details.forEach(item => {
      detailsHTML += `
        <tr>
          <td class="receipt-item-title">${item.name}</td>
          <td>${item.price}</td>
          <td>${item.qty}</td>
          <td>₹${item.price * item.qty}</td>
        </tr>
      `;
    });
  } else {
    // Fallback if details are stored as string
    detailsHTML = `
      <tr>
        <td class="receipt-item-title">${activeOrder.items || 'Fast Food Items'}</td>
        <td>₹${activeOrder.total}</td>
        <td>1</td>
        <td>₹${activeOrder.total}</td>
      </tr>
    `;
  }

  container.innerHTML = `
    <div class="receipt-info-grid">
      <div class="receipt-meta-item">
        <span>Order Reference</span>
        <strong>#${activeOrder.id}</strong>
      </div>
      <div class="receipt-meta-item">
        <span>Date &amp; Time</span>
        <strong>${activeOrder.date || ''}</strong>
      </div>
      <div class="receipt-meta-item">
        <span>Takeaway Delivery</span>
        <strong>${activeOrder.deliveryMethod || ''}</strong>
      </div>
      <div class="receipt-meta-item">
        <span>Customer Contact</span>
        <strong>${activeOrder.phone || ''}</strong>
      </div>
    </div>

    <div class="receipt-table-wrapper">
      <table class="receipt-table">
        <thead>
          <tr>
            <th>Snack Item</th>
            <th>Rate</th>
            <th>Qty</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${detailsHTML}
        </tbody>
      </table>
    </div>

    <div class="receipt-summary-box">
      <div class="summary-row">
        <span>Subtotal</span>
        <span>₹${activeOrder.total}</span>
      </div>
      <div class="summary-row">
        <span>Delivery Fee</span>
        <span>₹0</span>
      </div>
      <div class="summary-row total-row">
        <span>Grand Total</span>
        <span>₹${activeOrder.total}</span>
      </div>
    </div>
  `;
}

// Switch order detail selector
function viewSpecificOrderDetails(orderId) {
  const ord = ordersList.find(o => String(o.id) === String(orderId));
  if (ord) {
    activeOrder = ord;
    switchOrderTab('details');
  }
}

// Support Form Handler
function handleSupportSubmit(e) {
  e.preventDefault();
  const orderIdVal = document.getElementById('sup-order-id')?.value;
  const issueType = document.getElementById('sup-issue-type')?.value;
  const msgVal = document.getElementById('sup-message')?.value;

  let msg = 'Thank you! Your ticket has been logged successfully.';
  if (orderIdVal) {
    msg += ` Reference logged for Order #${orderIdVal}.`;
  }
  
  if (typeof showToast === 'function') {
    showToast(msg);
  } else {
    alert(msg);
  }

  // Clear inputs
  e.target.reset();
}

// Init Load
function initOrdersPage() {
  // Load orders from localStorage
  try {
    ordersList = JSON.parse(localStorage.getItem('ks_orders') || '[]');
  } catch (e) {
    console.error('Error loading ks_orders:', e);
    ordersList = [];
  }

  // Default active order is the latest placed order (first in array)
  if (ordersList.length > 0) {
    activeOrder = ordersList[0];
  }

  // Draw default list
  renderTrackPanel();
}

// Expose globals for click handlers
window.switchOrderTab = switchOrderTab;
window.viewSpecificOrderDetails = viewSpecificOrderDetails;
window.handleSupportSubmit = handleSupportSubmit;

// Execute
initOrdersPage();
