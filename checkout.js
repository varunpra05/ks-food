'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // Load Cart
  let cart = JSON.parse(sessionStorage.getItem('ks_cart') || '[]');
  
  // If cart is empty, redirect back to shop
  if (cart.length === 0) {
    alert("Your cart is empty. Adding some items before checking out!");
    window.location.href = 'shop.html';
    return;
  }

  // DOM Elements
  const summaryList = document.getElementById('summary-items-list');
  const sumSubtotalEl = document.getElementById('sum-subtotal');
  const sumDiscountEl = document.getElementById('sum-discount');
  const sumTotalEl = document.getElementById('sum-total');
  const saveRow = document.getElementById('save-row');
  
  const couponInput = document.getElementById('coupon-code');
  const applyCouponBtn = document.getElementById('btn-apply-coupon');
  const couponFeedback = document.getElementById('coupon-feedback');

  const btnSubmitCheckout = document.getElementById('btn-submit-checkout');

  // Popup modal elements
  const successModal = document.getElementById('success-modal');
  const successOrderId = document.getElementById('success-order-id');
  const successCustName = document.getElementById('success-cust-name');
  const successCustPhone = document.getElementById('success-cust-phone');
  const successCustTime = document.getElementById('success-cust-time');
  const successCustTotal = document.getElementById('success-cust-total');
  const btnSuccessClose = document.getElementById('btn-success-close');

  // Pricing State
  let subtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);
  let packagingCharges = 10;
  let promoDiscount = 0;
  let activeCoupon = "";

  // Render items & calculate totals
  renderSummaryItems();
  calculateTotal();
  loadSavedAddress();

  // --- Functions ---
  function renderSummaryItems() {
    summaryList.innerHTML = cart.map(item => {
      // Find matching product in database to resolve fallback or uploaded image
      const dbProd = window.KS_DB.getAll().find(p => p.name === item.name || item.name.startsWith(p.name));
      const imgUrl = window.KS_DB.getProductImage(dbProd || item);
      return `
        <div class="summary-item">
          <div class="item-thumb-box">
            <img src="${imgUrl}" alt="${item.name}"/>
          </div>
          <div class="item-details-box">
            <h4>${item.name}</h4>
            <span>Qty: ${item.qty}</span>
          </div>
          <div class="item-price-box">₹${item.price * item.qty}</div>
        </div>
      `;
    }).join('');
  }

  function calculateTotal() {
    // Subtotal
    sumSubtotalEl.textContent = `₹${subtotal}`;

    // Coupon discount
    if (activeCoupon === "WELCOME50") {
      promoDiscount = Math.round(subtotal * 0.50);
    } else if (activeCoupon === "KUMAR10") {
      promoDiscount = Math.round(subtotal * 0.10);
    } else if (activeCoupon === "FREE10") {
      promoDiscount = 10;
    } else {
      promoDiscount = 0;
    }

    if (promoDiscount > 0) {
      sumDiscountEl.textContent = `-₹${promoDiscount}`;
      saveRow.style.display = 'flex';
    } else {
      saveRow.style.display = 'none';
    }

    // Grand Total (Subtotal + Packaging - Discount)
    let grandTotal = Math.max(0, subtotal + packagingCharges - promoDiscount);
    sumTotalEl.textContent = `₹${grandTotal}`;
  }

  // --- Coupon Code Event ---
  applyCouponBtn.addEventListener('click', () => {
    const code = couponInput.value.trim().toUpperCase();
    if (!code) {
      showCouponFeedback("⚠️ Please enter a coupon code", "error");
      return;
    }

    const validCoupons = ["WELCOME50", "KUMAR10", "FREE10"];
    if (validCoupons.includes(code)) {
      activeCoupon = code;
      let desc = "";
      if (code === "WELCOME50") desc = "50% Welcome Discount applied!";
      if (code === "KUMAR10") desc = "10% Discount applied!";
      if (code === "FREE10") desc = "₹10 Coupon Discount applied!";
      
      showCouponFeedback(`✅ Coupon applied: ${desc}`, "success");
      calculateTotal();
    } else {
      activeCoupon = "";
      showCouponFeedback("❌ Invalid coupon code", "error");
      calculateTotal();
    }
  });

  function showCouponFeedback(msg, type) {
    couponFeedback.textContent = msg;
    couponFeedback.className = `coupon-feedback ${type}`;
  }

  // --- Form Validation Helper ---
  function validateField(id, errId, validationFn, errorMsg) {
    const field = document.getElementById(id);
    const errSpan = document.getElementById(errId);
    const parent = field.closest('.form-group');
    
    const isValid = validationFn(field.value.trim());
    if (isValid) {
      if (errSpan) errSpan.textContent = "";
      if (parent) parent.classList.remove('error');
      return true;
    } else {
      if (errSpan) errSpan.textContent = errorMsg;
      if (parent) parent.classList.add('error');
      return false;
    }
  }

  // Live input formatting/validators
  document.getElementById('c-fullname').addEventListener('input', () => {
    validateField('c-fullname', 'err-fullname', (val) => val.length > 0, "Full name is required");
  });
  document.getElementById('c-phone').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, ''); // Numbers only
    validateField('c-phone', 'err-phone', (val) => /^\d{10}$/.test(val), "Phone number must be exactly 10 digits");
  });

  // --- Place Takeaway Order Event ---
  btnSubmitCheckout.addEventListener('click', (e) => {
    e.preventDefault();

    const isNameValid = validateField('c-fullname', 'err-fullname', (val) => val.length > 0, "Full name is required");
    const isPhoneValid = validateField('c-phone', 'err-phone', (val) => /^\d{10}$/.test(val), "Phone number must be exactly 10 digits");

    if (!isNameValid || !isPhoneValid) {
      const firstError = document.querySelector('.error-msg:not(:empty)');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const fullname = document.getElementById('c-fullname').value.trim();
    const phone = document.getElementById('c-phone').value.trim();
    const pickupTime = document.getElementById('c-time').value;

    // Save user's takeaway details to localStorage for future use
    localStorage.setItem('ks_takeaway_info', JSON.stringify({ fullname, phone }));

    // Generate random ORD-xxxx ID
    const randId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().split('T')[0];
    const itemsEmojis = cart.map(i => i.emoji || '🍽️').join('');
    const details = cart.map(i => `${i.name} (x${i.qty})`).join(', ');
    const grandTotal = Math.max(0, subtotal + packagingCharges - promoDiscount);

    // Save order data to admin storage so the Admin panel can display it correctly
    const newOrder = {
      id: randId,
      customer: fullname,
      email: "takeaway@kumarsnacks.com", // Takeaway order placeholder email
      phone: `+91 ${phone}`,
      address: `Takeaway Pickup: Shop-02 Aanand Tenament, Ghodasar, Ahmedabad`,
      deliveryMethod: `Takeaway (${pickupTime})`,
      date: dateStr,
      total: grandTotal,
      status: 'Pending',
      items: itemsEmojis,
      details: details
    };

    const currentOrders = JSON.parse(localStorage.getItem('ks_orders') || '[]');
    currentOrders.unshift(newOrder);
    localStorage.setItem('ks_orders', JSON.stringify(currentOrders));

    // Populate modal values
    successOrderId.textContent = randId;
    successCustName.textContent = fullname;
    successCustPhone.textContent = `+91 ${phone}`;
    successCustTime.textContent = pickupTime;
    successCustTotal.textContent = `₹${grandTotal}`;

    // Display modal popup
    successModal.classList.add('active');

    // Clear cart sessionStorage
    sessionStorage.removeItem('ks_cart');
  });

  // --- Go Back to Home Redirection ---
  btnSuccessClose.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  // --- Load Saved takeaway details ---
  function loadSavedAddress() {
    const saved = localStorage.getItem('ks_takeaway_info');
    if (saved) {
      try {
        const info = JSON.parse(saved);
        if (info.fullname) document.getElementById('c-fullname').value = info.fullname;
        if (info.phone) document.getElementById('c-phone').value = info.phone;
      } catch (e) {
        console.error("Error parsing saved takeaway details:", e);
      }
    }
  }
});
