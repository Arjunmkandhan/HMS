// Application bootstrap:
// This is the very first JavaScript file executed by Vite when the website starts.
// Its job is to connect React to the HTML page and wrap the entire app with
// `BrowserRouter`, so every page component can use route-based navigation.
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App.jsx";
import { BrowserRouter } from "react-router-dom";

// React creates a root inside the `<div id="root"></div>` that lives in `index.html`.
// From this point onward, everything the user sees on the website is rendered by `App`.
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    {/* BrowserRouter enables all `Route`, `Link`, `Navigate`, and `useNavigate` features used throughout the app. */}
    <App />
  </BrowserRouter>
);
