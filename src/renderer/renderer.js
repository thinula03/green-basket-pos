let state = null;
let cart = [];
let selectedProductId = null;
let activeSale = null;
let currentProductImagePath = '';

const els = {
  shopName: document.querySelector('#shopName'),
  navButtons: document.querySelectorAll('[data-page-target]'),
  pages: document.querySelectorAll('[data-page]'),
  todaySales: document.querySelector('#todaySales'),
  todayTransactions: document.querySelector('#todayTransactions'),
  lowStockCount: document.querySelector('#lowStockCount'),
  productGrid: document.querySelector('#productGrid'),
  inventorySearch: document.querySelector('#inventorySearch'),
  inventoryCategoryFilter: document.querySelector('#inventoryCategoryFilter'),
  inventoryProductList: document.querySelector('#inventoryProductList'),
  inventoryTotalProducts: document.querySelector('#inventoryTotalProducts'),
  inventoryValue: document.querySelector('#inventoryValue'),
  inventoryLowStock: document.querySelector('#inventoryLowStock'),
  searchInput: document.querySelector('#searchInput'),
  categoryFilter: document.querySelector('#categoryFilter'),
  categoryPills: document.querySelector('#categoryPills'),
  sortProducts: document.querySelector('#sortProducts'),
  lowStockOnly: document.querySelector('#lowStockOnly'),
  heldCarts: document.querySelector('#heldCarts'),
  cartItems: document.querySelector('#cartItems'),
  discountInput: document.querySelector('#discountInput'),
  paymentMethod: document.querySelector('#paymentMethod'),
  amountPaidInput: document.querySelector('#amountPaidInput'),
  subtotalText: document.querySelector('#subtotalText'),
  totalText: document.querySelector('#totalText'),
  changeText: document.querySelector('#changeText'),
  productForm: document.querySelector('#productForm'),
  formMode: document.querySelector('#formMode'),
  productId: document.querySelector('#productId'),
  productName: document.querySelector('#productName'),
  productCategory: document.querySelector('#productCategory'),
  productBarcode: document.querySelector('#productBarcode'),
  productPrice: document.querySelector('#productPrice'),
  productStock: document.querySelector('#productStock'),
  productImagePreview: document.querySelector('#productImagePreview'),
  stockForm: document.querySelector('#stockForm'),
  stockProductLabel: document.querySelector('#stockProductLabel'),
  stockQty: document.querySelector('#stockQty'),
  stockReason: document.querySelector('#stockReason'),
  stockMoves: document.querySelector('#stockMoves'),
  shopForm: document.querySelector('#shopForm'),
  shopNameInput: document.querySelector('#shopNameInput'),
  shopAddressInput: document.querySelector('#shopAddressInput'),
  shopPhoneInput: document.querySelector('#shopPhoneInput'),
  shopCurrencyInput: document.querySelector('#shopCurrencyInput'),
  salesFrom: document.querySelector('#salesFrom'),
  salesTo: document.querySelector('#salesTo'),
  rangeSales: document.querySelector('#rangeSales'),
  averageSale: document.querySelector('#averageSale'),
  reportOrderCount: document.querySelector('#reportOrderCount'),
  reportItemsSold: document.querySelector('#reportItemsSold'),
  paymentBreakdown: document.querySelector('#paymentBreakdown'),
  topProducts: document.querySelector('#topProducts'),
  salesList: document.querySelector('#salesList'),
  settingsProductCount: document.querySelector('#settingsProductCount'),
  settingsSalesCount: document.querySelector('#settingsSalesCount'),
  settingsHeldCartCount: document.querySelector('#settingsHeldCartCount'),
  receiptDialog: document.querySelector('#receiptDialog'),
  receiptPreview: document.querySelector('#receiptPreview'),
  voidSaleBtn: document.querySelector('#voidSaleBtn'),
  toast: document.querySelector('#toast')
};

function fileUrl(filePath) {
  if (!filePath) return '';
  const normalized = String(filePath).replace(/\\/g, '/');
  return encodeURI(`file://${normalized}`);
}

