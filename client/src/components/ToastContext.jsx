// ToastContext.js
import React, { createContext, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const showToast = (message) => {
    toast.success(message, {position: "bottom-center", autoClose: 1500, closeButton: false, pauseOnHover: false});
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <ToastContainer />
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
