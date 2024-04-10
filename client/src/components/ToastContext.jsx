/*********************************************************************************
  FileName: ToastContext.jsx
  FileVersion: 1.0
  Core Feature(s): Toast notifications provider and hook
  Purpose: This file defines a context for managing toast notifications and provides a hook for accessing the toast functionality.
*********************************************************************************/

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
