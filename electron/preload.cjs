const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('labelyDesktop', {
  isDesktop: true,
  platform: process.platform,
  version: '1.0.0',
});
