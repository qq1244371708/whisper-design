import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { BrowserRouter as Router } from 'react-router-dom';
import '@/assets/css/fontawesome-free-6.6.0-web/js/all.min.js';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>
);
