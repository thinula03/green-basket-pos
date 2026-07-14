const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('posApi', {
  loadState: () => ipcRenderer.invoke('state:load'),
  resetDemo: () => ipcRenderer.invoke('state:reset-demo'),
  backupState: () => ipcRenderer.invoke('state:backup'),
  restoreState: () => ipcRenderer.invoke('state:restore'),
  saveShop: (shop) => ipcRenderer.invoke('shop:save', shop),
  saveProduct: (product) => ipcRenderer.invoke('product:save', product),
  selectProductImage: () => ipcRenderer.invoke('product:select-image'),
  deleteProduct: (productId) => ipcRenderer.invoke('product:delete', productId),
  adjustStock: (adjustment) => ipcRenderer.invoke('stock:adjust', adjustment),
  holdCart: (cart) => ipcRenderer.invoke('cart:hold', cart),
  deleteHeldCart: (holdId) => ipcRenderer.invoke('cart:delete-hold', holdId),
  completeSale: (sale) => ipcRenderer.invoke('sale:complete', sale),
  voidSale: (saleId) => ipcRenderer.invoke('sale:void', saleId)
});
