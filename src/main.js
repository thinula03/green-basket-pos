const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs/promises');

app.setName('Green Basket POS');

const seedProducts = [
  { id: 'P001', name: 'Rice 1kg', category: 'Staples', price: 420, stock: 80, barcode: '1001' },
  { id: 'P002', name: 'Sugar 1kg', category: 'Staples', price: 360, stock: 60, barcode: '1002' },
  { id: 'P003', name: 'Dhal 500g', category: 'Staples', price: 290, stock: 45, barcode: '1003' },
  { id: 'P004', name: 'Milk Powder 400g', category: 'Dairy', price: 1250, stock: 24, barcode: '1004' },
  { id: 'P005', name: 'Bread Loaf', category: 'Bakery', price: 180, stock: 30, barcode: '1005' },
  { id: 'P006', name: 'Eggs 10 Pack', category: 'Dairy', price: 650, stock: 35, barcode: '1006' },
  { id: 'P007', name: 'Coconut Oil 1L', category: 'Cooking', price: 980, stock: 22, barcode: '1007' },
  { id: 'P008', name: 'Tea 200g', category: 'Beverages', price: 540, stock: 40, barcode: '1008' },
  { id: 'P009', name: 'Soap Bar', category: 'Household', price: 160, stock: 70, barcode: '1009' },
  { id: 'P010', name: 'Biscuits Pack', category: 'Snacks', price: 220, stock: 55, barcode: '1010' }
];

const initialState = {
  shop: {
    name: 'Green Basket Grocery',
    address: 'Main Street',
    phone: '071 000 0000',
    currency: 'Rs.'
  },
  products: seedProducts,
  sales: [],
  stockMovements: [],
  heldCarts: []
};

function normalizeState(state) {
  return {
    ...initialState,
    ...state,
    shop: { ...initialState.shop, ...(state.shop || {}) },
    products: Array.isArray(state.products) ? state.products : [],
    sales: Array.isArray(state.sales) ? state.sales : [],
    stockMovements: Array.isArray(state.stockMovements) ? state.stockMovements : [],
    heldCarts: Array.isArray(state.heldCarts) ? state.heldCarts : []
  };
}

function dataPath() {
  return path.join(app.getPath('userData'), 'pos-data.json');
}

function productImagesPath() {
  return path.join(app.getPath('userData'), 'product-images');
}

async function ensureDataFile() {
  const file = dataPath();
  try {
    await fs.access(file);
  } catch {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(initialState, null, 2), 'utf8');
  }
  return file;
}

async function readState() {
  const file = await ensureDataFile();
  const raw = await fs.readFile(file, 'utf8');
  return normalizeState(JSON.parse(raw));
}

async function writeState(state) {
  const file = await ensureDataFile();
  await fs.writeFile(file, JSON.stringify(state, null, 2), 'utf8');
  return state;
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1040,
    minHeight: 720,
    title: 'Green Basket POS',
    backgroundColor: '#f5f4ef',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  await win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.handle('state:load', readState);

ipcMain.handle('state:reset-demo', async () => {
  return writeState(initialState);
});

ipcMain.handle('state:backup', async () => {
  const state = await readState();
  const result = await dialog.showSaveDialog({
    title: 'Save POS Backup',
    defaultPath: `pos-backup-${new Date().toISOString().slice(0, 10)}.json`,
    filters: [{ name: 'JSON Backup', extensions: ['json'] }]
  });

  if (result.canceled || !result.filePath) return { canceled: true };
  await fs.writeFile(result.filePath, JSON.stringify(state, null, 2), 'utf8');
  return { canceled: false, filePath: result.filePath, state };
});

ipcMain.handle('state:restore', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Restore POS Backup',
    properties: ['openFile'],
    filters: [{ name: 'JSON Backup', extensions: ['json'] }]
  });

  if (result.canceled || !result.filePaths[0]) return { canceled: true };
  const raw = await fs.readFile(result.filePaths[0], 'utf8');
  const restored = normalizeState(JSON.parse(raw));
  await writeState(restored);
  return { canceled: false, filePath: result.filePaths[0], state: restored };
});

ipcMain.handle('shop:save', async (_event, shop) => {
  const state = await readState();
  state.shop = {
    name: String(shop.name || '').trim() || initialState.shop.name,
    address: String(shop.address || '').trim(),
    phone: String(shop.phone || '').trim(),
    currency: String(shop.currency || '').trim() || initialState.shop.currency
  };
  return writeState(state);
});

ipcMain.handle('product:save', async (_event, product) => {
  const state = await readState();
  const cleanProduct = {
    id: String(product.id || '').trim(),
    name: String(product.name || '').trim(),
    category: String(product.category || 'General').trim(),
    price: Number(product.price || 0),
    stock: Number(product.stock || 0),
    barcode: String(product.barcode || '').trim(),
    imagePath: String(product.imagePath || '').trim()
  };

  if (!cleanProduct.id || !cleanProduct.name || !Number.isFinite(cleanProduct.price) || !Number.isFinite(cleanProduct.stock) || cleanProduct.price < 0 || cleanProduct.stock < 0) {
    throw new Error('Product ID, name, price, and stock are required.');
  }

  const duplicateBarcode = cleanProduct.barcode && state.products.some((item) => {
    return item.id !== cleanProduct.id && item.barcode === cleanProduct.barcode;
  });
  if (duplicateBarcode) {
    throw new Error('Barcode is already used by another product.');
  }

  const index = state.products.findIndex((item) => item.id === cleanProduct.id);
  if (index >= 0) {
    state.products[index] = cleanProduct;
  } else {
    state.products.push(cleanProduct);
  }

  state.products.sort((a, b) => a.name.localeCompare(b.name));
  return writeState(state);
});

