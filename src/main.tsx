import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { boot } from './lib/store';
import './styles.css';

boot();

const container = document.getElementById('app');
if (!container) throw new Error('ไม่พบ #app ใน index.html');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