function showPage(pageName) {
  els.pages.forEach((page) => {
    page.classList.toggle('active', page.dataset.page === pageName);
  });
  els.navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.pageTarget === pageName);
  });

  if (pageName === 'sale') {
    window.setTimeout(() => els.searchInput.focus(), 0);
  }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[char]);
}

function productImageMarkup(product, className = 'product-image') {
  if (product.imagePath) {
    return `<img class="${className}" src="${escapeHtml(fileUrl(product.imagePath))}" alt="${escapeHtml(product.name)}">`;
  }
  const title = String(product.name || 'Item').split(/\s+/).slice(0, 2).join(' ');
  return `
    <div class="${className} image-fallback">
      <span class="pack-shape"></span>
      <span class="placeholder-title">${escapeHtml(title)}</span>
      <span class="placeholder-category">${escapeHtml(product.category || 'Grocery')}</span>
    </div>
  `;
}

function money(value) {
  return `${state?.shop?.currency || 'Rs.'} ${Number(value || 0).toLocaleString('en-LK')}`;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function saleDateText(iso) {
  return new Intl.DateTimeFormat('en-LK', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(iso));
}

function currentTotals() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = Math.max(Number(els.discountInput.value || 0), 0);
  const total = Math.max(subtotal - discount, 0);
  const amountPaid = Number(els.amountPaidInput.value || 0);
  const change = els.paymentMethod.value === 'Cash' ? Math.max(amountPaid - total, 0) : 0;
  return { subtotal, discount, total, amountPaid, change };
}

function saleInRange(sale) {
  const saleDay = sale.createdAt.slice(0, 10);
  const from = els.salesFrom.value;
  const to = els.salesTo.value;
  return (!from || saleDay >= from) && (!to || saleDay <= to);
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('visible');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove('visible'), 2400);
}

async function reloadState() {
  state = await window.posApi.loadState();
  fillShopForm();
  render();
}

function render() {
  els.shopName.textContent = state.shop.name;
  renderSummary();
  renderCategoryFilter();
  renderProducts();
  renderInventory();
  renderHeldCarts();
  renderCart();
  renderStockMoves();
  renderSales();
  renderSettings();
}

function renderSummary() {
  const todaysSales = state.sales.filter((sale) => {
    return !sale.voidedAt && sale.createdAt.slice(0, 10) === todayKey();
  });
  const total = todaysSales.reduce((sum, sale) => sum + sale.total, 0);
  els.todaySales.textContent = money(total);
  els.todayTransactions.textContent = todaysSales.length;
  els.lowStockCount.textContent = state.products.filter((product) => product.stock <= 5).length;
}

function renderCategoryFilter() {
  const categories = [...new Set(state.products.map((product) => product.category || 'General'))].sort();
  const selected = els.categoryFilter.value;
  els.categoryFilter.innerHTML = [
    '<option value="">All categories</option>',
    ...categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
  ].join('');
  els.categoryFilter.value = categories.includes(selected) ? selected : '';

  const activeCategory = els.categoryFilter.value;
  els.categoryPills.innerHTML = [
    `<button class="category-pill ${activeCategory ? '' : 'active'}" data-category-pill="">All</button>`,
    ...categories.map((category) => {
      const active = category === activeCategory ? 'active' : '';
      return `<button class="category-pill ${active}" data-category-pill="${escapeHtml(category)}">${escapeHtml(category)}</button>`;
    })
  ].join('');
}

function filteredProducts() {
  const query = els.searchInput.value.trim().toLowerCase();
  const category = els.categoryFilter.value;
  const products = state.products.filter((product) => {
    const haystack = [product.id, product.name, product.category, product.barcode].join(' ').toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    const matchesCategory = !category || product.category === category;
    const matchesStock = !els.lowStockOnly.checked || product.stock <= 5;
    return matchesQuery && matchesCategory && matchesStock;
  });

  return products.sort((a, b) => {
    if (els.sortProducts.value === 'stock-low') return a.stock - b.stock || a.name.localeCompare(b.name);
    if (els.sortProducts.value === 'price-low') return a.price - b.price || a.name.localeCompare(b.name);
    if (els.sortProducts.value === 'price-high') return b.price - a.price || a.name.localeCompare(b.name);
    return a.name.localeCompare(b.name);
  });
}

