import React from 'react';
import ReactDOM from 'react-dom/client';
import Home from './pages/Home';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';


const loadIonicons = async () => {
  try {
    await import('ionicons/dist/ionicons/ionicons.esm');
  } catch (err) {
    console.warn('Ionicons load warning:', err);
  }
};

loadIonicons();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ThemeProvider>
            <Home />
        </ThemeProvider>
    </React.StrictMode>
);
