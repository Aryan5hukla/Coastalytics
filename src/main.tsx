import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'leaflet/dist/leaflet.css';

// Initialize theme on app startup
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('coastalytics_theme') || 'dark';
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(savedTheme);
  document.documentElement.setAttribute('data-theme', savedTheme);
};

// Apply theme immediately
initializeTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
