import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';
import App from './App';
import './index.css';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1f2a',
            color: '#fff',
            border: '1px solid #2a3040'
          },
          success: {
            iconTheme: {
              primary: '#00d4b4',
              secondary: '#fff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ff6b6b',
              secondary: '#fff'
            }
          }
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
