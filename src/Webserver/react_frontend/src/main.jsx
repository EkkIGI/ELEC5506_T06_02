// Importing the React library, which is necessary for working with JSX and React components.
import React from 'react'

// Importing the ReactDOM library's client object, which provides methods for rendering React components.
import ReactDOM from 'react-dom/client'

// Importing the App component from a local file.
import App from './App.jsx'

// Importing the CSS styles from a local stylesheet.
import './index.css'

// Creating a root DOM element for the React application using ReactDOM.createRoot.
// 'document.getElementById('root')' selects the HTML element with the ID of 'root'.
// This element acts as the container for the React application.
const root = ReactDOM.createRoot(document.getElementById('root'));

// Rendering the React application inside the root element.
// React.StrictMode is a wrapper component that checks for potential problems in the application during development.
// It helps to identify unsafe lifecycles, legacy API usage, and other potential issues.
// Wrapping the App component inside React.StrictMode ensures that these checks are performed.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// This file typically acts as the entry point for a React application, initializing the app and placing it on the page.
