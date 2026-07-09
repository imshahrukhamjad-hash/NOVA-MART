import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import "./index.css";
import "./styles/theme.css";
import "./styles/ui-tweaks.css";

axios.defaults.baseURL = "http://localhost:5000";
axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        className: 'custom-toast',
        success: { className: 'custom-toast custom-toast-success' },
        error: { className: 'custom-toast custom-toast-error' },
        info: { className: 'custom-toast custom-toast-info' },
        loading: { className: 'custom-toast custom-toast-loading' },
      }}
    />
  </React.StrictMode>
);
