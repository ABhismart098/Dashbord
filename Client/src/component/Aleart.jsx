import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Alert = ({ message }) => {
  // Function to show toast notification
  const showToast = () => {
    toast(message, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: { color: 'red', backgroundColor: 'black' },
    });
  };

  return (
    <div>
      <button onClick={showToast}>Show Alert</button>
      <ToastContainer />
    </div>
  );
};

export default Alert;
