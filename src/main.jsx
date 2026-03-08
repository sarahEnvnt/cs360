import React from 'react'
import ReactDOM from 'react-dom/client'
import CS360 from '../cs360.jsx'

// Polyfill window.storage with localStorage
window.storage = {
  async get(key) {
    const value = localStorage.getItem(key);
    return value !== null ? { value } : null;
  },
  async set(key, value) {
    localStorage.setItem(key, value);
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CS360 />
  </React.StrictMode>
)
