import { initializeTheme } from './theme.js';
import { loadDevices } from './devices.js';
import { setupEventListeners } from './event-listeners.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    loadDevices();
    setupEventListeners();
});