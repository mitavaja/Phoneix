import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { toast } from 'react-toastify';

// Global window.alert interceptor to redirect native alerts to react-toastify
window.alert = (message) => {
  if (!message) return;
  const msgStr = String(message).toLowerCase();
  if (
    msgStr.includes("error") || 
    msgStr.includes("failed") || 
    msgStr.includes("invalid") || 
    msgStr.includes("please") ||
    msgStr.includes("reject")
  ) {
    toast.error(message);
  } else if (
    msgStr.includes("success") || 
    msgStr.includes("successfully") || 
    msgStr.includes("verified") || 
    msgStr.includes("active") || 
    msgStr.includes("resolved") || 
    msgStr.includes("approved") || 
    msgStr.includes("completed") || 
    msgStr.includes("deleted") || 
    msgStr.includes("saved") ||
    msgStr.includes("waived") ||
    msgStr.includes("sent") ||
    msgStr.includes("assigned")
  ) {
    toast.success(message);
  } else {
    toast.info(message);
  }
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
