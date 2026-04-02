const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('desktopConfig', {
  apiBaseUrl: process.env.OHANA_API_BASE_URL || 'http://127.0.0.1:3000',
  isDesktop: true,
});
