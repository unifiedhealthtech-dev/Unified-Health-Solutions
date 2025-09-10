// ✅ CORRECT — Only render App, let App.jsx handle routing
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import  { Provider } from 'react-redux';
import { store } from './store';

// Wrap the entire app with the Redux Provider  
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);