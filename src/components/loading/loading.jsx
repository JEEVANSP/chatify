import React from "react";
import "./loading.css"; // Add your custom CSS for the loading animation

const Loading = () => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Verifying your email, please wait...</p>
    </div>
  );
};

export default Loading;