function renderProducts() {
  const products = filteredProducts();
  els.productGrid.innerHTML = products.length
    ? products.map((product) => `
        <article class="product-card ${product.stock <= 0 ? 'out' : ''}">
          <button class="product-hitbox" data-add-product="${escapeHtml(product.id)}" ${product.stock <= 0 ? 'disabled' : ''}>
            ${productImageMarkup(product)}
            <span class="product-meta">
              <span>${escapeHtml(product.category || 'General')}</span>
              <span>${escapeHtml(product.barcode || product.id)}</span>
            </span>
            <strong>${escapeHtml(product.name)}</strong>
            <span class="price-row">
              <span class="price">${money(product.price)}</span>
              <span class="stock ${product.stock <= 5 ? 'low' : ''}">${product.stock} in stock</span>
            </span>
            <span class="add-badge">+</span>
          </button>
          <button class="edit-product-button" data-edit-product="${escapeHtml(product.id)}">Edit</button>
        </article>
      `).join('')
    : '<div class="empty-state">No matching products</div>';
}

function inventoryProducts() {
  const query = els.inventorySearch.value.trim().toLowerCase();
  const category = els.inventoryCategoryFilter.value;
  return state.products
    .filter((product) => {
      const haystack = [product.id, product.name, product.category, product.barcode].join(' ').toLowerCase();
      return (!query || haystack.includes(query)) && (!category || product.category === category);
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function renderInventory() {
  const categories = [...new Set(state.products.map((product) => product.category || 'General'))].sort();
  const selectedCategory = els.inventoryCategoryFilter.value;
  els.inventoryCategoryFilter.innerHTML = [
    '<option value="">All categories</option>',
    ...categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
  ].join('');
  els.inventoryCategoryFilter.value = categories.includes(selectedCategory) ? selectedCategory : '';

  const totalValue = state.products.reduce((sum, product) => {
    return sum + Number(product.price || 0) * Number(product.stock || 0);
  }, 0);
  els.inventoryTotalProducts.textContent = state.products.length;
  els.inventoryValue.textContent = money(totalValue);
  els.inventoryLowStock.textContent = state.products.filter((product) => product.stock <= 5).length;

  const products = inventoryProducts();
  els.inventoryProductList.innerHTML = products.length
    ? products.map((product) => `
      <button class="inventory-row ${product.id === selectedProductId ? 'selected' : ''}" data-inventory-product="${escapeHtml(product.id)}">
        <span class="inventory-product-cell">
          ${productImageMarkup(product, 'inventory-thumb')}
          <span class="inventory-name">
            <strong>${escapeHtml(product.name)}</strong>
            <small>${escapeHtml(product.id)} / ${escapeHtml(product.barcode || 'No barcode')}</small>
          </span>
        </span>
        <span>${escapeHtml(product.category || 'General')}</span>
        <span class="${product.stock <= 5 ? 'stock-danger' : ''}">${product.stock}</span>
        <span>${money(product.price)}</span>
      </button>
    `).join('')
    : '<div class="empty-state">No inventory items found</div>';
}

function renderProductImagePreview() {
  if (!currentProductImagePath) {
    els.productImagePreview.innerHTML = '<span>No image</span>';
    els.productImagePreview.classList.add('empty');
    return;
  }

  els.productImagePreview.innerHTML = `<img src="${escapeHtml(fileUrl(currentProductImagePath))}" alt="Product image preview">`;
  els.productImagePreview.classList.remove('empty');
}

function renderCart() {
  if (!cart.length) {
    els.cartItems.innerHTML = '<div class="empty-state">Add items from the product list</div>';
  } else {
    els.cartItems.innerHTML = cart.map((item) => `
      <div class="cart-row" data-cart-row="${escapeHtml(item.id)}">
        ${productImageMarkup(item, 'cart-thumb')}
        <div>
          <strong>${escapeHtml(item.name)}</strong>
          <small>${money(item.price)} each</small>
        </div>
        <div class="qty-control">
          <button data-qty-minus="${escapeHtml(item.id)}" title="Decrease quantity">-</button>
          <input data-qty-input="${escapeHtml(item.id)}" type="number" min="1" max="${item.stock}" value="${item.qty}">
          <button data-qty-plus="${escapeHtml(item.id)}" title="Increase quantity">+</button>
        </div>
        <span class="line-total">${money(item.price * item.qty)}</span>
        <button class="remove-button" data-remove-item="${escapeHtml(item.id)}" title="Remove item">x</button>
      </div>
    `).join('');
  }

  const totals = currentTotals();
  els.subtotalText.textContent = money(totals.subtotal);
  els.totalText.textContent = money(totals.total);
  els.changeText.textContent = money(totals.change);
}

function renderHeldCarts() {
  const held = state.heldCarts.slice(0, 4);
  const recentSales = state.sales.filter((sale) => !sale.voidedAt).slice(0, 4 - held.length);

  if (!held.length && !recentSales.length) {
    els.heldCarts.innerHTML = `
      <div class="queue-card empty-queue">
        <strong>No active queues</strong>
        <span>Held carts and recent sales will appear here.</span>
      </div>
    `;
    return;
  }

  const heldCards = held.map((hold) => {
    const total = hold.items.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
    return `
      <div class="queue-card held-cart">
        <span class="queue-id">${escapeHtml(hold.id)}</span>
        <span class="queue-status ready">Held</span>
        <button data-restore-cart="${escapeHtml(hold.id)}">
          <strong>${escapeHtml(hold.name)}</strong>
          <span>${hold.items.length} items · ${money(total)}</span>
        </button>
        <button class="remove-button" data-delete-hold="${escapeHtml(hold.id)}" title="Delete held cart">x</button>
      </div>
    `;
  });

  const saleCards = recentSales.map((sale) => `
    <button class="queue-card sale-queue" data-sale-id="${escapeHtml(sale.id)}">
      <span class="queue-id">${escapeHtml(sale.id)}</span>
      <span class="queue-status served">Completed</span>
      <strong>${sale.items.length} items</strong>
      <span>${saleDateText(sale.createdAt)} · ${money(sale.total)}</span>
    </button>
  `);

  els.heldCarts.innerHTML = [...heldCards, ...saleCards].join('');
}

function renderStockMoves() {
  const moves = state.stockMovements.slice(0, 6);
  els.stockMoves.innerHTML = moves.length
    ? moves.map((move) => `
      <div class="stock-move">
        <strong>${move.qty > 0 ? '+' : ''}${move.qty} · ${escapeHtml(move.productName)}</strong>
        <span>${escapeHtml(move.reason)} · ${saleDateText(move.createdAt)}</span>
      </div>
    `).join('')
    : '<p class="muted-note">No stock movements yet</p>';
}

function renderSales() {
  const rangeSales = state.sales.filter((sale) => saleInRange(sale));
  const completed = rangeSales.filter((sale) => !sale.voidedAt);
  const total = completed.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  const itemsSold = completed.reduce((sum, sale) => {
    return sum + sale.items.reduce((itemSum, item) => itemSum + Number(item.qty || 0), 0);
  }, 0);
  els.rangeSales.textContent = money(total);
  els.averageSale.textContent = money(completed.length ? total / completed.length : 0);
  els.reportOrderCount.textContent = completed.length;
  els.reportItemsSold.textContent = itemsSold;

  const paymentTotals = completed.reduce((map, sale) => {
    map[sale.paymentMethod] = (map[sale.paymentMethod] || 0) + Number(sale.total || 0);
    return map;
  }, {});
  els.paymentBreakdown.innerHTML = Object.keys(paymentTotals).length
    ? Object.entries(paymentTotals).map(([method, value]) => `
      <div class="breakdown-row">
        <span>${escapeHtml(method)}</span>
        <strong>${money(value)}</strong>
      </div>
    `).join('')
    : '<div class="empty-state">No payment data</div>';

  const productTotals = new Map();
  completed.forEach((sale) => {
    sale.items.forEach((item) => {
      const current = productTotals.get(item.id) || { name: item.name, qty: 0, total: 0 };
      current.qty += Number(item.qty || 0);
      current.total += Number(item.total || 0);
      productTotals.set(item.id, current);
    });
  });
  const topProducts = [...productTotals.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  els.topProducts.innerHTML = topProducts.length
    ? topProducts.map((item) => `
      <div class="breakdown-row">
        <span>${escapeHtml(item.name)} <small>${item.qty} sold</small></span>
        <strong>${money(item.total)}</strong>
      </div>
    `).join('')
    : '<div class="empty-state">No product data</div>';

  els.salesList.innerHTML = rangeSales.length
    ? rangeSales.slice(0, 16).map((sale) => `
      <button class="sale-card sales-table-row ${sale.voidedAt ? 'voided' : ''}" data-sale-id="${escapeHtml(sale.id)}">
        <strong>${escapeHtml(sale.id)}</strong>
        <span>${saleDateText(sale.createdAt)}</span>
        <span>${sale.items.length}</span>
        <span>${escapeHtml(sale.paymentMethod)}${sale.voidedAt ? ' / Voided' : ''}</span>
        <strong>${money(sale.total)}</strong>
      </button>
    `).join('')
    : '<div class="empty-state">No sales yet</div>';
}

function renderSettings() {
  els.settingsProductCount.textContent = state.products.length;
  els.settingsSalesCount.textContent = state.sales.length;
  els.settingsHeldCartCount.textContent = state.heldCarts.length;
}

function addToCart(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;
  if (product.stock <= 0) {
    showToast(`${product.name} is out of stock`);
    return;
  }

  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.qty = Math.min(existing.qty + 1, product.stock);
  } else {
    cart.push({ ...product, qty: 1 });
  }

  renderCart();
}

function addExactScan(query) {
  const normalized = query.trim().toLowerCase();
  const match = state.products.find((product) => {
    return [product.barcode, product.id].some((value) => String(value || '').toLowerCase() === normalized);
  });
  if (!match) return false;
  addToCart(match.id);
  els.searchInput.value = '';
  renderProducts();
  return true;
}

function setCartQty(productId, qty) {
  const item = cart.find((entry) => entry.id === productId);
  if (!item) return;
  item.qty = Math.max(1, Math.min(Number(qty || 1), item.stock));
  renderCart();
}

function fillProductForm(product) {
  selectedProductId = product?.id || null;
  currentProductImagePath = product?.imagePath || '';
  els.formMode.textContent = product ? 'Edit' : 'New';
  els.stockProductLabel.value = product ? `${product.id} · ${product.name}` : '';
  els.productId.value = product?.id || nextProductId();
  els.productName.value = product?.name || '';
  els.productCategory.value = product?.category || 'General';
  els.productBarcode.value = product?.barcode || '';
  els.productPrice.value = product?.price || '';
  els.productStock.value = product?.stock || '';
  els.productId.readOnly = Boolean(product);
  renderProductImagePreview();
}

function fillShopForm() {
  els.shopNameInput.value = state.shop.name || '';
  els.shopAddressInput.value = state.shop.address || '';
  els.shopPhoneInput.value = state.shop.phone || '';
  els.shopCurrencyInput.value = state.shop.currency || 'Rs.';
}

function nextProductId() {
  const numbers = state.products
    .map((product) => Number(String(product.id).replace(/\D/g, '')))
    .filter(Number.isFinite);
  return `P${String(Math.max(0, ...numbers) + 1).padStart(3, '0')}`;
}

function selectedSale(id) {
  return state.sales.find((sale) => sale.id === id) || activeSale || state.sales[0];
}

function buildReceipt(sale) {
  if (!sale) return '';
  const lines = sale.items.map((item) => `
    <tr>
      <td>${escapeHtml(item.name)}</td>
      <td>${item.qty}</td>
      <td>${money(item.price)}</td>
      <td>${money(item.total)}</td>
    </tr>
  `).join('');

  return `
    <section id="receiptPrint" class="receipt-paper">
      <h2>${escapeHtml(state.shop.name)}</h2>
      <p>${escapeHtml(state.shop.address)}<br>${escapeHtml(state.shop.phone)}</p>
      <p>Receipt: ${escapeHtml(sale.id)}<br>${saleDateText(sale.createdAt)}</p>
      ${sale.voidedAt ? `<p class="void-label">VOIDED ${saleDateText(sale.voidedAt)}</p>` : ''}
      <table>
        <thead><tr><th align="left">Item</th><th>Qty</th><th align="right">Price</th><th align="right">Total</th></tr></thead>
        <tbody>${lines}</tbody>
      </table>
      <hr>
      <p>Subtotal: ${money(sale.subtotal)}<br>Discount: ${money(sale.discount)}<br><strong>Total: ${money(sale.total)}</strong><br>Paid: ${money(sale.amountPaid)}<br>Change: ${money(sale.change)}</p>
      <p>Thank you</p>
    </section>
  `;
}

function openReceipt(sale) {
  if (!sale) {
    showToast('No receipt to show yet');
    return;
  }
  activeSale = sale;
  els.receiptPreview.innerHTML = buildReceipt(sale);
  els.voidSaleBtn.disabled = Boolean(sale.voidedAt);
  if (!els.receiptDialog.open) {
    els.receiptDialog.showModal();
  }
}

function printReceipt() {
  if (!activeSale) {
    showToast('No receipt to print yet');
    return;
  }
  window.print();
}

function exportSalesCsv() {
  const header = ['Sale ID', 'Date', 'Status', 'Payment', 'Subtotal', 'Discount', 'Total', 'Amount Paid', 'Change', 'Items'];
  const rows = state.sales.filter((sale) => saleInRange(sale)).map((sale) => [
    sale.id,
    saleDateText(sale.createdAt),
    sale.voidedAt ? 'Voided' : 'Completed',
    sale.paymentMethod,
    sale.subtotal,
    sale.discount,
    sale.total,
    sale.amountPaid,
    sale.change,
    sale.items.map((item) => `${item.name} x ${item.qty}`).join('; ')
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `sales-${todayKey()}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function backupData() {
  const result = await window.posApi.backupState();
  if (!result.canceled) showToast('Backup saved');
}

async function restoreData() {
  if (!window.confirm('Restore backup and replace current POS data?')) return;
  try {
    const result = await window.posApi.restoreState();
    if (result.canceled) return;
    state = result.state;
    cart = [];
    selectedProductId = null;
    fillProductForm(null);
    fillShopForm();
    render();
    showToast('Backup restored');
  } catch (error) {
    showToast('Backup file could not be restored');
  }
}

async function resetDemoData() {
  if (!window.confirm('Reset products and clear all sales?')) return;
  state = await window.posApi.resetDemo();
  cart = [];
  selectedProductId = null;
  fillProductForm(null);
  fillShopForm();
  render();
  showToast('Demo data restored');
}

document.addEventListener('click', async (event) => {
  const addButton = event.target.closest('[data-add-product]');
  const editButton = event.target.closest('[data-edit-product]');
  const removeButton = event.target.closest('[data-remove-item]');
  const plusButton = event.target.closest('[data-qty-plus]');
  const minusButton = event.target.closest('[data-qty-minus]');
  const saleButton = event.target.closest('[data-sale-id]');
  const restoreCartButton = event.target.closest('[data-restore-cart]');
  const deleteHoldButton = event.target.closest('[data-delete-hold]');
  const categoryPill = event.target.closest('[data-category-pill]');
  const inventoryProductButton = event.target.closest('[data-inventory-product]');

  if (categoryPill) {
    els.categoryFilter.value = categoryPill.dataset.categoryPill;
    renderCategoryFilter();
    renderProducts();
    return;
  }

  if (inventoryProductButton) {
    const product = state.products.find((item) => item.id === inventoryProductButton.dataset.inventoryProduct);
    fillProductForm(product);
    renderInventory();
    return;
  }

  if (addButton) {
    addToCart(addButton.dataset.addProduct);
    return;
  }

  if (editButton) {
    const product = state.products.find((item) => item.id === editButton.dataset.editProduct);
    fillProductForm(product);
    showPage('inventory');
    return;
  }

  if (removeButton) {
    cart = cart.filter((item) => item.id !== removeButton.dataset.removeItem);
    renderCart();
    return;
  }

  if (plusButton) {
    const item = cart.find((entry) => entry.id === plusButton.dataset.qtyPlus);
    if (!item) return;
    setCartQty(item.id, item.qty + 1);
    return;
  }

  if (minusButton) {
    const item = cart.find((entry) => entry.id === minusButton.dataset.qtyMinus);
    if (!item) return;
    setCartQty(item.id, item.qty - 1);
    return;
  }

  if (saleButton) {
    openReceipt(selectedSale(saleButton.dataset.saleId));
    return;
  }

  if (restoreCartButton) {
    const hold = state.heldCarts.find((item) => item.id === restoreCartButton.dataset.restoreCart);
    if (!hold) return;
    cart = hold.items.map((item) => {
      const product = state.products.find((entry) => entry.id === item.id);
      return {
        ...(product || item),
        price: product ? product.price : item.price,
        stock: product ? product.stock : item.qty,
        qty: Math.min(Number(item.qty), product ? product.stock : Number(item.qty))
      };
    }).filter((item) => item.qty > 0);
    state = await window.posApi.deleteHeldCart(hold.id);
    render();
    showToast('Held cart restored');
    return;
  }

  if (deleteHoldButton) {
    state = await window.posApi.deleteHeldCart(deleteHoldButton.dataset.deleteHold);
    render();
    showToast('Held cart removed');
  }
});

els.cartItems.addEventListener('change', (event) => {
  const input = event.target.closest('[data-qty-input]');
  if (input) setCartQty(input.dataset.qtyInput, input.value);
});

els.searchInput.addEventListener('input', renderProducts);
els.searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    if (!addExactScan(els.searchInput.value)) showToast('No exact barcode or item ID match');
  }
});
els.categoryFilter.addEventListener('change', renderProducts);
els.sortProducts.addEventListener('change', renderProducts);
els.lowStockOnly.addEventListener('change', renderProducts);
els.inventorySearch.addEventListener('input', renderInventory);
els.inventoryCategoryFilter.addEventListener('change', renderInventory);
els.salesFrom.addEventListener('change', renderSales);
els.salesTo.addEventListener('change', renderSales);
els.discountInput.addEventListener('input', renderCart);
els.amountPaidInput.addEventListener('input', renderCart);
els.paymentMethod.addEventListener('change', renderCart);

els.navButtons.forEach((button) => {
  button.addEventListener('click', () => showPage(button.dataset.pageTarget));
});

document.querySelector('#clearCartBtn').addEventListener('click', () => {
  cart = [];
  renderCart();
});

document.querySelector('#clearCartMirrorBtn').addEventListener('click', () => {
  cart = [];
  renderCart();
});

document.querySelector('#holdCartBtn').addEventListener('click', async () => {
  if (!cart.length) {
    showToast('Cart is empty');
    return;
  }
  const name = window.prompt('Hold name or customer name:', `Hold ${state.heldCarts.length + 1}`);
  if (name === null) return;
  try {
    state = await window.posApi.holdCart({ name, items: cart });
    cart = [];
    render();
    showToast('Cart held');
  } catch (error) {
    showToast(error.message);
  }
});

document.querySelector('#newProductBtn').addEventListener('click', () => {
  fillProductForm(null);
  showPage('inventory');
});

document.querySelector('#inventoryNewProductBtn').addEventListener('click', () => {
  fillProductForm(null);
  renderInventory();
});

document.querySelector('#uploadImageBtn').addEventListener('click', async () => {
  const result = await window.posApi.selectProductImage();
  if (result.canceled) return;
  currentProductImagePath = result.imagePath;
  renderProductImagePreview();
  showToast('Product image selected');
});

document.querySelector('#removeImageBtn').addEventListener('click', () => {
  currentProductImagePath = '';
  renderProductImagePreview();
});

document.querySelector('#printReceiptBtn').addEventListener('click', () => openReceipt(activeSale || state.sales[0]));
document.querySelector('#dialogPrintBtn').addEventListener('click', printReceipt);
document.querySelector('#closeReceiptBtn').addEventListener('click', () => els.receiptDialog.close());
document.querySelector('#exportSalesBtn').addEventListener('click', exportSalesCsv);
document.querySelector('#reportsExportBtn').addEventListener('click', exportSalesCsv);
document.querySelector('#backupBtn').addEventListener('click', backupData);
document.querySelector('#settingsBackupBtn').addEventListener('click', backupData);
document.querySelector('#restoreBtn').addEventListener('click', restoreData);
document.querySelector('#settingsRestoreBtn').addEventListener('click', restoreData);
document.querySelector('#resetDemoBtn').addEventListener('click', resetDemoData);
document.querySelector('#settingsResetBtn').addEventListener('click', resetDemoData);

document.querySelector('#deleteProductBtn').addEventListener('click', async () => {
  if (!selectedProductId) {
    showToast('Select a product first');
    return;
  }
  if (!window.confirm('Delete this product?')) return;
  state = await window.posApi.deleteProduct(selectedProductId);
  cart = cart.filter((item) => item.id !== selectedProductId);
  fillProductForm(null);
  render();
  showToast('Product deleted');
});

els.productForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const product = {
    id: els.productId.value,
    name: els.productName.value,
    category: els.productCategory.value,
    barcode: els.productBarcode.value,
    price: Number(els.productPrice.value),
    stock: Number(els.productStock.value),
    imagePath: currentProductImagePath
  };

  try {
    state = await window.posApi.saveProduct(product);
    fillProductForm(state.products.find((item) => item.id === product.id));
    render();
    showToast('Product saved');
  } catch (error) {
    showToast(error.message);
  }
});

els.stockForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    state = await window.posApi.adjustStock({
      productId: selectedProductId,
      qty: Number(els.stockQty.value),
      reason: els.stockReason.value
    });
    const product = state.products.find((item) => item.id === selectedProductId);
    fillProductForm(product);
    els.stockQty.value = '';
    els.stockReason.value = '';
    render();
    showToast('Stock adjusted');
  } catch (error) {
    showToast(error.message);
  }
});

els.shopForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  state = await window.posApi.saveShop({
    name: els.shopNameInput.value,
    address: els.shopAddressInput.value,
    phone: els.shopPhoneInput.value,
    currency: els.shopCurrencyInput.value
  });
  render();
  showToast('Shop details saved');
});

document.querySelector('#completeSaleBtn').addEventListener('click', async () => {
  try {
    const totals = currentTotals();
    state = await window.posApi.completeSale({
      items: cart,
      discount: totals.discount,
      paymentMethod: els.paymentMethod.value,
      amountPaid: totals.amountPaid
    });
    activeSale = state.sales[0];
    cart = [];
    els.discountInput.value = 0;
    els.amountPaidInput.value = 0;
    render();
    showToast('Sale completed');
    openReceipt(activeSale);
  } catch (error) {
    showToast(error.message);
  }
});

els.voidSaleBtn.addEventListener('click', async () => {
  if (!activeSale || activeSale.voidedAt) return;
  if (!window.confirm('Void this sale and return items to stock?')) return;
  try {
    state = await window.posApi.voidSale(activeSale.id);
    activeSale = state.sales.find((sale) => sale.id === activeSale.id);
    render();
    openReceipt(activeSale);
    showToast('Sale voided and stock returned');
  } catch (error) {
    showToast(error.message);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'F2') {
    event.preventDefault();
    showPage('sale');
    els.searchInput.focus();
  }
  if (event.key === 'F4') {
    event.preventDefault();
    document.querySelector('#completeSaleBtn').click();
  }
});

reloadState().then(() => fillProductForm(null));