ipcMain.handle('product:select-image', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Choose Product Image',
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'] }
    ]
  });

  if (result.canceled || !result.filePaths[0]) return { canceled: true };

  const source = result.filePaths[0];
  const ext = path.extname(source).toLowerCase() || '.jpg';
  const imageDir = productImagesPath();
  const filename = `product-${Date.now()}${ext}`;
  const destination = path.join(imageDir, filename);

  await fs.mkdir(imageDir, { recursive: true });
  await fs.copyFile(source, destination);

  return { canceled: false, imagePath: destination };
});

ipcMain.handle('product:delete', async (_event, productId) => {
  const state = await readState();
  state.products = state.products.filter((item) => item.id !== productId);
  return writeState(state);
});

ipcMain.handle('stock:adjust', async (_event, adjustment) => {
  const state = await readState();
  const product = state.products.find((item) => item.id === adjustment.productId);
  const qty = Number(adjustment.qty || 0);
  if (!product) throw new Error('Select a product before adjusting stock.');
  if (!Number.isFinite(qty) || qty === 0) throw new Error('Adjustment quantity cannot be zero.');
  if (product.stock + qty < 0) throw new Error('Stock cannot go below zero.');

  product.stock += qty;
  state.stockMovements.unshift({
    id: `M${Date.now()}`,
    productId: product.id,
    productName: product.name,
    qty,
    reason: String(adjustment.reason || 'Manual adjustment').trim(),
    createdAt: new Date().toISOString()
  });

  return writeState(state);
});

ipcMain.handle('cart:hold', async (_event, cartDraft) => {
  const state = await readState();
  const items = Array.isArray(cartDraft.items) ? cartDraft.items : [];
  if (items.length === 0) throw new Error('Cart is empty.');

  const hold = {
    id: `H${Date.now()}`,
    name: String(cartDraft.name || '').trim() || `Hold ${state.heldCarts.length + 1}`,
    createdAt: new Date().toISOString(),
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      qty: Number(item.qty),
      imagePath: String(item.imagePath || '').trim()
    }))
  };

  state.heldCarts.unshift(hold);
  return writeState(state);
});

ipcMain.handle('cart:delete-hold', async (_event, holdId) => {
  const state = await readState();
  state.heldCarts = state.heldCarts.filter((hold) => hold.id !== holdId);
  return writeState(state);
});

ipcMain.handle('sale:void', async (_event, saleId) => {
  const state = await readState();
  const sale = state.sales.find((item) => item.id === saleId);
  if (!sale) throw new Error('Sale not found.');
  if (sale.voidedAt) throw new Error('Sale is already voided.');

  const productMap = new Map(state.products.map((item) => [item.id, item]));
  for (const item of sale.items) {
    const product = productMap.get(item.id);
    if (product) {
      const qty = Number(item.qty || 0);
      product.stock += qty;
      state.stockMovements.unshift({
        id: `M${Date.now()}-${item.id}`,
        productId: product.id,
        productName: product.name,
        qty,
        reason: `Void ${sale.id}`,
        createdAt: new Date().toISOString()
      });
    }
  }

  sale.voidedAt = new Date().toISOString();
  return writeState(state);
});

ipcMain.handle('sale:complete', async (_event, saleDraft) => {
  const state = await readState();
  const lineItems = Array.isArray(saleDraft.items) ? saleDraft.items : [];

  if (lineItems.length === 0) {
    throw new Error('Cart is empty.');
  }

  const productMap = new Map(state.products.map((item) => [item.id, item]));
  for (const item of lineItems) {
    const product = productMap.get(item.id);
    const qty = Number(item.qty);
    if (!product) throw new Error(`Product not found: ${item.name}`);
    if (!Number.isFinite(qty) || qty <= 0) throw new Error(`Invalid quantity for ${item.name}`);
    if (product.stock < qty) throw new Error(`Not enough stock for ${item.name}`);
  }

  const sale = {
    id: `S${Date.now()}`,
    createdAt: new Date().toISOString(),
    paymentMethod: saleDraft.paymentMethod || 'Cash',
    amountPaid: Number(saleDraft.amountPaid || 0),
    items: lineItems.map((item) => {
      const product = productMap.get(item.id);
      const qty = Number(item.qty);
      return {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        qty,
        total: Number(product.price) * qty
      };
    })
  };

  sale.subtotal = sale.items.reduce((sum, item) => sum + item.total, 0);
  sale.discount = Math.max(Number(saleDraft.discount || 0), 0);
  if (!Number.isFinite(sale.discount) || !Number.isFinite(sale.amountPaid)) {
    throw new Error('Payment values are invalid.');
  }
  sale.total = Math.max(sale.subtotal - sale.discount, 0);
  sale.change = sale.paymentMethod === 'Cash' ? Math.max(sale.amountPaid - sale.total, 0) : 0;

  if (sale.paymentMethod === 'Cash' && sale.amountPaid < sale.total) {
    throw new Error('Cash received is less than the sale total.');
  }

  for (const item of sale.items) {
    const product = productMap.get(item.id);
    product.stock -= item.qty;
    state.stockMovements.unshift({
      id: `M${Date.now()}-${item.id}`,
      productId: product.id,
      productName: product.name,
      qty: -item.qty,
      reason: `Sale ${sale.id}`,
      createdAt: sale.createdAt
    });
  }

  state.sales.unshift(sale);
  return writeState(state);
});
