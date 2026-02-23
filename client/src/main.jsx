import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import { FlashProvider } from "./context/FlashContext.jsx";
import FlashMessage from "./components/FlashMessage.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <FlashProvider>
        <App />
        <FlashMessage />
      </FlashProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
